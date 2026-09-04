# Solace 18+ – Vercel + Discord login

Denne version er lavet til:
- Vercel som hjemmeside og backend
- Discord OAuth2 som login
- Discord Role IDs som permissions
- Neon PostgreSQL som database

## Roller
- ROLE_ADMIN_ID → adgang til alt
- ROLE_WHITELIST_RECEIVER_ID → whitelist
- ROLE_STAFF_RESPONSIBLE_ID → staff
- ROLE_CREATOR_RESPONSIBLE_ID → content creator
- ROLE_COMPANY_RESPONSIBLE_ID → firma

## Vigtigt
Discord-roller læses ved login. Hvis en rolle ændres, skal brugeren logge ud og ind igen for at få nye permissions.


## Discord webhook til Whitelist-status
Opret en webhook i den Discord-kanal, hvor beskederne skal sendes, og tilføj denne Vercel environment variable:

`DISCORD_WHITELIST_WEBHOOK_URL`

Beskederne er:
- `<@user> Vi har modtaget din ansøgning`
- `<@user> Din Whitelist ansøgning er Godkendt`
- `<@user> Din Whitelist Ansøgning er Afvist.`

Webhook-fejl stopper ikke selve ansøgningen fra at blive gemt i databasen.


## Webhook v2

Denne version bruger kun Discord Webhook og har:
- 3 forsøg ved midlertidige fejl
- tydelige Runtime Logs i Vercel
- admin-only test-endpoint

Vercel Environment Variable:
`DISCORD_WHITELIST_WEBHOOK_URL`

Test:
1. Log ind på hjemmesiden med Projekt Lead/Admin.
2. Åbn:
   `/api/webhook-test`
3. Ved succes vises:
   `{"ok":true,"message":"Webhook sendt.","status":204}`
4. Discord-kanalen modtager:
   `@User Solace webhook-test virker ✅`

Hvis testen fejler, viser endpointet selve fejlen, fx 401/404/429.

Whitelist-beskeder:
- `@User Vi har modtaget din ansøgning`
- `@User Din Whitelist ansøgning er Godkendt`
- `@User Din Whitelist Ansøgning er Afvist.`
