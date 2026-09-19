"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopUpLogo } from "@/components/Navbar";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"creator" | "supporter">("creator");
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const normalized = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (normalized.length < 3 || normalized.length > 30) { setError("Votre username doit contenir 3 à 30 caractères"); return; }
      setLoading(true); setError(""); setUsernameState("checking");
      try {
        const response = await fetch(`/api/usernames?username=${encodeURIComponent(normalized)}`, { cache: "no-store" });
        const result = await response.json();
        if (!result.available) { setUsernameState("taken"); setError("Ce username est déjà pris. Choisissez-en un autre."); return; }
        setUsername(normalized); setUsernameState("available"); setStep(2);
      } catch { setError("Impossible de vérifier ce username"); }
      finally { setLoading(false); }
      return;
    }
    if (!email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, role, username, register: true }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Inscription impossible");
      sessionStorage.setItem("isLoggedIn", "true");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#1b1c19]" style={{ backgroundColor: "#fbf9f4" }}>
      {/* ── Left Side: Editorial Image (Hidden on mobile) ── */}
      <div className="hidden md:flex relative w-full md:w-1/2 lg:w-3/5 h-64 md:h-screen">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/signup-hero.png"
          alt="Créatrice préparant sa page Buy Me Data"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Créez votre page.<br />Recevez du soutien.
          </h2>
          <p className="text-lg opacity-90 max-w-md">
            Donnez à votre créativité un espace clair pour être soutenue.
          </p>
        </div>
      </div>

      {/* ── Right Side: Form Container ── */}
      <div
        className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-24 relative z-10 md:-ml-6 md:rounded-l-[2rem] shadow-[-12px_0_24px_rgba(0,0,0,0.05)] min-h-screen overflow-y-auto"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Brand Element */}
          <Link href="/" className="mb-8 flex items-center gap-3">
            <TopUpLogo className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#b20024" }}>
              Buy Me Data
            </span>
          </Link>

          {/* Headers */}
          <h1 className="text-3xl font-bold mb-2 text-[#1b1c19] tracking-tight">Créer un compte</h1>
          <p className="text-sm text-[#5b403f] mb-6">
            Rejoignez-nous en tant que créateur ou soutien.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
          {error && step === 1 && <div className="p-3 rounded-xl text-xs font-bold text-center" style={{ backgroundColor: "#ffdad8", color: "#b20024" }}>{error}</div>}
          {step === 1 ? <>
          <div className="rounded-2xl border border-[#e4bdbc] bg-[#fbf9f4] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#5b403f]">Votre lien public</p>
            <label className="mt-3 block text-sm font-bold text-[#1b1c19]">Choisissez votre username</label>
            <div className="mt-2 flex items-center rounded-xl border border-[#e4bdbc] bg-white px-4 py-3.5 text-sm"><span className="whitespace-nowrap text-[#7b6864]">buymedata.tools-cl.com/</span><input autoFocus required value={username} onChange={(e)=>{setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,""));setUsernameState("idle");setError("");}} placeholder="votre-nom" className="min-w-0 flex-1 outline-none" /></div>
            <p className="mt-2 text-xs text-[#7b6864]">Ce lien sera votre page de soutien et pourra être partagé partout.</p>
            {usernameState === "available" && <p className="mt-2 text-xs font-semibold text-[#315c38]">✓ Username disponible</p>}
          </div>
          </> : <>
          {/* Role Selection Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-2 rounded-xl border" style={{ borderColor: "#e4bdbc" }}>
            <button
              type="button"
              onClick={() => setRole("creator")}
              className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all border-2 ${
                role === "creator"
                  ? "bg-[#ffdad8] border-[#b20024] text-[#b20024]"
                  : "border-transparent text-[#5b403f] hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined mb-1 text-xl">palette</span>
              <span className="text-xs font-bold">Créateur</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("supporter")}
              className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all border-2 ${
                role === "supporter"
                  ? "bg-[#ffdad8] border-[#b20024] text-[#b20024]"
                  : "border-transparent text-[#5b403f] hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined mb-1 text-xl">favorite</span>
              <span className="text-xs font-bold text-center">Soutien</span>
            </button>
          </div>

            {error && (
              <div
                className="p-3 rounded-xl text-xs font-bold text-center"
                style={{ backgroundColor: "#ffdad8", color: "#b20024" }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#5b403f]">
                Adresse e-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#5b403f] text-[20px]">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bonjour@exemple.fr"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm rounded-xl outline-none transition-all"
                  style={{ backgroundColor: "#fbf9f4", border: "1px solid #e4bdbc", color: "#1b1c19" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#b20024";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,0,36,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e4bdbc";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#5b403f]">Confirmer le mot de passe</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="block w-full px-4 py-3.5 text-sm rounded-xl outline-none" style={{ backgroundColor: "#fbf9f4", border: "1px solid #e4bdbc", color: "#1b1c19" }} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#5b403f]">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#5b403f] text-[20px]">lock</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm rounded-xl outline-none transition-all"
                  style={{ backgroundColor: "#fbf9f4", border: "1px solid #e4bdbc", color: "#1b1c19" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#b20024";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,0,36,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e4bdbc";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "#b20024" }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Création...
                </div>
              ) : (
                "S'inscrire"
              )}
            </button>
            <div className="relative flex items-center gap-3 py-2"><div className="flex-1 border-t" style={{ borderColor: "#e4bdbc" }} /><span className="text-xs text-[#5b403f]">Ou</span><div className="flex-1 border-t" style={{ borderColor: "#e4bdbc" }} /></div>
            <button type="button" onClick={() => { window.location.href = "/api/auth/google"; }} className="w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-xl bg-white text-sm font-bold text-[#1b1c19] hover:bg-gray-50 transition-colors" style={{ borderColor: "#e4bdbc" }}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> Continuer avec Google
            </button>
          </>}
          {step === 1 && <button type="submit" disabled={loading} className="w-full mt-6 flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white shadow-md transition-all disabled:opacity-50" style={{ backgroundColor: "#b20024" }}>{loading ? "Vérification…" : "Continuer"}</button>}
          </form>

          <p className="mt-8 text-center text-sm text-[#5b403f]">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="font-bold text-[#b20024] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
