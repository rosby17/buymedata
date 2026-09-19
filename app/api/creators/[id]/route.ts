import { query } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await query("SELECT id, full_name AS name, avatar_url, username, bio, category FROM profiles WHERE id = $1 AND role = 'creator'", [id]);
  if (!result.rows[0]) return Response.json({ error: "Créateur introuvable" }, { status: 404 });
  return Response.json({ creator: result.rows[0] });
}
