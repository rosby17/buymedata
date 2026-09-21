"use client";

import { useEffect, useState } from "react";
import DonationCard from "@/components/DonationCard";
import { donationTextLimits, donationThemes, resolveDonationDesign, themeById, type DonationDesign } from "@/lib/donation-page";

const field = "mt-2 w-full rounded-xl border border-[#ead6d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#b20024] focus:ring-4 focus:ring-[#b20024]/10";
const labelClass = "text-sm font-semibold text-[#1b1c19]";

type Creator = { id?: string; name: string; username?: string | null; avatar_url?: string | null; bio?: string | null };

const texts: { key: keyof DonationDesign; label: string; hint: string; area?: boolean }[] = [
  { key: "page_eyebrow", label: "Sur-titre", hint: "La petite ligne au-dessus du titre." },
  { key: "page_headline", label: "Titre", hint: "Le message principal, par exemple « Soutenir Roosevelt »." },
  { key: "page_tagline", label: "Accroche", hint: "Une ou deux phrases qui expliquent à quoi sert le soutien.", area: true },
  { key: "page_cta", label: "Texte du bouton", hint: "L’action que voit le visiteur." },
  { key: "page_note", label: "Mention de réassurance", hint: "Affichée sous le bouton." },
];

export default function DonationPageEditor() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [design, setDesign] = useState<DonationDesign | null>(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("profil indisponible");
        const { profile } = await response.json();
        setCreator({ id: profile.id, name: profile.full_name, username: profile.username, avatar_url: profile.avatar_url, bio: profile.bio });
        setDesign(resolveDonationDesign(profile.username || profile.full_name, profile));
      })
      .catch(() => setNotice("Impossible de charger votre page pour le moment."));
  }, []);

  if (!creator || !design) {
    return <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[#ead6d2]/40" aria-label="Chargement de l’apparence" />;
  }

  const update = (key: keyof DonationDesign, value: string) => setDesign({ ...design, [key]: value });

  const save = async () => {
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(design),
    });
    const data = await response.json().catch(() => ({}));
    setNotice(response.ok ? "Apparence enregistrée. Votre page publique est à jour." : data.error || "Enregistrement impossible.");
    setSaving(false);
  };

  return (
    <section className="mt-6 rounded-2xl border border-[#ead6d2] bg-white p-5 sm:p-8">
      <h2 className="text-xl font-bold text-[#1b1c19]">Apparence de ma page de dons</h2>
      <p className="mt-1 text-sm text-[#6f5a57]">C’est la page que voient vos visiteurs avant de donner. Choisissez un thème, votre bannière et vos textes.</p>

      <fieldset className="mt-6">
        <legend className={labelClass}>Thème</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {donationThemes.map(theme => {
            const active = design.page_theme === theme.id;
            return (
              <label
                key={theme.id}
                className={`cursor-pointer rounded-2xl border p-4 transition focus-within:ring-4 focus-within:ring-[#b20024]/15 ${active ? "border-[#b20024] bg-[#fff2f1]" : "border-[#ead6d2] bg-white hover:border-[#e4bdbc]"}`}
              >
                <input
                  type="radio"
                  name="page_theme"
                  value={theme.id}
                  checked={active}
                  onChange={() => update("page_theme", theme.id)}
                  className="sr-only"
                />
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-10 w-10 shrink-0 rounded-xl border"
                    style={{ background: theme.banner, borderColor: theme.border }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#1b1c19]">{theme.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[#6f5a57]">{theme.description}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label className={labelClass} htmlFor="banner_url">Bannière</label>
        <input
          id="banner_url"
          className={field}
          value={design.banner_url}
          onChange={event => update("banner_url", event.target.value)}
          placeholder="https://… (laissez vide pour le dégradé du thème)"
        />
        <p className="mt-1.5 text-xs text-[#7b6864]">Collez l’adresse d’une image en https. Format conseillé : 1200 × 400 pixels.</p>
      </div>

      <div className="mt-6 grid gap-5">
        {texts.map(({ key, label, hint, area }) => (
          <div key={key}>
            <label className={labelClass} htmlFor={key}>{label}</label>
            {area ? (
              <textarea
                id={key}
                rows={2}
                maxLength={donationTextLimits[key as keyof typeof donationTextLimits]}
                className={field}
                value={design[key]}
                onChange={event => update(key, event.target.value)}
              />
            ) : (
              <input
                id={key}
                maxLength={donationTextLimits[key as keyof typeof donationTextLimits]}
                className={field}
                value={design[key]}
                onChange={event => update(key, event.target.value)}
              />
            )}
            <p className="mt-1.5 text-xs text-[#7b6864]">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <p className={labelClass}>Aperçu</p>
        <div
          className="mt-3 rounded-2xl p-4 sm:p-6"
          style={{ background: themeById(design.page_theme).pageImage ? `${themeById(design.page_theme).pageImage}, ${themeById(design.page_theme).page}` : themeById(design.page_theme).page }}
        >
          <DonationCard creator={creator} design={design} preview />
        </div>
      </div>

      {notice && <p className="mt-5 rounded-xl bg-[#fff2f1] px-4 py-3 text-sm font-semibold text-[#8e001d]">{notice}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer l’apparence"}
        </button>
        {creator.username && (
          <a href={`/${creator.username}/donate`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#5b403f] underline underline-offset-4">
            Ouvrir ma page de dons ↗
          </a>
        )}
      </div>
    </section>
  );
}
