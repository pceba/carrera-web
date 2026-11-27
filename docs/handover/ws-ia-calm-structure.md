# Handover: WS-IA calm structure (build green slice)

Last updated: 2026-11-27, after slice 3 (Claude Sonnet 5.5). Branch `claude/nifty-solomon-fc84d8`, cut from `claude/ws-ia-calm-structure-305a1a` (1c4a800).

## State

`npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` all pass (41 unit tests, 30 static pages). No push, no merge.

## Done

- Home rewritten: hero, six industries from `content/catalog.ts`, three steps, one trust line. No year-of-degree entry.
- `/industrias` map rewritten from the catalog (one line each, "comparte preparación con…" derived from `PREP_GUIDES`).
- `industrias.module.css` rewritten calm: hubHead, hubActions, hubMeta, block, blockTitle, toc*, guide, article, articleHead, articleFoot, kind.
- `GuideNav` and its CSS deleted. `/dev/ui` and the og-template needed no change.
- Unit tests for catalog helpers in `src/components/nav/catalog.test.ts`.
- Prettier applied to the previous WIP files (catalog, hub pages, ResourceList, tokens).

## Slice 2 (done)

- `/preparacion` (index of `PREP_GUIDES` with industries) and `/preparacion/[guia]` (frame: where it is used, industry pages that cover it, resources of that prep, "En preparación" while `hasContent` is false). Real guide content goes in `content/preparacion/<slug>.mdx` (not rendered yet: add it when the first guide is written).
- `/recursos`: filters `?industria=` and `?tipo=` are plain links (no JS), unknown values ignored, empty state from `ResourceList`. Phones get one scrolling chip row per filter.
- Breadcrumbs drop "Inicio" below 40rem so the trail never wraps with a stray "/".
- Browser check at 375 and 1280 px: no horizontal scroll on home, map, hub, `/industrias/consultoria/proceso`, `/preparacion`, `/recursos`. Heights at 375 px: home 3023, map 2205, hub 2689, preparacion 1941, recursos 3468 (all filters off), proceso 4783 (over the 4,000 px target: long MDX content, split it in slice 3).
- `docs/ownership.md`: added rows for `src/components/nav/`, `content/catalog.ts`, preparacion and recursos. The old `industrias/consultoria/` row is stale (route removed).

## Slice 3 (done)

- e2e rewritten (`e2e/home.spec.ts`, `consulting.spec.ts`, new `library.spec.ts`): year-of-degree test deleted; home links the six industries; header reaches Industrias, Preparación, Recursos, Ofertas (desktop and phone menu); hub -> section -> next/previous; segment `estrategia`; firm filter, case and calendar on their new URLs; `/recursos` filters; dark theme persists. `npx playwright test`: 57 passed, 1 skipped (phone-only test on desktop).
- Lighthouse 13.6.0 via `npx --yes lighthouse` (not added to package.json), headless Chrome, production build, 4 pages x light/dark x mobile/desktop. Dark is opt-in through localStorage, so the profile was seeded first. Final run: accessibility 100, best practices 100, SEO 100 everywhere; performance 100 on desktop everywhere; mobile 99-100 in light, dark 82-98 (TBT 170-710 ms).
  Mobile performance is noisy on this machine: three repeat runs of the same page gave 95, 93 and 99, and the worst page changed between runs. No page has a real bottleneck (LCP 0.9-1.1 s, CLS 0), so I did not chase it. Re-measure in CI before quoting a single number.
- Fixed from Lighthouse: `/favicon.ico` 404 (added `src/app/icon.svg`), heading order on `/recursos` (`ResourceList` takes `headingLevel`) and on `el-trabajo` (added the h2 "Una semana de ejemplo" before the week plan).
- Screenshots in `docs/screenshots/v2/` (6 pages x 375/1280, light). Heights at 375 px: home 3024, map 2205, hub 2691, el-trabajo 2908, preparacion 1935, recursos 3246.
- Merged `origin/main` (WS-R2a) into the branch: only conflict was this file (kept this version). All web checks pass after the merge.

## Left

- Sections over ~4,000 px at 375 px (long MDX, not split yet): como-funciona 4354, empresas 4779, proceso 4791, recursos 4304, estrategia 4169. Split them (e.g. firms table into its own page or collapse per firm) in a content slice.
- Content for `content/preparacion/<slug>.mdx` (not rendered yet) and the five industries in preparation.
- Dark screenshots (`THEMES=light,dark`) if wanted.
- Stale ownership row for `industrias/consultoria/` in `docs/ownership.md`.

## Gotchas

- Stale `.next/` made `tsc` fail with missing `industrias/consultoria/page.js`; `rm -rf .next` fixes it.
- `.tocLink` uses `:has(.tocN)` to switch between numbered rows (hub) and plain rows (map).
- Home heading "Seis industrias" is hard-coded; change it if the catalog size changes.
