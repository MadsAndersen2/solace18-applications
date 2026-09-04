async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendWhitelistWebhook(discordId, message) {
  const url = process.env.DISCORD_WHITELIST_WEBHOOK_URL;

  if (!url) {
    console.error("DISCORD_WHITELIST_WEBHOOK_URL mangler i Vercel Environment Variables.");
    return { ok: false, error: "Webhook URL mangler." };
  }

  const payload = {
    content: `<@${discordId}> ${message}`,
    allowed_mentions: {
      parse: [],
      users: [String(discordId)]
    }
  };

  let lastError = "Ukendt fejl";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Solace18-Applications/1.0"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`Discord webhook sendt korrekt. Status: ${response.status}`);
        return { ok: true, status: response.status };
      }

      const body = await response.text();
      lastError = `Discord svarede ${response.status}: ${body}`;
      console.error(lastError);

      if (response.status === 429 || response.status >= 500) {
        let wait = 800 * attempt;
        try {
          const parsed = JSON.parse(body);
          if (parsed.retry_after) wait = Math.ceil(Number(parsed.retry_after) * 1000);
        } catch {}
        await sleep(wait);
        continue;
      }

      break;
    } catch (error) {
      lastError = error?.message || String(error);
      console.error("Discord webhook fetch-fejl:", lastError);
      await sleep(800 * attempt);
    }
  }

  return { ok: false, error: lastError };
}
