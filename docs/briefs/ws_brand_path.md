# Brief WS-BRAND: apply the "Path" identity (about 1 hour)

Pablo chose the visual identity on 2026-11-27 (direction B, "precise tool"; symbol 1, single step
that lights up). Everything below is decided: implement it exactly, do not explore alternatives.

## Read first (only these)

`AGENTS.md`; `src/styles/tokens.css`; `src/app/layout.tsx`; `src/components/ui/Wordmark.tsx` and
`wordmark.module.css`; `src/app/icon.svg`; `src/app/(public)/opengraph-image.tsx`; `src/lib/site.ts`;
`src/components/ui/Sources.tsx` and `sources.module.css`. Grep, don't read whole folders.

## You own

`src/styles/`, `src/app/layout.tsx`, `src/app/icon.svg`, `src/app/(public)/opengraph-image.tsx`,
`src/app/(public)/dev/ui/`, `src/components/ui/`, `src/lib/site.ts` (name only), `e2e/` (only
selectors that break), `docs/screenshots/v3/`. Do not edit content, industry components or
`src/components/match/` (keep the `carrera-web.profile.v1` storage key: changing it would wipe
users' saved profiles).

## Decided values

- **Name:** `Path`; wordmark text is lowercase `path`. `SITE.name = "Path"`.
- **Fonts:** `Geist` (400, 500, 600) for everything and `Geist_Mono` (400, 500) for figures,
  meta and labels, both via `next/font/google` (self-hosted at build time, as now). Remove
  Instrument Serif and Schibsted Grotesk. `--font-display` = Geist 600 with `letter-spacing:
-0.02em` on headings (-0.03em at 40px+); add `--font-mono` pointing at Geist Mono.
- **Light (default):** bg `#ECEEF1`, surface `#F6F7F9`, ink `#171C24`, body text `#2C3440`,
  muted `#55606E`, border `#DDE1E6`, accent `#3550B0` (hover `#253C8A`), accent contrast
  `#F6F7F9`. Primary button = ink background (`#171C24`) with light text; accent is for links and
  focus rings.
- **Dark (opt-in):** bg `#0B0D10`, surface `#14181E`, ink `#ECEEF1`, body `#C9CED5`, muted
  `#9AA2AC`, border `#2C333D`, accent `#7D93E8`, accent contrast `#0B0D10`.
- Keep the existing token names; change values. Radii: `--radius-sm 6px`, `--radius-md 8px`,
  `--radius-lg 10px`. Check AA contrast for every text/background pair you touch and write the
  ratios in the handover.
- **Wordmark:** symbol + `path` (Geist 600, `letter-spacing: -0.045em`), symbol height = cap
  height × 1.15, gap 0.4em. Header uses it at about 24px text size.

## Symbol SVGs (use verbatim)

Full symbol (header, footer, OG image, `/dev/ui`):

```svg
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="path-tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#262C35"/><stop offset="1" stop-color="#06080B"/></linearGradient>
    <linearGradient id="path-trail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.3"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
    <filter id="path-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="48" height="48" rx="11" fill="url(#path-tile)"/>
  <path d="M14 34 V24 H34 V14" fill="none" stroke="url(#path-trail)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="14" cy="34" r="3" fill="#8A929C"/>
  <circle cx="34" cy="14" r="4" fill="#FFFFFF" filter="url(#path-glow)"/>
</svg>
```

In React, give gradient and filter ids a `useId()` suffix so two symbols on one page don't clash.
On the dark theme the tile gets a 1px `#2C333D` stroke so it doesn't vanish into the background.

Flat symbol (favicon `src/app/icon.svg`, anything under 32px):

```svg
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="11" fill="#0B0D10"/>
  <path d="M14 34 V24 H34 V14" fill="none" stroke="#C9CED5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="34" cy="14" r="6" fill="#FFFFFF"/>
</svg>
```

## Deliverable

1. Tokens + fonts (layout.tsx). 2. Wordmark + symbol component, header and footer. 3. Favicon
   and OG image (`#0B0D10` ground, full symbol, `path` wordmark, the site description). 4. `/dev/ui`
   shows the symbol (full and flat) and the type scale. 5. **Compact sources on phones:** below
   40rem the sources list in `Sources.tsx` starts collapsed in a `<details>` labelled "Fuentes (N)";
   a click on an in-text citation opens it and scrolls to the entry (keyboard too); desktop stays
   expanded. 6. Screenshots v3 (light, 375 and 1280) of home, consulting hub, one IB section in
   `docs/screenshots/v3/`, and the 375 px heights of every industry section in the handover.

## Rules

UI copy in Spanish; code in English. No new dependencies. Kill any orphan `next start` on
:3000/:3100 before e2e. All checks (`typecheck`, `lint`, `format:check`, `npm test`, `build`) +
e2e pass. Commit per step; no push; handover `docs/handover/ws-brand.md` (done, contrast ratios,
heights, left).
