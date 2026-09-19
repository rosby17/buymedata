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
  meta: Record<string, string>;
}

export interface CheckoutResponse {
  id: string;
  status: WarapPayStatus;
  checkout_url: string | null;
  download_url?: string | null;
  meta?: Record<string, string>;
}

export function createCheckout(input: CreateCheckoutInput) {
  return request<CheckoutResponse>("/checkout", { method: "POST", body: JSON.stringify(input) });
}

export function getCheckout(id: string) {
  return request<CheckoutResponse & { amount?: number; currency?: string }>(`/checkout/${encodeURIComponent(id)}`);
}
