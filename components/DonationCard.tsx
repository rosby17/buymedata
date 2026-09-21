import Link from "next/link";
import { safeBannerUrl, themeById, type DonationDesign } from "@/lib/donation-page";

export type DonationCreator = {
  id?: string;
  name: string;
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
};

export type EditableField = keyof DonationDesign | "bio";
export type UploadField = "avatar" | "banner";

/** Branché par l'éditeur du dashboard ; absent sur la page publique. */
export type EditHandlers = {
  active: EditableField | null;
  start: (field: EditableField) => void;
  stop: () => void;
  set: (field: EditableField, value: string) => void;
  upload: (field: UploadField) => void;
};

/**
 * Rendu de la page de dons. Les couleurs venant du thème choisi par le
 * créateur, elles sont appliquées en style inline : Tailwind ne peut pas
 * générer des classes à partir de valeurs dynamiques.
 */
export default function DonationCard({ creator, design, preview = false, edit }: {
  creator: DonationCreator;
  design: DonationDesign;
  preview?: boolean;
  edit?: EditHandlers;
}) {
  const theme = themeById(design.page_theme);
  const banner = safeBannerUrl(design.banner_url);
  const centered = theme.layout === "centered";
  const align = centered ? "center" : "left";
  const displayName = creator.username || creator.name;
  const bio = creator.bio?.trim();
  const distinctBio = bio && bio.toLowerCase() !== displayName.trim().toLowerCase() && bio.toLowerCase() !== creator.name.trim().toLowerCase() ? bio : "";
  // En édition, la présentation reste visible même vide pour rester modifiable.
  const shownBio = edit ? creator.bio || "" : distinctBio;

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
          position: "relative",
          height: theme.bannerHeight,
          background: banner ? `center / cover no-repeat url("${banner}")` : theme.banner,
        }}
      >
        {edit && <ImageButton label="Changer la bannière" icon="add_photo_alternate" onClick={() => edit.upload("banner")} corner />}
      </div>
      <div style={{ padding: preview ? "0 1.5rem 1.75rem" : "0 1.75rem 2.5rem", textAlign: align }}>
        <span style={{ position: "relative", display: "block", width: "fit-content", marginLeft: centered ? "auto" : 0, marginRight: centered ? "auto" : 0 }}>
          <img
            src={creator.avatar_url || "/buy-me-data-mascot.png"}
            alt={displayName}
            style={{
              display: "block",
              marginTop: "-2.75rem",
              height: preview ? "5rem" : "6rem",
              width: preview ? "5rem" : "6rem",
              borderRadius: theme.avatarRadius,
              border: `4px solid ${theme.surface.startsWith("rgba") ? "#ffffff" : theme.surface}`,
              objectFit: "cover",
              background: theme.quote,
            }}
          />
          {edit && <ImageButton label="Changer la photo de profil" icon="photo_camera" onClick={() => edit.upload("avatar")} />}
        </span>

        <Editable
          field="page_eyebrow"
          value={design.page_eyebrow}
          edit={edit}
          theme={theme}
          style={{
            marginTop: "1.25rem",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: theme.eyebrow,
          }}
        />
        <Editable
          as="h1"
          field="page_headline"
          value={design.page_headline}
          edit={edit}
          theme={theme}
          style={{
            marginTop: "0.5rem",
            fontFamily: theme.display,
            fontSize: preview ? "1.75rem" : "2.25rem",
            lineHeight: 1.1,
            fontWeight: theme.headlineWeight,
            letterSpacing: theme.headlineTracking,
            textTransform: theme.headlineTransform,
          }}
        />
        <Editable
          field="page_tagline"
          value={design.page_tagline}
          edit={edit}
          theme={theme}
          multiline
          style={{
            marginTop: "0.85rem",
            maxWidth: "30rem",
            marginLeft: centered ? "auto" : 0,
            marginRight: centered ? "auto" : 0,
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: theme.muted,
          }}
        />
        {(shownBio || edit) && (
          <Editable
            field="bio"
            value={shownBio}
            placeholder="Présentez-vous en quelques mots"
            edit={edit}
            theme={theme}
            multiline
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
          />
        )}

        <div style={{ marginTop: "1.75rem" }}>
          <CallToAction creator={creator} design={design} theme={theme} centered={centered} preview={preview} edit={edit} />
        </div>

        <Editable
          field="page_note"
          value={design.page_note}
          edit={edit}
          theme={theme}
          icon="verified_user"
          style={{ marginTop: "1rem", fontSize: "0.75rem", color: theme.muted }}
        />
      </div>
    </article>
  );
}

/** Texte de la page : modifiable sur place, crayon collé au texte. */
function Editable({ as = "p", field, value, placeholder, edit, theme, style, multiline, icon }: {
  as?: "p" | "h1";
  field: EditableField;
  value: string;
  placeholder?: string;
  edit?: EditHandlers;
  theme: ReturnType<typeof themeById>;
  style: React.CSSProperties;
  multiline?: boolean;
  icon?: string;
}) {
  const Tag = as;
  const glyph = icon ? <span className="material-symbols-outlined" style={{ fontSize: "15px", verticalAlign: "-2px", marginRight: "0.3rem" }}>{icon}</span> : null;

  if (!edit) return <Tag style={style}>{glyph}{value}</Tag>;

  if (edit.active === field) {
    const shared = {
      autoFocus: true,
      value,
      placeholder,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => edit.set(field, event.target.value),
      onBlur: edit.stop,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Escape" || (event.key === "Enter" && !multiline)) { event.preventDefault(); edit.stop(); }
      },
      style: {
        ...style,
        width: "100%",
        display: "block",
        color: style.color || theme.text,
        background: style.background || "transparent",
        border: `2px dashed ${theme.accent}`,
        borderRadius: "0.5rem",
        padding: style.padding || "0.3rem 0.5rem",
        outline: "none",
        resize: "none" as const,
      },
    };
    return multiline ? <textarea {...shared} rows={3} /> : <input {...shared} />;
  }

  return (
    <Tag style={style}>
      {glyph}
      <span
        role="button"
        tabIndex={0}
        onClick={() => edit.start(field)}
        onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); edit.start(field); } }}
        style={{ cursor: "text", borderRadius: "0.35rem", outlineOffset: "3px" }}
      >
        {value || <span style={{ opacity: 0.55 }}>{placeholder}</span>}
      </span>
      <PencilButton onClick={() => edit.start(field)} theme={theme} />
    </Tag>
  );
}

/** Crayon posé juste après le texte qu'il modifie. */
function PencilButton({ onClick, theme }: { onClick: () => void; theme: ReturnType<typeof themeById> }) {
  return (
    <button
      type="button"
      aria-label="Modifier ce texte"
      onClick={onClick}
      style={{
        marginLeft: "0.4rem",
        verticalAlign: "middle",
        display: "inline-grid",
        placeItems: "center",
        height: "1.35rem",
        width: "1.35rem",
        borderRadius: "999px",
        border: `1px solid ${theme.border}`,
        background: theme.quote,
        color: theme.accent,
        cursor: "pointer",
        opacity: 0.8,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>edit</span>
    </button>
  );
}

/** Bouton d'image pour la bannière et la photo de profil. */
function ImageButton({ label, icon, onClick, corner }: { label: string; icon: string; onClick: () => void; corner?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        position: "absolute",
        ...(corner ? { right: "0.75rem", bottom: "0.75rem" } : { right: "-0.35rem", bottom: "-0.35rem" }),
        display: "grid",
        placeItems: "center",
        height: corner ? "2.25rem" : "2rem",
        width: corner ? "2.25rem" : "2rem",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.7)",
        background: "rgba(17, 17, 17, 0.62)",
        color: "#ffffff",
        cursor: "pointer",
        backdropFilter: "blur(6px)",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: corner ? "18px" : "16px" }}>{icon}</span>
    </button>
  );
}

function CallToAction({ creator, design, theme, centered, preview, edit }: {
  creator: DonationCreator;
  design: DonationDesign;
  theme: ReturnType<typeof themeById>;
  centered: boolean;
  preview: boolean;
  edit?: EditHandlers;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: centered ? "100%" : undefined,
    minWidth: centered ? undefined : "16rem",
    background: theme.accent,
    color: theme.accentText,
    borderRadius: `calc(${theme.radius} / 2.5)`,
    padding: preview ? "0.85rem 1.25rem" : "1rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 700,
    border: "none",
  };

  if (edit?.active === "page_cta") {
    return (
      <input
        autoFocus
        value={design.page_cta}
        onChange={event => edit.set("page_cta", event.target.value)}
        onBlur={edit.stop}
        onKeyDown={event => { if (event.key === "Enter" || event.key === "Escape") { event.preventDefault(); edit.stop(); } }}
        style={{ ...style, textAlign: "center", outline: "none", border: `2px dashed ${theme.accentText}` }}
      />
    );
  }

  const content = (
    <>
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>volunteer_activism</span>
      {design.page_cta}
    </>
  );

  if (edit) {
    return (
      <span style={{ position: "relative", display: "inline-flex", width: centered ? "100%" : undefined }}>
        <button type="button" onClick={() => edit.start("page_cta")} style={{ ...style, cursor: "text" }}>{content}</button>
        <ImageButton label="Modifier le texte du bouton" icon="edit" onClick={() => edit.start("page_cta")} />
      </span>
    );
  }

  if (preview || !creator.id) return <span style={style}>{content}</span>;
  return <Link href={`/pay?creator_id=${creator.id}`} style={style}>{content}</Link>;
}
