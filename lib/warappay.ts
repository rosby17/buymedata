const WARAPPAY_URL = "https://api.warappay.com/api/v1";

export type WarapPayStatus = "waiting_payment" | "completed" | "failed" | "refunded";

export class WarapPayError extends Error {
  constructor(public readonly status: number, message: string, public readonly code?: string) {
    super(message);
    this.name = "WarapPayError";
  }
}

function apiKey() {
  const key = process.env.WARAPPAY_API_KEY;
  if (!key) throw new WarapPayError(500, "WarapPay is not configured");
  return key;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${WARAPPAY_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    throw new WarapPayError(response.status, error?.message || "WarapPay request failed", error?.code);
  }
  return body as T;
}

export interface CreateCheckoutInput {
  product_code: string;
  email: string;
  customer_name: string;
  customer_phone?: string;
  redirect_url: string;
  // Le produit est à prix libre : le montant choisi par le soutien est
  // obligatoire, faute de quoi WarapPay refuse en 422 AMOUNT_REQUIRED.
  amount: number;
  meta: Record<string, string>;
}

export interface CheckoutResponse {
  id: string;
  status: WarapPayStatus;
  /** Ce que le client paie, frais de service et majoration de zone compris. */
  amount?: number;
  /** Ce dont la boutique est créditée. */
  base_amount?: number;
  currency?: string;
  checkout_url: string | null;
  download_url?: string | null;
  meta?: Record<string, string>;
}

export interface WarapPayProduct {
  code: string;
  name: string;
  pricing_type: "fixed" | "variable";
  price: number;
  min_amount: number | null;
  currency: string;
  available: boolean;
}

// La fiche produit change rarement ; la relire à chaque don gaspillerait le
// quota de 60 requêtes par minute partagé par toute la boutique.
let productCache: { code: string; fetchedAt: number; product: WarapPayProduct } | null = null;

export async function getProduct(code: string) {
  if (productCache && productCache.code === code && Date.now() - productCache.fetchedAt < 300_000) {
    return productCache.product;
  }
  const product = await request<WarapPayProduct>(`/products/${encodeURIComponent(code)}`);
  productCache = { code, fetchedAt: Date.now(), product };
  return product;
}

export function createCheckout(input: CreateCheckoutInput) {
  return request<CheckoutResponse>("/checkout", { method: "POST", body: JSON.stringify(input) });
}

export function getCheckout(id: string) {
  return request<CheckoutResponse>(`/checkout/${encodeURIComponent(id)}`);
}

/** Message destiné au donateur, à partir du code d'erreur WarapPay. */
export function donorMessage(error: WarapPayError) {
  switch (error.code) {
    case "AMOUNT_REQUIRED":
    case "AMOUNT_TOO_LOW":
      return "Ce montant est trop bas pour être encaissé. Choisissez un montant plus élevé.";
    case "AMOUNT_TOO_HIGH":
      return "Ce montant dépasse le plafond accepté. Choisissez un montant plus bas.";
    case "CARD_AMOUNT_TOO_LOW":
      return "Ce montant est trop bas pour un paiement par carte. Utilisez Mobile Money ou augmentez le montant.";
    case "PRODUCT_UNAVAILABLE":
    case "INVALID_PRODUCT":
    case "SHOP_INACTIVE":
    case "PAYMENTS_FROZEN":
    case "ACCESS_REVOKED":
    case "INVALID_API_KEY":
      return "Les paiements Mobile Money sont momentanément indisponibles. Réessayez plus tard.";
    case "COUNTRY_BLOCKED":
      return "Les paiements depuis votre pays sont momentanément suspendus.";
    case "CHANNEL_UNAVAILABLE":
      return "Ce moyen de paiement n’est pas disponible pour le moment.";
    case "RATE_LIMITED":
      return "Trop de demandes en cours. Patientez quelques instants puis réessayez.";
    default:
      return "Le paiement n’a pas pu être lancé. Réessayez dans un instant.";
  }
}
