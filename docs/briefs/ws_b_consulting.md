# Brief WS-B: consulting, the reference industry

Read `AGENTS.md`, `PROGRESS.md`, `docs/ownership.md` and `src/components/ui/README.md` first.
Reply to Pablo in Spanish; code in English; site copy in Spanish (tú, direct, no hype).

## Goal

The consulting industry page, done to the bar every later industry is measured against: bespoke
structure (not a template), all six pillars, one interactive case that works without AI.

## You own

`content/industrias/consultoria/`, `src/components/industries/consulting/`,
`src/app/(public)/industrias/consultoria/`. Compose WS-A primitives from `src/components/ui/`
(Typography, Card, Callout, Tabs, Accordion, Timeline, Stat, Tag, Sources). Never edit them; if one
is missing, build a consulting-specific component in your folder and note it in your report.

## The six pillars (Spain, junior/intern level)

1. **Map:** strategy (MBB), Big Four advisory, tech/implementation, boutiques, in-house strategy.
2. **How it works:** projects, clients, staffing, leverage pyramid, career ladder (analyst -> partner),
   up-or-out.
3. **The job:** a realistic week, skills used, travel, hours; pay ranges only with a cited source
   and a year.
4. **Firms in Spain:** a filterable table (type, Madrid/Barcelona offices, entry programmes,
   official careers URL). Official sources only.
5. **Selection prep:** stages (CV screen, tests, case and fit interviews, final round), a recruiting
   calendar (internships vs full-time, typical months), a recommended path by year of degree
   (1st-2nd: explore; 3rd: internship; 4th: full-time), materials (books, firm case libraries,
   free resources) with honest notes. Say there are several valid paths.
6. **People:** how to network well (events, alumni, coffee chats, message templates) and a
   placeholder section for the mentor partner (link only, no integration).

## Interactive case (no AI)

A step-by-step market-sizing or profitability case: prompt, clarifying questions, structure choice,
exhibits with data, maths with input checking, a synthesis, then model answers and a self-assessment
checklist. State in plain React (no server). Keyboard accessible, works at 375 px. Unit tests for
the scoring logic plus a Playwright happy path.

## Accuracy rules

- Every factual claim (dates, pay, offices, programmes, stages) has a source in front matter and an
  inline `Sources` citation. Use web search; prefer official firm pages and recognised reports.
- If you cannot verify a fact, leave it out or mark it `TODO(verify)`; never invent.
- Front matter: `reviewer: founder`, `reviewed_at`, `next_review` (+6 months), `sources: [...]`.
- Pablo has a consulting offer, but never use or guess his personal details.

## Done when

typecheck, lint, format, tests and build pass; the page is reachable from `/industrias`; a list of
`TODO(verify)` items and open questions for Pablo is in your report. Commit in small steps on your
branch; no push, no merge.
