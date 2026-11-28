# Brief P4: industry fit diagnostic (about 45 minutes)

Roadmap item 4. Read `AGENTS.md`, `docs/naming.md`, `src/components/ui/README.md` and the
industry hubs in `content/industrias/*/index*` (for tone and links). Branch from main, no push.

## Owned

`src/app/(public)/diagnostico/`, `src/components/quiz/`, `src/lib/quiz/`, `e2e/diagnostico.spec.ts`,
`docs/handover/p4-fit-quiz.md`. Do NOT edit `src/components/ui/`, `src/components/nav/`,
`src/styles/`, the home or `/industrias` (a redesign session owns them; ask in the handover for
links from home and `/industrias`).

## Decisions (do not reopen)

- Route **`/diagnostico`**, title "¿Qué industria encaja contigo?". Static, client-side, **no AI,
  nothing stored or sent**; say so on the page ("No guardamos tus respuestas").
- 8 questions, one per screen, 3-4 options each, keyboard and 375 px. Axes: tolerance to long and
  unpredictable hours; building with code/data vs persuading/advising vs reading/writing law;
  specialise early vs keep options open; client-facing vs deep solo work; comfort with numbers and
  financial models; structured career ladder vs fast-moving field; deal intensity vs long projects;
  Spain vs open to London/abroad. Wording neutral, tú, no hype, no stereotypes.
- Scoring: a pure function in `src/lib/quiz/` mapping answers to a weight per industry (six slugs:
  banca-de-inversion, consultoria, big-law, private-equity, data-science, roles-de-ia; confirm slugs
  from `src/lib/generated/` or `/ofertas` filters). Weights are qualitative tendencies, not facts;
  never claim pay, hours numbers or firm names. Vitest tests: each industry can win; ties are stable.
- Result: ranked six with a short bar per industry, top 2 highlighted with two lines of "por qué"
  derived from the answers, and a link to the guide (`/industrias/<slug>`; for industries without a
  guide yet, say "Guía en preparación" and link to `/ofertas?industria=<slug>`). Caveat line: "Es
  una orientación, no un veredicto." Buttons: "Repetir" and "Copiar enlace" (answers encoded in the
  URL hash, so sharing works without storage).
- Motion: CSS only (slide/fade between questions, bars grow on result), off under
  `prefers-reduced-motion`. Progress bar with "3 de 8". Use existing primitives and tokens only.

## Deliverable (commit after each)

1. Lib + tests. 2. Page and components. 3. e2e (complete the quiz by keyboard, see a ranked result,
   reload with the hash restores it, 375 px). All checks pass (`typecheck`, `lint`, `format:check`,
   `test`, `build`, Playwright; kill orphan `next start` on :3000/:3100 first). Handover ≤20 lines.
