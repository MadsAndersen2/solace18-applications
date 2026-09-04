import { readSession, permissionsFor } from "./_lib/auth.js";
import { sendWhitelistWebhook } from "./_lib/webhook.js";

export default async function handler(req, res) {
  const session = await readSession(req);

  if (!session) {
    return res.status(401).json({
      ok: false,
      error: "Login kræves."
    });
  }

  const permissions = permissionsFor(session.roles || []);
  if (!permissions.admin) {
    return res.status(403).json({
      ok: false,
      error: "Kun Projekt Lead/Admin kan teste webhooken."
    });
  }

  const result = await sendWhitelistWebhook(
    session.id,
    "Solace webhook-test virker ✅"
  );

  if (!result.ok) {
    return res.status(500).json({
      ok: false,
      error: result.error
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Webhook sendt.",
    status: result.status
  });
}
