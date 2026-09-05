import { SignJWT, jwtVerify } from "jose";

const cookieName = "solace_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET mangler eller er for kort.");
  return new TextEncoder().encode(value);
}

export async function makeSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function readSession(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(new RegExp(`(?:^|; )${cookieName}=([^;]+)`));
  if (!match) return null;
  try {
    const { payload } = await jwtVerify(decodeURIComponent(match[1]), secret());
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export function permissionsFor(roles = []) {
  const has = (id) => id && roles.includes(id);
  const admin = has(process.env.ROLE_ADMIN_ID);
  return {
    admin,
    whitelist: admin || has(process.env.ROLE_WHITELIST_RECEIVER_ID),
    staff: admin || has(process.env.ROLE_STAFF_RESPONSIBLE_ID),
    creator: admin || has(process.env.ROLE_CREATOR_RESPONSIBLE_ID),
    company: admin || has(process.env.ROLE_COMPANY_RESPONSIBLE_ID),
    police: admin || has(process.env.ROLE_POLICE_RESPONSIBLE_ID),
    ems: admin || has(process.env.ROLE_EMS_RESPONSIBLE_ID)
  };
}

export function canHandle(type, roles = []) {
  const p = permissionsFor(roles);
  return !!p[type];
}
