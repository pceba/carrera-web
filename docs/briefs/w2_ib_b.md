# Brief W2-banca-de-inversion-B: get in (about 1 hour)

Wave 2, slice B for investment banking. Slice A is on main (hub, `como-funciona`, `empresas`,
`el-trabajo`); read `docs/handover/w2-banca-de-inversion.md` first. Same reading list and
ownership as `docs/briefs/w2_ib_a.md`, plus dossier sections 8–13.

## Deliverable

1. `proceso`: recruiting calendar in Spain (off-cycle internships, Spanish CIB programmes,
   Big Four deal advisory intakes) with London only as context; selection stages and the technical
   interview blocks (accounting, valuation, M&A, paper LBO, a recent deal). Only stages and dates
   you verify on firm pages; mark the rest as "lo que cuentan candidatos" or leave it out. Include
   the "CFA/FMVA is not the way in" myth only with a citable source.
2. `recursos`: resources for this industry in the catalog (books, free guides, firm programme
   pages, press), each with its type so `/recursos?industria=banca-de-inversion` works.
3. `personas`: networking without a "target" university (how to reach analysts, alumni, clubs),
   no named individuals.
4. Height: split `el-trabajo` (about 5,300 px at 375 px) by moving pay into a `sueldos` section;
   add `sueldos` to `SECTION_SLUGS` in `content/catalog.ts` (the orchestrator approves this one
   shared change).
5. Extend `empresas` with verified programmes (BBVA, CaixaBank, Santander 2026–27 calls) if the
   firm pages open.

Rules as in slice A (Spain first; cite opened primary sources; `reviewer: "pendiente"`; tú;
pages under ~4,000 px; checks + e2e; commit per step; no push; update the handover).
