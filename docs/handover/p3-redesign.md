# P3 handover: modern product UI and motion

Branch `claude/p3-redesign-66ac3e` (not pushed). Brief: `docs/briefs/p3_redesign.md`. 2026-11-28.

## What changed

- **Tokens** (`src/styles/tokens.css`): `--text-hero/band/eyebrow`, `--radius-xl/2xl/pill`, `--shadow-window/lift`,
  `--color-glass/scrim`, `--dur-slow`. Reveal CSS and the dialog scroll lock are in `globals.css`.
- **Primitives** (`src/components/ui/`): pill `Button`/`ButtonLink` (+`size="lg"`), `Dialog` (native `<dialog>`),
  `Toast` (`toast()` + `<Toaster/>` in the Shell, no provider), `Reveal`/`useReveal`, `WindowFrame`, `Eyebrow`,
  `ToolIcon`, `Announcement` (site-wide mono bar linking `/candidaturas`).
- **Header**: sticky glass bar, dropdowns Industrias / Herramientas / Recursos (disclosure pattern: hover, click,
  ArrowDown/Up, Esc), search pill, full-screen popover menu on phones. Footer in 5 columns from the catalog.
- **Command palette** (`src/components/nav/`): Ctrl/⌘K or the search button; searches tools, industries, guide pages,
  prep guides, account; "Copiar enlace" action shows a toast. Pure search in `palette-data.ts` (unit-tested).
- **Home** (`src/components/marketing/`): hero, product window (tabs cycle by CSS animation, pause on hover and
  keyboard focus, no cycle under reduced motion), stats strip, typographic logo wall (20 firms from `content/`),
  six cards with generated cover art, bento of tools, trust row, CTA band.
- **`/industrias`**: same cards + filter chips (`hub.module.css`; shared `industrias.module.css` untouched).
- **e2e**: `e2e/home-product.spec.ts` (new), header test in `home.spec.ts` rewritten for the menus.
- Screenshots: `docs/screenshots/v4/` (1280 and 375, light and dark, plus menu and palette).

## Gotchas

- Mockups in the window use invented data and no firm names; the window says "Datos de ejemplo".
- Card facts are counts from the catalog ("8 páginas con fuentes"), never outside numbers.
- The announcement bar and the "Candidaturas" links point to `/candidaturas`, built by the P1 session: until P1
  merges they 404. Merge order: P1 first, or accept the dead link briefly.
- Palette content is mounted only while open (plus 320 ms for the exit); otherwise hidden hints break `getByText`.
- Playwright: `networkidle` never settles on the home (prefetch); don't use it.
- `NAV_LINKS` is kept (unit test) but the header now reads its menus from `Header.tsx`.

## Not done

- No visual regression of `/dev/ui` or the guide pages beyond the pill-button change (all buttons are pills now).
- Dropdown panels do not flip near the viewport edge (fine at the current widths).
