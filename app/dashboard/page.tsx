"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandSelect from "@/components/BrandSelect";
import SupportAmount from "@/components/SupportAmount";
import { useDashboardProfile } from "@/components/DashboardShell";
// The dashboard layout owns the persistent application header.
const Navbar = () => null;

type Campaign = { id:string; title:string; current:number|string; total:number|string; status:string };
type Activity = { id:string; name:string; message?:string; amount:number|string; status:string };
type Support = { id:string; creator_name:string; creator_avatar?:string; amount:number|string; currency:string; status:string; created_at:string; message?:string };

export default function DashboardPage() {
  const profile=useDashboardProfile();
  const [campaigns,setCampaigns]=useState<Campaign[]>([]);
  const [activity,setActivity]=useState<Activity[]>([]);
  const [stats,setStats]=useState({collected:0,last30:0,last90:0,supporters:0,available:0,directSupport:0,campaignSupport:0});
  const [supports,setSupports]=useState<Support[]>([]);
  const [loadError,setLoadError]=useState("");
  const [copied,setCopied]=useState(false);
  const [period,setPeriod]=useState<"30"|"90"|"all">("30");

  const load=async()=>{
    const d=await fetch("/api/dashboard",{cache:"no-store"});
    if(d.status===401){window.location.replace("/login?next=%2Fdashboard");return;}
    if(!d.ok) throw new Error("Dashboard unavailable");
    const dd=await d.json();
    setCampaigns(dd.campaigns||[]); setActivity(dd.activity||[]);
    setSupports(dd.supports||[]);
    setStats({collected:Number(dd.stats?.collected||0),last30:Number(dd.stats?.last30||0),last90:Number(dd.stats?.last90||0),supporters:Number(dd.stats?.supporters||0),available:Number(dd.stats?.available||0),directSupport:Number(dd.stats?.direct_support||0),campaignSupport:Number(dd.stats?.campaign_support||0)});
  };
  useEffect(()=>{const timer=window.setTimeout(()=>{load().catch(()=>setLoadError("Les chiffres n’ont pas pu être actualisés."));},0);return()=>window.clearTimeout(timer);},[]);
  const publicUrl=profile?.username ? `https://buymedata.tools-cl.com/${profile.username}` : "";
  const periodValue=period==="30"?stats.last30:period==="90"?stats.last90:stats.collected;
  async function copyPublicLink(){if(!publicUrl)return;await navigator.clipboard?.writeText(publicUrl);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}


  if(profile.role==="supporter")return <><Navbar/><main className="mx-auto max-w-5xl px-5 py-10"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[#b20024]">Votre espace soutien</p><h1 className="mt-2 text-3xl font-bold">Bonjour, {profile.full_name||profile.email.split("@")[0]}</h1><p className="mt-2 text-sm text-[#6f5a57]">Retrouvez uniquement vos contributions réelles.</p></div><Link href="/explore" className="rounded-xl bg-[#b20024] px-5 py-3 text-center text-sm font-bold text-white">Explorer les cagnottes</Link></header><section className="mt-8 grid gap-4 sm:grid-cols-2"><Metric label="Total soutenu" value={`${stats.collected.toLocaleString("fr-FR")} FCFA`}/><Metric label="Paiements réussis" value={String(stats.supporters)}/></section><section className="mt-8 rounded-2xl border border-[#ead6d2] bg-white p-5 sm:p-7"><h2 className="text-xl font-bold">Mes soutiens</h2><div className="mt-5 space-y-3">{supports.length===0?<Empty text="Vous n’avez encore soutenu aucun créateur."/>:supports.map(s=><div key={s.id} className="flex items-center gap-4 rounded-xl bg-[#fbf9f4] p-4"><img src={s.creator_avatar||"/buy-me-data-mascot.png"} alt="" className="h-11 w-11 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="truncate font-semibold">{s.creator_name}</p><p className="text-xs text-[#7b6864]">{new Date(s.created_at).toLocaleDateString("fr-FR")} · {s.status}</p></div><p className="font-bold text-[#b20024]">{Number(s.amount).toLocaleString("fr-FR")} FCFA</p></div>)}</div></section></main></>;
  return <><Navbar/><div className="min-h-[calc(100vh-4rem)] bg-[#f5f3ee]"><main className="mx-auto min-w-0 max-w-5xl px-5 py-8 sm:px-8">{loadError&&<div className="mb-5 rounded-xl bg-[#fff2f1] px-4 py-3 text-sm font-semibold text-[#8e001d]">{loadError}</div>}
    <header className="mb-5 rounded-2xl border border-[#ead6d2] bg-white p-5 shadow-[0_10px_24px_rgba(91,64,63,0.05)] sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><img src={profile.avatar_url||"/buy-me-data-mascot.png"} alt="" className="h-14 w-14 rounded-2xl bg-[#fff2f1] object-cover"/><div className="min-w-0"><h1 className="text-lg font-bold text-[#1b1c19]">Bonjour, {(profile.full_name||profile.email.split("@")[0]).split(" ")[0]}</h1><p className="mt-1 truncate text-sm text-[#6f5a57]">{publicUrl||"Choisissez votre lien public dans Mon compte"}</p></div></div><div className="flex flex-wrap gap-2"><button onClick={copyPublicLink} disabled={!publicUrl} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1b1c19] px-4 text-sm font-bold text-white transition hover:bg-[#30312d] disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-[19px]">{copied?"check":"ios_share"}</span><span>{copied?"Lien copié":"Partager"}</span></button><Link href={profile.username?`/${profile.username}`:"/dashboard/settings"} target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#b20024] px-4 text-sm font-bold text-[#b20024] transition hover:bg-[#fff2f1]"><span className="material-symbols-outlined text-[19px]">open_in_new</span><span>Voir ma page</span></Link></div></div></header>
    <section className="mb-5 rounded-2xl border border-[#ead6d2] bg-white p-5 shadow-[0_10px_24px_rgba(91,64,63,0.05)] sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-bold text-[#1b1c19]">Revenus</h2><BrandSelect label="Période des revenus" value={period} onChange={value=>setPeriod(value as "30"|"90"|"all")} options={[{value:"30",label:"30 derniers jours"},{value:"90",label:"90 derniers jours"},{value:"all",label:"Depuis toujours"}]}/></div><p className="mt-5 text-4xl font-bold tracking-tight text-[#1b1c19]">{periodValue.toLocaleString("fr-FR")} FCFA</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6f5a57]"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-[#b20024]"/>Soutiens directs · {stats.directSupport.toLocaleString("fr-FR")} FCFA</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-[#e8b7b0]"/>Cagnottes · {stats.campaignSupport.toLocaleString("fr-FR")} FCFA</span></div></section>
    <section className="grid gap-5 lg:grid-cols-3"><Link href="/dashboard/campaigns" className="rounded-2xl border border-[#ead6d2] bg-white p-6 shadow-[0_10px_24px_rgba(91,64,63,0.05)] transition hover:-translate-y-0.5"><span className="material-symbols-outlined text-[#b20024]">flag</span><h2 className="mt-4 text-xl font-bold">Cagnottes</h2><p className="mt-2 text-sm text-[#6f5a57]">{campaigns.length} objectif{campaigns.length!==1?"s":""} · créer, modifier et partager.</p><span className="mt-5 inline-block text-sm font-bold text-[#b20024]">Gérer mes cagnottes →</span></Link><Link href="/dashboard/support" className="rounded-2xl border border-[#ead6d2] bg-white p-6 shadow-[0_10px_24px_rgba(91,64,63,0.05)] transition hover:-translate-y-0.5"><span className="material-symbols-outlined text-[#b20024]">volunteer_activism</span><h2 className="mt-4 text-xl font-bold">Me soutenir</h2><p className="mt-2 text-sm text-[#6f5a57]">Configurez et partagez votre page de soutien personnelle.</p><span className="mt-5 inline-block text-sm font-bold text-[#b20024]">Gérer ma page de soutien →</span></Link><Link href="/dashboard/withdrawals" className="rounded-2xl border border-[#ead6d2] bg-white p-6 shadow-[0_10px_24px_rgba(91,64,63,0.05)] transition hover:-translate-y-0.5"><span className="material-symbols-outlined text-[#b20024]">payments</span><h2 className="mt-4 text-xl font-bold">Retraits</h2><p className="mt-2 text-sm text-[#6f5a57]">{stats.available.toLocaleString("fr-FR")} FCFA disponibles.</p><span className="mt-5 inline-block text-sm font-bold text-[#b20024]">Gérer mes retraits →</span></Link></section>
    <section className="mt-5 rounded-2xl border border-[#ead6d2] bg-white p-5 shadow-[0_10px_24px_rgba(91,64,63,0.05)] sm:p-6"><h2 className="font-bold text-[#1b1c19]">Derniers soutiens</h2><div className="mt-4 space-y-3">{activity.length===0?<Empty text="Vos prochaines contributions apparaîtront ici."/>:activity.slice(0,5).map(a=><div key={a.id} className="flex items-start justify-between gap-3 border-b border-[#f0e8e5] pb-3 last:border-0"><div><p className="text-sm font-semibold">{a.name}</p>{a.message&&<p className="mt-1 text-xs text-[#6f5a57]">{a.message}</p>}</div><SupportAmount amount={a.amount} status={a.status}/></div>)}</div></section>
  </main></div></>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[#ead6d2] bg-white p-5 shadow-[0_10px_24px_rgba(91,64,63,0.06)]"><p className="text-xs font-semibold uppercase tracking-wide text-[#7b6864]">{label}</p><p className="mt-2 text-2xl font-bold text-[#1b1c19]">{value}</p></div>}
function Empty({text}:{text:string}){return <div className="rounded-xl border border-dashed border-[#dec9c4] px-4 py-6 text-center text-xs text-[#7b6864]">{text}</div>}
