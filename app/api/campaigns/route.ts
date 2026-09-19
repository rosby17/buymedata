import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim().slice(0, 500);
  const target = Number(body.target_amount);
  if (title.length < 3 || !Number.isFinite(target) || target < 1000) return Response.json({ error: "Titre et objectif minimum de 1 000 FCFA requis" }, { status: 400 });
  const owner = await query("SELECT role FROM profiles WHERE id = $1", [userId]);
  if (owner.rows[0]?.role !== "creator") return Response.json({ error: "Seuls les créateurs peuvent créer une cagnotte" }, { status: 403 });
  const result = await query("INSERT INTO campaigns (creator_id, title, description, target_amount) VALUES ($1, $2, $3, $4) RETURNING id, title, description, target_amount, collected_amount, status, created_at", [userId, title, description || null, Math.round(target)]);
  return Response.json({ campaign: result.rows[0] }, { status: 201 });
}
