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
    const inserted = await client.query(`INSERT INTO webhook_events (provider, event_id, event_type, payload, processed_at) VALUES ('warappay', $1, $2, $3, now()) ON CONFLICT (event_id) DO NOTHING RETURNING id`, [event.data!.id, event.event, event]);
    if (!inserted.rowCount) return;
    const orderId = (event.data as { meta?: { order_id?: string } }).meta?.order_id;
    if (orderId) await client.query(`UPDATE payments SET status = $2, raw_status = $2, updated_at = now() WHERE order_id = $1`, [orderId, event.data!.status || (event.event === "checkout.completed" ? "completed" : "failed")]);
    if (orderId) await client.query(`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`, [orderId, event.data!.status || (event.event === "checkout.completed" ? "completed" : "failed")]);
  });
  return Response.json({ received: true });
}
