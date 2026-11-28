import type { IndustrySlug } from "../../../content/catalog";
import styles from "./cover-art.module.css";

/**
 * Abstract cover art, one composition per industry, generated in code (no images, no stock).
 * Palette: ink, cobalt and greys through CSS tokens, so it follows light and dark mode.
 * Purely decorative: `aria-hidden`.
 */

/** Small deterministic generator, so the scatter plot is the same on server and client. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const Grid = () => (
  <g className={styles.rule} strokeWidth="1">
    {[40, 80, 120, 160].map((y) => (
      <path key={`h${y}`} d={`M0 ${y}H320`} />
    ))}
    {[64, 128, 192, 256].map((x) => (
      <path key={`v${x}`} d={`M${x} 0V200`} />
    ))}
  </g>
);

/** Consultoría: a 2x2 framework with bubbles, the classic consulting matrix. */
function Matrix() {
  return (
    <>
      <rect x="64" y="28" width="192" height="144" rx="6" className={styles.soft} />
      <path d="M160 28V172M64 100H256" className={styles.axis} strokeWidth="1.5" />
      <rect x="160" y="28" width="96" height="72" rx="6" className={styles.accentSoft} />
      <circle cx="205" cy="64" r="22" className={styles.accent} />
      <circle cx="116" cy="68" r="12" className={styles.ink} />
      <circle cx="112" cy="138" r="8" className={styles.mid} />
      <circle cx="214" cy="140" r="14" className={styles.inkSoft} />
      <circle cx="244" cy="112" r="4" className={styles.ink} />
    </>
  );
}

/** Banca de inversión: stepped bars that climb, with a deal line over them. */
function Bars() {
  const heights = [34, 52, 44, 76, 96, 120, 148];
  return (
    <>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={40 + i * 36}
          y={176 - h}
          width="24"
          height={h}
          rx="3"
          className={i === heights.length - 1 ? styles.accent : i > 3 ? styles.ink : styles.mid}
        />
      ))}
      <path
        d="M52 132L88 112L124 122L160 88L196 66L232 44L268 24"
        className={styles.line}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="268" cy="24" r="5" className={styles.accent} />
      <path d="M28 176H300" className={styles.axis} strokeWidth="1.5" />
    </>
  );
}

/** Big Law: pillars under a pediment, abstracted to rectangles. */
function Pillars() {
  return (
    <>
      <path d="M52 76L160 30L268 76Z" className={styles.ink} />
      <rect x="52" y="84" width="216" height="10" rx="2" className={styles.mid} />
      {[76, 118, 160, 202, 244].map((x, i) => (
        <rect
          key={x}
          x={x - 9}
          y="102"
          width="18"
          height="58"
          rx="3"
          className={i === 2 ? styles.accent : styles.inkSoft}
        />
      ))}
      <rect x="44" y="164" width="232" height="12" rx="2" className={styles.ink} />
    </>
  );
}

/** Private equity: stacked layers, a position built up in slabs. */
function Layers() {
  const slab = (cy: number, cls: string | undefined) => (
    <g key={cy}>
      <path d={`M160 ${cy - 30}L246 ${cy}L160 ${cy + 30}L74 ${cy}Z`} className={cls} />
      <path
        d={`M74 ${cy}L160 ${cy + 30}L246 ${cy}V${cy + 12}L160 ${cy + 42}L74 ${cy + 12}Z`}
        className={styles.edge}
      />
    </g>
  );
  return (
    <>
      {slab(132, styles.mid)}
      {slab(100, styles.inkSoft)}
      {slab(68, styles.accent)}
      <path d="M160 38V12" className={styles.axis} strokeWidth="1.5" strokeDasharray="3 4" />
    </>
  );
}

/** Data science: a noisy scatter with its regression line. */
function Scatter() {
  const rnd = lcg(7);
  const pts = Array.from({ length: 34 }, (_, i) => {
    const x = 36 + (i / 33) * 248;
    const y = 160 - (i / 33) * 112 + (rnd() - 0.5) * 56;
    return { x, y: Math.min(172, Math.max(24, y)), r: 2.5 + rnd() * 3 };
  });
  return (
    <>
      <path d="M32 176H296M32 176V20" className={styles.axis} strokeWidth="1.5" />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(1)}
          cy={p.y.toFixed(1)}
          r={p.r.toFixed(1)}
          className={i % 7 === 0 ? styles.accent : styles.inkSoft}
        />
      ))}
      <path
        d="M36 160L284 48"
        className={styles.accentLine}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  );
}

/** Roles de IA: a small network, one path lit. */
function Network() {
  const layers = [
    [
      { x: 52, y: 60 },
      { x: 52, y: 100 },
      { x: 52, y: 140 },
    ],
    [
      { x: 132, y: 40 },
      { x: 132, y: 80 },
      { x: 132, y: 120 },
      { x: 132, y: 160 },
    ],
    [
      { x: 212, y: 56 },
      { x: 212, y: 100 },
      { x: 212, y: 144 },
    ],
    [{ x: 280, y: 100 }],
  ];
  const lit = new Set(["0-1>1-1", "1-1>2-1", "2-1>3-0"]);
  const edges: { d: string; on: boolean }[] = [];
  layers.forEach((layer, li) => {
    const next = layers[li + 1];
    if (!next) return;
    layer.forEach((a, ai) =>
      next.forEach((b, bi) => {
        edges.push({
          d: `M${a.x} ${a.y}L${b.x} ${b.y}`,
          on: lit.has(`${li}-${ai}>${li + 1}-${bi}`),
        });
      }),
    );
  });
  return (
    <>
      {edges
        .filter((e) => !e.on)
        .map((e, i) => (
          <path key={i} d={e.d} className={styles.edgeLine} strokeWidth="1" />
        ))}
      {edges
        .filter((e) => e.on)
        .map((e, i) => (
          <path
            key={`on${i}`}
            d={e.d}
            className={styles.accentLine}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      {layers.flat().map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="7" className={styles.node} strokeWidth="2" />
      ))}
      <circle cx="132" cy="80" r="7" className={styles.accent} />
      <circle cx="212" cy="100" r="7" className={styles.accent} />
      <circle cx="280" cy="100" r="9" className={styles.accent} />
    </>
  );
}

const ART: Record<IndustrySlug, () => React.JSX.Element> = {
  consultoria: Matrix,
  "banca-de-inversion": Bars,
  "big-law": Pillars,
  "private-equity": Layers,
  "data-science": Scatter,
  "inteligencia-artificial": Network,
};

export function CoverArt({ slug, className }: { slug: IndustrySlug; className?: string }) {
  const Art = ART[slug];
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={`${styles.art} ${className ?? ""}`}
    >
      <Grid />
      <Art />
    </svg>
  );
}
