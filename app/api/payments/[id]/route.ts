import { NextRequest } from "next/server";
import { getCheckout, WarapPayError } from "@/lib/warappay";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return Response.json(await getCheckout(id));
  } catch (error) {
    if (error instanceof WarapPayError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    return Response.json({ error: "Unable to retrieve payment" }, { status: 500 });
  }
}
