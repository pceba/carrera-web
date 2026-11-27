/**
 * Share-card template (1200x630) for LinkedIn/TikTok/WhatsApp previews, rendered by next/og.
 * Satori cannot read CSS variables or SVG filters, so the dark-theme token values are mirrored
 * here and the symbol's glow is faked with translucent circles.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = "#0b0d10";
const TEXT = "#eceef1";
const BODY = "#c9ced5";
const MUTED = "#9aa2ac";
const BORDER = "#2c333d";

function OgSymbol({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#262C35" />
          <stop offset="1" stopColor="#06080B" />
        </linearGradient>
        <linearGradient id="r" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill="url(#t)" stroke={BORDER} strokeWidth="1" />
      <path
        d="M14 34 V24 H34 V14"
        fill="none"
        stroke="url(#r)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="34" r="3" fill="#8A929C" />
      <circle cx="34" cy="14" r="8" fill="#FFFFFF" fillOpacity="0.12" />
      <circle cx="34" cy="14" r="6" fill="#FFFFFF" fillOpacity="0.2" />
      <circle cx="34" cy="14" r="4" fill="#FFFFFF" />
    </svg>
  );
}

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
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 3,
          color: MUTED,
          textTransform: "uppercase",
        }}
      >
        {kicker ?? ""}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: -2,
          color: BODY,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: -2.5,
          borderTop: `2px solid ${BORDER}`,
          paddingTop: 28,
        }}
      >
        <OgSymbol size={72} />
        {siteName.toLowerCase()}
      </div>
    </div>
  );
}
