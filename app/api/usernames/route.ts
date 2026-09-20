import { query } from "@/lib/db";
import { validUsername } from "@/lib/auth-security";
export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim().toLowerCase() || "";
  if (!validUsername(username)) return Response.json({available:false,error:"Utilisez un nom disponible de 3 à 30 caractères."});
  const result = await query("SELECT 1 FROM profiles WHERE username=$1", [username]);
  return Response.json({available:result.rowCount === 0,username});
}
