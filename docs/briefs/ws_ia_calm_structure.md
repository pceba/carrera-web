# Brief WS-IA: calm design and a structure that guides

Read `docs/roadmap.md` (the IA you implement), `AGENTS.md`, `PROGRESS.md`, `docs/ownership.md`,
`src/components/ui/README.md`, and look at `docs/screenshots/after/`. If the skills `design-taste`,
`good-css` or `taste-design-review` are available, load them. Reply to Pablo in Spanish; code in
English; UI copy in Spanish.

## Pablo's feedback on the current site (this is the brief)

- It feels **overloaded**. Less noise: fewer eyebrows, labels, borders, boxes and accents; more
  whitespace; one clear action per screen; shorter home.
- **Light background, silver-grey** (a soft cool grey, not cream, not white), dark ink, one
  restrained accent. Light is the default for everyone; keep a dark theme only as an opt-in toggle.
- **Better structure and connections**, easy to navigate.
- **Resources more extensive and better distributed**: no 13,000 px pages; split into sections.
- **No "¿En qué curso estás?"** or any segmentation by year of degree. Remove it everywhere.
- Only the six focus industries (see `docs/roadmap.md`); the other ones leave the map and home.

## You own

`src/styles/`, `src/app/layout.tsx`, `src/app/(public)/` (except `legal/` content and `ofertas/`
data logic), `src/components/ui/`, `src/components/industries/consulting/`, `src/components/nav/`
(new), `content/industrias/` (structure and moving files; **do not change facts or sources**),
`content/catalog.ts` (new: industries, sections, segments as data), `e2e/`. Do not touch
`crates/`, `config/`, `src/lib/`, `src/app/(account)/`, `supabase/`, `docs/research/`, workflows:
other sessions work there in parallel.

## Scope

1. **Visual system v2:** new tokens (silver-grey surfaces, ink, one accent, quieter borders),
   calmer typography scale, fewer decorative elements. Update every primitive and `/dev/ui`.
2. **IA:** implement the routes in `docs/roadmap.md`: industry hub `/industrias/[slug]`, sections
   `/industrias/[slug]/[seccion]`, segment pages, `/preparacion` and `/recursos` (frames with a
   data model and a few real entries taken from existing consulting content; wave 2 fills them).
   Industries, sections, segments and resources come from one data catalog, so wave 2 sessions add
   content without touching navigation code.
3. **Navigation:** header with four items (Industrias, Preparación, Recursos, Ofertas) + Entrar;
   breadcrumbs; section nav inside an industry (sticky on desktop, compact on mobile);
   previous/next; "related" links across industries; a clean footer. Mobile menu.
4. **Consulting migrated** into the hub + sections + `estrategia` segment page, same facts and
   citations, nothing lost. The interactive case lives in `proceso` (or its own section).
5. **Placeholders for the other five industries:** a hub page each, marked "en preparación", with
   only what is certain (one-line description), so navigation is complete.
6. **Home, shorter:** hero, the six industries, how the site works (three steps), trust line.
7. **Lighthouse:** install it if needed (`npx lighthouse` was blocked before; try a dev dependency
   or Chrome's built-in tools) and reach 95+ performance and accessibility on home, an industry hub
   and a section page, light and dark. Report real numbers.

## Done when

All checks pass (format, lint, typecheck, unit, build, e2e); screenshots at 375 and 1280 px of
home, map, consulting hub, a section, `/recursos` and `/preparacion` in `docs/screenshots/v2/`;
no page over ~4,000 px tall at 375 px; Lighthouse numbers reported. Commit in small steps on your
branch; no push, no merge.
