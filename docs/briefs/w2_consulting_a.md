# Brief W2-consultoria-A: shorter pages and the 2026 tests (about 1 hour)

Wave 2, slice A for consulting (plan: `docs/briefs/wave2_plan.md`). Consulting is already live;
this slice fixes length and brings the selection process up to date.

## Read first (only these)

`AGENTS.md`; `content/catalog.ts` (consulting block); `content/industrias/consultoria/*`;
`src/components/industries/consulting/` (only the components the long pages use);
`docs/handover/rs1-research-notes.md` (consulting part); `docs/research/gemini-deep-research.md`
and PDF pages 10–15 of `docs/research/sources/gemini-deep-research-2026-11.pdf`.

## You own

`content/industrias/consultoria/`, `src/components/industries/consulting/`, and only the
`consultoria` block in `content/catalog.ts`. Another session works on `banca-de-inversion` and
adds `sueldos` to `SECTION_SLUGS`; if you need a new slug, tell the orchestrator instead of
editing that list.

## Deliverable

1. Heights at 375 px (measured by WS-IA): como-funciona 4354, empresas 4779, proceso 4791,
   recursos 4304, estrategia 4169. Bring each under ~4,000 px total. `empresas` and `recursos`
   are short MDX with long components (firms table, resource list): make those calmer on phones
   (e.g. one row per firm with details on demand, group resources by type with a short list
   first). Move content between existing sections where it fits better. Do not drop facts or
   sources; do not edit `src/components/ui/`.
2. `proceso`: update online tests to 2026 (McKinsey Solve, BCG Casey, Bain Sova/TestGorilla) and
   say that some offices now run AI-assisted case interviews, only from firm pages you open
   (McKinsey interviewing page, BCG and Bain careers pages); where only prep blogs say it, write
   "según guías de preparación" or leave it out. Keep the Spain focus.
3. Re-measure heights; e2e for consulting still passes (update selectors if you move things).

## Rules

Every new fact cites a primary source you opened, in `meta.ts`/front matter (append sources; keep
numbering stable). Tú, direct, no hype; no year-of-degree segmentation; no "target" university
names; tokens only. `npm ci` first; all checks (`typecheck`, `lint`, `format:check` incl. docs,
`npm test`, `build`) + e2e pass. Commit per step; no push; handover in
`docs/handover/w2-consultoria.md` (done, left for slice B, heights, unverified items).
