import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PersonalSupportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await query(`SELECT id, full_name AS name, username, avatar_url, bio, category
    FROM profiles WHERE username=$1 AND role='creator'`, [username.toLowerCase()]);
  const creator = result.rows[0];

  if (!creator) return <main className="grid min-h-screen place-items-center bg-[#fbf9f4] px-5 text-center"><div><h1 className="text-3xl font-bold">Page introuvable</h1><p className="mt-2 text-sm text-[#6f5a57]">Ce lien de soutien n’est pas encore disponible.</p><Link href="/explore" className="mt-6 inline-block rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white">Explorer les créateurs</Link></div></main>;

  return <main className="min-h-screen bg-[#fbf9f4] px-4 py-8 sm:py-14"><div className="mx-auto max-w-2xl"><div className="flex items-center justify-between"><Link href={`/${creator.username}`} className="text-sm font-bold text-[#b20024]">← Voir la page complète</Link><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a18d88]">Soutien personnel</span></div><section className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#ead6d2] bg-white shadow-[0_18px_50px_rgba(91,64,63,0.08)]"><div className="h-28 bg-[linear-gradient(120deg,#b20024,#e8b7b0_58%,#fff2f1)] sm:h-36"/><div className="px-6 pb-8 text-center sm:px-12 sm:pb-12"><img src={creator.avatar_url||"/buy-me-data-mascot.png"} alt={creator.name} className="relative mx-auto -mt-12 h-24 w-24 rounded-3xl border-4 border-white bg-[#fff2f1] object-cover shadow-md sm:-mt-14 sm:h-28 sm:w-28"/><h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1b1c19]">Soutenir {creator.name}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f5a57]">Un soutien libre pour accompagner son travail et ses prochaines créations.</p>{creator.bio&&<p className="mx-auto mt-4 max-w-lg rounded-2xl bg-[#fbf9f4] px-5 py-4 text-sm leading-6 text-[#5b403f]">{creator.bio}</p>}<Link href={`/pay?creator_id=${creator.id}`} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b20024] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#8e001d] sm:w-auto sm:min-w-64"><span className="material-symbols-outlined text-[20px]">volunteer_activism</span>Faire un don</Link><p className="mt-4 text-xs text-[#7b6864]">Vous choisissez librement le montant de votre soutien.</p></div></section><div className="mt-6 text-center"><Link href={`/${creator.username}`} className="text-sm font-semibold text-[#5b403f] underline decoration-[#e8b7b0] underline-offset-4">Voir aussi les cagnottes en cours</Link></div></div></main>;
}
