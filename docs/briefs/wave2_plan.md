# Wave 2 plan: one industry at a time (2026-11-27)

Inputs: the Gemini report digest `docs/research/gemini-deep-research.md` (and its PDF), the
dossiers in `docs/research/` and the notes `docs/handover/rs1-research-notes.md` (consulting,
Big Law) and `docs/handover/rs3-ai-data-handover.md` (AI, data). The frame (hub, sections,
catalog, `/preparacion`, `/recursos`) is on main since WS-IA.

## Budget rules

At most 2 sessions at a time (Sonnet; medium for content, high only for the interactive piece).
Each industry is two slices of about 1 hour. Research happens inside each slice: the session
opens the primary source for every fact it writes. No separate research sessions.

## Order (by how much verified material exists)

| #   | Industry           | Slice A (hub + understand)                            | Slice B (get in)                                        |
| --- | ------------------ | ----------------------------------------------------- | ------------------------------------------------------- |
| 1   | Banca de inversión | hub, como-funciona, el-trabajo (dossier is complete)  | proceso, empresas, recursos, personas, myths            |
| 2   | Consultoría        | split the 5 sections over 4,000 px; 2026 test formats | estrategia segment refresh, routes from any university  |
| 3   | Big Law            | hub, como-funciona (Spain access path), el-trabajo    | proceso (firm by firm), empresas, recursos              |
| 4   | Private equity     | hub, como-funciona, el-trabajo (finish the dossier)   | proceso (via IB/MBB, off-cycle), empresas, recursos     |
| 5   | Data science       | hub, the three specialities, el-trabajo               | proceso (SQL, product cases), empresas, recursos        |
| 6   | Roles de IA        | hub, the six families, el-trabajo                     | proceso (portfolio, lab interviews), empresas, recursos |

Then one cross-industry slice: the fit diagnostic on `/industrias` (static, no AI) and the
first `content/preparacion/*.mdx` guides (case interview, technical finance interview).

## Brief template (copy per slice)

> Brief W2-<slug>-<A|B>. Read `AGENTS.md`, `docs/roadmap.md` (IA), `content/catalog.ts`, the
> consulting sections as the model, `docs/research/gemini-deep-research.md` (pages for your
> industry) and your industry's dossier/notes. You own `content/industrias/<slug>/`,
> `src/components/industries/<slug>/` and only your industry's entries in `content/catalog.ts`
> (sections, segments, resources). Deliverable: <sections>. Rules: Spain first, US/London only
> as context; every factual claim cites a primary source you opened, in front matter
> (`sources`, `reviewer`, `reviewed_at`, `next_review`); report figures as "según <estudio>,
> <año>"; no year-of-degree segmentation; calm components only; each page under ~4,000 px at
> 375 px; tú, direct, no hype. Checks + e2e pass. Commit per section; no push; handover in
> `docs/handover/w2-<slug>.md`.

## Merge order

The orchestrator merges each slice after checks. Two sessions touching `content/catalog.ts` edit
different industry blocks; merge one, then merge main into the other before its checks.
