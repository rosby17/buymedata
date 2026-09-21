import Link from "next/link";
import { query } from "@/lib/db";
import DonationCard, { type DonationCreator } from "@/components/DonationCard";
import { resolveDonationDesign, themeById, type DonationDesign } from "@/lib/donation-page";

export const dynamic = "force-dynamic";

export default async function PersonalSupportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await query<DonationCreator & { username: string } & Partial<DonationDesign>>(`SELECT id, full_name AS name, username, avatar_url, bio, category,
    page_theme, banner_url, page_eyebrow, page_headline, page_tagline, page_cta, page_note
    FROM profiles WHERE username=$1 AND role='creator'`, [username.toLowerCase()]);
  const creator = result.rows[0];

  if (!creator) return <main className="grid min-h-screen place-items-center bg-[#fbf9f4] px-5 text-center"><div><h1 className="text-3xl font-bold">Page introuvable</h1><p className="mt-2 text-sm text-[#6f5a57]">Ce lien de soutien n’est pas encore disponible.</p><Link href="/explore" className="mt-6 inline-block rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white">Explorer les cagnottes</Link></div></main>;

  const design = resolveDonationDesign(creator.username || creator.name, creator);
  const theme = themeById(design.page_theme);

  return (
    <main
      className="min-h-screen px-4 py-8 sm:py-14"
      style={{ background: theme.pageImage ? `${theme.pageImage}, ${theme.page}` : theme.page, color: theme.text }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center">
          <Link href={`/${creator.username}`} className="text-sm font-bold" style={{ color: theme.accent }}>← Voir la page complète</Link>
        </div>
        <div className="mt-8">
          <DonationCard creator={creator} design={design} />
        </div>
        <div className="mt-6 text-center">
          <Link href={`/${creator.username}`} className="text-sm font-semibold underline underline-offset-4" style={{ color: theme.muted }}>
            Voir aussi les cagnottes en cours
          </Link>
        </div>
      </div>
    </main>
  );
}
