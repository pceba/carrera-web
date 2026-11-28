# Brief P3: modern product UI and motion (about 1.5 hours)

Pablo (2026-11-28): the site must feel like a real, modern product. References he likes:
happyrobot.ai and notion.com. Read `AGENTS.md`, `docs/naming.md`, `src/styles/tokens.css`,
`src/components/ui/README.md`, the home page and `/industrias`. Branch `p3/redesign`, no push.

## What to take from the references (observed)

- Huge display headline (Geist, tight tracking), one-line subhead, **pill buttons**: primary ink
  filled + secondary light.
- A **product window** under the hero (rounded frame, fake title bar) showing the real tools.
- Mono eyebrow labels in caps (`GLOBAL SCALE`) above big numbers; thin 1 px grid borders.
- **Logo wall**: bordered grid of firm marks, greyscale, hover to ink.
- Thin announcement bar in mono at the very top; sticky header with dropdown menus.
- Generous whitespace, few colours, motion that is quick and quiet.

## Owned

`src/app/(public)/page.tsx`, `src/app/(public)/home.module.css`, `src/app/(public)/industrias/page.tsx`
and its css, `src/components/ui/`, `src/components/nav/`, new `src/components/marketing/`,
`src/styles/`, `e2e/home*.spec.ts`, `docs/handover/p3-redesign.md`, `docs/screenshots/v4/`.
`src/app/layout.tsx` only if a provider is truly needed. Do NOT edit `content/` or the industry
guide pages, nor `src/app/(public)/candidaturas/` (another session builds it).

## Decisions (do not reopen)

- **No new dependencies.** Motion in CSS: transitions, `@starting-style`, scroll reveals via a
  tiny IntersectionObserver hook (or `animation-timeline: view()` with a static fallback).
  Everything is off under `prefers-reduced-motion: reduce`. Durations 150-400 ms, `--ease-out`.
- **Identity stays**: Geist / Geist Mono, silver-grey `#ECEEF1`, ink `#171C24`, cobalt `#3550B0`,
  wordmark + single-step symbol. You may add tokens (display sizes, radii incl. pill, shadows,
  motion) to `tokens.css`; light and dark both AA.
- **Logos**: no logo files (trademarks, no download source). Build a *typographic* logo wall: firm
  names set as wordmarks (Geist, varied weight/tracking per firm, greyscale), only firms already
  named in `content/industrias/*/empresas*`. Caption: "Empresas que analiza la guía" and small
  print "Path no está afiliado a ninguna de ellas."
- **Images**: no stock photos, no AI people. Use (a) product mockups built in HTML/CSS inside
  the window frame, (b) abstract SVG cover art per industry (geometric, cobalt/ink/grey,
  generated in code). Decorative images `aria-hidden`.
- **Pop-ups**: a `Dialog` primitive on native `<dialog>` (focus, Esc, backdrop), a **command
  palette** (Ctrl/⌘K + header search button) over the catalog (industries, guide pages, tools),
  a `Toast` primitive, and header **dropdown menus** (Industrias, Herramientas, Recursos) that
  work by keyboard and collapse into a full-screen menu at 375 px.
- **Home**, top to bottom: mono announcement bar ("NUEVO · Tracker de candidaturas →
  /candidaturas") → hero (headline about starting a career in the six industries, two pill CTAs:
  "Explorar industrias", "Probar Encaje") → product window with tabs that auto-cycle (pause on
  hover/focus) between Encaje, Candidaturas and Ofertas mockups → logo wall → six industry cards
  with cover art and one mono fact each (only facts already cited in `content/`; else no number)
  → bento grid of tools (Encaje, Candidaturas, Ofertas, Alertas "pronto", Práctica BYOK "pronto")
  → trust row (gratis, código abierto, tu CV no sale del navegador, sin anuncios ni tracking)
  → final CTA band → richer footer (columns).
- **`/industrias`**: cards with cover art and hover lift, filter chips, same visual language.
- Copy in Spanish (tú, direct, no hype); keep the six industries; no pay per firm.

## Deliverable (commit after each)

1. Tokens + primitives (pill Button variants, Dialog, Toast, Reveal hook, window frame). Commit.
2. Header (dropdowns, sticky, mobile menu) + command palette + footer. Commit.
3. Home rebuilt as above. Commit.
4. `/industrias` restyle. Commit.
5. e2e: home renders, palette opens with Ctrl+K and navigates, mobile menu by keyboard, reduced
   motion shows content. Screenshots 1280 and 375, light and dark, in `docs/screenshots/v4/`.

All checks pass (`typecheck`, `lint`, `format:check`, `test`, `build`, Playwright; kill orphan
`next start` on :3000/:3100 first). Handover `docs/handover/p3-redesign.md` (≤30 lines).
