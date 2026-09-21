"use client";

import Link from "next/link";
import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export type DashboardProfile = { id: string; email: string; full_name: string; role: "creator" | "supporter"; username?: string | null; avatar_url?: string | null; bio?: string | null; category?: string | null };
const DashboardProfileContext = createContext<DashboardProfile | null>(null);

export function useDashboardProfile() {
  const profile = useContext(DashboardProfileContext);
  if (!profile) throw new Error("Dashboard profile is unavailable");
  return profile;
}

export default function DashboardShell({ children, profile }: { children: React.ReactNode; profile: DashboardProfile }) {
  const pathname = usePathname();
  const pageHref = profile?.username ? `/${profile.username}` : "/app/support";
  const items = [
    ["/app", "home", "Accueil", pathname === "/app"],
    [pageHref, "open_in_new", "Voir ma page", false],
    ["/app/support", "volunteer_activism", "Me soutenir", pathname.startsWith("/app/support")],
    ["/app/campaigns", "flag", "Cagnottes", pathname.startsWith("/app/campaigns") || pathname.startsWith("/app/create-campaign")],
    ["/app/withdrawals", "payments", "Retraits", pathname.startsWith("/app/withdrawals")],
    ["/app/account", "settings", "Paramètres du compte", pathname.startsWith("/app/account")],
  ] as const;
  return <DashboardProfileContext.Provider value={profile}><Navbar dashboardLayout initialUser={{ name: profile.full_name, email: profile.email, username: profile.username, avatar_url: profile.avatar_url }} /><div className="min-h-screen bg-[#f5f3ee]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#ead6d2] bg-white lg:block"><div className="flex h-full flex-col"><div className="flex h-16 items-center px-5"><Link href="/" className="flex items-center gap-2"><img src="/buy-me-data-mascot.png" alt="Buy Me Data" className="h-9 w-9 object-contain" /><span className="text-sm font-bold text-[#b20024]">Buy Me Data</span></Link></div><div className="flex-1 p-4">
      <nav className="mt-1 space-y-1">{items.map(([href, icon, label, active], index) => <div key={label}>{index === 2 && <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a18d88]">Monétiser</p>}{index === 5 && <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a18d88]">Compte</p>}<Link href={href} prefetch={false} target={index === 1 ? "_blank" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#fff2f1] text-[#b20024]" : "text-[#1b1c19] hover:bg-[#f5f3ee]"}`}><span className="material-symbols-outlined text-[19px]">{icon}</span>{label}{index === 1 && <span className="material-symbols-outlined ml-auto text-[16px]">open_in_new</span>}</Link></div>)}</nav>
    </div></div></aside><div className="min-w-0 lg:pl-64">{children}</div>
  </div></DashboardProfileContext.Provider>;
}
