"use client";
import Link from "next/link";
import { useState } from "react";
import { TopUpLogo } from "@/components/Navbar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Vue d'ensemble");

  const tabs = ["Vue d'ensemble", "Créateurs", "Transactions", "Retraits"];

  return (
    <div className="min-h-screen text-[#1b1c19]" style={{ backgroundColor: "#fbf9f4" }}>
      {/* ── Top Navigation ── */}
      <nav
        className="sticky top-0 z-50 border-b shadow-sm h-16 transition-colors flex justify-between items-center px-4 md:px-8"
        style={{ backgroundColor: "#ffffff", borderColor: "#e4bdbc" }}
      >
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <TopUpLogo className="w-8 h-8" />
            <span
              className="text-xl font-extrabold tracking-tight hidden sm:block"
              style={{ color: "#b20024" }}
            >
              Admin Console
            </span>
          </Link>

          <div className="hidden md:flex gap-4 ml-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="text-sm font-medium transition-colors duration-200 pb-1"
                style={{
                  color: activeTab === tab ? "#b20024" : "#5b403f",
                  borderBottom: activeTab === tab ? "2px solid #b20024" : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "#496546" }}
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-32">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1b1c19", letterSpacing: "-0.02em" }}>
            Tableau de bord administrateur
          </h1>
          <p className="text-sm" style={{ color: "#5b403f" }}>
            Bienvenue sur Buy Me Data. Voici un aperçu des performances de la plateforme.
          </p>
        </header>

        {/* ── Stats Overview ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md"
            style={{ borderColor: "#e4bdbc" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b403f" }}>
                  Créateurs Actifs
                </h3>
                <p className="text-3xl font-bold mt-1" style={{ color: "#1b1c19" }}>
                  1,248
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ffdad8", color: "#b20024" }}
              >
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold" style={{ color: "#496546" }}>
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>+12% ce mois</span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md"
            style={{ borderColor: "#e4bdbc" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b403f" }}>
                  Total Collecté
                </h3>
                <p className="text-3xl font-bold mt-1" style={{ color: "#1b1c19" }}>
                  84 500 €
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#c8e9c1", color: "#496546" }}
              >
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold" style={{ color: "#496546" }}>
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>+5.4% ce mois</span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md"
            style={{ borderColor: "#e4bdbc" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b403f" }}>
                  Objectifs Atteints
                </h3>
                <p className="text-3xl font-bold mt-1" style={{ color: "#1b1c19" }}>
                  342
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#e4bdbc", color: "#b20024" }}
              >
                <span className="material-symbols-outlined">flag</span>
              </div>
            </div>
            <div className="w-full rounded-full h-1.5 mt-2" style={{ backgroundColor: "#f0eee9" }}>
              <div className="h-1.5 rounded-full" style={{ width: "65%", backgroundColor: "#b20024" }}></div>
            </div>
            <p className="text-xs font-semibold mt-2" style={{ color: "#5b403f" }}>
              65% de taux de réussite
            </p>
          </div>

          {/* Card 4 */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md"
            style={{ borderColor: "#e4bdbc" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b403f" }}>
                  Nouveaux Fans
                </h3>
                <p className="text-3xl font-bold mt-1" style={{ color: "#1b1c19" }}>
                  5,892
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ffdad8", color: "#b20024" }}
              >
                <span className="material-symbols-outlined">favorite</span>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold" style={{ color: "#b20024" }}>
              <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
              <span>-2% ce mois</span>
            </div>
          </div>
        </section>

        {/* ── Creators Table ── */}
        <section className="bg-white rounded-2xl border shadow-sm mb-12 overflow-hidden" style={{ borderColor: "#e4bdbc" }}>
          <div
            className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            style={{ borderColor: "#e4bdbc" }}
          >
            <h2 className="text-xl font-bold" style={{ color: "#1b1c19" }}>
              Gestion des Créateurs
            </h2>
            <button
              className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-80"
              style={{ border: "1px solid #b20024", color: "#b20024" }}
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Exporter CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="text-xs uppercase tracking-wider border-b"
                  style={{ backgroundColor: "#fbf9f4", color: "#5b403f", borderColor: "#e4bdbc" }}
                >
                  <th className="p-4">Créateur</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Collecté</th>
                  <th className="p-4">Date d&apos;inscription</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ borderColor: "#e4bdbc" }}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMw--EZGtsaIZvB_cfyJZpgq_hJVW8sjaaV63yLJ0GnfGZL7nA8JSdzKTQxgUJyVoO0t7IFY4rKdGsK0Q8Np3g2V1DkRaT6jm96IACIzPM1TONdlehHfedczIF5uUmhXQfZ17PmXrCpZ_slFfgpMmjTCvNaH0rPUzsQzENolBYTa-vIkI5oJJM7zO4Oa7XM5bHd5_NHztecFPfNTF8Prm8paRA3Tpe6vOv1XseqRixE2lyR9S6DzAPsYugXfyhjHXHDEIlwVpc-i5P"
                      alt="Avatar"
                    />
                    <div>
                      <p className="font-bold">Marie Dubois</p>
                      <p className="text-xs" style={{ color: "#5b403f" }}>@maried_art</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#c8e9c1", color: "#496546" }}
                    >
                      Actif
                    </span>
                  </td>
                  <td className="p-4 font-semibold">4 200 €</td>
                  <td className="p-4 text-xs" style={{ color: "#5b403f" }}>12 Jan 2024</td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-semibold hover:underline" style={{ color: "#b20024" }}>
                      Suspendre
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: "#5b403f" }}
                    >
                      JL
                    </div>
                    <div>
                      <p className="font-bold">Jean Laurent</p>
                      <p className="text-xs" style={{ color: "#5b403f" }}>@jl_music</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#ffdad8", color: "#b20024" }}
                    >
                      Suspendu
                    </span>
                  </td>
                  <td className="p-4 font-semibold">850 €</td>
                  <td className="p-4 text-xs" style={{ color: "#5b403f" }}>05 Fév 2024</td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-semibold hover:underline" style={{ color: "#496546" }}>
                      Réactiver
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Withdrawals Table ── */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#e4bdbc" }}>
          <div
            className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            style={{ borderColor: "#e4bdbc" }}
          >
            <h2 className="text-xl font-bold" style={{ color: "#1b1c19" }}>
              Demandes de Retrait
            </h2>
            <button
              className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-80"
              style={{ border: "1px solid #b20024", color: "#b20024" }}
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Exporter CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="text-xs uppercase tracking-wider border-b"
                  style={{ backgroundColor: "#fbf9f4", color: "#5b403f", borderColor: "#e4bdbc" }}
                >
                  <th className="p-4">Créateur</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4">Méthode</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ borderColor: "#e4bdbc" }}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold">Sophie Martin</td>
                  <td className="p-4 font-semibold">1 500 €</td>
                  <td className="p-4 text-xs flex items-center gap-2" style={{ color: "#5b403f" }}>
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    Virement Bancaire
                  </td>
                  <td className="p-4">
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#e4bdbc", color: "#1b1c19" }}
                    >
                      En attente
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80"
                      style={{ backgroundColor: "#496546" }}
                    >
                      Valider
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80 border"
                      style={{ backgroundColor: "transparent", color: "#b20024", borderColor: "#b20024" }}
                    >
                      Rejeter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── Bottom Nav (Mobile) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t flex justify-around items-center px-2 py-3 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ borderColor: "#e4bdbc" }}
      >
        <button className="flex flex-col items-center p-2 rounded-xl" style={{ color: "#b20024" }}>
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] font-semibold mt-1">Vue</span>
        </button>
        <button className="flex flex-col items-center p-2 rounded-xl" style={{ color: "#5b403f" }}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-semibold mt-1">Créat.</span>
        </button>
        <button className="flex flex-col items-center p-2 rounded-xl" style={{ color: "#5b403f" }}>
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[10px] font-semibold mt-1">Trans.</span>
        </button>
        <button className="flex flex-col items-center p-2 rounded-xl" style={{ color: "#5b403f" }}>
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-semibold mt-1">Profil</span>
        </button>
      </nav>
    </div>
  );
}
