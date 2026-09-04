export default async function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !redirectUri) return res.status(500).send("Discord OAuth er ikke konfigureret.");

  const state = crypto.randomUUID();
  res.setHeader("Set-Cookie", `solace_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds.members.read",
    state,
    prompt: "none"
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}
