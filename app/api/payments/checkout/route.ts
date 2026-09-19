import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { createCheckout, WarapPayError } from "@/lib/warappay";
import { withTransaction } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productCode = process.env.WARAPPAY_PRODUCT_CODE;
    const origin = request.nextUrl.origin;
    if (!productCode) return Response.json({ error: "Payment product is not configured" }, { status: 503 });
    if (!body?.email || !body?.customer_name || !body?.amount) {
      return Response.json({ error: "email, customer_name and amount are required" }, { status: 400 });
    }
    const orderId = crypto.randomUUID();
    const creatorId = "00000000-0000-0000-0000-000000000001";
    await withTransaction(async (client) => {
      await client.query(`INSERT INTO profiles (id, email, full_name, role) VALUES ($1, $2, $3, 'creator') ON CONFLICT (id) DO NOTHING`, [creatorId, "juliet@buymedata.app", "Juliet"]);
      await client.query(`INSERT INTO orders (id, creator_id, email, customer_name, customer_phone, amount, message, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`, [orderId, creatorId, String(body.email), String(body.customer_name), body.customer_phone ? String(body.customer_phone) : null, Number(body.amount), body.message ? String(body.message) : null]);
    });
    const result = await createCheckout({
      product_code: productCode,
      email: String(body.email),
      customer_name: String(body.customer_name),
      customer_phone: body.customer_phone ? String(body.customer_phone) : undefined,
      redirect_url: `${origin}/merci`,
      meta: { order_id: orderId, amount: String(body.amount) },
    });
    await queryPayment(orderId, result);
    return Response.json({ ...result, order_id: orderId });
  } catch (error) {
    if (error instanceof WarapPayError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    return Response.json({ error: "Unable to create checkout" }, { status: 500 });
  }
}

async function queryPayment(orderId: string, result: { id: string; status: string; checkout_url: string | null }) {
  const { query } = await import("@/lib/db");
  await query(`INSERT INTO payments (order_id, provider_payment_id, checkout_url, status, raw_status, amount) SELECT $1, $2, $3, $4, $4, amount FROM orders WHERE id = $1`, [orderId, result.id, result.checkout_url, result.status]);
  await query(`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`, [orderId, result.status]);
}
