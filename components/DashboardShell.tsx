"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

type Profile = { username?: string };

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch("/api/profile", { cache: "no-store" }).then(async r => r.ok ? (await r.json()).profile : null).then(setProfile).catch(() => setProfile(null));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const pageHref = profile?.username ? `/${profile.username}` : "/dashboard/settings";
  const items = [
    ["/dashboard", "home", "Accueil", pathname === "/dashboard"],
    [pageHref, "open_in_new", "Voir ma page", false],
    ["/dashboard/support", "volunteer_activism", "Me soutenir", pathname.startsWith("/dashboard/support")],
    ["/dashboard/campaigns", "flag", "Cagnottes", pathname.startsWith("/dashboard/campaigns") || pathname.startsWith("/dashboard/create-campaign")],
    ["/dashboard/withdrawals", "payments", "Retraits", pathname.startsWith("/dashboard/withdrawals")],
    ["/dashboard/settings", "edit_square", "Ma page de soutien", pathname.startsWith("/dashboard/settings")],
    ["/dashboard/account", "settings", "Paramètres du compte", pathname.startsWith("/dashboard/account")],
  ] as const;
  return <><Navbar dashboardLayout /><div className="min-h-screen bg-[#f5f3ee]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#ead6d2] bg-white lg:block"><div className="flex h-full flex-col"><div className="flex h-16 items-center border-b border-[#ead6d2] px-5"><Link href="/explore" className="flex items-center gap-2"><img src="/buy-me-data-mascot.png" alt="Buy Me Data" className="h-9 w-9 object-contain" /><span className="text-sm font-bold text-[#b20024]">Buy Me Data</span></Link></div><div className="flex-1 p-4">
      <nav className="mt-1 space-y-1">{items.map(([href, icon, label, active], index) => <div key={label}>{index === 2 && <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a18d88]">Monétiser</p>}{index === 5 && <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a18d88]">Compte</p>}<Link href={href} target={index === 1 ? "_blank" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#fff2f1] text-[#b20024]" : "text-[#1b1c19] hover:bg-[#f5f3ee]"}`}><span className="material-symbols-outlined text-[19px]">{icon}</span>{label}{index === 1 && <span className="material-symbols-outlined ml-auto text-[16px]">open_in_new</span>}</Link></div>)}</nav>
    </div></div></aside><div className="min-w-0 lg:pl-64">{children}</div>
  </div></>;
}
