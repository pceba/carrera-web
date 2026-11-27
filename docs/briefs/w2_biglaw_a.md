# Brief W2-big-law-A: hub and "understand the industry" (about 1 hour)

Wave 2, slice A for Big Law (plan: `docs/briefs/wave2_plan.md`).

## Read first (only these)

`AGENTS.md`; `content/catalog.ts`; the investment banking sections as the model
(`content/industrias/banca-de-inversion/como-funciona.mdx`, `empresas.mdx`, `meta.ts`); the Big Law
part of `docs/handover/rs1-research-notes.md`; `docs/research/gemini-deep-research.md` and PDF
pages 27–33 of `docs/research/sources/gemini-deep-research-2026-11.pdf`.

## You own

`content/industrias/big-law/`, `src/components/industries/big-law/`, and only the `big-law`
block in `content/catalog.ts`. Another session edits the `consultoria` block in parallel.

## Deliverable

1. Catalog: industry live with sections `como-funciona`, `empresas`, `el-trabajo`; hub text.
2. `como-funciona`: what a large business law firm does (transactional vs disputes; practice
   areas); how the firm makes money (billable hour, leverage, partners) at a level a student
   needs; **the access path in Spain**: Grado en Derecho, Máster de Acceso a la Abogacía (with its
   practices), Examen de Estado and colegiación, citing BOE/Ministerio de Justicia pages you open.
   Legal AI tools only as one short paragraph with a citable source.
3. `empresas`: Spanish firms (Garrigues, Cuatrecasas, Uría Menéndez, Pérez-Llorca, others you
   verify) and international firms' Madrid/Barcelona offices; what each offers students
   (practices, summer programmes) only from their careers pages. Revenue ranking only if you open
   the Expansión source.
4. `el-trabajo`: the junior's week, the ladder (junior, asociado, sénior, counsel/socio), pay by
   level from a named study (Signium/UFV, as in rs1 notes: "según <estudio>, <año>", never per
   firm, flagged as estimates). London Magic Circle / US firms only as context for those who aim
   abroad.

## Rules

Spain first; the Gemini report is a lead, not a citation. Cite opened primary sources in
`meta.ts`/front matter (`reviewer: "pendiente"`). No "target" university names; no named
individuals. Tú, direct, no hype; each page under ~4,000 px at 375 px; tokens only; MDX has no
GFM tables (use components). `npm ci` first; kill any orphan `next start` on :3000/:3100 before
e2e; all checks + e2e pass; add one e2e (hub -> como-funciona -> empresas -> el-trabajo). Commit per
step; no push; handover `docs/handover/w2-big-law.md` (done, left for slice B, heights,
unverified).
