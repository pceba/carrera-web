/**
 * Share-card template (1200x630) for LinkedIn/TikTok/WhatsApp previews, rendered by next/og.
 * Satori cannot read CSS variables, so the light-theme token values are mirrored here.
 * Keep in sync with src/styles/tokens.css (--color-bg, --color-text, --color-accent).
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = "#fbfaf7";
const TEXT = "#17181c";
const ACCENT = "#1d4ed8";
const MUTED = "#565a66";

export function OgCard({
  title,
  kicker,
  siteName,
}: {
  title: string;
  kicker?: string;
  siteName: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        color: TEXT,
        padding: 72,
        borderTop: `16px solid ${ACCENT}`,
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          letterSpacing: 4,
          color: MUTED,
          textTransform: "uppercase",
        }}
      >
        {kicker ? `§ ${kicker}` : ""}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 36,
          fontWeight: 700,
          borderTop: `3px solid ${TEXT}`,
          paddingTop: 24,
        }}
      >
        {siteName}
      </div>
    </div>
  );
}
