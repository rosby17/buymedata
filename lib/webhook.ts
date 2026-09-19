import crypto from "node:crypto";

export function verifyWarapPaySignature(rawBody: string, signature: string | null) {
  const secret = process.env.WARAPPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const actual = Buffer.from(signature, "utf8");
  const wanted = Buffer.from(expected, "utf8");
  return actual.length === wanted.length && crypto.timingSafeEqual(actual, wanted);
}
