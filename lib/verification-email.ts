import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { withTransaction, query } from "./db";

export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM && process.env.NEXT_PUBLIC_SITE_URL);
}
export async function sendVerification(email: string, purpose: "register" | "verify" | "reset", payload: Record<string, string>) {
  if (!mailConfigured()) throw new Error("MAIL_NOT_CONFIGURED");
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await withTransaction(async client => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["verify:" + email]);
    await client.query("DELETE FROM auth_email_tokens WHERE email=$1 OR expires_at<now()", [email]);
    await client.query("INSERT INTO auth_email_tokens(token_hash,email,purpose,payload,expires_at) VALUES($1,$2,$3,$4,now()+interval '30 minutes')", [hash,email,purpose,payload]);
  });
  const link = new URL(purpose === "reset" ? "/reset-password" : "/verify-email", process.env.NEXT_PUBLIC_SITE_URL);
  link.hash = "token=" + token;
  const transport = nodemailer.createTransport({
    host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT || 587), secure:process.env.SMTP_PORT === "465",
    requireTLS:process.env.SMTP_PORT !== "465",
    auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},
    connectionTimeout:10000, socketTimeout:15000,
  });
  try {
    const reset = purpose === "reset";
    await transport.sendMail({from:process.env.SMTP_FROM,to:email,subject:reset ? "Réinitialisez votre mot de passe · Buy Me Data" : "Confirmez votre adresse · Buy Me Data",
      text:(reset ? "Réinitialisez votre mot de passe Buy Me Data :" : "Confirmez votre adresse pour accéder à Buy Me Data :")+"\n\n"+link.toString()+"\n\nCe lien expire dans 30 minutes et ne fonctionne qu’une fois. Si vous n’avez pas fait cette demande, ignorez cet e-mail."});
  } catch {
    await query("DELETE FROM auth_email_tokens WHERE token_hash=$1", [hash]);
    throw new Error("MAIL_DELIVERY_FAILED");
  }
}
