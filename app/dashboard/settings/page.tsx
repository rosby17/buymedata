"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// The dashboard layout owns the persistent application header.
const Navbar = () => null;

const input = "mt-2 w-full rounded-xl border border-[#ead6d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b20024] focus:ring-4 focus:ring-[#b20024]/10";
type Profile = { full_name?: string; username?: string; category?: string; avatar_url?: string; bio?: string };

export default function DashboardSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch("/api/profile", { cache: "no-store" }).then(async r => { if (r.status === 401) { location.href = "/login"; return; } const d = await r.json(); setProfile(d.profile); }).catch(() => setNotice("Impossible de charger le profil")); }, []);
  async function save(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setSaving(true); setNotice(""); const body = Object.fromEntries(new FormData(e.currentTarget)); const r = await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json(); setNotice(r.ok ? "Paramètres enregistrés" : (d.error || "Enregistrement impossible")); if (r.ok) setProfile(d.profile); setSaving(false); }
  if (!profile) return <><Navbar/><main className="mx-auto max-w-3xl px-5 py-20 text-center text-[#6f5a57]">Chargement…</main></>;
  return <><Navbar/><main className="mx-auto max-w-3xl px-5 py-10"><Link href="/dashboard" className="text-sm font-semibold text-[#b20024]">← Retour au dashboard</Link><div className="mt-5 rounded-2xl border border-[#ead6d2] bg-white p-5 sm:p-8"><h1 className="text-3xl font-bold">Paramètres de la page</h1><p className="mt-2 text-sm text-[#6f5a57]">Ces informations apparaissent sur votre page publique de soutien.</p>{notice&&<div className="mt-5 rounded-xl bg-[#fff2f1] px-4 py-3 text-sm font-semibold text-[#8e001d]">{notice}</div>}<form onSubmit={save} className="mt-7 grid gap-5"><label className="text-xs font-bold text-[#5b403f]">Nom affiché<input name="full_name" defaultValue={profile.full_name||""} required className={input}/></label><label className="text-xs font-bold text-[#5b403f]">Nom public / username<div className="flex items-center gap-2"><span className="mt-2 text-sm text-[#7b6864]">buymedata.tools-cl.com/</span><input name="username" defaultValue={profile.username||""} required className={input}/></div></label><label className="text-xs font-bold text-[#5b403f]">Catégorie<input name="category" defaultValue={profile.category||""} placeholder="Vidéo, musique, design…" className={input}/></label><label className="text-xs font-bold text-[#5b403f]">Photo de profil (URL)<input name="avatar_url" type="url" defaultValue={profile.avatar_url||""} placeholder="https://…" className={input}/></label><label className="text-xs font-bold text-[#5b403f]">Présentation<textarea name="bio" defaultValue={profile.bio||""} required maxLength={240} rows={5} placeholder="Dites ce que vous créez." className={`${input} resize-none`}/></label><button disabled={saving} className="w-fit rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?"Enregistrement…":"Enregistrer"}</button></form></div></main></>;
}
