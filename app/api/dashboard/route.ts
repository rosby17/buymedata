import { query } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const [totals, activity, campaigns, withdrawals] = await Promise.all([
    query("SELECT COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)::bigint AS collected, COUNT(*) FILTER (WHERE status = 'completed')::int AS supporters FROM orders WHERE creator_id = $1", [userId]),
    query("SELECT id, customer_name AS name, message, amount, created_at FROM orders WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 20", [userId]),
    query("SELECT id, title, target_amount AS total, collected_amount AS current, status FROM campaigns WHERE creator_id = $1 ORDER BY created_at DESC", [userId]),
    query("SELECT id, amount, method, destination, status, created_at FROM withdrawals WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 10", [userId]),
  ]);
  return Response.json({ stats: totals.rows[0], activity: activity.rows, campaigns: campaigns.rows, withdrawals: withdrawals.rows });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 500) return Response.json({ error: "Montant minimum: 500 FCFA" }, { status: 400 });
  const method = body.method === "crypto" ? "crypto" : "mobile_money";
  const destination = String(body.destination || "").trim();
  if (!destination) return Response.json({ error: "Destination requise" }, { status: 400 });
  const result = await query("INSERT INTO withdrawals (creator_id, amount, method, destination) VALUES ($1, $2, $3, $4) RETURNING *", [userId, amount, method, destination]);
  return Response.json({ withdrawal: result.rows[0] }, { status: 201 });
}
