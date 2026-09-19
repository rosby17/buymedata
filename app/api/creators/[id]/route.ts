import { query } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await query(`SELECT p.id, p.full_name AS name, p.avatar_url, p.username, p.bio, p.category,
    COALESCE(json_agg(json_build_object('id', c.id, 'title', c.title, 'target_amount', c.target_amount,
      'collected_amount', c.collected_amount)) FILTER (WHERE c.id IS NOT NULL), '[]') AS campaigns
    FROM profiles p LEFT JOIN campaigns c ON c.creator_id = p.id AND c.status = 'active'
    WHERE p.id = $1 AND p.role = 'creator' GROUP BY p.id`, [id]);
  if (!result.rows[0]) return Response.json({ error: "Créateur introuvable" }, { status: 404 });
  return Response.json({ creator: result.rows[0] });
}
