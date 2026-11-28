# P12 handover: guide reading experience

Branch `p12/guide` (from main at "Add briefs P10-P16 (wave 3)", not pushed). 2026-11-28.

## What changed

- **Hero band** per page (`GuideHero`): eyebrow ("Big Law · Sección 2 de 7"), h1, lead, mono chips (reading time,
  review date) and the industry's cover art from `components/marketing/CoverArt` (decorative, `aria-hidden`).
  Industry hubs (live and "en preparación") use the same band.
- **"En esta página"** (`GuideToc`): the `##` headings of the page, scroll-spy (`aria-current="location"`).
  ≥78rem a sticky right column; below that a collapsible `details` row above the article (works without JS).
- **Reading progress bar** (`ReadingProgress`): 3 px bar at the top, writes `--read` directly (no re-renders).
- **Reading time**: words of the MDX source / 220 wpm. **Prev/next cards** (`PagerCards`) show the neighbour's summary.
- **Copiar enlace** (`CopyLink`): clipboard + toast. "Guardar en candidaturas" skipped (not trivial).

## How heading ids work (no MDX change)

Plain Markdown headings have no ids. `extractHeadings` (regex over the `.mdx` source, outside code fences) builds the
TOC; the page shell overrides the MDX `h2` component and gives each rendered `<h2>` an id from the same `makeSlugger`
(accent-stripped, `-2` for repeats) in document order. `e2e/guide.spec.ts` checks every TOC link has a target on all
22 guide pages, so a heading that breaks the rule (e.g. an unusual inline element) fails CI instead of silently.
`##` headings written as JSX would not be in the TOC; none exist today.

## Files

New: `src/components/guide/*` (+ `headings.test.ts`), `e2e/guide.spec.ts`. Edited (owned shells only):
`src/app/(public)/industrias/[slug]/page.tsx` and `[slug]/[seccion]/page.tsx`. Not touched: MDX, sources,
`industrias.module.css` (its `.guide`/`.articleHead` classes are now unused by these pages), `nav/` (old `PrevNext` stays).

## Gotchas / not done

- Tests ran against my own build on :3400 (another session held :3000/:3100); dev-only specs were skipped.
- No visual regression pass on every guide page: layouts checked at 1400 and 375 on Big Law "Empresas" and a hub.
