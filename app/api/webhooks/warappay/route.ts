import { verifyWarapPaySignature } from "@/lib/webhook";

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
  // TODO: persist the event id and update the order in the database.
  // Processing must be idempotent on event.data.id before enabling fulfilment.
  return Response.json({ received: true });
}
