import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "buy_me_data_session";
const secret = () => process.env.AUTH_SECRET || "development-only-change-me";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [salt, stored] = encoded.split(":");
  if (!salt || !stored) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(stored, "hex"));
}

function sign(value: string) { return crypto.createHmac("sha256", secret()).update(value).digest("base64url"); }
export function createSession(userId: string) { const value = `${userId}.${Date.now()}`; return `${value}.${sign(value)}`; }
export function readSession(token?: string) {
  if (!token) return null;
  const [userId, issued, signature] = token.split(".");
  const value = `${userId}.${issued}`;
  if (!userId || !issued || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(value)))) return null;
  if (Date.now() - Number(issued) > 1000 * 60 * 60 * 24 * 30) return null;
  return userId;
}
export async function currentUserId() { return readSession((await cookies()).get(COOKIE)?.value); }
export const sessionCookie = COOKIE;
