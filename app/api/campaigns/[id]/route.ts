import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";

async function ownsCampaign(id: string, userId: string) {
  const result = await query("SELECT id FROM campaigns WHERE id=$1 AND creator_id=$2", [id, userId]);
  return Boolean(result.rows[0]);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  if (!await ownsCampaign(id, userId)) return Response.json({ error: "Cagnotte introuvable" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : null;
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : null;
  const target = body.target_amount === undefined ? null : Number(body.target_amount);
  const status = ["active", "paused", "archived"].includes(body.status) ? body.status : null;
  if (title !== null && title.length < 3) return Response.json({ error: "Titre trop court" }, { status: 400 });
  if (target !== null && (!Number.isFinite(target) || target < 1000)) return Response.json({ error: "Objectif minimum : 1 000 FCFA" }, { status: 400 });
  const result = await query(`UPDATE campaigns SET title=COALESCE($3,title), description=COALESCE($4,description),
    target_amount=COALESCE($5,target_amount), status=COALESCE($6,status), updated_at=now()
    WHERE id=$1 AND creator_id=$2 RETURNING id,title,description,target_amount,collected_amount,status,updated_at`, [id, userId, title, description, target === null ? null : Math.round(target), status]);
  return Response.json({ campaign: result.rows[0] });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const result = await query("DELETE FROM campaigns WHERE id=$1 AND creator_id=$2 AND collected_amount=0 RETURNING id", [id, userId]);
  if (!result.rows[0]) return Response.json({ error: "Seules les cagnottes sans don peuvent être supprimées" }, { status: 400 });
  return Response.json({ deleted: true });
}
