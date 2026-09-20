import { NextRequest } from "next/server";
import { getCheckout, WarapPayError } from "@/lib/warappay";
import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await currentUserId();
    if (!userId) return Response.json({error:"Authentication required"},{status:401});
    const payment = await query("SELECT p.id FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.provider='warappay' AND p.provider_payment_id=$1 AND (o.creator_id=$2 OR o.supporter_id=$2)",[id,userId]);
    if (!payment.rowCount) return Response.json({error:"Payment not found"},{status:404});
    const checkout = await getCheckout(id);
    return Response.json({id:checkout.id,status:checkout.status},{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    if (error instanceof WarapPayError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    return Response.json({ error: "Unable to retrieve payment" }, { status: 500 });
  }
}
