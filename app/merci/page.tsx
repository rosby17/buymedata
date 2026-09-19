"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Order = {
  id: string; amount: number | string; currency: string; status: "pending"|"waiting_payment"|"completed"|"failed"|"refunded";
  created_at: string; provider?: string; creator_id: string; creator_name: string; creator_avatar?: string;
  creator_category?: string; campaign_title?: string;
};

function ConfirmationInner() {
  const orderId = useSearchParams().get("order_id") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Commande introuvable");
        if (!active) return;
        setOrder(payload.order);
        if (["pending", "waiting_payment"].includes(payload.order.status)) timer = setTimeout(load, 3000);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Vérification impossible"); }
    };
    load();
    return () => { active = false; clearTimeout(timer); };
  }, [orderId]);

  if (!orderId || error) return <><Navbar/><main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-2xl font-bold">Confirmation indisponible</h1><p className="mt-3 text-sm text-[#6f5a57]">{error || "Référence de commande manquante."}</p><Link href="/explore" className="mt-6 inline-block rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white">Retour à Explorer</Link></main><Footer/></>;
  if (!order) return <><Navbar/><main className="mx-auto max-w-xl px-5 py-24 text-center text-sm text-[#6f5a57]">Vérification du paiement…</main><Footer/></>;

  const completed = order.status === "completed";
  const failed = order.status === "failed" || order.status === "refunded";
  const amount = Number(order.amount);
  const title = completed ? "Paiement confirmé" : failed ? "Paiement non finalisé" : "Paiement en cours de confirmation";
  const statusText = completed ? "Confirmé" : failed ? (order.status === "refunded" ? "Remboursé" : "Échoué") : "En attente";
  const tone = completed ? "#496546" : failed ? "#b20024" : "#9a6200";

  return <><Navbar/><main className="min-h-[70vh] bg-[#fbf9f4] px-4 py-12"><div className="mx-auto max-w-xl text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{backgroundColor:completed?"#c8e9c1":failed?"#ffdad8":"#fff0c7",color:tone}}><span className="material-symbols-outlined text-5xl">{completed?"check_circle":failed?"error":"hourglass_top"}</span></div>
    <h1 className="mt-6 text-3xl font-bold text-[#1b1c19]">{title}</h1>
    <p className="mt-3 text-sm leading-6 text-[#6f5a57]">{completed?`Votre soutien à ${order.creator_name} est bien enregistré.`:failed?"Aucun soutien n’a été comptabilisé. Vous pouvez réessayer.":"Nous attendons la confirmation de WaraPay. Cette page se met à jour automatiquement."}</p>
    <section className="mt-8 rounded-2xl border border-[#ead6d2] bg-white p-6 text-left shadow-sm">
      <div className="flex items-center gap-4 border-b border-[#f0e8e5] pb-5"><img src={order.creator_avatar||"/buy-me-data-mascot.png"} alt={order.creator_name} className="h-14 w-14 rounded-2xl bg-[#fff2f1] object-cover"/><div className="min-w-0"><p className="truncate font-bold">{order.creator_name}</p><p className="text-xs text-[#6f5a57]">{order.campaign_title||order.creator_category||"Créateur de contenu"}</p></div><p className="ml-auto whitespace-nowrap text-xl font-bold text-[#b20024]">{amount.toLocaleString("fr-FR")} FCFA</p></div>
      <dl className="mt-4 space-y-3 text-sm"><Row label="Statut" value={statusText} color={tone}/><Row label="Référence" value={order.id}/><Row label="Date" value={new Date(order.created_at).toLocaleString("fr-FR")}/><Row label="Prestataire" value={order.provider||"WaraPay"}/></dl>
    </section>
    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/explore" className="rounded-xl border border-[#b20024] px-5 py-3 text-sm font-bold text-[#b20024]">Explorer</Link><Link href={`/pay?creator_id=${order.creator_id}`} className="rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white">{failed?"Réessayer":"Soutenir à nouveau"}</Link></div>
  </div></main><Footer/></>;
}

function Row({label,value,color}:{label:string;value:string;color?:string}) { return <div className="flex items-start justify-between gap-5"><dt className="text-[#7b6864]">{label}</dt><dd className="break-all text-right font-semibold" style={{color:color||"#1b1c19"}}>{value}</dd></div>; }

export default function ConfirmationPage() { return <Suspense fallback={<div className="min-h-screen grid place-items-center text-[#6f5a57]">Chargement…</div>}><ConfirmationInner/></Suspense>; }
