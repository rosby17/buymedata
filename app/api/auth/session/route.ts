import { cookies } from "next/headers";
import { createSession, currentUserId, hashPassword, sessionCookie, verifyPassword, cookieOptions } from "@/lib/auth";
import { authSecret, validEmail, validUsername, sameOrigin } from "@/lib/auth-security";
import { allowAuthAttempt } from "@/lib/auth-limits";
import { mailConfigured, sendVerification } from "@/lib/verification-email";
import { query } from "@/lib/db";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ user:null }, {status:401});
  const result = await query("SELECT id,email,full_name AS name,role,avatar_url,username FROM profiles WHERE id=$1", [userId]);
  (await cookies()).set(sessionCookie,createSession(userId),cookieOptions);
  return Response.json({user:result.rows[0]}, {headers:{"Cache-Control":"no-store"}});
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine de la requête refusée"}, {status:403});
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  if (!validEmail(email) || password.length < 8 || password.length > 256) return Response.json({error:"Adresse valide et mot de passe de 8 à 256 caractères requis."}, {status:400});
  try {
    authSecret();
    if (!await allowAuthAttempt("credentials",email)) return Response.json({error:"Trop de tentatives. Réessayez dans 15 minutes."}, {status:429,headers:{"Retry-After":"900"}});
    if (body.register === true) {
      if (!validUsername(username)) return Response.json({error:"Username indisponible : utilisez 3 à 30 lettres, chiffres, tirets ou underscores."}, {status:400});
      if (!mailConfigured()) return Response.json({error:"L’inscription par e-mail est momentanément indisponible. Essayez Google ou contactez-nous."}, {status:503});
      const exists = await query("SELECT id FROM profiles WHERE lower(email)=$1 OR username=$2", [email,username]);
      if (exists.rowCount) return Response.json({error:"Cette adresse ou ce username est déjà utilisé. Connectez-vous ou choisissez-en un autre."}, {status:409});
      if (!await allowAuthAttempt("mail",email,3,3600)) return Response.json({error:"Veuillez patienter avant de demander un nouvel e-mail."}, {status:429});
      await sendVerification(email,"register",{username,name:username,password:hashPassword(password)});
      return Response.json({verification_required:true,message:"Confirmez votre adresse avec le lien reçu par e-mail. Votre compte sera créé après confirmation."}, {status:202});
    }
    const result = await query("SELECT p.id,p.email,p.full_name AS name,p.email_verified_at,c.password_hash FROM profiles p JOIN auth_credentials c ON c.user_id=p.id WHERE lower(p.email)=$1", [email]);
    const user = result.rows[0];
    // Always perform the expensive comparison, including for unknown addresses.
    const dummy = "0".repeat(32)+":"+"0".repeat(128);
    if (!verifyPassword(password,user?.password_hash || dummy)) return Response.json({error:"Adresse e-mail ou mot de passe incorrect."}, {status:401});
    if (!user.email_verified_at) {
      if (!mailConfigured()) return Response.json({error:"Votre adresse doit être confirmée. L’envoi d’e-mail est indisponible ; contactez-nous."}, {status:503});
      if (!await allowAuthAttempt("mail",email,3,3600)) return Response.json({error:"Consultez votre boîte e-mail ou réessayez plus tard."}, {status:429});
      await sendVerification(email,"verify",{userId:user.id});
      return Response.json({verification_required:true,message:"Un lien de confirmation vous a été envoyé. Confirmez votre adresse avant de vous connecter."}, {status:202});
    }
    (await cookies()).set(sessionCookie,createSession(user.id),cookieOptions);
    return Response.json({user:{id:user.id,email:user.email,name:user.name}});
  } catch {
    return Response.json({error:"Connexion ou envoi de confirmation indisponible. Réessayez plus tard."}, {status:503});
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine refusée"}, {status:403});
  (await cookies()).set(sessionCookie,"",{...cookieOptions,maxAge:0});
  return Response.json({ok:true});
}
