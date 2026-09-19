import { cookies } from "next/headers";
import crypto from "node:crypto";
import { createSession, hashPassword, sessionCookie, verifyPassword } from "@/lib/auth";

// Development persistence boundary: replace this store with PostgreSQL/Supabase before production.
const users = new Map<string, { id: string; email: string; name: string; password: string }>();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!email || !password || password.length < 8) return Response.json({ error: "Email and password (8+ chars) are required" }, { status: 400 });
  let user = users.get(email);
  if (body.register) {
    if (user) return Response.json({ error: "An account already exists" }, { status: 409 });
    user = { id: crypto.randomUUID(), email, name: name || email.split("@")[0], password: hashPassword(password) };
    users.set(email, user);
  } else if (!user || !verifyPassword(password, user.password)) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  (await cookies()).set(sessionCookie, createSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function DELETE() {
  (await cookies()).set(sessionCookie, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return Response.json({ ok: true });
}
