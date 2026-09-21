import { query, withTransaction } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

// Frais Buy Me Data retenus sur chaque retrait, avant versement au créateur.
const WITHDRAWAL_FEE_RATE = 0.12;
// Politique de retrait : 3 jours en attente, puis mise en paiement, dépôt sous 48 h max (5 jours au total).
const WITHDRAWAL_PENDING_DAYS = 3;
const WITHDRAWAL_PAYOUT_HOURS = 48;

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const profile = await query("SELECT role FROM profiles WHERE id = $1", [userId]);
  if (profile.rows[0]?.role === "supporter") {
    const supports = await query(`SELECT o.id, o.amount, o.currency, o.status, o.created_at, o.message,
      p.full_name AS creator_name, p.avatar_url AS creator_avatar FROM orders o
      JOIN profiles p ON p.id=o.creator_id WHERE o.supporter_id=$1 ORDER BY o.created_at DESC LIMIT 50`, [userId]);
    const completed = supports.rows.filter((row) => row.status === "completed");
    return Response.json({ mode: "supporter", supports: supports.rows, stats: { collected: completed.reduce((sum, row) => sum + Number(row.amount), 0), supporters: completed.length } });
  }
  const [totals, activity, campaigns, withdrawals] = await Promise.all([
    query(`SELECT
      COALESCE(SUM(amount) FILTER (WHERE status='completed'),0)::bigint AS collected,
      COALESCE(SUM(amount) FILTER (WHERE status='completed' AND campaign_id IS NULL),0)::bigint AS direct_support,
      COALESCE(SUM(amount) FILTER (WHERE status='completed' AND campaign_id IS NOT NULL),0)::bigint AS campaign_support,
      COALESCE(SUM(amount) FILTER (WHERE status='completed' AND created_at >= now()-interval '30 days'),0)::bigint AS last30,
      COALESCE(SUM(amount) FILTER (WHERE status='completed' AND created_at >= now()-interval '90 days'),0)::bigint AS last90,
      COUNT(*) FILTER (WHERE status='completed')::int AS supporters
      FROM orders WHERE creator_id=$1`, [userId]),
    query("SELECT id, customer_name AS name, message, amount, status, created_at FROM orders WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 20", [userId]),
    query("SELECT id, title, target_amount AS total, collected_amount AS current, status FROM campaigns WHERE creator_id = $1 ORDER BY created_at DESC", [userId]),
    query("SELECT id, amount, fee_amount, net_amount, method, destination, status, process_after, expected_paid_at, created_at FROM withdrawals WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 10", [userId]),
  ]);
  const paidOut = withdrawals.rows.filter((row) => ["pending", "processing", "paid"].includes(row.status)).reduce((sum, row) => sum + Number(row.amount), 0);
  return Response.json({ mode: "creator", stats: { ...totals.rows[0], available: Math.max(0, Number(totals.rows[0].collected) - paidOut) }, activity: activity.rows, campaigns: campaigns.rows, withdrawals: withdrawals.rows });
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
  const grossAmount = Math.round(amount);
  const feeAmount = Math.ceil(grossAmount * WITHDRAWAL_FEE_RATE);
  const netAmount = grossAmount - feeAmount;
  if (netAmount <= 0) return Response.json({ error: "Montant net invalide" }, { status: 400 });
  const withdrawal = await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [userId]);
    const owner = await client.query("SELECT role FROM profiles WHERE id=$1", [userId]);
    if (owner.rows[0]?.role !== "creator") throw new Error("CREATOR_REQUIRED");
    const balance = await client.query(`SELECT
      COALESCE((SELECT SUM(amount) FROM orders WHERE creator_id=$1 AND status='completed'),0) -
      COALESCE((SELECT SUM(amount) FROM withdrawals WHERE creator_id=$1 AND status IN ('pending','processing','paid')),0) AS available`, [userId]);
    if (amount > Number(balance.rows[0].available)) throw new Error("INSUFFICIENT_BALANCE");
    const result = await client.query(
      `INSERT INTO withdrawals (creator_id, amount, fee_amount, net_amount, method, destination, process_after, expected_paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, now() + ($7 || ' days')::interval, now() + ($7 || ' days')::interval + ($8 || ' hours')::interval) RETURNING *`,
      [userId, grossAmount, feeAmount, netAmount, method, destination, WITHDRAWAL_PENDING_DAYS, WITHDRAWAL_PAYOUT_HOURS]);
    return result.rows[0];
  }).catch((error) => {
    if (String(error).includes("CREATOR_REQUIRED")) return null;
    if (String(error).includes("INSUFFICIENT_BALANCE")) return false;
    throw error;
  });
  if (withdrawal === null) return Response.json({ error: "Seuls les créateurs peuvent demander un retrait" }, { status: 403 });
  if (withdrawal === false) return Response.json({ error: "Solde disponible insuffisant" }, { status: 400 });
  return Response.json({
    withdrawal,
    fees: { rate: WITHDRAWAL_FEE_RATE, amount: feeAmount, net: netAmount },
    schedule: { pendingDays: WITHDRAWAL_PENDING_DAYS, payoutHours: WITHDRAWAL_PAYOUT_HOURS, processAfter: withdrawal.process_after, expectedPaidAt: withdrawal.expected_paid_at },
  }, { status: 201 });
}
