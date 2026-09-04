import { readSession, permissionsFor } from "./_lib/auth.js";

export default async function handler(req, res) {
  const session = await readSession(req);
  if (!session) return res.status(200).json({ loggedIn: false });

  res.status(200).json({
    loggedIn: true,
    user: { id: session.id, username: session.username, avatar: session.avatar },
    permissions: permissionsFor(session.roles || [])
  });
}
