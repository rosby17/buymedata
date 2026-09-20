import crypto from "node:crypto";

export function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters");
  return secret;
}
export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
export function signPayload(value: unknown) {
  const encoded = Buffer.from(JSON.stringify(value)).toString("base64url");
  return encoded + "." + crypto.createHmac("sha256", authSecret()).update(encoded).digest("base64url");
}
export function readPayload(token?: string): Record<string, unknown> | null {
  if (!token || token.length > 8192) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac("sha256", authSecret()).update(parts[0]).digest("base64url");
  if (!safeEqual(parts[1], expected)) return null;
  try { const data = JSON.parse(Buffer.from(parts[0], "base64url").toString()); return data && typeof data === "object" ? data : null; } catch { return null; }
}
export function createSession(userId: string) {
  return signPayload({ kind: "session-v2", userId, issued: Date.now() });
}
export function readSession(token?: string) {
  const data = readPayload(token);
  if (!data || data.kind !== "session-v2" || typeof data.userId !== "string" || !/^[0-9a-f-]{36}$/i.test(data.userId)) return null;
  if (typeof data.issued !== "number" || !Number.isFinite(data.issued) || data.issued > Date.now() || Date.now() - data.issued > 30 * 86400000) return null;
  return data.userId;
}
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + crypto.scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, encoded: string) {
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(encoded) || password.length > 256) return false;
  const [salt, stored] = encoded.split(":");
  return safeEqual(crypto.scryptSync(password, salt, 64).toString("hex"), stored);
}
export function validUsername(value: string) {
  const reserved = ["about","privacy","terms","contact","api","dashboard","login","signup","explore","pay","merci","admin","verify-email","forgot-password","reset-password"];
  return /^[a-z0-9_-]{3,30}$/.test(value) && !reserved.includes(value);
}
export function validEmail(value: string) { return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
export function sameOrigin(request: Request) {
  const supplied = request.headers.get("origin");
  if (!supplied) return false;
  try {
    const origin = new URL(supplied).origin;
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured && origin === new URL(configured).origin) return true;

    // Next receives the container URL behind Coolify/Traefik. Compare against
    // the public host preserved by the trusted reverse proxy instead.
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || request.headers.get("host");
    if (!host) return false;
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : new URL(request.url).protocol.replace(":", "");
    return origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}
