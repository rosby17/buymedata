import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { createSession, sessionCookie } from "@/lib/auth";

const origin = () => process.env.NEXT_PUBLIC_SITE_URL || "https://buymedata.tools-cl.com";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    const state = crypto.randomBytes(24).toString("hex");
    (await cookies()).set("google_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
    const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID || "", redirect_uri: `${origin()}/api/auth/google`, response_type: "code", scope: "openid email profile", state, access_type: "offline" });
    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }
  const state = url.searchParams.get("state");
  const saved = (await cookies()).get("google_oauth_state")?.value;
  if (!state || state !== saved) return Response.json({ error: "Invalid OAuth state" }, { status: 400 });
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID || "", client_secret: process.env.GOOGLE_CLIENT_SECRET || "", redirect_uri: `${origin()}/api/auth/google`, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) return Response.json({ error: "Google authentication failed" }, { status: 401 });
  const tokens = await tokenResponse.json();
  const profile = await (await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } })).json();
  if (!profile.email) return Response.json({ error: "Google account has no email" }, { status: 400 });
  const id = crypto.randomUUID();
  const result = await query<{ id: string }>("INSERT INTO profiles (id, email, full_name, avatar_url) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url RETURNING id", [id, profile.email.toLowerCase(), profile.name || profile.email.split("@")[0], profile.picture || null]);
  (await cookies()).set(sessionCookie, createSession(result.rows[0].id), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return Response.redirect(`${origin()}/dashboard`);
}
