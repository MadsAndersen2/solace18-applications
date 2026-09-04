import { db } from "./_lib/db.js";
import { readSession } from "./_lib/auth.js";
import { sendWhitelistWebhook } from "./_lib/webhook.js";

const validTypes = new Set(["whitelist", "staff", "creator", "company"]);

export default async function handler(req, res) {
  const session = await readSession(req);

  if (!session) {
    return res.status(401).json({ error: "Login kræves." });
  }

  const sql = db();

  if (req.method === "GET") {
    const rows = await sql`
      SELECT id, type, status, answers, staff_reply, handled_by, created_at, updated_at
      FROM applications
      WHERE discord_id = ${session.id}
      ORDER BY created_at DESC
    `;

    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { type, answers } = req.body || {};

    if (!validTypes.has(type)) {
      return res.status(400).json({ error: "Ugyldig ansøgningstype." });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Svar mangler." });
    }

    const active = await sql`
      SELECT id
      FROM applications
      WHERE discord_id = ${session.id}
        AND type = ${type}
        AND status IN ('pending', 'interview')
      LIMIT 1
    `;

    if (active.length) {
      return res.status(409).json({
        error: "Du har allerede en aktiv ansøgning af denne type."
      });
    }

    const inserted = await sql`
      INSERT INTO applications (
        discord_id,
        discord_name,
        discord_avatar,
        type,
        answers
      )
      VALUES (
        ${session.id},
        ${session.username},
        ${session.avatar || null},
        ${type},
        ${JSON.stringify(answers)}
      )
      RETURNING id, type, status, created_at
    `;

    if (type === "whitelist") {
      const webhookResult = await sendWhitelistWebhook(
        session.id,
        "Vi har modtaget din ansøgning"
      );

      if (!webhookResult.ok) {
        console.error(
          "Whitelist modtagelsesbesked blev ikke sendt:",
          webhookResult.error
        );
      }
    }

    return res.status(201).json(inserted[0]);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
