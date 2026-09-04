import { readSession, permissionsFor } from "./_lib/auth.js";
import { sendWhitelistWebhook } from "./_lib/webhook.js";

export default async function handler(req, res) {
  const session = await readSession(req);

  if (!session) {
    return res.status(200).json({ loggedIn: false });
  }

  const permissions = permissionsFor(session.roles || []);

  // Webhook-test - kun Projekt Lead/Admin
  if (req.query?.testWebhook === "1") {
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

  return res.status(200).json({
    loggedIn: true,
    user: {
      id: session.id,
      username: session.username,
      avatar: session.avatar
    },
    permissions
  });
}
