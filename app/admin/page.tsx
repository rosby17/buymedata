"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopUpLogo } from "@/components/Navbar";

type AdminData = {
  stats:{creators:number;supporters:number;completed_orders:number;collected:number|string};
  creators:Array<{id:string;full_name:string;email:string;username?:string;avatar_url?:string;onboarding_completed:boolean;created_at:string;collected:number|string}>;
  orders:Array<{id:string;customer_name:string;creator_name:string;amount:number|string;currency:string;status:string;created_at:string}>;
  withdrawals:Array<{id:string;creator_name:string;amount:number|string;currency:string;method:string;destination:string;status:string;created_at:string}>;
};

export default function AdminDashboard() {
  const [data,setData]=useState<AdminData|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/admin",{cache:"no-store"}).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error||"Chargement impossible");return p;}).then(setData).catch(e=>setError(e.message));},[]);
  return <div className="min-h-screen bg-[#fbf9f4] text-[#1b1c19]"><nav className="border-b border-[#e4bdbc] bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2"><TopUpLogo className="h-8 w-8"/><span className="font-bold text-[#b20024]">Buy Me Data · Admin</span></Link><Link href="/app" className="text-sm font-semibold text-[#5b403f]">Mon espace</Link></div></nav>
    <main className="mx-auto max-w-7xl px-5 py-10"><h1 className="text-3xl font-bold">Pilotage de la plateforme</h1><p className="mt-2 text-sm text-[#6f5a57]">Uniquement des données enregistrées dans PostgreSQL.</p>
      {error&&<div className="mt-8 rounded-2xl border border-[#e4bdbc] bg-white p-8 text-center"><p className="font-bold text-[#b20024]">{error}</p><Link href="/app" className="mt-4 inline-block text-sm font-semibold underline">Retour au tableau de bord</Link></div>}
      {!data&&!error&&<p className="py-20 text-center text-sm text-[#6f5a57]">Chargement…</p>}
      {data&&<><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Créateurs" value={data.stats.creators}/><Metric label="Soutiens" value={data.stats.supporters}/><Metric label="Paiements réussis" value={data.stats.completed_orders}/><Metric label="Total collecté" value={`${Number(data.stats.collected).toLocaleString("fr-FR")} FCFA`}/></section>
        <Table title="Créateurs"><thead><tr><Th>Créateur</Th><Th>Profil</Th><Th>Collecté</Th><Th>Inscription</Th></tr></thead><tbody>{data.creators.length?data.creators.map(c=><tr key={c.id} className="border-t border-[#f0e8e5]"><Td><div className="flex items-center gap-3"><img src={c.avatar_url||"/buy-me-data-mascot.png"} alt="" className="h-9 w-9 rounded-xl object-cover"/><div><p className="font-semibold">{c.full_name}</p><p className="text-xs text-[#7b6864]">{c.email}</p></div></div></Td><Td>{c.onboarding_completed?"Publié":"À compléter"}</Td><Td>{Number(c.collected).toLocaleString("fr-FR")} FCFA</Td><Td>{new Date(c.created_at).toLocaleDateString("fr-FR")}</Td></tr>):<EmptyRow/>}</tbody></Table>
        <Table title="Paiements récents"><thead><tr><Th>Soutien</Th><Th>Créateur</Th><Th>Montant</Th><Th>Statut</Th><Th>Date</Th></tr></thead><tbody>{data.orders.length?data.orders.map(o=><tr key={o.id} className="border-t border-[#f0e8e5]"><Td>{o.customer_name}</Td><Td>{o.creator_name}</Td><Td>{Number(o.amount).toLocaleString("fr-FR")} {o.currency}</Td><Td><Status value={o.status}/></Td><Td>{new Date(o.created_at).toLocaleString("fr-FR")}</Td></tr>):<EmptyRow/>}</tbody></Table>
        <Table title="Retraits"><thead><tr><Th>Créateur</Th><Th>Montant</Th><Th>Méthode</Th><Th>Statut</Th><Th>Date</Th></tr></thead><tbody>{data.withdrawals.length?data.withdrawals.map(w=><tr key={w.id} className="border-t border-[#f0e8e5]"><Td>{w.creator_name}</Td><Td>{Number(w.amount).toLocaleString("fr-FR")} {w.currency}</Td><Td>{w.method==="crypto"?"Crypto":"Mobile Money"}</Td><Td><Status value={w.status}/></Td><Td>{new Date(w.created_at).toLocaleString("fr-FR")}</Td></tr>):<EmptyRow/>}</tbody></Table>
      </>}
    </main></div>;
}

function Metric({label,value}:{label:string;value:string|number}){return <div className="rounded-2xl border border-[#ead6d2] bg-white p-5"><p className="text-xs font-semibold uppercase text-[#7b6864]">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>}
function Table({title,children}:{title:string;children:React.ReactNode}){return <section className="mt-8 overflow-hidden rounded-2xl border border-[#ead6d2] bg-white"><h2 className="p-5 text-lg font-bold">{title}</h2><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">{children}</table></div></section>}
function Th({children}:{children:React.ReactNode}){return <th className="bg-[#f7f3f0] px-5 py-3 text-xs uppercase text-[#7b6864]">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="px-5 py-4">{children}</td>}
function Status({value}:{value:string}){return <span className="rounded-full bg-[#f3eeeb] px-2.5 py-1 text-xs font-semibold">{value}</span>}
function EmptyRow(){return <tr><td colSpan={5} className="px-5 py-10 text-center text-[#7b6864]">Aucune donnée.</td></tr>}
