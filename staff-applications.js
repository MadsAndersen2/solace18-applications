import { db } from "./_lib/db.js";
import { readSession, canHandle, permissionsFor } from "./_lib/auth.js";
import { sendWhitelistWebhook } from "./_lib/webhook.js";

const validStatus = new Set(["pending","interview","approved","rejected"]);

export default async function handler(req, res) {
  const session = await readSession(req);
  if (!session) return res.status(401).json({ error: "Login kræves." });

  const sql = db();

  if (req.method === "GET") {
    const requestedType = req.query.type || "whitelist";
    if (!canHandle(requestedType, session.roles || [])) return res.status(403).json({ error: "Ingen adgang." });

    const rows = await sql`
      SELECT id, discord_id, discord_name, discord_avatar, type, status, answers,
             staff_reply, handled_by, created_at, updated_at
      FROM applications
      WHERE type = ${requestedType}
      ORDER BY
        CASE status WHEN 'pending' THEN 0 WHEN 'interview' THEN 1 ELSE 2 END,
        created_at ASC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === "PATCH") {
    const { id, status, staffReply } = req.body || {};
    if (!id || !validStatus.has(status)) return res.status(400).json({ error: "Ugyldige data." });

    const existing = await sql`SELECT type, discord_id, status FROM applications WHERE id = ${id} LIMIT 1`;
    if (!existing.length) return res.status(404).json({ error: "Ansøgningen findes ikke." });

    const type = existing[0].type;
    const applicantDiscordId = existing[0].discord_id;
    const previousStatus = existing[0].status;
    if (!canHandle(type, session.roles || [])) return res.status(403).json({ error: "Ingen adgang." });

    const updated = await sql`
      UPDATE applications
      SET status = ${status},
          staff_reply = ${staffReply || null},
          handled_by = ${session.username},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (type === "whitelist" && previousStatus !== status) {
      if (status === "approved") {
        await sendWhitelistWebhook(applicantDiscordId, "Din Whitelist ansøgning er Godkendt");
      } else if (status === "rejected") {
        await sendWhitelistWebhook(applicantDiscordId, "Din Whitelist Ansøgning er Afvist.");
      }
    }

    return res.status(200).json(updated[0]);
  }

  res.setHeader("Allow", "GET, PATCH");
  res.status(405).end();
}
