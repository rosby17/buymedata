import { safeEqual } from "@/lib/auth-security";
import { withTransaction } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.TARA_WEBHOOK_SECRET || "";
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!secret || !safeEqual(key, secret)) return Response.json({ error: "Invalid signature" }, { status: 401 });
  const payload = await request.json().catch(() => null) as { status?: string; productId?: string; paymentId?: string; amount?: number } | null;
  if (!payload?.productId) return Response.json({ received: true });
  const status = String(payload.status || "").toUpperCase();
  const completed = status === "SUCCESS";
  const failed = ["FAILED", "FAIL", "CANCELLED", "CANCELED", "EXPIRED", "ERROR", "DECLINED"].includes(status);
  if (!completed && !failed) return Response.json({ received: true });
  await withTransaction(async (client) => {
    const order = await client.query("SELECT o.status, o.campaign_id, o.amount FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.id=$1 AND p.provider='taramoney' FOR UPDATE OF o", [payload.productId]);
    if (!order.rows[0]) throw new Error("Payment not recorded yet");
    if (["completed","refunded"].includes(order.rows[0].status)) return;
    if (completed && payload.amount !== undefined && Number(payload.amount) !== Number(order.rows[0].amount)) throw new Error("Payment amount mismatch");
    const next = completed ? "completed" : "failed";
    await client.query("UPDATE payments SET provider_payment_id=COALESCE($2, provider_payment_id), status=$3, raw_status=$4, updated_at=now() WHERE order_id=$1", [payload.productId, payload.paymentId || null, next, status]);
    await client.query("UPDATE orders SET status=$2, updated_at=now() WHERE id=$1", [payload.productId, next]);
    if (completed && order.rows[0].status !== "completed" && order.rows[0].campaign_id) await client.query("UPDATE campaigns SET collected_amount=collected_amount+$2, status=CASE WHEN collected_amount+$2>=target_amount THEN 'completed' ELSE status END, updated_at=now() WHERE id=$1", [order.rows[0].campaign_id, order.rows[0].amount]);
  });
  return Response.json({ received: true });
}
