import { neon } from "@neondatabase/serverless";

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mangler.");
  return neon(process.env.DATABASE_URL);
}
