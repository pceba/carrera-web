/**
 * Share-card template (1200x630) for LinkedIn/TikTok/WhatsApp previews, rendered by next/og.
 * Satori cannot read CSS variables, so the light-theme token values are mirrored here.
 * Hex equivalents of the light-theme oklch tokens in src/styles/tokens.css.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = "#f9f6f0";
const TEXT = "#1a1511";
const ACCENT = "#b94300";
const MUTED = "#5b544e";

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
        {kicker ?? ""}
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
          alignItems: "center",
          gap: 20,
          fontSize: 40,
          borderTop: `2px solid ${TEXT}`,
          paddingTop: 28,
        }}
      >
        {/* The wordmark's three rising steps. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 40 }}>
          <div style={{ width: 12, height: 14, background: TEXT, borderRadius: 2 }} />
          <div style={{ width: 12, height: 25, background: TEXT, borderRadius: 2 }} />
          <div style={{ width: 12, height: 38, background: ACCENT, borderRadius: 2 }} />
        </div>
        {siteName}
      </div>
    </div>
  );
}
