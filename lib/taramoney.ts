const TARA_URL = "https://www.dklo.co/api/tara/paymentlinks";

export class TaraMoneyError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = "TaraMoneyError"; }
}

export async function createTaraCheckout(input: {
  orderId: string; amount: number; origin: string; customerName: string; provider: "card" | "paypal";
}) {
  const apiKey = process.env.TARA_API_KEY;
  const businessId = process.env.TARA_BUSINESS_ID;
  const webhookSecret = process.env.TARA_WEBHOOK_SECRET;
  if (!apiKey || !businessId || !webhookSecret) throw new TaraMoneyError(503, "Le paiement par carte/PayPal n'est pas encore configuré");
  const response = await fetch(TARA_URL, {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({
      apiKey, businessId, productId: input.orderId,
      productName: `Soutien Buy Me Data (${input.provider === "paypal" ? "PayPal" : "Carte"})`,
      productPrice: input.amount,
      productDescription: `Soutien de ${input.amount} FCFA à un créateur Buy Me Data.`,
      returnUrl: `${input.origin}/merci?order_id=${input.orderId}&provider=taramoney`,
      webHookUrl: `${input.origin}/api/webhooks/taramoney?key=${encodeURIComponent(webhookSecret)}`,
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new TaraMoneyError(response.status, data?.message || "TaraMoney a refusé le paiement");
  const checkoutUrl = data?.generalLink || (input.provider === "card" ? data?.cardLink : data?.generalLink || data?.cardLink);
  if (!checkoutUrl) throw new TaraMoneyError(502, "TaraMoney n'a pas renvoyé de lien de paiement");
  return { id: data?.paymentId || input.orderId, status: "waiting_payment", checkout_url: checkoutUrl };
}
