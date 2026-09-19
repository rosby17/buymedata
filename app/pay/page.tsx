"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const creatorId = searchParams.get("creator_id") || "";
  const campaignId = searchParams.get("campaign_id") || "";
  const [creator, setCreator] = useState<{name:string;avatar_url?:string;category?:string;campaigns?:Array<{id:string;title:string}>}|null>(null);

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
  const [showOverlay, setShowOverlay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "card" | "paypal">("mobile_money");

  useEffect(() => {
    if (!creatorId) return;
    fetch(`/api/creators/${creatorId}`).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => setCreator(data.creator)).catch(() => setPaymentError("Ce créateur n’existe pas."));
  }, [creatorId]);

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
    if (currentAmount <= 0) { setPaymentError("Choisissez un montant avant de poursuivre."); return; }
    setShowOverlay(true);
    setPaymentError("");
    try {
      const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creator_id: creatorId, campaign_id: campaignId || undefined, amount: currentAmount, email, customer_name: customerName, message, customer_phone: "", payment_method: paymentMethod }) });
      const data = await response.json();
      if (!response.ok || !data.checkout_url) throw new Error(data.error || "Impossible de créer le paiement");
      window.location.assign(data.checkout_url);
    } catch (error) {
      setShowOverlay(false);
      setPaymentError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
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
                    src={creator?.avatar_url || "/buy-me-data-mascot.png"}
                    alt={creator?.name || "Créateur"}
                  />
                </div>
                <h2 className="text-2xl font-semibold" style={{ color: "#1b1c19" }}>{creator?.name || "Créateur"}</h2>
                <p className="text-sm mt-1" style={{ color: "#5b403f" }}>
                  {creator?.category || "Créateur de contenu"}
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
                Retour aux créateurs
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
                  Votre message sera visible par le créateur.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Votre nom (optionnel)" className="w-full p-3 rounded-lg border outline-none text-sm" style={{ borderColor: "#e4bdbc", backgroundColor: "#fbf9f4" }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre e-mail (optionnel)" className="w-full p-3 rounded-lg border outline-none text-sm" style={{ borderColor: "#e4bdbc", backgroundColor: "#fbf9f4" }} />
                </div>
                <textarea
                  className="w-full p-4 rounded-lg border outline-none resize-none text-sm mb-5 transition-all"
                  style={{
                    borderColor: "#e4bdbc",
                    backgroundColor: "#fbf9f4",
                    minHeight: "160px",
                    flex: 1,
                  }}
                  placeholder="Laissez un message au créateur..."
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
                <h3 className="text-2xl font-semibold mb-1" style={{ color: "#1b1c19" }}>Paiement sécurisé</h3>
                <p className="text-sm mb-5" style={{ color: "#5b403f" }}>Choisissez votre moyen de paiement. Vous serez redirigé vers le prestataire sécurisé correspondant.</p>
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  {[{id:"mobile_money",label:"Mobile Money",detail:"Orange Money, MTN MoMo · WaraPay"},{id:"card",label:"Carte bancaire",detail:"Visa / Mastercard · TaraMoney"},{id:"paypal",label:"PayPal",detail:"Paiement international · TaraMoney"}].map((method)=><button key={method.id} onClick={()=>setPaymentMethod(method.id as typeof paymentMethod)} className={`rounded-xl border p-4 text-left transition ${paymentMethod===method.id?"border-[#b20024] bg-[#fff2f1]":"border-[#e4bdbc] bg-[#fbf9f4]"}`}><p className="font-bold text-[#1b1c19]">{method.label}</p><p className="mt-1 text-xs text-[#5b403f]">{method.detail}</p></button>)}
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  {paymentError && <p className="text-sm text-center" style={{ color: "#b20024" }}>{paymentError}</p>}
                  <button
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
                  Préparation de votre redirection sécurisée vers WaraPay.
                </p>
              </>
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
