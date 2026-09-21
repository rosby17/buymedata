"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import DonationCard, { type EditableField } from "@/components/DonationCard";
import { donationTextLimits, donationThemes, resolveDonationDesign, themeById, type DonationDesign } from "@/lib/donation-page";

type Profile = {
  id?: string; full_name?: string; username?: string; category?: string; avatar_url?: string; bio?: string;
} & Partial<DonationDesign>;

type FieldSpec = { label: string; hint?: string; max: number; area?: boolean };

const fields: Record<Exclude<EditableField, "avatar">, FieldSpec> = {
  banner_url: { label: "Bannière", hint: "URL d’une image en https, idéalement 1200 × 400. Vide = dégradé du thème.", max: 500 },
  page_eyebrow: { label: "Sur-titre", max: donationTextLimits.page_eyebrow },
  page_headline: { label: "Titre", max: donationTextLimits.page_headline },
  page_tagline: { label: "Accroche", max: donationTextLimits.page_tagline, area: true },
  page_cta: { label: "Texte du bouton", max: donationTextLimits.page_cta },
  page_note: { label: "Mention sous le bouton", max: donationTextLimits.page_note },
  bio: { label: "Présentation", hint: "Le paragraphe affiché sur votre page.", max: 240, area: true },
  page_theme: { label: "Thème", max: 40 },
};

export default function SupportPageManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  type EditTarget = EditableField | "username";
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const pending = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" }).then(async response => {
      if (response.status === 401) { window.location.replace("/login?next=%2Fdashboard%2Fsupport"); return; }
      if (!response.ok) throw new Error("Profile unavailable");
      setProfile((await response.json()).profile);
    }).catch(() => setError("Impossible de charger votre page de soutien."));
  }, []);

  // Enregistrement automatique : plus de bouton, plus d'aller-retour.
  const persist = useCallback((patch: Partial<Profile>) => {
    window.clearTimeout(pending.current);
    setStatus("saving");
    pending.current = window.setTimeout(async () => {
      const response = await fetch("/api/profile", {
        method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(patch),
      }).catch(() => null);
      const data = await response?.json().catch(() => ({}));
      if (!response?.ok) { setStatus("error"); setMessage(data?.error || "Enregistrement impossible."); return; }
      setStatus("saved");
      setMessage("");
      window.setTimeout(() => setStatus(current => (current === "saved" ? "idle" : current)), 2000);
    }, 700);
  }, []);

  if (error) return <main className="mx-auto max-w-5xl px-5 py-20 text-center"><p className="font-semibold text-[#1b1c19]">{error}</p></main>;
  if (!profile) return <DashboardSkeleton compact />;

  const displayName = profile.username || profile.full_name || "votre page";
  const design = resolveDonationDesign(displayName, profile);
  const theme = themeById(design.page_theme);
  const supportUrl = profile.username ? `buymedata.tools-cl.com/${profile.username}/donate` : "";

  const change = (key: keyof Profile, value: string) => {
    setProfile({ ...profile, [key]: value });
    persist({ [key]: value });
  };

  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setStatus("error"); setMessage("Choisissez une image JPG, PNG ou WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { setStatus("error"); setMessage("La photo doit faire moins de 2 Mo."); return; }
    const reader = new FileReader();
    reader.onload = () => change("avatar_url", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const pencil = (field: EditableField) => (
    <button
      type="button"
      aria-label={`Modifier : ${field === "avatar" ? "photo de profil" : fields[field].label}`}
      onClick={() => (field === "avatar" ? avatarInput.current?.click() : setEditing(editing === field ? null : field))}
      className="absolute -right-2 -top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-[#ead6d2] bg-white text-[#b20024] shadow-md transition hover:bg-[#fff2f1] focus:outline-none focus:ring-4 focus:ring-[#b20024]/20"
    >
      <span className="material-symbols-outlined text-[16px]">edit</span>
    </button>
  );

  const editor = editing && editing !== "avatar" && editing !== "username" ? (
    <InlineEditor
      spec={fields[editing]}
      value={editing === "bio" ? profile.bio || "" : design[editing as keyof DonationDesign]}
      onChange={value => change(editing === "bio" ? "bio" : (editing as keyof Profile), value)}
      onClose={() => setEditing(null)}
    />
  ) : null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <input ref={avatarInput} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Monétiser</p>
          <h1 className="mt-2 text-3xl font-bold">Me soutenir</h1>
          <p className="mt-2 text-sm text-[#6f5a57]">Cliquez sur un crayon pour modifier un élément. Tout est enregistré automatiquement.</p>
        </div>
        <p className="text-sm font-semibold text-[#6f5a57]" aria-live="polite">
          {status === "saving" && "Enregistrement…"}
          {status === "saved" && "✓ Enregistré"}
          {status === "error" && <span className="text-[#8e001d]">{message}</span>}
        </p>
      </div>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div
          className="rounded-3xl p-5 sm:p-8"
          style={{ background: theme.pageImage ? `${theme.pageImage}, ${theme.page}` : theme.page }}
        >
          <DonationCard creator={{ id: profile.id, name: profile.full_name || "", username: profile.username, avatar_url: profile.avatar_url, bio: profile.bio }} design={design} preview renderEdit={pencil} />
        </div>

        <div className="space-y-5">
          {editor}

          <section className="rounded-2xl border border-[#ead6d2] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Lien à partager</p>
            <div className="mt-3 flex items-start gap-2">
              <p className="min-w-0 flex-1 break-all text-sm font-semibold text-[#b20024]">{supportUrl || "Complétez votre nom public"}</p>
              <button
                type="button"
                aria-label="Modifier le lien"
                onClick={() => setEditing(editing === "username" ? null : "username")}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#ead6d2] text-[#b20024] hover:bg-[#fff2f1]"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
            {editing === "username" && (
              <InlineEditor
                spec={{ label: "Nom public", hint: "3 à 30 caractères : lettres, chiffres, tirets.", max: 30 }}
                value={profile.username || ""}
                onChange={value => change("username", value.toLowerCase())}
                onClose={() => setEditing(null)}
              />
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

          <section className="rounded-2xl border border-[#ead6d2] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a18d88]">Identité</p>
            <div className="mt-3 space-y-3">
              {([["full_name", "Nom affiché", 80], ["category", "Catégorie", 80]] as const).map(([key, label, max]) => (
                <label key={key} className="block">
                  <span className="text-xs font-semibold text-[#6f5a57]">{label}</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-[#ead6d2] px-3 py-2.5 text-sm outline-none focus:border-[#b20024] focus:ring-4 focus:ring-[#b20024]/10"
                    maxLength={max}
                    value={profile[key] || ""}
                    onChange={event => change(key, event.target.value)}
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-xs font-semibold text-[#6f5a57]">Présentation</span>
                <textarea
                  rows={3}
                  maxLength={240}
                  className="mt-1 w-full resize-none rounded-xl border border-[#ead6d2] px-3 py-2.5 text-sm outline-none focus:border-[#b20024] focus:ring-4 focus:ring-[#b20024]/10"
                  value={profile.bio || ""}
                  onChange={event => change("bio", event.target.value)}
                />
              </label>
            </div>
          </section>
        </div>
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
            const active = design.page_theme === item.id;
            return (
              <label
                key={item.id}
                className={`cursor-pointer overflow-hidden rounded-2xl border transition focus-within:ring-4 focus-within:ring-[#b20024]/15 ${active ? "border-[#b20024]" : "border-[#ead6d2] hover:border-[#e4bdbc]"}`}
              >
                <input type="radio" name="page_theme" value={item.id} checked={active} onChange={() => change("page_theme", item.id)} className="sr-only" />
                <span aria-hidden className="block h-16" style={{ background: item.banner }} />
                <span className="block bg-white p-3">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#1b1c19]">{item.label}</span>
                    {active && <span className="material-symbols-outlined text-[18px] text-[#b20024]">check_circle</span>}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#6f5a57]">{item.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function InlineEditor({ spec, value, onChange, onClose }: {
  spec: FieldSpec; value: string; onChange: (value: string) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const common = {
    maxLength: spec.max,
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    onKeyDown: (event: React.KeyboardEvent) => { if (event.key === "Escape" || (event.key === "Enter" && !spec.area)) { event.preventDefault(); onClose(); } },
    className: "mt-2 w-full rounded-xl border border-[#ead6d2] px-3 py-2.5 text-sm outline-none focus:border-[#b20024] focus:ring-4 focus:ring-[#b20024]/10",
  };
  return (
    <section className="rounded-2xl border-2 border-[#b20024] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#1b1c19]">{spec.label}</p>
        <button type="button" onClick={onClose} className="text-xs font-bold text-[#b20024]">Terminé</button>
      </div>
      {spec.area
        ? <textarea ref={ref as React.RefObject<HTMLTextAreaElement>} rows={3} {...common} />
        : <input ref={ref as React.RefObject<HTMLInputElement>} {...common} />}
      {spec.hint && <p className="mt-2 text-xs text-[#7b6864]">{spec.hint}</p>}
      <p className="mt-1 text-right text-[11px] text-[#a18d88]">{value.length}/{spec.max}</p>
    </section>
  );
}
