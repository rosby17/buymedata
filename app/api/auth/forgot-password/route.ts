import { allowAuthAttempt } from "@/lib/auth-limits";
import { sameOrigin, validEmail } from "@/lib/auth-security";
import { query } from "@/lib/db";
import { mailConfigured, sendVerification } from "@/lib/verification-email";

const generic = "Si un compte avec mot de passe correspond à cette adresse, un lien de réinitialisation vient d’être envoyé.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine refusée"},{status:403});
  if (!mailConfigured()) return Response.json({error:"L’envoi d’e-mail est momentanément indisponible."},{status:503});
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!validEmail(email)) return Response.json({message:generic});
  if (!await allowAuthAttempt("password-reset",email,3,3600)) return Response.json({message:generic});
  const result = await query("SELECT p.id FROM profiles p JOIN auth_credentials c ON c.user_id=p.id WHERE lower(p.email)=$1",[email]);
  if (result.rows[0]) await sendVerification(email,"reset",{userId:result.rows[0].id});
  return Response.json({message:generic});
}
