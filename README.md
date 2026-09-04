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
