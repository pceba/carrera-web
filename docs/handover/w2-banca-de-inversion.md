# Handover: wave 2, investment banking, slice A

Written 2026-11-27 (Claude Sonnet 5.5). Branch `claude/confident-kare-97f997`; not pushed.

## Done

- Catalog: `banca-de-inversion` is `live`, sections `como-funciona` and `el-trabajo`, `startHere: como-funciona`.
- `content/industrias/banca-de-inversion/`: `como-funciona.mdx`, `el-trabajo.mdx`, `meta.ts` (9 sources, `reviewer: "pendiente"`).
- `src/components/industries/banca-de-inversion/GuideVisuals.tsx`: `DealFlow` (4 stages) and `PayRanges` (table).
- `e2e/banca-de-inversion.spec.ts`: hub -> como-funciona -> el-trabajo.

## Left for slice B

`empresas`, `proceso`, `recursos`, `personas` pages (add to the catalog block; `meta.ts` sources are numbered, append only).
Dossier sections 8-12 hold the calendar, selection process and prep plan, but most stage/test claims are marked U.

## Gotchas

- Rothschild's page returns 403 to scripts (Cloudflare); it opens in the browser pane. Alantra/Santander/EY/Forbes/Fortune/Michael Page PDF were opened.
- The Michael Page PDF text extraction scrambles the table; numbers were matched against the dossier row by row. Check against the PDF page 5 visually before the human review.
- The league table (Forbes) is PwC's own claim quoting rankings: the page says so.
- No GFM in MDX: tables are components, not markdown.
- Page height at 375 px: como-funciona ~6.2k, el-trabajo ~5.9k including header, sources and footer (~2k of chrome). Consulting pages are 4.3-4.8k. Body is near 4k; trim further if the limit is strict.

## Unverified / not published

London pay and right-to-work for Spanish students; years per level; exits; Spanish hours; JPM/Citi/BofA/MS Madrid listings (only Goldman's page was opened, and only its title); Houlihan Lokey size; Big Four intake and careers pages (only the generic IE page on entry routes); BBVA/CaixaBank CIB programmes (dossier R, not opened); Santander 2026-27 call dates (only the 2025 release was read).
