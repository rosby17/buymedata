import { query } from "@/lib/db";

export async function GET() {
  const result = await query(`SELECT p.id, p.full_name AS name, p.avatar_url, p.role,
    COALESCE(json_agg(json_build_object('id', c.id, 'title', c.title, 'description', c.description,
      'target_amount', c.target_amount, 'collected_amount', c.collected_amount, 'status', c.status))
      FILTER (WHERE c.id IS NOT NULL), '[]') AS campaigns
    FROM profiles p LEFT JOIN campaigns c ON c.creator_id = p.id AND c.status = 'active'
    WHERE p.role = 'creator' GROUP BY p.id ORDER BY p.created_at DESC`);
  return Response.json({ creators: result.rows });
}
