"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface NavbarProps {
  onSupportClick?: () => void;
  dashboardLayout?: boolean;
}

/* ── Buy Me Data mascot logo ── */
export function TopUpLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img src="/buy-me-data-mascot.png" alt="Buy Me Data" className={`${className} object-contain`} />
  );
}

export default function Navbar({ onSupportClick, dashboardLayout = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; username?: string | null; avatar_url?: string | null } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => response.ok ? (await response.json()).user : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  const isProfile = pathname === "/";
  const isPayment = pathname === "/pay";
  const isMerci = pathname === "/merci";
  const isAuth = pathname === "/login" || pathname === "/signin" || pathname === "/signup";

  return (
    <nav
      className={`sticky top-0 z-50 shadow-sm h-16 transition-colors ${dashboardLayout ? "lg:ml-64" : ""}`}
      style={{ backgroundColor: "#fbf9f4" }}
    >
      <div
        className="flex justify-between items-center w-full h-full px-5 sm:px-8"
      >
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-8">
          {!dashboardLayout && <Link href="/" className="flex items-center gap-2 group">
            <TopUpLogo className="w-8 h-8 transition-transform group-hover:scale-105" />
            <span className="text-2xl font-extrabold tracking-tight cursor-pointer" style={{ color: "#b20024" }}><span className="text-[1.05rem] sm:text-[1.2rem] font-bold tracking-tight">Buy Me Data</span></span>
          </Link>}

        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Back to profile — on /pay and /merci */}
          {(isPayment || isMerci) && (
            <Link href="/">
              <span
                className="hidden md:flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: "#5b403f" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  arrow_back
                </span>
                Retour au profil
              </span>
            </Link>
          )}

          {/* Soutenir — on profile page */}
          {isProfile && onSupportClick && (
            <button
              onClick={onSupportClick}
              className="hidden md:flex items-center gap-1 text-sm font-bold transition-opacity hover:opacity-70 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#ffdad8", color: "#b20024" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                wifi
              </span>
              Offrir des Gigas
            </button>
          )}

          {/* Auth State Buttons / Dropdown */}
          {user ? (
            <div className="relative">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-8 h-8 rounded-full overflow-hidden border cursor-pointer hover:opacity-85 transition-opacity"
                style={{ borderColor: "#e4bdbc" }}
              >
                <img
                  src={user.avatar_url || "/buy-me-data-mascot.png"}
                  alt={user.name || "Votre profil"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg py-2 z-50 transition-all text-sm"
                  style={{ borderColor: "#e4bdbc" }}
                >
                  <Link
                    href={user.username ? `/${user.username}` : "/dashboard/settings"}
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 hover:bg-gray-50 text-[#1b1c19] font-medium"
                  >
                    Voir ma page
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 hover:bg-gray-50 text-[#1b1c19] font-medium border-b"
                    style={{ borderColor: "#f5f3ee" }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/account"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 hover:bg-gray-50 text-[#1b1c19] font-medium"
                  >
                    Paramètres du compte
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 hover:bg-gray-50 text-[#1b1c19] font-medium border-b"
                    style={{ borderColor: "#f5f3ee" }}
                  >
                    Inviter un créateur
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-[#b20024] font-bold"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {!isAuth ? (
                <>
                  <Link href="/login">
                    <button
                      className="text-sm font-semibold transition-colors hover:opacity-80 px-3 py-1.5"
                      style={{ color: "#5b403f" }}
                    >
                      Se connecter
                    </button>
                  </Link>

                  <Link href="/signup">
                    <button
                      className="px-5 py-2 rounded-lg text-sm font-bold transition-all active:scale-90 hover:opacity-90 shadow-sm flex items-center gap-1.5"
                      style={{ backgroundColor: "#b20024", color: "#ffffff" }}
                    >
                      <span className="material-symbols-outlined text-base">rocket_launch</span>
                      Commencer
                    </button>
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <button
                    className="text-sm font-medium transition-colors hover:opacity-80 flex items-center gap-1"
                    style={{ color: "#5b403f" }}
                  >
                    <span>Accueil</span>
                    <span className="material-symbols-outlined text-base">home</span>
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
