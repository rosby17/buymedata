import { query } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

export async function GET() {
  const id = await currentUserId();
  if (!id) return Response.json({ error: "Authentication required" }, { status: 401 });
  const result = await query("SELECT id, email, full_name, role, phone, avatar_url, created_at FROM profiles WHERE id = $1", [id]);
  if (!result.rows[0]) return Response.json({ error: "Profile not found" }, { status: 404 });
  return Response.json({ profile: result.rows[0] });
}

export async function PATCH(request: Request) {
  const id = await currentUserId();
  if (!id) return Response.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = typeof body.full_name === "string" ? body.full_name.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const avatar = typeof body.avatar_url === "string" ? body.avatar_url.trim() : undefined;
  const result = await query("UPDATE profiles SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone), avatar_url = COALESCE($4, avatar_url), updated_at = now() WHERE id = $1 RETURNING id, email, full_name, role, phone, avatar_url", [id, name || null, phone || null, avatar || null]);
  return Response.json({ profile: result.rows[0] });
}
