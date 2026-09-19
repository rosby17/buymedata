"use client";
import Link from "next/link";
import { TopUpLogo } from "./Navbar";

export default function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ backgroundColor: "#f5f3ee", borderColor: "#e4bdbc" }}
    >
      <div
        className="w-full py-8 px-8 mx-auto grid grid-cols-1 md:grid-cols-3 gap-5"
        style={{ maxWidth: "1200px" }}
      >
        {/* Brand */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 group">
            <TopUpLogo className="w-8 h-8 transition-transform group-hover:scale-105" />
            <span
              className="text-2xl font-bold cursor-pointer tracking-tight"
              style={{ color: "#1b1c19" }}
            >
              Buy Me Data
            </span>
          </Link>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "#5b403f" }}>
            Propulser la créativité en finançant la connexion internet des créateurs (Base : 500 FCFA = 1 Go de data).
          </p>
        </div>

        {/* Créateurs */}
        <div>
          <h4 className="font-semibold mb-4 text-sm" style={{ color: "#1b1c19" }}>
            Pour les Créateurs
          </h4>
          <ul className="space-y-2">
            {[
              { label: "Créer une page de don", href: "/signup" },
              { label: "Tableau de bord", href: "/dashboard" },
              { label: "Convertisseur FCFA vers Gigas", href: "/dashboard" },
              { label: "Guide de collecte internet", href: "/explore" },
            ].map((link) => (
              <li key={link.label}>
                <Link href={link.href}>
                  <span
                    className="text-xs transition-opacity hover:opacity-70 cursor-pointer"
                    style={{ color: "#5b403f" }}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Communauté */}
        <div>
          <h4 className="font-semibold mb-4 text-sm" style={{ color: "#1b1c19" }}>
            Communauté
          </h4>
          <ul className="space-y-2">
            {[
              { label: "Sign In / Connexion", href: "/login" },
              { label: "Sign Up / Inscription", href: "/signup" },
              { label: "Twitter / X", href: "#" },
              { label: "Discord Afrique Créative", href: "#" },
            ].map((link) => (
              <li key={link.label}>
                <Link href={link.href}>
                  <span
                    className="text-xs transition-opacity hover:opacity-70 cursor-pointer"
                    style={{ color: "#5b403f" }}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div
        className="mx-auto px-8 py-5 border-t text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2"
        style={{ maxWidth: "1200px", borderColor: "rgba(228, 189, 188, 0.3)" }}
      >
        <p className="text-xs" style={{ color: "#5b403f" }}>
          © 2024 Buy Me Data. Tous droits réservés. Fait avec ❤️ pour propulser les créateurs.
        </p>
      </div>
    </footer>
  );
}
