import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "cagnotte";
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while ((await query("SELECT 1 FROM campaigns WHERE slug=$1", [slug])).rows[0]) slug = `${base}-${suffix++}`;
  return slug;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const result = await query("SELECT id, title, description, target_amount, collected_amount, status, slug, cover_url, created_at, updated_at FROM campaigns WHERE creator_id=$1 ORDER BY created_at DESC", [userId]);
  return Response.json({ campaigns: result.rows });
}

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
  const coverUrl = typeof body.cover_url === "string" && body.cover_url.length <= 2_500_000 ? body.cover_url : null;
  const slug = await uniqueSlug(title);
  const result = await query("INSERT INTO campaigns (creator_id, title, description, target_amount, slug, cover_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, description, target_amount, collected_amount, status, slug, cover_url, created_at", [userId, title, description || null, Math.round(target), slug, coverUrl]);
  return Response.json({ campaign: result.rows[0] }, { status: 201 });
}
