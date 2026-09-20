import { currentUserId, hashPassword, verifyPassword } from "@/lib/auth";
import { allowAuthAttempt } from "@/lib/auth-limits";
import { sameOrigin } from "@/lib/auth-security";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine refusée"},{status:403});
  const userId = await currentUserId();
  if (!userId) return Response.json({error:"Authentication required"},{status:401});
  if (!await allowAuthAttempt("change-password",userId,5,900)) return Response.json({error:"Trop de tentatives. Réessayez dans 15 minutes."},{status:429});
  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 8 || newPassword.length > 256) return Response.json({error:"Le nouveau mot de passe doit contenir 8 à 256 caractères."},{status:400});
  const result = await query("SELECT password_hash FROM auth_credentials WHERE user_id=$1",[userId]);
  if (!result.rows[0]) return Response.json({error:"Ce compte utilise Google. Utilisez « Mot de passe oublié » pour créer un mot de passe."},{status:400});
  if (!verifyPassword(currentPassword,result.rows[0].password_hash)) return Response.json({error:"Mot de passe actuel incorrect."},{status:401});
  await query("UPDATE auth_credentials SET password_hash=$2 WHERE user_id=$1",[userId,hashPassword(newPassword)]);
  return Response.json({ok:true});
}
