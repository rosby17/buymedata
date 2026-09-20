import { cookies } from "next/headers";
import { query } from "./db";
import { readSession } from "./auth-security";
export { createSession, hashPassword, verifyPassword, readSession } from "./auth-security";
export const sessionCookie = "buy_me_data_session";
export const cookieOptions = { httpOnly:true, sameSite:"lax" as const, secure:process.env.NODE_ENV === "production", path:"/", maxAge:30*86400 };
export async function currentUserId() {
  const id = readSession((await cookies()).get(sessionCookie)?.value);
  if (!id) return null;
  const result = await query("SELECT id FROM profiles WHERE id=$1 AND email_verified_at IS NOT NULL", [id]);
  return result.rows[0]?.id || null;
}
