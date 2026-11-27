# Brief W2-banca-de-inversion-A: hub and "understand the industry" (about 1 hour)

Wave 2, slice A for investment banking (plan: `docs/briefs/wave2_plan.md`).

## Read first (only these)

`AGENTS.md`; `docs/roadmap.md` (IA); `content/catalog.ts`; two consulting sections as the model
(`content/industrias/consultoria/como-funciona.mdx`, `el-trabajo.mdx`); the dossier
`docs/research/banca-de-inversion.md` (sections 1–7, 14, 15); the Gemini digest
`docs/research/gemini-deep-research.md` and PDF pages 19–22 of
`docs/research/sources/gemini-deep-research-2026-11.pdf` (read figures in the PDF).

## You own

`content/industrias/banca-de-inversion/`, `src/components/industries/banca-de-inversion/`, and
only the `banca-de-inversion` block in `content/catalog.ts` (status, sections, segments, its
resources). Nothing else.

## Deliverable

1. Catalog: set the industry live with sections `como-funciona`, `el-trabajo` (more come in
   slice B); hub "start here" text.
2. `como-funciona.mdx`: what IB does (M&A, ECM, DCM, LevFin, restructuring; product vs sector
   groups); who hires in Spain: Spanish CIBs, international banks' Madrid offices (small intake),
   boutiques (Alantra and others the dossier verifies) and **the Big Four deal advisory teams
   inside this guide** (Pablo's decision: they are the biggest real door in Spain). Sales &
   trading: one paragraph that explains the difference and says this guide does not cover it.
3. `el-trabajo.mdx`: the analyst's real week, the career ladder, pay. Pay ranges by level from
   named studies (Michael Page 2026 Spain, others the dossier marks verified), always "según
   <estudio>, <año>", never per firm, with a note that they are estimates. Hours: say there is no
   Spanish survey; give the London/US context only as context. Do not name "target" universities.
4. One small calm visual if it earns its place (e.g. the ladder or the deal flow), as a component
   in your folder. Interactive pieces come later.

## Rules

Spain first; the Gemini report is a lead, not a citation: open the primary source for every fact
and cite it in front matter (`sources`, `reviewer: "pendiente"`, `reviewed_at`, `next_review`).
Do not publish anything the dossier lists as unverified unless you verify it. Do not present
Madrid as "Goldman/JPM/Morgan Stanley". Tú, direct, no hype; no year-of-degree segmentation; each
page under ~4,000 px at 375 px. All checks + e2e pass (add one e2e: hub -> como-funciona ->
el-trabajo). Commit per step; no push; handover in `docs/handover/w2-banca-de-inversion.md`.
