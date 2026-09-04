export async function sendWhitelistWebhook(discordId, message) {
  const url = process.env.DISCORD_WHITELIST_WEBHOOK_URL;
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `<@${discordId}> ${message}`,
        allowed_mentions: {
          parse: [],
          users: [String(discordId)]
        }
      })
    });

    if (!response.ok) {
      console.error("Discord webhook fejlede:", response.status, await response.text());
    }
  } catch (error) {
    // Ansøgningen må stadig gemmes, selv hvis Discord midlertidigt er nede.
    console.error("Discord webhook fejl:", error);
  }
}
