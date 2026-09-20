"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

type Profile = { username?: string };

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<"checking" | "granted" | "unavailable">("checking");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/profile", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (response.status === 401) {
          window.location.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (!response.ok) throw new Error("Profile unavailable");
        setProfile((await response.json()).profile);
        setAccess("granted");
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAccess("unavailable");
      });
    return () => controller.abort();
  }, [pathname]);

  if (access === "checking") return <main className="grid min-h-screen place-items-center bg-[#f5f3ee] px-5 text-center text-sm text-[#6f5a57]">Vérification de votre session…</main>;
  if (access === "unavailable") return <main className="grid min-h-screen place-items-center bg-[#f5f3ee] px-5 text-center"><div><p className="font-semibold text-[#1b1c19]">Votre espace ne peut pas être chargé pour le moment.</p><button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-[#b20024] px-5 py-3 text-sm font-bold text-white">Réessayer</button></div></main>;

  const pageHref = profile?.username ? `/${profile.username}` : "/dashboard/settings";
  const items = [
    ["/dashboard", "home", "Accueil", pathname === "/dashboard"],
    [pageHref, "open_in_new", "Voir ma page", false],
    ["/dashboard/support", "volunteer_activism", "Me soutenir", pathname.startsWith("/dashboard/support")],
    ["/dashboard/campaigns", "flag", "Cagnottes", pathname.startsWith("/dashboard/campaigns") || pathname.startsWith("/dashboard/create-campaign")],
    ["/explore", "explore", "Explorer les cagnottes", false],
    ["/dashboard/withdrawals", "payments", "Retraits", pathname.startsWith("/dashboard/withdrawals")],
    ["/dashboard/settings", "edit_square", "Ma page de soutien", pathname.startsWith("/dashboard/settings")],
    ["/dashboard/account", "settings", "Paramètres du compte", pathname.startsWith("/dashboard/account")],
  ] as const;
  return <><Navbar dashboardLayout /><div className="min-h-screen bg-[#f5f3ee]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#ead6d2] bg-white lg:block"><div className="flex h-full flex-col"><div className="flex h-16 items-center px-5"><Link href="/" className="flex items-center gap-2"><img src="/buy-me-data-mascot.png" alt="Buy Me Data" className="h-9 w-9 object-contain" /><span className="text-sm font-bold text-[#b20024]">Buy Me Data</span></Link></div><div className="flex-1 p-4">
      <nav className="mt-1 space-y-1">{items.map(([href, icon, label, active], index) => <div key={label}>{index === 2 && <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a18d88]">Monétiser</p>}{index === 6 && <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a18d88]">Compte</p>}<Link href={href} prefetch={false} target={index === 1 ? "_blank" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#fff2f1] text-[#b20024]" : "text-[#1b1c19] hover:bg-[#f5f3ee]"}`}><span className="material-symbols-outlined text-[19px]">{icon}</span>{label}{index === 1 && <span className="material-symbols-outlined ml-auto text-[16px]">open_in_new</span>}</Link></div>)}</nav>
    </div></div></aside><div className="min-w-0 lg:pl-64">{children}</div>
  </div></>;
}
