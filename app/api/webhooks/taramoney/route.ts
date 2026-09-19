import crypto from "node:crypto";
import { withTransaction } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.TARA_WEBHOOK_SECRET || "";
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!secret || key.length !== secret.length || !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(secret))) return Response.json({ error: "Invalid signature" }, { status: 401 });
  const payload = await request.json().catch(() => null) as { status?: string; productId?: string; paymentId?: string; amount?: number } | null;
  if (!payload?.productId) return Response.json({ received: true });
  const status = String(payload.status || "").toUpperCase();
  const completed = status === "SUCCESS";
  const failed = ["FAILED", "FAIL", "CANCELLED", "CANCELED", "EXPIRED", "ERROR", "DECLINED"].includes(status);
  if (!completed && !failed) return Response.json({ received: true });
  await withTransaction(async (client) => {
    const order = await client.query("SELECT status, campaign_id, amount FROM orders WHERE id=$1 FOR UPDATE", [payload.productId]);
    if (!order.rows[0]) return;
    const next = completed ? "completed" : "failed";
    await client.query("UPDATE payments SET provider_payment_id=COALESCE($2, provider_payment_id), status=$3, raw_status=$4, updated_at=now() WHERE order_id=$1", [payload.productId, payload.paymentId || null, next, status]);
    await client.query("UPDATE orders SET status=$2, updated_at=now() WHERE id=$1", [payload.productId, next]);
    if (completed && order.rows[0].status !== "completed" && order.rows[0].campaign_id) await client.query("UPDATE campaigns SET collected_amount=collected_amount+$2, status=CASE WHEN collected_amount+$2>=target_amount THEN 'completed' ELSE status END, updated_at=now() WHERE id=$1", [order.rows[0].campaign_id, order.rows[0].amount]);
  });
  return Response.json({ received: true });
}
