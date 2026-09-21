import Link from "next/link";
import { query } from "@/lib/db";
import { resolveDonationDesign, themeById } from "@/lib/donation-page";

export const dynamic = "force-dynamic";
type Campaign = { id:string; slug?:string; cover_url?:string; title:string; description?:string; target_amount:number; collected_amount:number };

export default async function PublicCreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await query(`SELECT p.id, p.full_name AS name, p.username, p.avatar_url, p.bio, p.category,
    p.page_theme, p.page_tagline, p.page_cta,
    COALESCE(json_agg(json_build_object('id', c.id, 'slug', c.slug, 'cover_url', c.cover_url, 'title', c.title, 'description', c.description,
      'target_amount', c.target_amount, 'collected_amount', c.collected_amount)) FILTER (WHERE c.id IS NOT NULL), '[]') AS campaigns
    FROM profiles p LEFT JOIN campaigns c ON c.creator_id=p.id AND c.status='active'
    WHERE p.username=$1 AND p.role='creator' GROUP BY p.id`, [username.toLowerCase()]);
  const creator = result.rows[0];
  if (!creator) return <main className="grid min-h-screen place-items-center bg-[#fbf9f4] px-5 text-center"><div><h1 className="text-3xl font-bold">Page introuvable</h1><p className="mt-2 text-sm text-[#6f5a57]">Ce lien de soutien n’est pas encore disponible.</p><Link href="/explore" className="mt-6 inline-block rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white">Explorer les cagnottes</Link></div></main>;
  const campaigns = (creator.campaigns || []) as Campaign[];
  const design = resolveDonationDesign(creator.username || creator.name, creator);
  const theme = themeById(design.page_theme);
  const pageBackground = theme.pageImage ? `${theme.pageImage}, ${theme.page}` : theme.page;
  const cardStyle = { background: theme.surface, borderColor: theme.border, borderRadius: theme.radius, boxShadow: theme.shadow, color: theme.text };
  return (
    <main className="min-h-screen px-4 py-10 sm:py-14" style={{ background: pageBackground, color: theme.text }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold" style={{ color: theme.accent }}>Buy Me Data</Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: theme.eyebrow }}>Page publique</span>
        </div>

        <section className="mt-8 grid gap-5 border p-6 sm:grid-cols-[1fr_0.8fr] sm:p-8" style={cardStyle}>
          <div className="flex items-center gap-5">
            <img
              src={creator.avatar_url || "/buy-me-data-mascot.png"}
              alt={creator.name}
              className="h-24 w-24 object-cover sm:h-28 sm:w-28"
              style={{ borderRadius: theme.avatarRadius, background: theme.quote }}
            />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: theme.display, fontWeight: theme.headlineWeight, letterSpacing: theme.headlineTracking }}>{creator.name}</h1>
              <p className="mt-1 text-sm" style={{ color: theme.muted }}>{creator.category || "Créateur de contenu"}</p>
              {creator.bio && <p className="mt-3 max-w-md text-sm leading-6" style={{ color: theme.text }}>{creator.bio}</p>}
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-6" style={{ background: theme.quote, borderRadius: `calc(${theme.radius} / 1.6)` }}>
            <p className="text-sm leading-6" style={{ color: theme.text }}>{design.page_tagline}</p>
            <Link
              href={`/${creator.username}/donate`}
              className="mt-4 inline-flex items-center justify-center px-5 py-3.5 text-center text-sm font-bold"
              style={{ background: theme.accent, color: theme.accentText, borderRadius: `calc(${theme.radius} / 2.5)` }}
            >
              {design.page_cta}
            </Link>
          </div>
        </section>

        {campaigns.length > 0 && (
          <section className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: theme.eyebrow }}>Objectifs dédiés</p>
                <h2 className="mt-1 text-2xl font-bold" style={{ fontFamily: theme.display }}>Cagnottes en cours</h2>
              </div>
              <span className="text-xs" style={{ color: theme.muted }}>{campaigns.length} active{campaigns.length > 1 ? "s" : ""}</span>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {campaigns.map(campaign => {
                const percent = Math.min(100, Math.round(Number(campaign.collected_amount) * 100 / Number(campaign.target_amount)));
                return (
                  <Link
                    key={campaign.id}
                    href={`/c/${campaign.slug || campaign.id}`}
                    className="grid overflow-hidden border transition hover:-translate-y-0.5 sm:grid-cols-[9rem_1fr]"
                    style={cardStyle}
                  >
                    <div className="h-36 sm:h-full" style={{ background: theme.quote }}>
                      <img src={campaign.cover_url || "/buy-me-data-mascot.png"} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold">{campaign.title}</p>
                        <span className="text-sm font-bold" style={{ color: theme.accent }}>{percent}%</span>
                      </div>
                      {campaign.description && <p className="mt-2 line-clamp-2 text-sm" style={{ color: theme.muted }}>{campaign.description}</p>}
                      <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: theme.quote }}>
                        <div className="h-full" style={{ width: `${percent}%`, background: theme.accent }} />
                      </div>
                      <p className="mt-2 text-xs" style={{ color: theme.muted }}>
                        {Number(campaign.collected_amount).toLocaleString("fr-FR")} / {Number(campaign.target_amount).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
