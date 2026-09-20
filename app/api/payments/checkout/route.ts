import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { createCheckout, WarapPayError } from "@/lib/warappay";
import { createTaraCheckout, TaraMoneyError } from "@/lib/taramoney";
import { query, withTransaction } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let orderId: string | null = null;
  try {
    const body = await request.json();
    const productCode = process.env.WARAPPAY_PRODUCT_CODE;
    const paymentMethod = body.payment_method === "card" || body.payment_method === "paypal" ? body.payment_method : "mobile_money";
    const origin = request.nextUrl.origin;
    if (paymentMethod === "mobile_money" && !productCode) return Response.json({ error: "Le paiement Mobile Money n'est pas configuré" }, { status: 503 });
    if (!body?.amount) return Response.json({ error: "amount is required" }, { status: 400 });
    orderId = crypto.randomUUID();
    // Identity is optional for a donor. Payment providers still need stable values,
    // so anonymous donations receive internal placeholders that are never shown publicly.
    const customerName = String(body.customer_name || "").trim() || "Donateur anonyme";
    const customerEmail = String(body.email || "").trim().toLowerCase() || `anonymous+${orderId}@buymedata.invalid`;
    const creatorId = String(body.creator_id || "");
    const campaignId = body.campaign_id ? String(body.campaign_id) : null;
    const amount = Math.round(Number(body.amount));
    if (!creatorId) return Response.json({ error: "creator_id is required" }, { status: 400 });
    if (!Number.isFinite(amount) || amount < 100) return Response.json({ error: "Le montant minimum est de 100 FCFA" }, { status: 400 });
    const creator = await query("SELECT id FROM profiles WHERE id = $1 AND role = 'creator'", [creatorId]);
    if (!creator.rows[0]) return Response.json({ error: "Creator not found" }, { status: 404 });
    if (campaignId) {
      const campaign = await query("SELECT id FROM campaigns WHERE id = $1 AND creator_id = $2 AND status = 'active'", [campaignId, creatorId]);
      if (!campaign.rows[0]) return Response.json({ error: "Cagnotte introuvable ou inactive" }, { status: 404 });
    }
    const supporterId = await currentUserId();
    await withTransaction(async (client) => {
      await client.query(`INSERT INTO orders (id, creator_id, campaign_id, supporter_id, email, customer_name, customer_phone, amount, message, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`, [orderId, creatorId, campaignId, supporterId, customerEmail, customerName, body.customer_phone ? String(body.customer_phone) : null, amount, body.message ? String(body.message).trim().slice(0, 500) : null]);
    });
    const result = paymentMethod === "mobile_money" ? await createCheckout({
      product_code: productCode || "",
      email: customerEmail,
      customer_name: customerName,
      customer_phone: body.customer_phone ? String(body.customer_phone) : undefined,
      redirect_url: `${origin}/merci?order_id=${orderId}`,
      meta: { order_id: orderId, creator_id: creatorId, amount: String(amount) },
    }) : await createTaraCheckout({ orderId, amount, origin, customerName, provider: paymentMethod });
    await queryPayment(orderId, result, paymentMethod === "mobile_money" ? "warappay" : "taramoney");
    return Response.json({ ...result, order_id: orderId });
  } catch (error) {
    if (orderId && (error instanceof WarapPayError || error instanceof TaraMoneyError) && error.status >= 400 && error.status < 500) {
      await query("UPDATE orders SET status='failed', updated_at=now() WHERE id=$1 AND status='pending'",[orderId]);
    }
    if (error instanceof WarapPayError || error instanceof TaraMoneyError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Unable to create checkout" }, { status: 500 });
  }
}

async function queryPayment(orderId: string, result: { id: string; status: string; checkout_url: string | null }, provider: string) {
  const { query } = await import("@/lib/db");
  const status = result.status === "failed" ? "failed" : "waiting_payment";
  await query(`INSERT INTO payments (order_id, provider, provider_payment_id, checkout_url, status, raw_status, amount) SELECT $1, $2, $3, $4, $5, $5, amount FROM orders WHERE id = $1`, [orderId, provider, result.id, result.checkout_url, status]);
  await query(`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1 AND status IN ('pending','waiting_payment')`, [orderId, status]);
}
