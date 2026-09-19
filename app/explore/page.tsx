"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = ["Tous", "Art Numérique", "Développement", "Musique", "Vidéo", "Design"];

const ACTIVE_CAMPAIGNS = [
  {
    id: 1,
    category: "Développement",
    title: "Serveur Rendu 3D Open Source",
    description:
      "Besoin de bande passante pour héberger les fichiers sources du nouveau moteur de rendu communautaire.",
    current: "740 Go",
    total: "1 To",
    pct: 74,
    contributors: 124,
    daysLeft: "6 jours restants",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJTfu_U4ng8YgrWslPWim4nDj99xsu0aK2LaSF3JZxM2ndtt6O-MXXCZHYcGAKLo6Zhk4KDOptIpUFuJR3asuyFTVacd2YIKxGoEAYrv_k-Gyfng3fvzKNvJI5ZVnHyST164TO3UahMjBrQcFt3mPsxZMDQxPeIB-Rxj4OJaQFDFNQ6sIDMQF_0-uhk4B4ygFGHTIUXr9P8BritAz2vIhBiL_ebsMDBVc3xGKWFD9MgpSRKyS-k0N2ar3VL3jbKuR4CqfN0LcejPWx",
  },
  {
    id: 2,
    category: "Musique & Sound Design",
    title: "Banque de Sons Gratuite v2",
    description:
      "Aidez-nous à financer le stockage et le téléchargement de 50 Go de samples HQ pour tous les créateurs.",
    current: "450 Go",
    total: "500 Go",
    pct: 90,
    contributors: 210,
    daysLeft: "Termine demain",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuALkBE_HxBkgNr_NjvQd6JzEhChL0dw5IaRzxVBV3hKG9hgBxDQg1vVhorZpUZ-0509_lI8lSEK5kjVqtpaaHJLnTTjsqBpp2i4hg3ejXRWX2t3rsZONmht0GVmgY28s0Ab733gWtodZTJT-4tE2GScjwMpWcOXF2Uph4JhgLccY6hcXvghwgIM3491-xRSsAPOgZRgojPjwOmFyMz2l3npGcUn1Nx7LGe1okUTk9-FN_nuA_byQoWcQjeEejuKJbeSsYcr7FtHO4fU",
  },
];

const FEATURED_CREATORS = [
  {
    id: 1,
    name: "Elena Rossi",
    role: "Illustratrice",
    data: "8.5/10 Go",
    pct: 85,
    category: "Art Numérique",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH3vQ3blLwzCASLtiOo1jcCt-qiPM_-XkCV1lzYsTcCpbAPhOwwXhUSVO8carJuS8nsEYaGTyxlOdIvr3wWb03PacagwSCakbkA4d2C7YhwIDOfC1ooHP7kFjmf8FIuWpPqgCWXnXpCNTAZ1bKgO6IHMoX2Mcyhl5kZ4Z14hkQ66QXxQ9kHaFB9TNvkw8YYkFv_lyvp2rs7EqSBzOxnjQ600_L-axWDhb1_2YXsnENl3yxR_MdzbbT-nkvA6MUa-ugeubLJvFxk0QD",
  },
  {
    id: 2,
    name: "Marc Weber",
    role: "Développeur",
    data: "12/50 Go",
    pct: 24,
    category: "Développement",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMO7Ey5IvIfcgmZUdMSyCbycVhM6X4sHkRxWomgo7G5Rft9JxoAxNplZLHRoVtpXMGQCjq4cu-DAW4_a3R4GArvw5WH6NnGPXgMe3n3wHGM41MHjU8XGlz9sSZ0CooUkeR5dR6vo1e1i2BdKVR7aoY31UyLuF4w1RfeUMwmG-dgQ9RRZKuZsuPZGwKY-IpjtZD4gxmIU5UqHqCI8UxBNOfa_mvy_S-835ZYauXq5O8FdAa6_3LNB_xd-4zK5kRLklaycme3I_SLQbo",
  },
  {
    id: 3,
    name: "Sophie Laurent",
    role: "Vidéaste",
    data: "45/100 Go",
    pct: 45,
    category: "Vidéo",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjlur-Ubtl259QdO6oIAcxwb0gk9SvJW8khMsq4_HC6pCDyUuxJ_w5YvxXgCpaUItycngwFAIlL2HKCU2BFXLZZcPE_c6m2YQZyemVqRumYAs-q_FK-w-VTGJbAYtamzNKR7AEjnIRvDwBd30aJXzWlz_fx1OIu8rJ1lQrQil9xaDsb2hRvf2Y8z0NAb8AilNk8JKv-L649XKicH5KrjmD3MI3wHec5xo0gHDZxOXBplgADR_lJbqCi8OKOT_ey-ne8MIsnoiTkA8P",
  },
  {
    id: 4,
    name: "Julie Chen",
    role: "UX Designer",
    data: "18/20 Go",
    pct: 90,
    category: "Design",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCt-pJRPPV-ImhBMu5wgzAE7YCY-xxzfdTP8dXCyQXO1fF2HE-CdycSa40Ftw6xbm1NHCpRp8t1QUrtb0Z7xB35NJxdgUE8U8VG8xXEpHB02kHcMhP-YGWiwhmUuDVc36GTGpH6IGqANGHLDpgthouGg_wV5Tm6ruFAIXUNOfI7p3o3qz6QXBNv1k9CiirTy3l_ZlxbYEcti1CluT_eDUmiuTsIjAxa6V7utiKKlvIAuJXZLdD8ezwuzHtx1WcuKyvzby-WNT9VVlat",
  },
];

/* ── Gauge bar with entrance animation ── */
function GaugeBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120 + delay);
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
          width: `${width}%`,
          backgroundColor: "#496546",
          borderRadius: "9999px",
          transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

function ExploreInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [dbCreators, setDbCreators] = useState<typeof FEATURED_CREATORS>([]);
  const [dbCampaigns, setDbCampaigns] = useState<typeof ACTIVE_CAMPAIGNS>([]);

  useEffect(() => {
    fetch("/api/creators").then((r) => r.ok ? r.json() : Promise.reject()).then((payload) => {
      const creators = (payload.creators || []).map((creator: any) => {
        const campaign = creator.campaigns?.[0];
        const total = Number(campaign?.target_amount || 0);
        const current = Number(campaign?.collected_amount || 0);
        return { id: creator.id, name: creator.name, role: "Créateur", data: `${current.toLocaleString("fr-FR")} FCFA`, pct: total ? Math.min(100, Math.round(current * 100 / total)) : 0, category: "Tous", img: creator.avatar_url || "/buy-me-data-mascot.png" };
      });
      setDbCreators(creators);
      setDbCampaigns((payload.creators || []).flatMap((creator: any) => (creator.campaigns || []).map((campaign: any) => ({ id: campaign.id, category: "Créateurs", title: campaign.title, description: campaign.description || "", current: `${Number(campaign.collected_amount).toLocaleString("fr-FR")} FCFA`, total: `${Number(campaign.target_amount).toLocaleString("fr-FR")} FCFA`, pct: campaign.target_amount ? Math.min(100, Math.round(campaign.collected_amount * 100 / campaign.target_amount)) : 0, contributors: 0, daysLeft: "En cours", img: creator.avatar_url || "/buy-me-data-mascot.png" }))));
    }).catch(() => { setDbCreators([]); setDbCampaigns([]); });
  }, []);

  const filteredCreators =
    activeCategory === "Tous"
      ? dbCreators
      : dbCreators.filter((c) => c.category === activeCategory);

  const searchedCreators = query
    ? filteredCreators.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.role.toLowerCase().includes(query.toLowerCase())
      )
    : filteredCreators;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <Navbar />
      <main
        className="mx-auto px-8 py-6 space-y-16"
        style={{ maxWidth: "1200px" }}
      >
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-8">
          <div className="space-y-6">
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "#1b1c19", letterSpacing: "-0.02em" }}
            >
              Rechargez les mégas de vos{" "}
              <span style={{ color: "#b20024" }}>créateurs préférés</span> ⚡
            </h1>
            <p
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: "#5b403f" }}
            >
              Donnez-leur la force de continuer à produire de superbes contenus. Financez directement leur connexion internet pour propulser leurs streams, uploads et projets en ligne.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a href="#cagnottes">
                <button
                  className="px-8 py-4 rounded-xl text-base font-bold shadow-md transition-all hover:opacity-90 active:scale-95 flex items-center gap-2"
                  style={{ backgroundColor: "#b20024", color: "#ffffff" }}
                >
                  <span className="material-symbols-outlined">explore</span>
                  Voir les cagnottes
                </button>
              </a>
              <Link href="/pay">
                <button
                  className="px-8 py-4 rounded-xl text-base font-bold border transition-all hover:opacity-80 flex items-center gap-2"
                  style={{ borderColor: "#b20024", color: "#b20024" }}
                >
                  <span className="material-symbols-outlined">payments</span>
                  Payer les mégas
                </button>
              </Link>
            </div>
            {/* Stats strip */}
            <div className="flex gap-8 pt-2">
              {[
                { value: "2.4k+", label: "Créateurs" },
                { value: "18k+", label: "Soutiens" },
                { value: "90%", label: "Reversés" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold" style={{ color: "#b20024" }}>
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: "#5b403f" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/hero-creator.png"
              alt="Juliet Tech"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }}
            />
            <div className="absolute bottom-6 left-6 text-white">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                style={{ backgroundColor: "rgba(73,101,70,0.9)" }}
              >
                Créateur de la semaine
              </span>
              <h3 className="text-xl font-bold">Juliet Tech</h3>
              <p className="text-sm opacity-90">Créatrice de tutoriels • 85% Financé</p>
            </div>
            {/* Floating badge */}
            <div
              className="absolute top-4 right-4 px-3 py-2 rounded-xl text-xs font-bold shadow-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#b20024" }}
            >
              🔥 12 soutiens aujourd&apos;hui
            </div>
          </div>
        </section>

        {/* ── Juliet Tech Featured Creator ── */}
        <section className="mb-16">
          <div className="bg-[#f0eee9] rounded-3xl p-8 border flex flex-col md:flex-row gap-8 items-center" style={{ borderColor: "#e4bdbc" }}>
            <div className="w-full md:w-1/3 relative">
              <img
                className="w-full aspect-square object-cover rounded-2xl shadow-md"
                src="/images/hero-creator.png"
                alt="Juliet Tech"
              />
              <div
                className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-md text-xs font-bold border flex items-center gap-2 animate-bounce"
                style={{ borderColor: "#e4bdbc", color: "#b20024" }}
              >
                <span>🔥 12 soutiens aujourd&apos;hui</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: "#1b1c19" }}>
                    Juliet Tech
                  </h2>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: "#c8e9c1", color: "#496546" }}
                  >
                    Créatrice de tutoriels
                  </span>
                </div>
              </div>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "#5b403f" }}>
                &ldquo;Besoin de data pour uploader mes prochains tutoriels vidéo sur le développement web. Chaque soutien m&apos;aide à propulser ma communauté !&rdquo;
              </p>
              <div className="bg-white p-6 rounded-2xl border" style={{ borderColor: "#e4bdbc" }}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5b403f]">
                    Objectif de la semaine
                  </span>
                  <span className="text-2xl font-bold" style={{ color: "#496546" }}>
                    85% Financé
                  </span>
                </div>
                <div className="w-full h-3 mb-6 overflow-hidden rounded-full" style={{ backgroundColor: "#f5f3ee" }}>
                  <div className="h-full rounded-full" style={{ width: "85%", backgroundColor: "#496546" }}></div>
                </div>
                <Link href="/pay?amount=10000">
                  <button
                    className="w-full py-4 text-white rounded-xl text-lg font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "#b20024" }}
                  >
                    Payer les mégas à Juliet
                  </button>
                </Link>
            </div>
          </div>
        </div>
      </section>

        {/* ── Search & Filter ── */}
        <section className="space-y-5">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <span
                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#906f6e" }}
              >
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full outline-none text-base transition-all"
                style={{
                  paddingLeft: "48px",
                  paddingRight: "16px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e4bdbc",
                  borderRadius: "12px",
                  color: "#1b1c19",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#b20024";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,0,36,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e4bdbc";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Rechercher un créateur ou une catégorie..."
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: "#b20024", color: "#ffffff" }}
            >
              Rechercher
            </button>
          </form>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: activeCategory === cat ? "#b20024" : "#ffffff",
                  color: activeCategory === cat ? "#ffffff" : "#5b403f",
                  border: `1px solid ${activeCategory === cat ? "#b20024" : "#e4bdbc"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Active Campaigns ── */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold" style={{ color: "#1b1c19" }}>
              Cagnottes actives
            </h2>
            <button className="text-sm font-medium" style={{ color: "#b20024" }}>
              Voir tout →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dbCampaigns.map((c, i) => (
              <Link href="/" key={c.id}>
                <div
                  className="bg-white rounded-2xl border flex flex-col md:flex-row gap-6 p-6 transition-all cursor-pointer h-full"
                  style={{ borderColor: "#e4bdbc" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0px 8px 24px rgba(29,30,32,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-full md:w-44 rounded-xl overflow-hidden shrink-0"
                    style={{ height: "176px" }}
                  >
                    <img
                      src={c.img}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#496546" }}
                      >
                        {c.category}
                      </span>
                      <h3
                        className="text-lg font-bold mt-1"
                        style={{ color: "#1b1c19" }}
                      >
                        {c.title}
                      </h3>
                      <p
                        className="text-sm mt-2 leading-relaxed"
                        style={{
                          color: "#5b403f",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {c.description}
                      </p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xl font-bold" style={{ color: "#b20024" }}>
                          {c.current}{" "}
                          <span className="text-sm font-normal" style={{ color: "#5b403f" }}>
                            / {c.total}
                          </span>
                        </span>
                        <span className="text-sm font-bold" style={{ color: "#496546" }}>
                          {c.pct}%
                        </span>
                      </div>
                      <GaugeBar pct={c.pct} delay={i * 100} />
                      <div className="flex justify-between text-xs" style={{ color: "#5b403f" }}>
                        <span>{c.contributors} contributeurs</span>
                        <span
                          className="font-medium"
                          style={{ color: c.pct >= 90 ? "#b20024" : "#5b403f" }}
                        >
                          {c.daysLeft}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Creators Grid ── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold" style={{ color: "#1b1c19" }}>
            Créateurs à la une
            {query && (
              <span className="text-base font-normal ml-3" style={{ color: "#5b403f" }}>
                — Résultats pour &ldquo;{query}&rdquo;
              </span>
            )}
          </h2>

          {searchedCreators.length === 0 ? (
            <div className="text-center py-20" style={{ color: "#5b403f" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#e4bdbc" }}>
                search_off
              </span>
              <p className="mt-3 text-lg font-medium">Aucun créateur trouvé pour &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => { setQuery(""); setActiveCategory("Tous"); }}
                className="mt-4 text-sm font-medium"
                style={{ color: "#b20024" }}
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {searchedCreators.map((creator, i) => (
                <Link href="/" key={creator.id}>
                  <div
                    className="bg-white rounded-2xl border overflow-hidden flex flex-col cursor-pointer transition-all"
                    style={{ borderColor: "#e4bdbc" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0px 8px 24px rgba(29,30,32,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div className="relative overflow-hidden" style={{ height: "192px" }}>
                      <img
                        src={creator.img}
                        alt={creator.name}
                        className="w-full h-full object-cover transition-transform duration-500"
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
                        }
                      />
                      <div
                        className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.92)",
                          color: "#b20024",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {creator.data}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-lg font-bold" style={{ color: "#1b1c19" }}>
                          {creator.name}
                        </h4>
                        <p
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: "#496546" }}
                        >
                          {creator.role}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <GaugeBar pct={creator.pct} delay={i * 80} />
                        <div className="flex justify-between items-center">
                          <span className="text-xs" style={{ color: "#5b403f" }}>
                            {creator.pct}% du forfait
                          </span>
                          <button
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80"
                            style={{ backgroundColor: "#ffdad8", color: "#b20024" }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                              bolt
                            </span>
                            Soutenir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Pourquoi choisir Buy Me Data ? ── */}
        <section id="pourquoi-nous-choisir" className="bg-white rounded-3xl p-8 md:p-12 border shadow-sm my-16" style={{ borderColor: "#e4bdbc" }}>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2" style={{ backgroundColor: "#ffdad8", color: "#b20024" }}>
              <span className="material-symbols-outlined text-2xl">campaign</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: "#1b1c19", letterSpacing: "-0.01em" }}>
              Pourquoi choisir <span style={{ color: "#b20024" }}>Buy Me Data</span> ?
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#5b403f" }}>
              En Afrique, la majorité des créateurs de contenu ne sont pas rémunérés à leur juste valeur par les plateformes digitales. Les revenus liés à la monétisation classique sont souvent insignifiants face aux coûts de production réels.
            </p>
            <p className="text-lg leading-relaxed font-semibold" style={{ color: "#496546" }}>
              Face à cette frustration, nous avons créé Buy Me Data : un espace où votre communauté peut vous soutenir financièrement et directement, afin que vous puissiez financer sereinement votre matériel, vos factures et votre production.
            </p>
          </div>
        </section>

        {/* ── Ce que les gens pensent de Buy Me Data ── */}
        <section className="space-y-6 my-16">
          <h2 className="text-2xl font-bold text-center" style={{ color: "#1b1c19" }}>
            Ce que les gens pensent de <span style={{ color: "#b20024" }}>Buy Me Data</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Juliet Tech",
                role: "Créatrice de tutoriels",
                quote: "Grâce aux cagnottes de ma communauté, j'ai pu payer ma connexion internet haut débit et mon électricité pour streamer tous les soirs sans interruption.",
              },
              {
                name: "Marie Dubois",
                role: "Artiste Digitale",
                quote: "C'est tellement simple de lancer un objectif pour un nouveau projet créatif. Mes abonnés adorent savoir exactement ce qu'ils financent.",
              },
              {
                name: "Amadou S.",
                role: "Soutien Actif",
                quote: "Je préfère largement offrir des FCFA convertis en mégas pour mes créateurs préférés plutôt que des pourboires classiques. On voit le résultat en direct !",
              },
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#e4bdbc" }}>
                <p className="text-sm italic leading-relaxed mb-6" style={{ color: "#5b403f" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <h4 className="font-bold text-base" style={{ color: "#1b1c19" }}>{t.name}</h4>
                  <p className="text-xs font-semibold" style={{ color: "#496546" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="space-y-6 my-16">
          <h2 className="text-2xl font-bold text-center" style={{ color: "#1b1c19" }}>
            Questions Fréquentes (FAQ)
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Comment fonctionne le reversement des dons ?",
                a: "90% des dons reçus sont directement reversés en cash sur le compte du créateur. Les 10% restants servent à couvrir les frais de transaction mobile money et d'infrastructure de la plateforme.",
              },
              {
                q: "Puis-je créer une cagnotte privée ?",
                a: "Absolument. Lors de la création de votre cagnotte, vous pouvez choisir de la laisser privée. Elle ne sera pas listée sur la page d'exploration publique et ne sera accessible que via le lien direct que vous partagerez avec votre communauté.",
              },
              {
                q: "Quelles sont les méthodes de retrait disponibles ?",
                a: "Les créateurs peuvent demander le retrait de leurs fonds à tout moment via Mobile Money (Orange Money, MTN MoMo, Wave, etc.) ou par virement bancaire directement depuis leur console d'administration.",
              },
              {
                q: "Y a-t-il une limite de durée pour les cagnottes ?",
                a: "Non. Vous pouvez définir une date limite pour stimuler votre communauté, ou choisir de laisser votre cagnotte ouverte sans limite de temps pour recevoir des soutiens continus.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "#e4bdbc" }}>
                <h4 className="font-bold text-base mb-2" style={{ color: "#b20024" }}>
                  {item.q}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "#5b403f" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ color: "#5b403f" }}>
          Chargement…
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  );
}
