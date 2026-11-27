# Handover: wave 2, investment banking, slice A

Written 2026-11-27 (Claude Sonnet 5.5). Branch `claude/confident-kare-97f997`; not pushed.

## Done

- Catalog: `banca-de-inversion` is `live`, sections `como-funciona`, `empresas` and `el-trabajo`, `startHere: como-funciona`.
- `content/industrias/banca-de-inversion/`: `como-funciona.mdx`, `empresas.mdx` (who hires in Spain, moved out of como-funciona), `el-trabajo.mdx`, `meta.ts` (9 sources, `reviewer: "pendiente"`).
- `src/components/industries/banca-de-inversion/GuideVisuals.tsx`: `DealFlow` (4 stages) and `PayRanges` (table).
- `e2e/banca-de-inversion.spec.ts`: hub -> como-funciona -> el-trabajo.

## Left for slice B

extend `empresas` (more firms, verified programmes); `proceso`, `recursos`, `personas` pages (add to the catalog block; `meta.ts` sources are numbered, append only).
Dossier sections 8-12 hold the calendar, selection process and prep plan, but most stage/test claims are marked U.

## Gotchas

- Rothschild's page returns 403 to scripts (Cloudflare); it opens in the browser pane. Alantra/Santander/EY/Forbes/Fortune/Michael Page PDF were opened.
- The Michael Page PDF text extraction scrambles the table; numbers were matched against the dossier row by row. Check against the PDF page 5 visually before the human review.
- The league table (Forbes) is PwC's own claim quoting rankings: the page says so.
- No GFM in MDX: tables are components, not markdown.
- Heights at 375 px (total / main element / article footer incl. sources): como-funciona 4241/3468/1158; empresas 4301/3528/1447; el-trabajo ~5300/4526/969 (body without sources about 3.4k). el-trabajo is the only page over 4k total; its three pay profiles share one compact table. No fitting slug exists in SECTION_SLUGS for a pay/ladder split (a `sueldos` slug would do).

## Unverified / not published

London pay and right-to-work for Spanish students; years per level; exits; Spanish hours; JPM/Citi/BofA/MS Madrid listings (only Goldman's page was opened, and only its title); Houlihan Lokey size; Big Four intake and careers pages (only the generic IE page on entry routes); BBVA/CaixaBank CIB programmes (dossier R, not opened); Santander 2026-27 call dates (only the 2025 release was read).

## Slice B (2026-11-27)

Added `sueldos` (pay moved out of `el-trabajo`; `sueldos` added to `SECTION_SLUGS`), `proceso`, `recursos`, `personas`; `empresas` extended; 12 resources appended to `RESOURCES` (types web-oficial, newsletter, guia, curso, comunidad). Sources 10-15 appended to `meta.ts`.

Heights at 375 px (total / body without sources+related footer): como-funciona 4241/~2.3k, empresas 4545/~2.2k, el-trabajo ~4.4k/~2.6k, sueldos 3099/~1.4k, proceso 5552/~3.4k, recursos 2559/~1.1k, personas 3203/~1.6k. Totals over 4k are mostly sources + site chrome.

Gotchas and unverified:

- The CaixaBank page the dossier cites is a 2020 press note about corporate services, not CIB: dropped. BBVA's page gives no year for the call (20 women, 1 year, starts October).
- Santander: only the April 2026 release (SCIB calls open Aug-Sep) and the 2025 call (closed 30 Nov) were read; no 2026-27 closing date.
- Selection stages and test content: no firm page publishes them; Prospect Rock (the dossier's source) blocks scripts. `proceso` only has a flagged "lo que cuentan candidatos" box. The "CFA/FMVA is not the way in" myth is left out (no citable source).
- London calendar, right to work, Big Four intake dates and Esade/CNMV/Cinco Días links (blocked or 500 to scripts) are not published.
- Books are listed as text without links (no verified URL).
- A server from another session listens on :3000, so `playwright` reuses it; run e2e with `BASE_URL` pointing at your own `next start -p <port>`.
