# WS-BRAND handover: "Path" identity applied

Branch `claude/sad-bartik-c644e1`. Not pushed, not merged.

## Done

- Tokens v3 (`src/styles/tokens.css`): brief values, hex via `light-dark()`. New tokens:
  `--color-text-body` (body copy), `--color-accent-hover`, `--weight-display`, `--tracking-display(-lg)`.
  `--font-display`/`--font-serif` now alias Geist; `--font-mono` = Geist Mono. Radii 6/8/10 px.
- Fonts: Geist 400/500/600 + Geist Mono 400/500 via `next/font/google`; Instrument Serif and
  Schibsted Grotesk removed.
- `PathSymbol` (full/flat, `useId` ids) + `Wordmark` (`path`, Geist 600, -0.045em); header and
  footer use it. Dark tile gets a 1px `#2C333D` stroke. `SITE.name = "Path"`.
- `src/app/icon.svg` flat symbol; OG card dark (`#0B0D10`), symbol (glow faked with translucent
  circles: Satori has no SVG filters), `path`, site description.
- `/dev/ui`: full + flat symbol (also at 64 and 16 px), Geist Mono sample, type scale.
- Sources: `SourcesDisclosure` (`<details>`, "Fuentes (N)"). Collapsed <40rem; expanded on desktop
  (JS `open` + `::details-content` so no flash). In-text `#fuente-N` clicks open and scroll;
  `hashchange`/load hash too. Kept `<section aria-label="Fuentes">`. e2e consulting "proceso"
  opens the summary on mobile.
- Checks: typecheck, lint, format:check, test, build, e2e (71 passed) all green.
- Screenshots: `docs/screenshots/v3/` (home, consultoria hub, IB como-funciona; 375 and 1280, light).

## AA contrast (WCAG 2.x)

| Pair                         | Light             | Dark              |
| ---------------------------- | ----------------- | ----------------- |
| ink / bg                     | 14.71             | 16.74             |
| body / bg (surface)          | 10.80 (11.71)     | 12.30 (11.26)     |
| muted / bg (surface, sunken) | 5.50 (5.96, 5.11) | 7.54 (6.90, 7.76) |
| accent / bg (surface)        | 6.18 (6.70)       | 6.68 (6.12)       |
| accent hover / bg            | 8.64              | 9.51              |
| accent-contrast on accent    | 6.70              | 6.68              |
| primary button (bg on ink)   | 14.71             | 16.74             |

All >= 4.5. Dark `--color-accent-hover` (`#A3B3F0`) and `--color-sunken`/`--color-rule` are my picks
(brief only fixed the main values).

## 375 px full-page heights (px; target < 4000)

- banca-de-inversion: hub 2585, como-funciona 3888, el-trabajo **4122**, empresas 3706,
  personas 3087, **proceso 4932**, recursos 2557, sueldos 2999
- big-law: hub 2059, como-funciona **4464**, el-trabajo **4178**, empresas **4150**
- consultoria: hub 2689, caso-practico 2248, como-funciona 3583, el-trabajo 2907, empresas 2918,
  estrategia 3453, personas 3551, proceso 3503, recursos 2621
- No horizontal scroll at 375 px. Only 3 of the 6 industries exist on this branch.
- Measured with sources collapsed. Still over 4000: IB proceso/el-trabajo, big-law x3 (content
  length, not sources).

## Left / notes

- Many module CSS files outside my ownership hardcode `font: 400 ... var(--font-display)`
  (home, industrias, preparacion, consulting/IB visuals, case). They now render Geist 400, not 600. Switch to `var(--weight-display)` in those owners' PRs for the intended look.
- Dark theme not screenshotted (brief asked light only); inverse-panel tokens updated but unseen.
- `docs/screenshots/README.md` not updated.
