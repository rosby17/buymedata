import crypto from "node:crypto";
import { sameOrigin, hashPassword } from "@/lib/auth-security";
import { withTransaction } from "@/lib/db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine refusée"},{status:403});
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[a-f0-9]{64}$/.test(token) || password.length < 8 || password.length > 256) return Response.json({error:"Lien invalide ou mot de passe non conforme."},{status:400});
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const changed = await withTransaction(async client => {
    const result = await client.query("DELETE FROM auth_email_tokens WHERE token_hash=$1 AND purpose='reset' AND expires_at>now() RETURNING payload",[hash]);
    const userId = result.rows[0]?.payload?.userId;
    if (!userId) return false;
    const update = await client.query("UPDATE auth_credentials SET password_hash=$2 WHERE user_id=$1 RETURNING user_id",[userId,hashPassword(password)]);
    await client.query("UPDATE profiles SET email_verified_at=COALESCE(email_verified_at,now()),updated_at=now() WHERE id=$1",[userId]);
    return !!update.rowCount;
  });
  return changed ? Response.json({ok:true}) : Response.json({error:"Ce lien a expiré ou a déjà été utilisé."},{status:400});
}
