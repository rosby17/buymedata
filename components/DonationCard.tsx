import Link from "next/link";
import { safeBannerUrl, themeById, type DonationDesign } from "@/lib/donation-page";

export type DonationCreator = {
  id?: string;
  name: string;
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
};

/**
 * Rendu de la page de dons. Les couleurs venant du thème choisi par le
 * créateur, elles sont appliquées en style inline : Tailwind ne peut pas
 * générer des classes à partir de valeurs dynamiques.
 */
export default function DonationCard({ creator, design, preview = false }: {
  creator: DonationCreator;
  design: DonationDesign;
  preview?: boolean;
}) {
  const theme = themeById(design.page_theme);
  const banner = safeBannerUrl(design.banner_url);
  const centered = theme.layout === "centered";
  const align = centered ? "center" : "left";
  const displayName = creator.username || creator.name;
  const bio = creator.bio?.trim();
  const distinctBio = bio && bio.toLowerCase() !== displayName.trim().toLowerCase() && bio.toLowerCase() !== creator.name.trim().toLowerCase() ? bio : "";

  return (
    <article
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: theme.shadow,
        color: theme.text,
        overflow: "hidden",
        backdropFilter: theme.surface.startsWith("rgba") ? "blur(18px)" : undefined,
      }}
    >
      <div
        style={{
          height: theme.bannerHeight,
          background: banner ? `center / cover no-repeat url("${banner}")` : theme.banner,
        }}
      />
      <div style={{ padding: preview ? "0 1.5rem 1.75rem" : "0 1.75rem 2.5rem", textAlign: align }}>
        <img
          src={creator.avatar_url || "/buy-me-data-mascot.png"}
          alt={displayName}
          style={{
            position: "relative",
            display: "block",
            marginTop: "-2.75rem",
            marginLeft: centered ? "auto" : 0,
            marginRight: centered ? "auto" : 0,
            height: preview ? "4.5rem" : "6rem",
            width: preview ? "4.5rem" : "6rem",
            borderRadius: theme.avatarRadius,
            border: `4px solid ${theme.surface.startsWith("rgba") ? "#ffffff" : theme.surface}`,
            objectFit: "cover",
            background: theme.quote,
          }}
        />
        <p
          style={{
            marginTop: "1.25rem",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: theme.eyebrow,
          }}
        >
          {design.page_eyebrow}
        </p>
        <h1
          style={{
            marginTop: "0.5rem",
            fontFamily: theme.display,
            fontSize: preview ? "1.6rem" : "2.25rem",
            lineHeight: 1.1,
            fontWeight: theme.headlineWeight,
            letterSpacing: theme.headlineTracking,
            textTransform: theme.headlineTransform,
          }}
        >
          {design.page_headline}
        </h1>
        <p
          style={{
            marginTop: "0.85rem",
            maxWidth: "30rem",
            marginLeft: centered ? "auto" : 0,
            marginRight: centered ? "auto" : 0,
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: theme.muted,
          }}
        >
          {design.page_tagline}
        </p>
        {distinctBio && (
          <p
            style={{
              marginTop: "1.25rem",
              background: theme.quote,
              borderRadius: `calc(${theme.radius} / 2)`,
              padding: "1rem 1.25rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: theme.text,
              textAlign: "left",
            }}
          >
            {distinctBio}
          </p>
        )}
        <CallToAction creator={creator} design={design} theme={theme} centered={centered} preview={preview} />
        <p
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: centered ? "center" : "flex-start",
            gap: "0.35rem",
            fontSize: "0.75rem",
            color: theme.muted,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>verified_user</span>
          {design.page_note}
        </p>
      </div>
    </article>
  );
}

function CallToAction({ creator, design, theme, centered, preview }: {
  creator: DonationCreator;
  design: DonationDesign;
  theme: ReturnType<typeof themeById>;
  centered: boolean;
  preview: boolean;
}) {
  const style: React.CSSProperties = {
    marginTop: "1.75rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: centered ? "100%" : undefined,
    minWidth: centered ? undefined : "16rem",
    background: theme.accent,
    color: theme.accentText,
    borderRadius: `calc(${theme.radius} / 2.5)`,
    padding: preview ? "0.75rem 1.25rem" : "1rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 700,
  };
  const content = (
    <>
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>volunteer_activism</span>
      {design.page_cta}
    </>
  );
  // L'aperçu de l'éditeur ne doit pas être cliquable.
  if (preview || !creator.id) return <span style={style}>{content}</span>;
  return <Link href={`/pay?creator_id=${creator.id}`} style={style}>{content}</Link>;
}
