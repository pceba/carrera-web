# W2 consultoría, slice A: handover

## Done

- Firms list on phones: one collapsed row per firm (`<details>`), details and link on demand.
- Resources page: new `ResourceGroups` (casos, guías, webs oficiales), first group open.
- `proceso`: rewritten shorter; new "Pruebas online y uso de IA" section; the calendar figure was
  removed (dated programs live in `estrategia`, undated ones in the firms table).
- `como-funciona`: callout and two short sections merged, ladder padding reduced.
- New sources 18–20 (Bain digital assessment, BCG interview process, BCG AI use) in `meta.ts`.
- e2e: calendar test replaced by two tests (proceso tests section, estrategia dated programs).

## Heights at 375 px (total / body-only)

| Page          | Before      | After       |
| ------------- | ----------- | ----------- |
| como-funciona | 4354 / 3581 | 3919 / 3146 |
| empresas      | 4779 / 4006 | 3115 / 2342 |
| proceso       | 4791 / 4018 | 3947 / 3174 |
| recursos      | 4304 / 3531 | 2623 / 1850 |
| estrategia    | 4169 / 3396 | 3552 / 2780 |

## Unverified / left for slice B

- McKinsey Solve, BCG Casey and AI-assisted case interviews: no official page opened (McKinsey
  interviewing page timed out twice; BCG and Bain pages do not name Casey or AI interviews). The
  page says only that prep guides mention them. Recorded in `todoVerify`.
- Bain Spain pages (`/es-es/...`) were not opened; Bain facts come from the global English pages.
- `RecruitingCalendar` is now unused in consulting (kept in `GuideVisuals`).
- No new slug needed.
- `format:check` flags 17 untouched files here (CRLF checkout); files I changed pass.
