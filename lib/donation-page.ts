// Personnalisation de la page de dons : thèmes, textes et bannière.
// Partagé par la page publique et l'éditeur du dashboard pour que l'aperçu
// corresponde exactement au rendu final.

export type DonationTheme = {
  id: string;
  label: string;
  description: string;
  layout: "centered" | "left";
  page: string;
  pageImage?: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentText: string;
  accentHover: string;
  quote: string;
  radius: string;
  avatarRadius: string;
  shadow: string;
  banner: string;
  bannerHeight: string;
  display: string;
  headlineWeight: number;
  headlineTracking: string;
  headlineTransform: "none" | "uppercase";
  eyebrow: string;
};

export const donationThemes: DonationTheme[] = [
  {
    id: "atelier",
    label: "Atelier",
    description: "Ivoire et encre, titre en serif. Éditorial et chaleureux.",
    layout: "left",
    page: "#f6f3ec",
    surface: "#fffdf8",
    text: "#1a1713",
    muted: "#7a7066",
    border: "#e6ded0",
    accent: "#b20024",
    accentText: "#ffffff",
    accentHover: "#8e001d",
    quote: "#f1ece1",
    radius: "1.5rem",
    avatarRadius: "999px",
    shadow: "0 24px 60px rgba(60, 46, 28, 0.10)",
    banner: "linear-gradient(115deg, #e9dcc4, #f3ece0 55%, #fffdf8)",
    bannerHeight: "9rem",
    display: "var(--font-display), Georgia, serif",
    headlineWeight: 600,
    headlineTracking: "-0.02em",
    headlineTransform: "none",
    eyebrow: "#a1907a",
  },
  {
    id: "eclipse",
    label: "Éclipse",
    description: "Fond nuit, accent doré. Sobre et haut de gamme.",
    layout: "centered",
    page: "#0b0b0e",
    surface: "#141419",
    text: "#f4f2ee",
    muted: "#9b978e",
    border: "#26262f",
    accent: "#e6c169",
    accentText: "#17140c",
    accentHover: "#d3ad50",
    quote: "#1c1c23",
    radius: "1.75rem",
    avatarRadius: "1.25rem",
    shadow: "0 30px 80px rgba(0, 0, 0, 0.55)",
    banner: "linear-gradient(135deg, #1d1a2b, #2e2440 45%, #4a3a2a)",
    bannerHeight: "10rem",
    display: "var(--font-display), Georgia, serif",
    headlineWeight: 500,
    headlineTracking: "-0.015em",
    headlineTransform: "none",
    eyebrow: "#8a7f68",
  },
  {
    id: "studio",
    label: "Studio",
    description: "Noir et blanc, angles nets, typographie XL. Très épuré.",
    layout: "left",
    page: "#ffffff",
    surface: "#ffffff",
    text: "#0a0a0a",
    muted: "#6b6b6b",
    border: "#0a0a0a",
    accent: "#0a0a0a",
    accentText: "#ffffff",
    accentHover: "#333333",
    quote: "#f4f4f4",
    radius: "0.25rem",
    avatarRadius: "0.25rem",
    shadow: "none",
    banner: "linear-gradient(90deg, #0a0a0a 0%, #0a0a0a 38%, #ededed 38%)",
    bannerHeight: "7rem",
    display: "inherit",
    headlineWeight: 700,
    headlineTracking: "-0.04em",
    headlineTransform: "none",
    eyebrow: "#8a8a8a",
  },
  {
    id: "aurore",
    label: "Aurore",
    description: "Dégradé clair et surfaces translucides. Léger et moderne.",
    layout: "centered",
    page: "#f4f4fb",
    pageImage: "radial-gradient(120% 90% at 12% 0%, #ffe6f0 0%, transparent 55%), radial-gradient(110% 80% at 88% 8%, #dfe8ff 0%, transparent 52%)",
    surface: "rgba(255, 255, 255, 0.72)",
    text: "#211f2b",
    muted: "#6e6a7d",
    border: "rgba(255, 255, 255, 0.85)",
    accent: "#6d4dfb",
    accentText: "#ffffff",
    accentHover: "#5a39e8",
    quote: "rgba(255, 255, 255, 0.6)",
    radius: "2rem",
    avatarRadius: "999px",
    shadow: "0 26px 70px rgba(70, 60, 130, 0.14)",
    banner: "linear-gradient(120deg, #c6b3ff, #ffc6e0 52%, #bfe0ff)",
    bannerHeight: "9rem",
    display: "inherit",
    headlineWeight: 700,
    headlineTracking: "-0.03em",
    headlineTransform: "none",
    eyebrow: "#8e87a6",
  },
];

export const defaultThemeId = donationThemes[0].id;
export function themeById(id?: string | null) {
  return donationThemes.find(theme => theme.id === id) || donationThemes[0];
}

export type DonationDesign = {
  page_theme: string;
  banner_url: string;
  page_eyebrow: string;
  page_headline: string;
  page_tagline: string;
  page_cta: string;
  page_note: string;
};

// Limites alignées sur celles appliquées côté API.
export const donationTextLimits: Record<keyof Omit<DonationDesign, "page_theme" | "banner_url">, number> = {
  page_eyebrow: 40,
  page_headline: 70,
  page_tagline: 180,
  page_cta: 40,
  page_note: 60,
};

/** Valeurs affichées quand le créateur n'a rien personnalisé. */
export function donationDefaults(displayName: string): DonationDesign {
  return {
    page_theme: defaultThemeId,
    banner_url: "",
    page_eyebrow: "Page de soutien",
    page_headline: `Soutenir ${displayName}`,
    page_tagline: "Soutiens son travail et ses prochaines créations.",
    page_cta: "Faire un Buy Me Data",
    page_note: "Paiement sécurisé",
  };
}

/** Complète les champs vides par les valeurs par défaut. */
export function resolveDonationDesign(displayName: string, stored?: Partial<DonationDesign> | null): DonationDesign {
  const defaults = donationDefaults(displayName);
  const entries = Object.entries(defaults).map(([key, fallback]) => {
    const value = stored?.[key as keyof DonationDesign];
    return [key, typeof value === "string" && value.trim() ? value.trim() : fallback];
  });
  const resolved = Object.fromEntries(entries) as DonationDesign;
  resolved.page_theme = themeById(resolved.page_theme).id;
  resolved.banner_url = typeof stored?.banner_url === "string" ? stored.banner_url.trim() : "";
  return resolved;
}

/** N'accepte que des URL d'image distantes ou locales, jamais de javascript:. */
export function safeBannerUrl(value: string) {
  if (!value) return "";
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}
