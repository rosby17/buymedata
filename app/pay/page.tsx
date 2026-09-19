"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOBILE_METHODS = [
  { id: "orange", label: "Orange Money", bg: "#FF7900", text: "#fff", abbr: "O" },
  { id: "mtn", label: "MTN MoMo", bg: "#FFCC00", text: "#004F9F", abbr: "MTN" },
  { id: "moov", label: "Moov Money", bg: "#0057A0", text: "#fff", abbr: "M" },
];

const OTHER_METHODS = [
  { id: "card", icon: "credit_card", label: "Carte Bancaire (Visa/Mastercard)" },
  { id: "paypal", icon: "account_balance_wallet", label: "PayPal" },
];

const PRESET_AMOUNTS = [1000, 5000, 10000];

const STEPS = [
  { id: 1, label: "Montant" },
  { id: 2, label: "Message" },
  { id: 3, label: "Paiement" },
];

function PaymentFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialAmount = parseInt(searchParams.get("amount") || "0") || 0;
  const initialMessage = decodeURIComponent(searchParams.get("message") || "");

  const [step, setStep] = useState(1);
  const [currentAmount, setCurrentAmount] = useState(initialAmount);
  const [customInput, setCustomInput] = useState(
    initialAmount > 0 ? String(initialAmount) : ""
  );
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    PRESET_AMOUNTS.includes(initialAmount) ? initialAmount : null
  );
  const [message, setMessage] = useState(initialMessage);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayState, setOverlayState] = useState<"loading" | "success">("loading");

  const gaugePercent = Math.min((currentAmount / 20000) * 100, 100);

  const handlePreset = (amt: number) => {
    setSelectedPreset(amt);
    setCurrentAmount(amt);
    setCustomInput(String(amt));
  };

  const handleCustomInput = (val: string) => {
    setCustomInput(val);
    const n = parseInt(val) || 0;
    setCurrentAmount(n);
    setSelectedPreset(null);
  };

  const handlePay = async () => {
    if (!customerName.trim() || !email.trim()) { setPaymentError("Veuillez renseigner votre nom et votre adresse e-mail."); return; }
    setShowOverlay(true);
    setOverlayState("loading");
    setPaymentError("");
    try {
      const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: currentAmount, email, customer_name: customerName, message, customer_phone: "" }) });
      const data = await response.json();
      if (!response.ok || !data.checkout_url) throw new Error(data.error || "Impossible de créer le paiement");
      window.location.assign(data.checkout_url);
    } catch (error) {
      setShowOverlay(false);
      setPaymentError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  const goToConfirmation = () => {
    router.push(`/merci?amount=${currentAmount}&method=${selectedMethod || "card"}`);
  };

  const goBack = () => router.push("/");

  return (
    <>
      <Navbar />
      <main
        className="flex-grow flex items-center justify-center p-5"
        style={{ minHeight: "calc(100vh - 64px - 200px)" }}
      >
        <div
          className="w-full rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 border"
          style={{
            maxWidth: "900px",
            minHeight: "600px",
            backgroundColor: "#ffffff",
            borderColor: "rgba(228, 189, 188, 0.3)",
          }}
        >
          {/* ── Left Panel ── */}
          <div
            className="md:col-span-4 p-6 border-r flex flex-col justify-between"
            style={{ backgroundColor: "#f5f3ee", borderColor: "rgba(228, 189, 188, 0.3)" }}
          >
            <div>
              <div className="flex flex-col items-center mb-6 text-center">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2"
                  style={{ borderColor: "#b20024" }}
                >
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5PXsU07Swjq7Y3mH7tozVZbYHzec6Aw5C2DmaWUfzS98LY35OIcUQS5rc_n8VemuuTVVwfeX1hyqQhBHtwMWEGAr8c_ZB_7XEAkeDZtq9vVb3meq7ZGhD4g0f1F0K0CTH9MlJJLYtDhRsdoXujXgsRZGIli6rVpuje-1XvBP7a1FLMWkxThc9EyWhV2BC8eJWC8_TxNofwvJDlxquJc3R0WjNuA9G7VGUmFYCq-1Vi-ylMlrLGzts10fqUh4bnnoD5L5qNqMs0x8W"
                    alt="Juliet"
                  />
                </div>
                <h2 className="text-2xl font-semibold" style={{ color: "#1b1c19" }}>Juliet</h2>
                <p className="text-sm mt-1" style={{ color: "#5b403f" }}>
                  Créatrice digitale &amp; Formatrice Tech
                </p>
              </div>

              {/* Récapitulatif */}
              <div
                className="p-4 rounded-lg border"
                style={{ backgroundColor: "#fbf9f4", borderColor: "rgba(228,189,188,0.2)" }}
              >
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#5b403f" }}>
                  Récapitulatif
                </p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: "#1b1c19" }}>Soutien</span>
                  <span className="text-2xl font-semibold" style={{ color: "#b20024" }}>
                    {currentAmount > 0
                      ? currentAmount.toLocaleString("fr-FR") + " FCFA"
                      : "—"}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden mt-2"
                  style={{ backgroundColor: "#e4e2dd" }}
                >
                  <div
                    style={{
                      width: `${gaugePercent}%`,
                      backgroundColor: "#496546",
                      height: "100%",
                      borderRadius: "9999px",
                      transition: "width 0.5s ease-out",
                    }}
                  />
                </div>
                {message && (
                  <p
                    className="text-xs mt-3 italic border-t pt-3"
                    style={{ color: "#5b403f", borderColor: "#e4e2dd" }}
                  >
                    &ldquo;{message.slice(0, 80)}{message.length > 80 ? "…" : ""}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Security + back */}
            <div
              className="pt-6 border-t text-center space-y-4"
              style={{ borderColor: "rgba(228,189,188,0.3)" }}
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1 mx-auto text-xs transition-opacity hover:opacity-70"
                style={{ color: "#5b403f" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  arrow_back
                </span>
                Retour au profil de Juliet
              </button>
              <p className="text-xs" style={{ color: "#5b403f" }}>
                <span
                  className="material-symbols-outlined align-middle mr-1"
                  style={{ fontSize: "16px" }}
                >
                  verified_user
                </span>
                Paiement 100% sécurisé
              </p>
              <div className="flex justify-center gap-2" style={{ opacity: 0.6 }}>
                {["payments", "credit_card", "shield"].map((icon) => (
                  <span key={icon} className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Steps ── */}
          <div className="md:col-span-8 p-6 flex flex-col">
            {/* Step Nav */}
            <div className="flex gap-4 mb-6 border-b pb-4" style={{ borderColor: "#f0eee9" }}>
              {STEPS.map((s) => {
                const isDone = step > s.id;
                const isActive = step === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => isDone && setStep(s.id)}
                    className="flex items-center gap-2 pb-1 transition-all"
                    style={{
                      color: isActive ? "#b20024" : isDone ? "#496546" : "#5b403f",
                      opacity: isActive || isDone ? 1 : 0.4,
                      borderBottom: isActive ? "2px solid #b20024" : "2px solid transparent",
                      cursor: isDone ? "pointer" : "default",
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: isActive ? "#b20024" : isDone ? "#496546" : "#e4e2dd",
                        color: isActive || isDone ? "#fff" : "#5b403f",
                      }}
                    >
                      {isDone ? "✓" : s.id}
                    </span>
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Step 1: Amount ── */}
            {step === 1 && (
              <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-semibold mb-5" style={{ color: "#1b1c19" }}>
                  Combien souhaitez-vous donner ?
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handlePreset(amt)}
                      className="border rounded-xl p-4 transition-all text-left"
                      style={{
                        borderColor: selectedPreset === amt ? "#b20024" : "#e4bdbc",
                        backgroundColor:
                          selectedPreset === amt ? "rgba(214,40,57,0.05)" : "transparent",
                        color: selectedPreset === amt ? "#b20024" : "#5b403f",
                      }}
                    >
                      <span className="block text-2xl font-semibold">
                        {amt.toLocaleString("fr-FR")}
                      </span>
                      <span className="block text-xs">FCFA</span>
                    </button>
                  ))}
                </div>
                <div className="relative mb-4">
                  <input
                    type="number"
                    className="w-full p-4 pl-16 rounded-lg border outline-none transition-all text-lg"
                    style={{ borderColor: "#e4bdbc", backgroundColor: "#fbf9f4" }}
                    placeholder="Montant libre"
                    value={customInput}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#b20024";
                      e.currentTarget.style.boxShadow = "0 0 0 2px rgba(178,0,36,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e4bdbc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                    style={{ color: "#5b403f" }}
                  >
                    FCFA
                  </span>
                </div>
                <div className="flex justify-between mt-auto pt-4">
                  <button
                    onClick={goBack}
                    className="px-6 py-3 text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                    style={{ color: "#5b403f" }}
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Annuler
                  </button>
                  <button
                    disabled={currentAmount <= 0}
                    onClick={() => setStep(2)}
                    className="px-8 py-3 rounded-lg text-sm font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    style={{ backgroundColor: "#b20024", color: "#ffffff" }}
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Message ── */}
            {step === 2 && (
              <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-semibold mb-2" style={{ color: "#1b1c19" }}>
                  Laissez un message{" "}
                  <span className="text-base font-normal" style={{ color: "#5b403f" }}>
                    (optionnel)
                  </span>
                </h3>
                <p className="text-sm mb-4" style={{ color: "#5b403f" }}>
                  Votre message sera visible par Juliet et la communauté.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Votre nom" className="w-full p-3 rounded-lg border outline-none text-sm" style={{ borderColor: "#e4bdbc", backgroundColor: "#fbf9f4" }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Votre e-mail" className="w-full p-3 rounded-lg border outline-none text-sm" style={{ borderColor: "#e4bdbc", backgroundColor: "#fbf9f4" }} />
                </div>
                <textarea
                  className="w-full p-4 rounded-lg border outline-none resize-none text-sm mb-5 transition-all"
                  style={{
                    borderColor: "#e4bdbc",
                    backgroundColor: "#fbf9f4",
                    minHeight: "160px",
                    flex: 1,
                  }}
                  placeholder="Dites quelque chose de gentil à Juliet..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#b20024";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(178,0,36,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e4bdbc";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                    style={{ color: "#5b403f" }}
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-8 py-3 rounded-lg text-sm font-medium shadow-md active:scale-95"
                    style={{ backgroundColor: "#b20024", color: "#ffffff" }}
                  >
                    Choisir le paiement →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Payment Method ── */}
            {step === 3 && (
              <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-semibold mb-1" style={{ color: "#1b1c19" }}>
                  Choisir le mode de paiement
                </h3>
                <p className="text-sm mb-5" style={{ color: "#5b403f" }}>
                  Privilégiez le Mobile Money pour des frais réduits.
                </p>

                {/* Mobile Money */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {MOBILE_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className="border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
                      style={{
                        borderColor: selectedMethod === m.id ? "#b20024" : "#e4bdbc",
                        backgroundColor: selectedMethod === m.id ? "#fff2f1" : "transparent",
                        boxShadow:
                          selectedMethod === m.id
                            ? "0px 4px 12px rgba(178,0,36,0.1)"
                            : "none",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: m.bg, color: m.text }}
                      >
                        {m.abbr}
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#1b1c19" }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Other methods */}
                <div className="space-y-3 mb-5">
                  {OTHER_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className="w-full border rounded-lg p-3 flex justify-between items-center transition-all"
                      style={{
                        borderColor: selectedMethod === m.id ? "#b20024" : "#e4bdbc",
                        backgroundColor: selectedMethod === m.id ? "#fff2f1" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined" style={{ color: "#5b403f" }}>
                          {m.icon}
                        </span>
                        <span className="text-sm font-medium" style={{ color: "#1b1c19" }}>
                          {m.label}
                        </span>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px", opacity: 0.3 }}>
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  {paymentError && <p className="text-sm text-center" style={{ color: "#b20024" }}>{paymentError}</p>}
                  <button
                    disabled={!selectedMethod}
                    onClick={handlePay}
                    className="w-full py-4 rounded-lg text-xl font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    style={{ backgroundColor: "#b20024", color: "#ffffff" }}
                  >
                    Payer {currentAmount > 0 ? currentAmount.toLocaleString("fr-FR") + " FCFA" : "les mégas"}
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="text-center py-2 text-sm transition-opacity hover:opacity-70"
                    style={{ color: "#5b403f" }}
                  >
                    ← Modifier le message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Processing Overlay ── */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="rounded-xl p-8 max-w-sm w-full text-center shadow-2xl mx-4"
            style={{ backgroundColor: "#fbf9f4" }}
          >
            {overlayState === "loading" ? (
              <>
                <div className="mb-6 flex justify-center">
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      border: "4px solid #e4bdbc",
                      borderTopColor: "#b20024",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: "#1b1c19" }}>
                  Traitement en cours…
                </h3>
                <p className="text-sm" style={{ color: "#5b403f" }}>
                  Veuillez valider l&apos;opération sur votre téléphone.
                </p>
              </>
            ) : (
              <>
                <div className="mb-6 animate-pop-in flex justify-center">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "64px",
                      color: "#496546",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    check_circle
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: "#1b1c19" }}>
                  Paiement réussi !
                </h3>
                <p className="text-sm mb-6" style={{ color: "#5b403f" }}>
                  Juliet a bien reçu{" "}
                  <strong>{currentAmount.toLocaleString("fr-FR")} FCFA</strong>. Merci !
                </p>
                <button
                  onClick={goToConfirmation}
                  className="w-full py-3 rounded-lg text-sm font-bold active:scale-95 transition-all"
                  style={{ backgroundColor: "#b20024", color: "#ffffff" }}
                >
                  Voir ma confirmation →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function PaymentFlow() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ color: "#5b403f" }}
        >
          Chargement…
        </div>
      }
    >
      <PaymentFlowInner />
    </Suspense>
  );
}
