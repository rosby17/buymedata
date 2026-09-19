import { query } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await query(`SELECT o.id, o.amount, o.currency, o.status, o.created_at, o.message,
    p.provider, p.provider_payment_id, p.raw_status,
    creator.id AS creator_id, creator.full_name AS creator_name, creator.avatar_url AS creator_avatar,
    creator.category AS creator_category, c.title AS campaign_title
    FROM orders o
    JOIN profiles creator ON creator.id = o.creator_id
    LEFT JOIN payments p ON p.order_id = o.id
    LEFT JOIN campaigns c ON c.id = o.campaign_id
    WHERE o.id = $1`, [id]);
  if (!result.rows[0]) return Response.json({ error: "Commande introuvable" }, { status: 404 });
  return Response.json({ order: result.rows[0] });
}
