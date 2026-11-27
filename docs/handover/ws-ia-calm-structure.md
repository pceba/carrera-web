# Handover: WS-IA calm structure (build green slice)

Last updated: 2026-11-27, after slice 2 (Claude Sonnet 5.5). Branch `claude/nifty-solomon-fc84d8`, cut from `claude/ws-ia-calm-structure-305a1a` (1c4a800).

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

## Left (later slices)

- e2e rewrite. Specs written for the old site that will fail: `e2e/home.spec.ts` ("industry map links only the live industry", "main navigation reaches industries, consulting and offers", "home offers an entry by year of degree" must be deleted), `e2e/consulting.spec.ts` (old single-page anchors: sections, firm filter, case, section navigation, calendar all live on other URLs now). Not run in this slice.
- Lighthouse numbers, screenshots in `docs/screenshots/v2/`, 375 px height check.
- Visual check in a browser of home, map, hub and a section (only build and types verified).
- `docs/ownership.md` / folder READMEs for `src/components/nav/` if not yet listed.

## Gotchas

- Stale `.next/` made `tsc` fail with missing `industrias/consultoria/page.js`; `rm -rf .next` fixes it.
- `.tocLink` uses `:has(.tocN)` to switch between numbered rows (hub) and plain rows (map).
- Home heading "Seis industrias" is hard-coded; change it if the catalog size changes.
