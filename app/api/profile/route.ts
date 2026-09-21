import { validUsername, sameOrigin } from "@/lib/auth-security";
import { donationTextLimits, safeBannerUrl, themeById } from "@/lib/donation-page";
import { query } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

export async function GET() {
  const id = await currentUserId();
  if (!id) return Response.json({ error: "Authentication required" }, { status: 401 });
  const result = await query("SELECT id, email, full_name, role, phone, avatar_url, username, bio, category, page_theme, banner_url, page_eyebrow, page_headline, page_tagline, page_cta, page_note, onboarding_completed, created_at FROM profiles WHERE id = $1", [id]);
  if (!result.rows[0]) return Response.json({ error: "Profile not found" }, { status: 404 });
  return Response.json({ profile: result.rows[0] });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Origine refusée"},{status:403});
  const id = await currentUserId();
  if (!id) return Response.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = typeof body.full_name === "string" ? body.full_name.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const avatar = typeof body.avatar_url === "string" ? body.avatar_url.trim() : undefined;
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : undefined;
  const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 240) : undefined;
  const category = typeof body.category === "string" ? body.category.trim().slice(0, 80) : undefined;
  if (username !== undefined && !validUsername(username)) return Response.json({ error: "Username indisponible ou invalide (3 à 30 caractères)." }, { status: 400 });

  // Personnalisation de la page de dons. `undefined` = champ absent du corps,
  // donc inchangé ; chaîne vide = retour au texte par défaut.
  const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
  const design = {
    theme: typeof body.page_theme === "string" ? themeById(body.page_theme).id : null,
    banner: typeof body.banner_url === "string" ? safeBannerUrl(body.banner_url.trim()) : null,
    eyebrow: text(body.page_eyebrow, donationTextLimits.page_eyebrow),
    headline: text(body.page_headline, donationTextLimits.page_headline),
    tagline: text(body.page_tagline, donationTextLimits.page_tagline),
    cta: text(body.page_cta, donationTextLimits.page_cta),
    note: text(body.page_note, donationTextLimits.page_note),
  };
  if (typeof body.banner_url === "string" && body.banner_url.trim() && !design.banner) {
    return Response.json({ error: "Adresse de bannière invalide : utilisez une URL d’image en https." }, { status: 400 });
  }
  // Une chaîne vide efface la valeur ; l'absence de clé la laisse telle quelle.
  const keepOrReset = (column: string, index: number) =>
    `${column} = CASE WHEN $${index}::text IS NULL THEN ${column} WHEN $${index} = '' THEN NULL ELSE $${index} END`;

  try {
    const result = await query(`UPDATE profiles SET
      full_name = COALESCE($2, full_name), phone = COALESCE($3, phone), avatar_url = COALESCE($4, avatar_url),
      username = COALESCE($5, username), bio = COALESCE($6, bio), category = COALESCE($7, category),
      page_theme = COALESCE($8, page_theme),
      ${keepOrReset("banner_url", 9)},
      ${keepOrReset("page_eyebrow", 10)},
      ${keepOrReset("page_headline", 11)},
      ${keepOrReset("page_tagline", 12)},
      ${keepOrReset("page_cta", 13)},
      ${keepOrReset("page_note", 14)},
      onboarding_completed = CASE WHEN COALESCE($2, full_name) <> '' AND COALESCE($5, username) <> '' AND COALESCE($6, bio) <> '' THEN true ELSE onboarding_completed END,
      updated_at = now() WHERE id = $1
      RETURNING id, email, full_name, role, phone, avatar_url, username, bio, category,
        page_theme, banner_url, page_eyebrow, page_headline, page_tagline, page_cta, page_note, onboarding_completed`,
      [id, name || null, phone || null, avatar || null, username || null, bio || null, category || null,
        design.theme, design.banner, design.eyebrow, design.headline, design.tagline, design.cta, design.note]);
    return Response.json({ profile: result.rows[0] });
  } catch (error) {
    if (String(error).includes("profiles_username_key")) return Response.json({ error: "Ce nom public est déjà utilisé" }, { status: 409 });
    throw error;
  }
}
