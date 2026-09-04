import { makeSession, setSessionCookie } from "./_lib/auth.js";

function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;
    const expected = getCookie(req, "solace_oauth_state");
    if (!code || !state || !expected || state !== expected) {
      return res.status(400).send("Ugyldig OAuth state. Prøv at logge ind igen.");
    }

    const tokenBody = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody
    });
    if (!tokenRes.ok) return res.status(401).send("Discord token exchange fejlede.");
    const token = await tokenRes.json();

    const headers = { Authorization: `Bearer ${token.access_token}` };
    const [userRes, memberRes] = await Promise.all([
      fetch("https://discord.com/api/users/@me", { headers }),
      fetch(`https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, { headers })
    ]);

    if (!userRes.ok) return res.status(401).send("Kunne ikke hente Discord-brugeren.");
    const user = await userRes.json();

    if (!memberRes.ok) {
      return res.status(403).send("Du skal være medlem af Solace Discord-serveren for at bruge ansøgningssiden.");
    }
    const member = await memberRes.json();

    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : null;

    const session = await makeSession({
      id: user.id,
      username: user.global_name || user.username,
      avatar,
      roles: member.roles || []
    });

    setSessionCookie(res, session);
    res.setHeader("Set-Cookie", [
      `solace_session=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,
      "solace_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    ]);
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send("Login fejlede. Kontrollér dine Discord- og Vercel-indstillinger.");
  }
}
