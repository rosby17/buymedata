"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import DonationCard, { type EditableField, type UploadField } from "@/components/DonationCard";
import { defaultThemeId, donationThemes, resolveDonationDesign, themeById, type DonationDesign } from "@/lib/donation-page";

/** Champs pilotés par cet écran, envoyés ensemble à l'enregistrement. */
const EDITABLE = ["page_theme", "banner_url", "page_eyebrow", "page_headline", "page_tagline", "page_cta", "page_note", "bio", "username"] as const;

type Profile = {
  id?: string; full_name?: string; username?: string; category?: string; avatar_url?: string; bio?: string;
} & Partial<DonationDesign>;

export default function SupportPageManager() {
  const [saved, setSaved] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState<EditableField | null>(null);
  const [editingLink, setEditingLink] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const target = useRef<UploadField>("avatar");
  const pending = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" }).then(async response => {
      if (response.status === 401) { window.location.replace("/login?next=%2Fapp%2Fsupport"); return; }
      if (!response.ok) throw new Error("Profile unavailable");
      const loaded = (await response.json()).profile;
      setSaved(loaded);
      setProfile(loaded);
    }).catch(() => setError("Impossible de charger votre page de soutien."));
  }, []);

  const dirty = Boolean(saved && profile) && EDITABLE.some(key => (profile?.[key] ?? "") !== (saved?.[key] ?? ""));

  // Rien n'est écrit tant que le créateur n'a pas confirmé : quitter la page
  // sans enregistrer abandonne les modifications.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!profile) return;
    setStatus("saving");
    const patch = Object.fromEntries(EDITABLE.map(key => [key, profile[key] ?? ""]));
    const response = await fetch("/api/profile", {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(patch),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (!response?.ok) { setStatus("error"); setMessage(data?.error || "Enregistrement impossible."); return; }
    setSaved(data.profile);
    setProfile(data.profile);
    setStatus("saved");
    setMessage("");
    window.setTimeout(() => setStatus(current => (current === "saved" ? "idle" : current)), 2500);
  }, [profile]);

  if (error) return <main className="mx-auto max-w-5xl px-5 py-20 text-center"><p className="font-semibold text-[#1b1c19]">{error}</p></main>;
  if (!profile) return <DashboardSkeleton compact />;

  const design = resolveDonationDesign(profile.username || profile.full_name || "votre page", profile);
  const theme = themeById(design.page_theme);
  const supportUrl = profile.username ? `buymedata.tools-cl.com/${profile.username}/donate` : "";

  const change = (key: keyof Profile, value: string) => setProfile(current => ({ ...current, [key]: value }));

  // Efface la personnalisation : les champs vides reprennent les textes d'origine.
  const resetToDefaults = () => setProfile(current => ({
    ...current,
    page_theme: defaultThemeId, banner_url: "",
    page_eyebrow: "", page_headline: "", page_tagline: "", page_cta: "", page_note: "",
  }));

  const pickImage = (field: UploadField) => { target.current = field; picker.current?.click(); };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setStatus("error"); setMessage("Choisissez une image JPG, PNG ou WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { setStatus("error"); setMessage("L’image doit faire moins de 2 Mo."); return; }
    const reader = new FileReader();
    reader.onload = () => change(target.current === "avatar" ? "avatar_url" : "banner_url", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <input ref={picker} type="file" accept="image/*" onChange={onFile} className="hidden" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Monétiser</p>
          <h1 className="mt-2 text-3xl font-bold">Me soutenir</h1>
          <p className="mt-2 text-sm text-[#6f5a57]">Cliquez sur un texte pour le modifier directement.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold" aria-live="polite">
            {status === "saving" && <span className="text-[#6f5a57]">Enregistrement…</span>}
            {status === "saved" && <span className="text-[#2f6b3a]">✓ Enregistré</span>}
            {status === "error" && <span className="text-[#8e001d]">{message}</span>}
            {status === "idle" && dirty && <span className="text-[#8e001d]">Modifications non enregistrées</span>}
          </p>
          <button type="button" onClick={resetToDefaults} className="rounded-xl border border-[#ead6d2] px-4 py-2.5 text-sm font-semibold text-[#5b403f] hover:bg-[#fbf9f4]">
            Réinitialiser
          </button>
          <button type="button" onClick={save} disabled={!dirty || status === "saving"} className="rounded-xl bg-[#b20024] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
            {status === "saving" ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-3xl p-5 sm:p-8" style={{ background: theme.pageImage ? `${theme.pageImage}, ${theme.page}` : theme.page }}>
          <DonationCard
            creator={{ id: profile.id, name: profile.full_name || "", username: profile.username, avatar_url: profile.avatar_url, bio: profile.bio }}
            design={design}
            preview
            edit={{
              active,
              start: field => setActive(field),
              stop: () => setActive(null),
              set: (field, value) => change(field === "bio" ? "bio" : (field as keyof Profile), value),
              upload: pickImage,
            }}
          />
        </div>

        <section className="rounded-2xl border border-[#ead6d2] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Lien à partager</p>
          {editingLink ? (
            <div className="mt-3">
              <div className="flex items-center gap-1 rounded-xl border border-[#b20024] ring-4 ring-[#b20024]/15 px-3 py-2">
                <span className="shrink-0 text-xs text-[#7b6864]">buymedata.tools-cl.com/</span>
                <input
                  autoFocus
                  maxLength={30}
                  value={profile.username || ""}
                  onChange={event => change("username", event.target.value.toLowerCase())}
                  onBlur={() => setEditingLink(false)}
                  onKeyDown={event => { if (event.key === "Enter" || event.key === "Escape") setEditingLink(false); }}
                  className="min-w-0 flex-1 text-sm font-semibold text-[#b20024] outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-[#7b6864]">3 à 30 caractères : lettres, chiffres, tirets.</p>
            </div>
          ) : (
            <p className="mt-3 flex items-start gap-1.5 text-sm font-semibold text-[#b20024]">
              <span className="min-w-0 break-all">{supportUrl || "Complétez votre nom public"}</span>
              <button
                type="button"
                aria-label="Modifier le lien"
                onClick={() => setEditingLink(true)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#ead6d2] text-[#b20024] hover:bg-[#fff2f1]"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
              </button>
            </p>
          )}
          <button
            type="button"
            disabled={!supportUrl}
            onClick={async () => { await navigator.clipboard?.writeText(`https://${supportUrl}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}
            className="mt-4 w-full rounded-xl bg-[#b20024] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {copied ? "Lien copié ✓" : "Copier le lien"}
          </button>
          {profile.username && (
            <a href={`/${profile.username}/donate`} target="_blank" rel="noreferrer" className="mt-3 block text-center text-sm font-semibold text-[#5b403f] underline underline-offset-4">
              Ouvrir ma page ↗
            </a>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Apparence</p>
            <h2 className="mt-1 text-2xl font-bold">Thème de la page</h2>
          </div>
          <p className="text-sm text-[#6f5a57]">{donationThemes.length} thèmes</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {donationThemes.map(item => {
            const selected = design.page_theme === item.id;
            return (
              <label
                key={item.id}
                className={`cursor-pointer overflow-hidden rounded-2xl border transition focus-within:ring-4 focus-within:ring-[#b20024]/15 ${selected ? "border-[#b20024]" : "border-[#ead6d2] hover:border-[#e4bdbc]"}`}
              >
                <input type="radio" name="page_theme" value={item.id} checked={selected} onChange={() => change("page_theme", item.id)} className="sr-only" />
                <span aria-hidden className="block h-16" style={{ background: item.banner }} />
                <span className="block bg-white p-3">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#1b1c19]">{item.label}</span>
                    {selected && <span className="material-symbols-outlined text-[18px] text-[#b20024]">check_circle</span>}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#6f5a57]">{item.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {dirty && (
        <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#b20024] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(91,64,63,0.18)]">
          <p className="text-sm font-semibold text-[#1b1c19]">
            Vos modifications ne sont pas encore enregistrées. Si vous quittez la page, elles seront perdues.
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setProfile(saved)} className="text-sm font-semibold text-[#5b403f] underline underline-offset-4">
              Annuler
            </button>
            <button type="button" onClick={save} disabled={status === "saving"} className="rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">
              {status === "saving" ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
