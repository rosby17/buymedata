import crypto from "node:crypto";
import { withTransaction } from "@/lib/db";
import { sameOrigin } from "@/lib/auth-security";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine refusée"}, {status:403});
  const body = await request.json().catch(() => ({}));
  if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) return Response.json({error:"Lien de confirmation invalide."}, {status:400});
  try {
    const hash = crypto.createHash("sha256").update(body.token).digest("hex");
    const verified = await withTransaction(async client => {
      const result = await client.query("DELETE FROM auth_email_tokens WHERE token_hash=$1 AND expires_at>now() RETURNING *",[hash]);
      const token = result.rows[0];
      if (!token) return false;
      if (token.purpose === "register") {
        const id = crypto.randomUUID();
        await client.query("INSERT INTO profiles(id,email,full_name,username,role,email_verified_at) VALUES($1,$2,$3,$4,'creator',now())",[id,token.email,token.payload.name,token.payload.username]);
        await client.query("INSERT INTO auth_credentials(user_id,password_hash) VALUES($1,$2)",[id,token.payload.password]);
      } else {
        const updated = await client.query("UPDATE profiles SET email_verified_at=now() WHERE id=$1 AND lower(email)=$2 RETURNING id",[token.payload.userId,token.email]);
        if (!updated.rowCount) return false;
      }
      return true;
    });
    return verified ? Response.json({ok:true}) : Response.json({error:"Ce lien a expiré ou a déjà été utilisé. Recommencez l’inscription ou la connexion pour recevoir un nouveau lien."},{status:400});
  } catch (error) {
    if ((error as {code?:string}).code === "23505") return Response.json({error:"Le username ou l’adresse est désormais utilisé. Recommencez avec un autre username ou connectez-vous."},{status:409});
    return Response.json({error:"Confirmation indisponible. Réessayez plus tard."},{status:503});
  }
}
