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
