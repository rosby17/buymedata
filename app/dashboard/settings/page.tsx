"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSkeleton from "@/components/DashboardSkeleton";
// The dashboard layout owns the persistent application header.
const Navbar = () => null;

const input = "mt-2 w-full rounded-xl border border-[#ead6d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b20024] focus:ring-4 focus:ring-[#b20024]/10";
type Profile = { full_name?: string; username?: string; category?: string; avatar_url?: string; bio?: string };

export default function DashboardSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  useEffect(() => { fetch("/api/profile", { cache: "no-store" }).then(async r => { if (r.status === 401) { location.href = "/login"; return; } const d = await r.json(); setProfile(d.profile); setAvatarPreview(d.profile.avatar_url || ""); }).catch(() => setNotice("Impossible de charger le profil")); }, []);
  function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setNotice("Choisissez une image JPG, PNG ou WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { setNotice("La photo doit faire moins de 2 Mo."); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  async function save(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setSaving(true); setNotice(""); const body = Object.fromEntries(new FormData(e.currentTarget)); const r = await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json(); setNotice(r.ok ? "Paramètres enregistrés" : (d.error || "Enregistrement impossible")); if (r.ok) setProfile(d.profile); setSaving(false); }
  if (!profile) return <><Navbar/><DashboardSkeleton compact /></>;
  return <><Navbar/><main className="mx-auto max-w-3xl px-5 py-10"><Link href="/dashboard" className="text-sm font-semibold text-[#b20024]">← Retour au dashboard</Link><div className="mt-5 rounded-2xl border border-[#ead6d2] bg-white p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Page publique</p><h1 className="mt-2 text-3xl font-bold">Modifier ma page de soutien</h1><p className="mt-2 text-sm text-[#6f5a57]">Ces informations apparaissent sur votre page publique et votre lien de soutien personnel.</p></div><Link href="/dashboard/account" className="rounded-xl border border-[#ead6d2] px-4 py-2 text-sm font-bold text-[#5b403f]">Paramètres du compte</Link></div>{notice&&<div className="mt-5 rounded-xl bg-[#fff2f1] px-4 py-3 text-sm font-semibold text-[#8e001d]">{notice}</div>}<form onSubmit={save} className="mt-7 grid gap-5"><label className="text-xs font-bold text-[#5b403f]">Nom affiché<input name="full_name" defaultValue={profile.full_name||""} required className={input}/></label><label className="text-xs font-bold text-[#5b403f]">Nom public / username<div className="mt-2 flex items-center rounded-xl border border-[#ead6d2] bg-white focus-within:border-[#b20024] focus-within:ring-4 focus-within:ring-[#b20024]/10"><span className="pl-4 text-sm text-[#7b6864]">buymedata.tools-cl.com/</span><input name="username" defaultValue={profile.username||""} required className="w-full bg-transparent px-2 py-3 text-sm outline-none"/></div></label><div className="rounded-xl bg-[#fbf9f4] p-4"><p className="text-xs font-bold text-[#5b403f]">Lien de votre page</p><p className="mt-1 break-all text-sm text-[#b20024]">buymedata.tools-cl.com/{profile.username || "votre-nom"}</p><p className="mt-1 text-xs text-[#7b6864]">Le lien se met à jour automatiquement avec votre nom public.</p></div><div><label className="text-xs font-bold text-[#5b403f]">Photo de profil</label><div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-[#ead6d2] p-4"><img src={avatarPreview || "/buy-me-data-mascot.png"} alt="Aperçu de la photo de profil" className="h-16 w-16 rounded-2xl bg-[#fff2f1] object-cover"/><div><input name="avatar_url" type="hidden" value={avatarPreview} readOnly/><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1b1c19] px-4 py-2.5 text-sm font-bold text-white"><span className="material-symbols-outlined text-[18px]">upload</span>Choisir une photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatar} className="sr-only"/></label><p className="mt-2 text-xs text-[#7b6864]">JPG, PNG ou WebP · 2 Mo maximum</p></div></div></div><label className="text-xs font-bold text-[#5b403f]">Catégorie<input name="category" defaultValue={profile.category||""} placeholder="Vidéo, musique, design…" className={input}/></label><label className="text-xs font-bold text-[#5b403f]">Présentation<textarea name="bio" defaultValue={profile.bio||""} required maxLength={240} rows={5} placeholder="Dites ce que vous créez." className={`${input} resize-none`}/></label><button disabled={saving} className="w-fit rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?"Enregistrement…":"Enregistrer les changements"}</button></form></div></main></>;
}
