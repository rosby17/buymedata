import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query(`SELECT c.id, c.slug, c.cover_url, c.title, c.description, c.target_amount, c.collected_amount, c.status,
    p.id AS creator_id, p.full_name AS creator_name, p.username, p.avatar_url, p.category
    FROM campaigns c JOIN profiles p ON p.id=c.creator_id WHERE (c.id::text=$1 OR c.slug=$1) AND c.status IN ('active','completed')`, [id]);
  const campaign = result.rows[0];
  if (!campaign) return <main className="grid min-h-screen place-items-center bg-[#fbf9f4] px-5 text-center"><div><h1 className="text-3xl font-bold">Cagnotte introuvable</h1><Link href="/explore" className="mt-6 inline-block text-sm font-bold text-[#b20024]">Explorer les cagnottes</Link></div></main>;
  const percent = Math.min(100, Math.round(Number(campaign.collected_amount) * 100 / Number(campaign.target_amount)));
  return <main className="min-h-screen bg-[#fbf9f4] px-4 py-10 sm:py-16"><div className="mx-auto max-w-xl"><Link href={`/${campaign.username}`} className="text-sm font-bold text-[#b20024]">← Retour au profil de {campaign.creator_name}</Link><section className="mt-6 overflow-hidden rounded-3xl border border-[#ead6d2] bg-white shadow-sm"><div className="h-52 bg-[#fff2f1]"><img src={campaign.cover_url||"/buy-me-data-mascot.png"} alt={campaign.title} className="h-full w-full object-cover"/></div><div className="p-6 sm:p-8"><div className="flex items-center gap-3"><img src={campaign.avatar_url||"/buy-me-data-mascot.png"} alt="" className="h-12 w-12 rounded-xl object-cover"/><div><p className="font-bold">{campaign.creator_name}</p><p className="text-xs text-[#6f5a57]">{campaign.category||"Créateur"}</p></div></div><h1 className="mt-7 text-3xl font-bold tracking-tight">{campaign.title}</h1>{campaign.description&&<p className="mt-3 text-sm leading-6 text-[#5b403f]">{campaign.description}</p>}<div className="mt-7 rounded-2xl bg-[#fbf9f4] p-5"><div className="flex justify-between gap-3"><p className="font-bold">Progression</p><p className="font-bold text-[#b20024]">{percent}%</p></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#eadfdb]"><div className="h-full bg-[#b20024]" style={{ width: `${percent}%` }}/></div><p className="mt-3 text-sm text-[#6f5a57]">{Number(campaign.collected_amount).toLocaleString("fr-FR")} FCFA collectés sur {Number(campaign.target_amount).toLocaleString("fr-FR")} FCFA</p></div>{campaign.status === "completed" ? <p className="mt-6 rounded-xl bg-[#edf5ef] px-5 py-4 text-center font-bold text-[#315c38]">Objectif financé · Merci à la communauté !</p> : <Link href={`/pay?creator_id=${campaign.creator_id}&campaign_id=${campaign.id}`} className="mt-6 block rounded-xl bg-[#b20024] px-5 py-4 text-center font-bold text-white">Soutenir cette cagnotte</Link>}</div></section></div></main>;
}
