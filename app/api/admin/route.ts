import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const admin = await query("SELECT role FROM profiles WHERE id = $1", [userId]);
  if (admin.rows[0]?.role !== "admin") return Response.json({ error: "Accès administrateur requis" }, { status: 403 });
  const [stats, creators, orders, withdrawals] = await Promise.all([
    query(`SELECT (SELECT COUNT(*)::int FROM profiles WHERE role='creator') AS creators,
      (SELECT COUNT(*)::int FROM profiles WHERE role='supporter') AS supporters,
      (SELECT COUNT(*)::int FROM orders WHERE status='completed') AS completed_orders,
      (SELECT COALESCE(SUM(amount),0)::bigint FROM orders WHERE status='completed') AS collected`),
    query(`SELECT p.id, p.full_name, p.email, p.username, p.avatar_url, p.onboarding_completed, p.created_at,
      COALESCE(SUM(o.amount) FILTER (WHERE o.status='completed'),0)::bigint AS collected
      FROM profiles p LEFT JOIN orders o ON o.creator_id=p.id WHERE p.role='creator'
      GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100`),
    query(`SELECT o.id, o.customer_name, o.amount, o.currency, o.status, o.created_at, p.full_name AS creator_name
      FROM orders o JOIN profiles p ON p.id=o.creator_id ORDER BY o.created_at DESC LIMIT 100`),
    query(`SELECT w.id, w.amount, w.currency, w.method, w.destination, w.status, w.created_at,
      p.full_name AS creator_name FROM withdrawals w JOIN profiles p ON p.id=w.creator_id
      ORDER BY w.created_at DESC LIMIT 100`),
  ]);
  return Response.json({ stats: stats.rows[0], creators: creators.rows, orders: orders.rows, withdrawals: withdrawals.rows });
}
