import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { createCheckout, WarapPayError } from "@/lib/warappay";

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
    const result = await createCheckout({
      product_code: productCode,
      email: String(body.email),
      customer_name: String(body.customer_name),
      customer_phone: body.customer_phone ? String(body.customer_phone) : undefined,
      redirect_url: `${origin}/merci`,
      meta: { order_id: orderId, amount: String(body.amount) },
    });
    return Response.json({ ...result, order_id: orderId });
  } catch (error) {
    if (error instanceof WarapPayError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    return Response.json({ error: "Unable to create checkout" }, { status: 500 });
  }
}
