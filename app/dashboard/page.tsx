"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Data ── */
const RECENT_ACTIVITY = [
  {
    id: 1,
    name: "Thomas N'Goran",
    icon: "volunteer_activism",
    message: "Bravo pour ton travail, continue comme ça ! Hâte de voir la suite du projet.",
    amount: 15000,
    time: "Il y a 2 heures",
  },
  {
    id: 2,
    name: "Anonyme",
    icon: "favorite",
    message: "Soutien pour le matériel audio.",
    amount: 50000,
    time: "Il y a 5 heures",
  },
  {
    id: 3,
    name: "Marie-Claire L.",
    icon: "person",
    message: "Félicitations pour votre 100ème soutien !",
    amount: 5000,
    time: "Hier",
  },
];

const GOALS = [
  {
    id: 1,
    title: "Nouveau micro studio Shure SM7B",
    current: 135000,
    total: 300000,
    pct: 45,
    active: true,
  },
  {
    id: 2,
    title: "Abonnement Adobe Creative Cloud",
    current: 48000,
    total: 60000,
    pct: 80,
    active: true,
  },
  {
    id: 3,
    title: "Formation en montage vidéo",
    current: 60000,
    total: 60000,
    pct: 100,
    active: false,
  },
];

const PERFS = [
  { label: "Vues de profil", value: "1.2k", icon: "visibility" },
  { label: "Taux de conversion", value: "4.8%", icon: "conversion_path" },
  { label: "Don moyen", value: "12 500 F", icon: "trending_up" },
];

/* ── Animated Gauge ── */
function Gauge({ pct, delay = 0, color = "#496546" }: { pct: number; delay?: number; color?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 150 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height: "6px", backgroundColor: "#e4e2dd" }}
    >
      <div
        style={{
          height: "100%",
          width: `${w}%`,
          backgroundColor: pct >= 100 ? "#496546" : color,
          borderRadius: "9999px",
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

/* ── Withdraw Modal ── */
function WithdrawModal({
  method,
  available,
  onClose,
}: {
  method: "mobile" | "bank";
  available: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/dashboard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount, destination, method: method === "mobile" ? "mobile_money" : "bank" }) });
    if (!response.ok) return;
    setSent(true);
    setTimeout(() => { onClose(); setSent(false); }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-8 w-full max-w-sm shadow-2xl mx-4"
        style={{ backgroundColor: "#fbf9f4" }}
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-4">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "56px", color: "#496546", fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <h3 className="text-xl font-bold mt-3" style={{ color: "#1b1c19" }}>
              Virement initié !
            </h3>
            <p className="text-sm mt-1" style={{ color: "#5b403f" }}>
              Vous recevrez vos fonds sous 24h.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#1b1c19" }}>
                {method === "mobile" ? "Retrait Mobile Money" : "Virement Bancaire"}
              </h3>
              <button onClick={onClose} style={{ color: "#5b403f" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "#5b403f" }}>
              Disponible :{" "}
              <strong style={{ color: "#1b1c19" }}>
                {available.toLocaleString("fr-FR")} FCFA
              </strong>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {method === "mobile" ? (
                <input
                  type="tel"
                  required
                  className="w-full outline-none px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #e4bdbc", backgroundColor: "#ffffff" }}
                  placeholder="Numéro Mobile Money (ex: 6XX XXX XXX)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              ) : (
                <>
                  <input
                    type="text"
                    required
                    className="w-full outline-none px-4 py-3 rounded-lg text-sm"
                    style={{ border: "1px solid #e4bdbc", backgroundColor: "#ffffff" }}
                    placeholder="IBAN ou numéro de compte"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <input
                    type="text"
                    required
                    className="w-full outline-none px-4 py-3 rounded-lg text-sm"
                    style={{ border: "1px solid #e4bdbc", backgroundColor: "#ffffff" }}
                    placeholder="Nom du titulaire"
                  />
                </>
              )}
              <div className="relative">
                <input
                  type="number"
                  required
                  min={500}
                  max={available}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full outline-none px-4 py-3 rounded-lg text-sm pr-20"
                  style={{ border: "1px solid #e4bdbc", backgroundColor: "#ffffff" }}
                  placeholder="Montant à retirer"
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium"
                  style={{ color: "#5b403f" }}
                >
                  FCFA
                </span>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-bold transition-all active:scale-95"
                style={{ backgroundColor: "#496546", color: "#ffffff" }}
              >
                Confirmer le retrait
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── New Goal Modal ── */
function NewGoalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (g: typeof GOALS[0]) => void }) {
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now(),
      title,
      current: 0,
      total: parseInt(total),
      pct: 0,
      active: true,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-8 w-full max-w-sm shadow-2xl mx-4"
        style={{ backgroundColor: "#fbf9f4" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: "#1b1c19" }}>
            Nouvel objectif
          </h3>
          <button onClick={onClose} style={{ color: "#5b403f" }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full outline-none px-4 py-3 rounded-lg text-sm"
            style={{ border: "1px solid #e4bdbc", backgroundColor: "#ffffff" }}
            placeholder="Nom de l'objectif (ex: Nouveau micro)"
          />
          <div className="relative">
            <input
              type="number"
              required
              min={1000}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full outline-none px-4 py-3 rounded-lg text-sm pr-20"
              style={{ border: "1px solid #e4bdbc", backgroundColor: "#ffffff" }}
              placeholder="Montant cible"
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium"
              style={{ color: "#5b403f" }}
            >
              FCFA
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: "#b20024", color: "#ffffff" }}
          >
            Créer l&apos;objectif
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Dashboard Page ── */
export default function DashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState(GOALS);
  const [withdrawModal, setWithdrawModal] = useState<"mobile" | "bank" | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [dbActivity, setDbActivity] = useState<typeof RECENT_ACTIVITY>([]);
  const [dbGoals, setDbGoals] = useState<typeof GOALS>([]);
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.ok ? r.json() : Promise.reject()).then((payload) => {
      setDbActivity(payload.activity || []);
      setDbGoals((payload.campaigns || []).map((c: any) => ({ id: c.id, title: c.title, current: Number(c.current), total: Number(c.total), pct: c.total ? Math.round(Number(c.current) * 100 / Number(c.total)) : 0, active: c.status === "active" })));
      setAvailable(Number(payload.stats?.collected || 0));
    }).catch(() => undefined);
  }, []);

  const AVAILABLE = 845000;
  const activity = dbActivity;
  const visibleActivity = showAllActivity ? activity : activity.slice(0, 3);

  const addGoal = (g: typeof GOALS[0]) => {
    setGoals((prev) => [g, ...prev]);
  };

  return (
    <>
      <Navbar />
      <main
        className="mx-auto px-8 py-6 min-h-screen"
        style={{ maxWidth: "1200px" }}
      >
        {/* ── Dashboard Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-5">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "#1b1c19", letterSpacing: "-0.02em" }}
            >
              Tableau de bord
            </h1>
            <p className="text-sm mt-1" style={{ color: "#5b403f" }}>
              Bienvenue Juliet 👋 — voici l&apos;aperçu de votre activité.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <button
                className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border transition-all hover:opacity-80"
                style={{ borderColor: "#b20024", color: "#b20024" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  person
                </span>
                Mon profil
              </button>
            </Link>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#b20024", color: "#ffffff" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                add_circle
              </span>
              Créer une cagnotte
            </button>
          </div>
        </div>

        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Total collecté */}
          <div
            className="p-6 rounded-xl border flex flex-col justify-between transition-all cursor-default"
            style={{ backgroundColor: "#ffffff", borderColor: "#e6e4df" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0px 8px 16px rgba(29,30,32,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: "#5b403f" }}>
                  Total collecté
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#496546" }}
                >
                  payments
                </span>
              </div>
          <div className="text-3xl font-bold" style={{ color: "#1b1c19" }}>
                {available.toLocaleString("fr-FR")} FCFA
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#5b403f" }}>Objectif : 3.000.000 FCFA</span>
                <span className="font-bold" style={{ color: "#496546" }}>81%</span>
              </div>
              <Gauge pct={81} />
            </div>
          </div>

          {/* Supporters */}
          <div
            className="p-6 rounded-xl border transition-all cursor-default"
            style={{ backgroundColor: "#ffffff", borderColor: "#e6e4df" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0px 8px 16px rgba(29,30,32,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: "#5b403f" }}>
                Soutiens
              </span>
              <span className="material-symbols-outlined" style={{ color: "#496546" }}>
                groups
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: "#1b1c19" }}>
              142
            </div>
            <p
              className="flex items-center gap-1 text-xs mt-2 font-medium"
              style={{ color: "#496546" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
              >
                trending_up
              </span>
              +12% cette semaine
            </p>
          </div>

          {/* Objectifs actifs */}
          <div
            className="p-6 rounded-xl border transition-all cursor-default"
            style={{ backgroundColor: "#ffffff", borderColor: "#e6e4df" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0px 8px 16px rgba(29,30,32,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: "#5b403f" }}>
                Objectifs actifs
              </span>
              <span className="material-symbols-outlined" style={{ color: "#496546" }}>
                ads_click
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: "#1b1c19" }}>
              {goals.filter((g) => g.active && g.pct < 100).length}
            </div>
            <p className="text-xs mt-2" style={{ color: "#5b403f" }}>
              Dernier succès il y a 2 jours
            </p>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left / Main ── */}
          <section className="lg:col-span-2 space-y-5">
            {/* Recent Activity */}
            <div
              className="p-6 rounded-xl border shadow-sm"
              style={{ backgroundColor: "#ffffff", borderColor: "#e6e4df" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: "#1b1c19" }}>
                  Activité Récente
                </h2>
                <button
                  className="text-sm font-medium"
                  style={{ color: "#b20024" }}
                  onClick={() => setShowAllActivity((p) => !p)}
                >
                  {showAllActivity ? "Réduire" : "Tout voir"}
                </button>
              </div>
              <div className="space-y-5">
                {visibleActivity.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-5"
                    style={{
                      borderBottom:
                        i < visibleActivity.length - 1 ? "1px solid #f0eee9" : "none",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#c8e9c1", color: "#4d6a4a" }}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm" style={{ color: "#1b1c19" }}>
                            {item.name}
                          </h4>
                          <p
                            className="text-sm mt-1 italic"
                            style={{ color: "#5b403f" }}
                          >
                            &ldquo;{item.message}&rdquo;
                          </p>
                        </div>
                        <span
                          className="font-bold text-base shrink-0 ml-4"
                          style={{ color: "#1b1c19" }}
                        >
                          +{item.amount.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                      <span className="text-xs block mt-2" style={{ color: "#5b403f" }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Goals list */}
              <div
                className="p-6 rounded-xl border space-y-5"
                style={{ backgroundColor: "#f5f3ee", borderColor: "#e6e4df" }}
              >
                <h3 className="font-bold flex items-center gap-2" style={{ color: "#1b1c19" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#496546" }}
                  >
                    rocket_launch
                  </span>
                  Mes objectifs
                </h3>
                {goals.map((g, i) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium" style={{ color: "#1b1c19" }}>
                        {g.title}
                      </p>
                      {g.pct >= 100 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "#c8e9c1", color: "#496546" }}
                        >
                          ✓ Atteint
                        </span>
                      )}
                    </div>
                    <Gauge pct={g.pct} delay={i * 100} />
                    <div className="flex justify-between text-xs mt-1" style={{ color: "#5b403f" }}>
                      <span>
                        {g.current.toLocaleString("fr-FR")} /{" "}
                        {g.total.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="font-bold" style={{ color: g.pct >= 100 ? "#496546" : "#1b1c19" }}>
                        {g.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add goal CTA */}
              <Link href="/dashboard/create-campaign" className="w-full">
                <button
                  className="p-6 rounded-xl border flex flex-col justify-center items-center text-center transition-all hover:opacity-80 active:scale-95 w-full"
                  style={{
                    backgroundColor: "#f5f3ee",
                    borderColor: "#e6e4df",
                    borderStyle: "dashed",
                  }}
                >
                  <span
                    className="material-symbols-outlined mb-3"
                    style={{ fontSize: "40px", color: "#e4bdbc" }}
                  >
                    add_task
                  </span>
                  <h3 className="font-bold text-base" style={{ color: "#1b1c19" }}>
                    Nouvel Objectif
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "#5b403f" }}>
                    Définissez un but pour vos soutiens
                  </p>
                </button>
              </Link>
            </div>
          </section>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">
            {/* Withdraw */}
            <div
              className="p-6 rounded-xl border shadow-sm"
              style={{ backgroundColor: "#ffffff", borderColor: "#e6e4df" }}
            >
              <h2 className="text-xl font-bold mb-5" style={{ color: "#1b1c19" }}>
                Retirer mes fonds
              </h2>
              <div className="mb-5">
                <label className="block text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#5b403f" }}>
                  Disponible
                </label>
                <div className="text-3xl font-bold" style={{ color: "#1b1c19" }}>
                  {AVAILABLE.toLocaleString("fr-FR")} FCFA
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setWithdrawModal("mobile")}
                  className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "#496546", color: "#ffffff" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    smartphone
                  </span>
                  Mobile Money
                </button>
                <button
                  onClick={() => setWithdrawModal("bank")}
                  className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold border transition-all hover:opacity-80"
                  style={{ borderColor: "#906f6e", color: "#1b1c19" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    account_balance
                  </span>
                  Virement Bancaire
                </button>
              </div>
              <div
                className="mt-5 pt-5 border-t"
                style={{ borderColor: "#f0eee9" }}
              >
                <button
                  className="flex items-center justify-between w-full text-sm transition-colors group hover:opacity-70"
                  style={{ color: "#5b403f" }}
                >
                  <span>Gérer les modes de paiement</span>
                  <span
                    className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                    style={{ fontSize: "18px" }}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* Tip Card */}
            <div
              className="rounded-xl p-6 relative overflow-hidden"
              style={{ backgroundColor: "#d62839" }}
            >
              <div
                className="absolute top-0 right-0 opacity-10"
                style={{ fontSize: "120px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>
                  lightbulb
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2" style={{ color: "#fff2f1" }}>
                  Besoin d&apos;aide ?
                </h3>
                <p className="text-sm mb-5" style={{ color: "rgba(255,242,241,0.85)" }}>
                  Apprenez à optimiser vos campagnes avec nos guides experts.
                </p>
                <Link href="/explore">
                  <button
                    className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:opacity-90"
                    style={{ backgroundColor: "#ffffff", color: "#b20024" }}
                  >
                    Voir les conseils
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Perfs */}
            <div
              className="p-6 rounded-xl border"
              style={{ backgroundColor: "#f5f3ee", borderColor: "#e6e4df" }}
            >
              <h3 className="font-bold mb-4" style={{ color: "#1b1c19" }}>
                Performances
              </h3>
              <div className="space-y-4">
                {PERFS.map((p) => (
                  <div key={p.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px", color: "#496546" }}
                      >
                        {p.icon}
                      </span>
                      <span className="text-sm" style={{ color: "#5b403f" }}>
                        {p.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#1b1c19" }}>
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini chart placeholder */}
              <div
                className="mt-5 pt-5 border-t"
                style={{ borderColor: "#e4bdbc" }}
              >
                <p className="text-xs font-medium mb-3" style={{ color: "#5b403f" }}>
                  Dons des 7 derniers jours
                </p>
                <div className="flex items-end gap-1 h-14">
                  {[30, 55, 40, 70, 45, 90, 65].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all hover:opacity-80"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 5 ? "#b20024" : "#c8e9c1",
                      }}
                    />
                  ))}
                </div>
                <div
                  className="flex justify-between text-xs mt-1"
                  style={{ color: "#5b403f" }}
                >
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <span key={i} className="flex-1 text-center">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Modals ── */}
      {withdrawModal && (
        <WithdrawModal
          method={withdrawModal}
          available={available}
          onClose={() => setWithdrawModal(null)}
        />
      )}
      {showGoalModal && (
        <NewGoalModal
          onClose={() => setShowGoalModal(false)}
          onAdd={addGoal}
        />
      )}

      <Footer />
    </>
  );
}
