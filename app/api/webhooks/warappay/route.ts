import { verifyWarapPaySignature } from "@/lib/webhook";
import { withTransaction } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWarapPaySignature(rawBody, request.headers.get("x-warappay-signature"))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  let event: { event?: string; data?: { id?: string; status?: string } };
  try { event = JSON.parse(rawBody); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!event.data?.id || !["checkout.completed", "checkout.failed"].includes(event.event || "")) {
    return Response.json({ received: true });
  }
  await withTransaction(async (client) => {
    const eventId = `${event.event}:${event.data!.id}`;
    const inserted = await client.query(`INSERT INTO webhook_events (provider, event_id, event_type, payload, processed_at) VALUES ('warappay', $1, $2, $3, now()) ON CONFLICT (event_id) DO NOTHING RETURNING id`, [eventId, event.event, event]);
    if (!inserted.rowCount) return;
    const orderId = (event.data as { meta?: { order_id?: string } }).meta?.order_id;
    if (!orderId) return;
    const nextStatus = event.event === "checkout.completed" ? "completed" : "failed";
    const order = await client.query(`SELECT status, campaign_id, amount FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
    if (!order.rows[0]) return;
    await client.query(`UPDATE payments SET status = $2, raw_status = $3, updated_at = now() WHERE order_id = $1`, [orderId, nextStatus, event.data!.status || nextStatus]);
    await client.query(`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`, [orderId, nextStatus]);
    if (nextStatus === "completed" && order.rows[0].status !== "completed" && order.rows[0].campaign_id) {
      await client.query(`UPDATE campaigns SET collected_amount = collected_amount + $2, status = CASE WHEN collected_amount + $2 >= target_amount THEN 'completed' ELSE status END, updated_at = now() WHERE id = $1`, [order.rows[0].campaign_id, order.rows[0].amount]);
    }
  });
  return Response.json({ received: true });
}
