import { query } from "@/lib/db";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") || "";
  if (username.length < 3 || username.length > 30) return Response.json({ available: false, error: "3 à 30 caractères" });
  const result = await query("SELECT 1 FROM profiles WHERE username = $1", [username]);
  return Response.json({ available: result.rowCount === 0, username });
}
