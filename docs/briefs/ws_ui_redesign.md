# Brief WS-UI: make the interface genuinely good

Read `AGENTS.md`, `PROGRESS.md`, `docs/ownership.md`, `docs/architecture.md` and
`src/components/ui/README.md` first. Reply to Pablo in Spanish; code in English; UI copy in Spanish.
If the skills `design-taste`, `good-css` or `taste-design-review` are available, load them first and
follow them.

## Who it is for

Spanish university students (18-23, some 16-17) who do not know where to start. They arrive from
LinkedIn or TikTok on a phone. In ten seconds they must understand what this is, trust it, and find
their industry. The tone is a smart older friend who works in the sector: clear, warm, no hype.

## You own

`src/styles/tokens.css`, `src/app/layout.tsx`, `src/app/(public)/` (layout, home, industry map,
ofertas page presentation, dev/ui, opengraph image), `src/components/ui/`,
`src/components/industries/consulting/` (presentation only), `src/app/(account)/` (styling only,
keep the logic and server actions intact), `e2e/`. Do **not** change facts or sources in
`content/` (layout around them is fine), and do not touch `crates/`, `pipeline/`, `src/lib/`,
`supabase/` or workflows: WS-R is working there in parallel.

## Findings from the orchestrator's review (fix these, then go further)

1. The consulting page reads like a long document: an unstyled bullet TOC with default blue links,
   one narrow column, nothing bespoke. Make it feel built for consulting: a sticky section rail with
   reading progress on desktop and a compact pillar switcher on mobile, a visual career ladder, the
   recruiting calendar as a real timeline by month, the firms table as filterable cards on mobile,
   and the interactive case as the visual climax.
2. The home is thin. Add what the visitor needs: "where are you?" entry by year of degree
   (1st-2nd, 3rd, 4th/graduate), a preview of what an industry guide contains, the industry map
   teaser, a jobs teaser, and the trust signals (sources, reviewed date, open source, no tracking).
3. The light "Todo el contenido es público" panel clashes in dark mode; audit both themes for every
   component and give the user a theme toggle (system default).
4. The header has no link to Ofertas; the footer links are plain underlined text. Design proper
   navigation, including a mobile menu.
5. Account pages (`/entrar`, `/cuenta/*`) are unstyled; bring them into the system.
6. There is no brand mark. Create a simple, distinctive wordmark that works with the codename and
   can be swapped when the name is chosen (one component).

## Quality bar

- Distinctive and editorial, never a generic template or default component-library look.
- Mobile first at 375 px, no horizontal scroll, tap targets of 44 px or more.
- WCAG AA in both themes, visible focus, `prefers-reduced-motion` respected.
- Lighthouse 95+ for performance and accessibility on home and consulting (measure it).
- Motion is subtle and purposeful. No new dependencies unless you ask Pablo first.
- Verify by looking: run the built site, take screenshots at 375 px and 1280 px in both themes,
  and iterate. Update e2e tests for the new navigation.

## Done when

All checks pass (format, lint, typecheck, unit, build, e2e); before and after screenshots of home,
consulting, ofertas and an account page are saved in `docs/screenshots/` (fictional data only);
the Lighthouse scores are reported. Commit in small steps on your branch; no push, no merge.
