import { cookies } from "next/headers";
import crypto from "node:crypto";
import { createSession, hashPassword, sessionCookie, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!email || !password || password.length < 8) return Response.json({ error: "Email and password (8+ chars) are required" }, { status: 400 });
  if (body.register) {
    const id = crypto.randomUUID();
    try {
      await query("INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3)", [id, email, name || email.split("@")[0]]);
      await query("INSERT INTO auth_credentials (user_id, password_hash) VALUES ($1, $2)", [id, hashPassword(password)]);
    } catch (error: unknown) {
      if (String(error).includes("duplicate key")) return Response.json({ error: "An account already exists" }, { status: 409 });
      throw error;
    }
    (await cookies()).set(sessionCookie, createSession(id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return Response.json({ user: { id, email, name: name || email.split("@")[0] } });
  }
  const result = await query<{ id: string; email: string; name: string; password: string }>("SELECT p.id, p.email, p.full_name AS name, c.password_hash AS password FROM profiles p JOIN auth_credentials c ON c.user_id = p.id WHERE p.email = $1", [email]);
  const user = result.rows[0];
  if (!user || !verifyPassword(password, user.password)) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  (await cookies()).set(sessionCookie, createSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function DELETE() {
  (await cookies()).set(sessionCookie, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return Response.json({ ok: true });
}
