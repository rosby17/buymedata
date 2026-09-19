"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const METHOD_LABELS: Record<string, string> = {
  orange: "Orange Money",
  mtn: "MTN MoMo",
  moov: "Moov Money",
  card: "Carte Bancaire",
  paypal: "PayPal",
};

const CONFETTI_COLORS = [
  "#b20024", "#d62839", "#496546", "#c8e9c1",
  "#ffdad8", "#FFCC00", "#FF7900",
];

function ConfettiEffect() {
  const [pieces, setPieces] = useState<
    Array<{ id: number; style: React.CSSProperties }>
  >([]);

  useEffect(() => {
    const items = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}vw`,
        top: `-${Math.random() * 20 + 10}px`,
        backgroundColor:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 12 + 5}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
      } as React.CSSProperties,
    }));
    setPieces(items);
  }, []);

  return (
    <>
      {pieces.map((p) => (
        <div key={p.id} className="confetti-piece" style={p.style} />
      ))}
    </>
  );
}

function ConfirmationInner() {
  const searchParams = useSearchParams();
  const amount = parseInt(searchParams.get("amount") || "0") || 0;
  const method = searchParams.get("method") || "card";
  const methodLabel = METHOD_LABELS[method] || method;

  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setShowConfetti(true), 200);
    const t3 = setTimeout(() => setShowConfetti(false), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const txRef = useRef(
    "CC-" +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );

  const now = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shareText = `Je viens d'offrir ⚡ ${amount / 500} Go de connexion (${amount.toLocaleString("fr-FR")} FCFA) à Juliet sur Buy Me Data ! 🎉 Rejoignez le mouvement.`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://topupmydata.app";

  const shareActions = [
    {
      label: "Twitter / X",
      icon: "share",
      color: "#000",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        ),
    },
    {
      label: "WhatsApp",
      icon: "chat",
      color: "#25D366",
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
          "_blank"
        ),
    },
    {
      label: "Facebook",
      icon: "thumb_up",
      color: "#1877F2",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        ),
    },
  ];

  const receiptRows = [
    { label: "Référence", value: txRef.current },
    { label: "Date", value: now },
    { label: "Méthode", value: methodLabel },
    {
      label: "Frais plateforme",
      value: `${Math.round(amount * 0.10).toLocaleString("fr-FR")} FCFA (10%)`,
    },
    {
      label: "Juliet reçoit",
      value: `${Math.round(amount * 0.90).toLocaleString("fr-FR")} FCFA`,
      highlight: true,
    },
  ];

  return (
    <>
      <Navbar />
      {showConfetti && <ConfettiEffect />}

      <main
        className="flex-grow flex items-center justify-center px-4 py-12"
        style={{ backgroundColor: "#fbf9f4" }}
      >
        <div
          className="w-full text-center"
          style={{
            maxWidth: "600px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* ── Success icon ── */}
          <div
            className="relative inline-flex items-center justify-center w-28 h-28 rounded-full mb-8"
            style={{ backgroundColor: "#c8e9c1" }}
          >
            {/* Pulse rings */}
            {[0, 0.5].map((delay) => (
              <div
                key={delay}
                className="absolute inset-0 rounded-full"
                style={{
                  animation: `pulse-ring 1.8s ease-out ${delay}s infinite`,
                  backgroundColor: "rgba(73,101,70,0.2)",
                }}
              />
            ))}
            <span
              className="material-symbols-outlined relative z-10"
              style={{
                fontSize: "56px",
                color: "#496546",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              check_circle
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#1b1c19", letterSpacing: "-0.02em" }}
          >
            Merci pour votre soutien ! 🎉
          </h1>
          <p className="text-base mb-8" style={{ color: "#5b403f" }}>
            Votre contribution aide Juliet à continuer de créer du contenu de
            qualité pour la communauté.
          </p>

          {/* ── Receipt Card ── */}
          <div
            className="rounded-xl border p-6 mb-6 text-left card-shadow"
            style={{ backgroundColor: "#ffffff", borderColor: "#e4bdbc" }}
          >
            {/* Creator row */}
            <div
              className="flex items-center gap-4 pb-5 mb-5 border-b"
              style={{ borderColor: "#f0eee9" }}
            >
              <div
                className="w-14 h-14 rounded-full overflow-hidden border-2 shrink-0"
                style={{ borderColor: "#b20024" }}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5PXsU07Swjq7Y3mH7tozVZbYHzec6Aw5C2DmaWUfzS98LY35OIcUQS5rc_n8VemuuTVVwfeX1hyqQhBHtwMWEGAr8c_ZB_7XEAkeDZtq9vVb3meq7ZGhD4g0f1F0K0CTH9MlJJLYtDhRsdoXujXgsRZGIli6rVpuje-1XvBP7a1FLMWkxThc9EyWhV2BC8eJWC8_TxNofwvJDlxquJc3R0WjNuA9G7VGUmFYCq-1Vi-ylMlrLGzts10fqUh4bnnoD5L5qNqMs0x8W"
                  alt="Juliet"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-lg" style={{ color: "#1b1c19" }}>
                    Juliet
                  </span>
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: "#496546", fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <p className="text-xs" style={{ color: "#5b403f" }}>
                  Créatrice digitale &amp; Formatrice Tech
                </p>
              </div>
              <div className="ml-auto text-right">
                <span className="block text-2xl font-bold" style={{ color: "#b20024" }}>
                  {amount.toLocaleString("fr-FR")} FCFA
                </span>
                <span
                  className="inline-block text-xs px-2 py-1 rounded-full font-medium mt-1"
                  style={{ backgroundColor: "#c8e9c1", color: "#496546" }}
                >
                  ✓ Confirmé
                </span>
              </div>
            </div>

            {/* Details */}
            <div>
              {receiptRows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2"
                  style={{
                    borderBottom:
                      i < receiptRows.length - 1 ? "1px solid #f0eee9" : "none",
                  }}
                >
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "#906f6e" }}
                  >
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: row.highlight ? "#496546" : "#1b1c19" }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Share Box ── */}
          <div
            className="rounded-xl border p-5 mb-6"
            style={{ backgroundColor: "#f5f3ee", borderColor: "#e4bdbc" }}
          >
            <p className="text-sm font-medium mb-4" style={{ color: "#1b1c19" }}>
              🙌 Partagez votre soutien et inspirez d&apos;autres personnes !
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {shareActions.map((s) => (
                <button
                  key={s.label}
                  onClick={s.onClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 hover:opacity-85"
                  style={{ backgroundColor: s.color, color: "#fff" }}
                >
                  <span className="material-symbols-outlined text-base">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <Link href="/">
              <button
                className="px-8 py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80 active:scale-95"
                style={{
                  borderColor: "#b20024",
                  color: "#b20024",
                  backgroundColor: "transparent",
                }}
              >
                ← Retour au profil
              </button>
            </Link>
            <Link href="/pay">
              <button
                className="px-8 py-3 rounded-xl text-sm font-medium shadow-md transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#b20024", color: "#ffffff" }}
              >
                Soutenir à nouveau
              </button>
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-xs" style={{ color: "#906f6e" }}>
            Un reçu a été envoyé à votre adresse email. Merci de faire partie de
            la communauté Buy Me Data ⚡💙
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ color: "#5b403f" }}>
          Chargement…
        </div>
      }
    >
      <ConfirmationInner />
    </Suspense>
  );
}
