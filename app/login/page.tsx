"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopUpLogo } from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Connexion impossible");
      if (payload.verification_required) { setMessage(payload.message || "Consultez votre e-mail pour confirmer votre adresse."); return; }
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/app") ? next : "/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#1b1c19]" style={{ backgroundColor: "#fbf9f4" }}>
      {/* ── Left Side: Editorial Image (Hidden on mobile) ── */}
      <div className="hidden md:flex relative w-full md:w-1/2 lg:w-3/5 h-64 md:h-screen">
        <Image
          fill
          preload
          sizes="(min-width: 1024px) 60vw, 50vw"
          quality={78}
          className="object-cover"
          src="/login-hero.jpg"
          alt="Créateur consultant sa communauté"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Vos soutiens.<br />Votre élan créatif.
          </h2>
          <p className="text-lg opacity-90 max-w-md">
            Retrouvez votre espace et continuez à faire grandir vos projets.
          </p>
        </div>
      </div>

      {/* ── Right Side: Form Container ── */}
      <div
        className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-24 relative z-10 md:-ml-6 md:rounded-l-[2rem] shadow-[-12px_0_24px_rgba(0,0,0,0.05)] min-h-screen"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Brand Element */}
          <Link href="/" className="mb-10 flex items-center gap-3">
            <TopUpLogo className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#b20024" }}>
              Buy Me Data
            </span>
          </Link>

          {/* Headers */}
          <h1 className="text-4xl font-bold mb-2 text-[#1b1c19] tracking-tight">Bon retour</h1>
          <p className="text-sm text-[#5b403f] mb-8">
            Veuillez vous connecter à votre compte pour continuer.
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {message && <div className="p-3 rounded-xl text-xs font-bold text-center" style={{ backgroundColor: "#edf6ee", color: "#315c38" }}>{message}</div>}
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

            <div className="flex items-center justify-between pt-1 pb-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#b20024] focus:ring-[#b20024]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#5b403f]">
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-bold text-[#b20024] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "#b20024" }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "#e4bdbc" }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-[#5b403f]">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => { window.location.href = "/api/auth/google?intent=login"; }}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-xl bg-white text-sm font-bold text-[#1b1c19] hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#e4bdbc" }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continuer avec Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#5b403f]">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-bold text-[#b20024] hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
