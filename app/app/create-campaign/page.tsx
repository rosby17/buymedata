"use client";
import { Suspense, useEffect, useState } from "react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function CreateCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("edit");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaignId) return;
    fetch("/api/campaigns", { cache: "no-store" }).then(r => r.json()).then(data => {
      const campaign = (data.campaigns || []).find((item: { id: string }) => item.id === campaignId);
      if (!campaign) return;
      setTitle(campaign.title || ""); setDescription(campaign.description || ""); setAmount(String(campaign.target_amount || "")); setImage(campaign.cover_url || null);
    }).catch(() => setError("Impossible de charger cette cagnotte."));
  }, [campaignId]);

  const calculateDaysRemaining = (dateStr: string) => {
    if (!dateStr) return "Sans limite";
    const targetDate = new Date(dateStr);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    if (diffTime <= 0) return "Expiré";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} jours restants`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(campaignId ? `/api/campaigns/${campaignId}` : "/api/campaigns", {
        method: campaignId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, target_amount: amount, cover_url: image }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push("/login"); return; }
      if (!response.ok) throw new Error(payload.error || "Création impossible");
      router.push("/app/campaigns");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Création impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-[#1b1c19]" style={{ backgroundColor: "#fbf9f4" }}>
      {/* ── Top Navigation ── */}
      <nav
        className="hidden"
        style={{ borderColor: "#e4bdbc" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app/dashboard">
              <button
                className="p-2 rounded-full transition-colors flex items-center justify-center"
                style={{ backgroundColor: "#f0eee9" }}
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </Link>
            <h1 className="text-xl font-bold hidden md:block" style={{ color: "#1b1c19" }}>
              {campaignId ? "Modifier la cagnotte" : "Créer une cagnotte / objectif"}
            </h1>
          </div>
          <div className="flex items-center">
            {/* Action button on mobile header, hidden on desktop */}
            <button
              onClick={() => document.querySelector<HTMLFormElement>("form")?.requestSubmit()}
              disabled={saving}
              className="md:hidden text-white font-bold text-xs px-4 py-2 rounded-full transition-all active:scale-95"
              style={{ backgroundColor: "#b20024" }}
            >
              Publier
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="md:hidden mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#1b1c19" }}>
            {campaignId ? "Modifier votre projet" : "Lancer votre projet"}
          </h1>
          <p className="text-sm mt-2" style={{ color: "#5b403f" }}>
            Définissez les détails de votre cagnotte pour financer vos besoins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FORM SECTION (Left) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border p-6 md:p-8" style={{ borderColor: "#e4bdbc" }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#1b1c19" }}>
                Détails de la cagnotte
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && <p className="rounded-xl bg-[#fff2f1] px-4 py-3 text-sm font-semibold text-[#8e001d]">{error}</p>}
                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-[#5b403f]">
                    Image de couverture
                  </label>
                  <label
                    className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group"
                    style={{ borderColor: "#e4bdbc" }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-[#e4bdbc] group-hover:text-[#b20024] transition-colors text-4xl mb-2">
                      add_photo_alternate
                    </span>
                    <p className="text-sm text-[#1b1c19] font-medium">
                      {image ? "Changer de couverture" : "Cliquez pour ajouter une image"}
                    </p>
                    <p className="text-xs text-[#5b403f] mt-1">Format recommandé: 16:9</p>
                  </label>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-[#5b403f]">
                    Titre de la cagnotte
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Financer la fibre optique pour mes streams"
                    className="w-full bg-[#fbf9f4] border focus:ring-1 focus:ring-[#b20024] rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                    style={{ borderColor: "#e4bdbc" }}
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-[#5b403f]">
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Expliquez ce projet à votre communauté..."
                    rows={4}
                    className="w-full bg-[#fbf9f4] border focus:ring-1 focus:ring-[#b20024] rounded-xl px-4 py-3.5 text-sm outline-none transition-all resize-none"
                    style={{ borderColor: "#e4bdbc" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Target Amount */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="amount" className="text-sm font-bold uppercase tracking-wider text-[#5b403f]">
                      Objectif (Optionnel, FCFA)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5b403f]">
                        FCFA
                      </span>
                      <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="50000"
                        required
                        min={1000}
                        className="w-full bg-[#fbf9f4] border focus:ring-1 focus:ring-[#b20024] rounded-xl pl-16 pr-4 py-3.5 text-sm outline-none transition-all"
                        style={{ borderColor: "#e4bdbc" }}
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="deadline" className="text-sm font-bold uppercase tracking-wider text-[#5b403f]">
                      Date limite (Optionnelle)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#5b403f] text-[20px]">
                        calendar_today
                      </span>
                      <input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-[#fbf9f4] border focus:ring-1 focus:ring-[#b20024] rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none transition-all"
                        style={{ borderColor: "#e4bdbc" }}
                      />
                  </div>
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex flex-col gap-2 p-4 rounded-xl border mt-2 bg-[#fbf9f4]" style={{ borderColor: "#e4bdbc" }}>
                  <label className="text-sm font-bold uppercase tracking-wider text-[#5b403f]">
                    Visibilité de la cagnotte
                  </label>
                  <div className="flex items-center justify-between gap-4 mt-1">
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "#1b1c19" }}>
                        {isPublic ? "Publique" : "Privée"}
                      </p>
                      <p className="text-xs text-[#5b403f] mt-0.5">
                        {isPublic 
                          ? "La cagnotte sera visible publiquement sur la plateforme et dans les résultats de recherche." 
                          : "La cagnotte sera uniquement accessible via un lien direct partagé à votre communauté."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className="w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center shrink-0"
                      style={{ backgroundColor: isPublic ? "#496546" : "#e4bdbc" }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200"
                        style={{ transform: isPublic ? "translateX(24px)" : "translateX(0)" }}
                      />
                    </button>
                  </div>
                </div>

                {/* Desktop Submit Button */}
                <div className="hidden md:flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-md"
                    style={{ backgroundColor: "#b20024" }}
                  >
                    {saving ? "Enregistrement…" : campaignId ? "Enregistrer" : "Publier la cagnotte"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* PREVIEW SECTION (Right) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5b403f] mb-4 px-2">
              Aperçu en direct
            </h3>
            {/* Preview Card */}
            <div
              className="bg-white rounded-3xl border overflow-hidden shadow-sm transition-all duration-300"
              style={{ borderColor: "#e4bdbc" }}
            >
              {/* Cover Image Placeholder */}
              <div className="w-full h-48 bg-[#f5f3ee] relative overflow-hidden group">
                <img
                  src={
                    image || "/buy-me-data-mascot.png"
                  }
                  alt="Preview Image"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="p-6">
                {/* Preview Title */}
                <h4 className="text-xl font-bold mb-2 text-[#1b1c19] line-clamp-2">
                  {title || "Titre de votre projet"}
                </h4>
                {/* Organizer Info */}
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ backgroundColor: "#5b403f" }}
                  >
                    Vous
                  </div>
                  <span className="text-xs font-semibold text-[#5b403f]">par Vous</span>
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white ml-auto"
                    style={{ backgroundColor: "#496546" }}
                  >
                    <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                  </span>
                </div>
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm text-[#1b1c19]">
                      <span className="text-xl font-bold" style={{ color: "#b20024" }}>
                        0 FCFA
                      </span>{" "}
                      collectés
                    </div>
                    <div className="text-xs font-semibold text-[#5b403f]">
                      sur {amount ? `${Number(amount).toLocaleString("fr-FR")} FCFA` : "0 FCFA"}
                    </div>
                  </div>
                  {/* Progress Gauge */}
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#c8e9c1" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: "0%", backgroundColor: "#496546" }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs font-semibold text-[#5b403f]">
                    <span>0 soutiens</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {calculateDaysRemaining(deadline)}
                    </span>
                  </div>
                </div>
                {/* Mock Action Button */}
                <button
                  disabled
                  className="w-full text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
                  style={{ backgroundColor: "#f0eee9", color: "#5b403f" }}
                >
                  Soutenir ce projet
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Action Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t p-4 z-40"
        style={{ borderColor: "#e4bdbc" }}
      >
        <button
          onClick={() => document.querySelector<HTMLFormElement>("form")?.requestSubmit()}
          disabled={saving}
          className="w-full text-white font-bold py-4 rounded-full transition-all active:scale-95 duration-100 shadow-md"
          style={{ backgroundColor: "#b20024" }}
        >
          {saving ? "Publication…" : "Publier la cagnotte"}
        </button>
      </div>
    </div>
  );
}

export default function CreateCampaign() {
  return <Suspense fallback={<DashboardSkeleton compact />}><CreateCampaignContent /></Suspense>;
}
