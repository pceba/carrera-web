# Handover: wave 2, Big Law, slice A

Written 2026-11-27 (Claude Sonnet 5.5). Branch `claude/trusting-agnesi-5ff01c`; not pushed.

## Done

- Catalog: `big-law` is `live`, sections `como-funciona`, `empresas`, `el-trabajo`, `startHere: como-funciona`.
- `content/industrias/big-law/`: three MDX pages + `meta.ts` (11 sources, `reviewer: "pendiente"`).
- `src/components/industries/big-law/GuideVisuals.tsx`: `PayByLevel` (pay table, Signium/UFV 2025 via Forbes España).
- `e2e/big-law.spec.ts`: hub -> como-funciona -> empresas -> el-trabajo.
- Opened: BOE Ley 34/2006 (arts. 1, 2, 6, 7), ICAB page for Orden PJC/298/2026 (title only), Uría, Cuatrecasas (prácticas and CELIA/Harvey note), Pérez-Llorca, GA&P, A&O Shearman, Freshfields, Clifford Chance, Forbes España (Signium).

## Left for slice B

`proceso` (Uría phases are in `empresas`; others' stages not found), `sueldos` (move pay out of `el-trabajo`, as in IB), `recursos`, `personas`; Garrigues; Expansión revenue ranking; Hogan Lovells/DLA/Pinsent/White & Case programmes (pages exist, not read in detail).

## Heights at 375 px (total)

como-funciona 5108, empresas 4597, el-trabajo 4634 (no horizontal scroll). Totals include sources and site chrome; como-funciona is the tallest because of its 11 sources.

## Unverified / not published

- Examen de Estado details (dates, structure, pass rules, 600 h practices, 70/30 weighting): the order's BOE text was not opened (BOE URL guess 404; ICAB page only gives the title). Gemini mentions them: lead only.
- Ministerio de Justicia pages: not opened (mjusticia URLs returned an error page).
- Billable hour/leverage/partner model: no citable Spanish source; page says so.
- Legal AI: Cuatrecasas's own 2023 press note only; Harvey adoption figures not published.
- Garrigues (403), London/US firms and pay abroad: not covered.
- Clifford Chance source URL is the Spanish job portal home; the listing text was seen there.
- Pay is a mixed-firm average (Signium/UFV, 2025), never per firm.

## Slice B (2026-11-27)

Merged origin/main (Path identity, sources collapsed). Added `sueldos` (pay moved out of `el-trabajo`), `proceso` (access path moved from `como-funciona`, Examen de Estado 2026 from the BOE order BOE-A-2026-7323 opened in full, firm recruiting from firm pages), `recursos` (10 entries in `RESOURCES`, `/recursos?industria=big-law` works), `personas` (ELSA Spain page and Uría's ESMCC note; no named people). Source 2 is now the BOE order itself; sources 12-13 appended. e2e: hub -> proceso -> recursos + library filter.

Heights at 375 px (sources collapsed): como-funciona 4099, empresas 4066, el-trabajo 3491, sueldos 2838, proceso 5083, recursos 2320, personas 3291. `proceso` is long (path + exam + recruiting); could be split or trimmed.

Unverified: only Uría publishes its tests; Part B of the exam (25 points) topics only via the annex, not summarised; ICAM/CGAE and Garrigues pages not opened (403); Ministerio de Justicia page not opened (order text came from BOE). Examen details are for the 2026 call only.
