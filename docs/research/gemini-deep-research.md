# Gemini Deep Research report: digest for wave 2

Source: `docs/research/sources/gemini-deep-research-2026-11.pdf` ("Guía Maestra para Estudiantes:
Cómo entrar en las seis industrias más ambiciosas en 2026–2027"), 56 pages, Spanish, generated
by Gemini Deep Research for Pablo, received 2026-11-27. About 15,000 words plus ~260 references
(pages 41–56). Pablo's note: useful but not exhaustive; research continues.

## How to use it (read this first)

- **It is a lead, not a citation.** Content in `content/` must cite the primary source the report
  points to (firm careers page, official regulator, salary study PDF), opened and checked by the
  session. Never cite "Gemini" or the PDF itself.
- **It is US/UK-first.** The site is for students in Spain. Use US/London only as context
  ("if you aim for London…"); lead every section with Spain. Latin America material is out of
  scope for now.
- **Source quality is mixed:** many prep-company blogs, Medium posts and one Reddit thread. Prefer
  official pages, regulators (BOE, SRA, USCIS), firm reports and named salary studies (Michael
  Page, Hays, LHH, Signium/UFV, Robert Walters). Mark self-reported figures as such.
- **Numbers can be mangled in text extraction** (dollar amounts were rendered as maths). Always
  read figures in the PDF, not in a text dump.
- People named in the report are public figures in news coverage; do not add other individuals.

## Page map

| Pages | Section                                                              |
| ----- | -------------------------------------------------------------------- |
| 1–5   | Comparative panel: pay, hours, selectivity, exits, AI effect         |
| 6–9   | 2026 board: junior contraction by AI; visas (US, UK, Spain/EU)       |
| 10–15 | Strategy consulting                                                  |
| 16–18 | Data science                                                         |
| 19–22 | Investment banking                                                   |
| 23–26 | Private equity                                                       |
| 27–33 | Big Law (incl. Spain access: Máster de Acceso + Examen de Estado)    |
| 34–39 | AI roles (six families incl. FDE, AI PM), recruiting calendar        |
| 40    | Product recommendations (diagnostic test, routes, myths, calculator) |
| 41–56 | References                                                           |

## What is useful for Spain, by industry (to verify)

- **Consulting (p. 10–15):** tiers (MBB, Tier 2, Big Four strategy, boutiques); four-filter
  process (CV + "why this firm", online tests, case, fit); 2026 test formats (McKinsey Solve,
  BCG Casey, Bain Sova/TestGorilla); AI-assisted case interviews at some offices; MBB Spain
  €45–55K fixed (source 91); Tier 2 → MBB lateral route; target schools in Madrid named by the
  report (handle with care: say "from any university" routes too). Complements
  `docs/handover/rs1-research-notes.md` (BCG, McKinsey, Bain, OW, Strategy&, L.E.K., EY-P, RB
  Spain pages; Infobae/Talentfirst pay; AEC sector data).
- **Data science (p. 16–18):** three specialities (product analytics, causal
  inference/experimentation, applied ML); Spain junior €25–35K (Manfred), mid ~€45–53K;
  bridge roles (analytics engineer, product analyst); portfolio over Kaggle; SQL window
  functions; four product-case archetypes; AI-assisted coding rounds. Complements
  `docs/handover/rs3-ai-data-handover.md` (Michael Page, LHH, Funcas).
- **Investment banking (p. 19–22):** BB / elite boutique / middle market incl. Alantra; Spain
  pay ranges (trainee €24–30K, analyst €35–60K base, source 157); Continental off-cycle
  internships (3–6 months) vs London spring weeks; technical interview blocks (accounting,
  valuation, M&A, paper LBO, deal of the day); "CFA/FMVA is not the way in" myth. Cross-check
  with `docs/research/banca-de-inversion.md` (complete dossier).
- **Private equity (p. 23–26):** buyout / growth / VC / private credit; Iberian funds named
  (Alantra PE, Portobello, ProA, Miura, Magnum); most entries via 2 years in IB or MBB; on-cycle
  is a US phenomenon, Europe is off-cycle; undergrad PE analyst programmes. Cross-check with
  `docs/research/private-equity.md` (partial).
- **Big Law (p. 27–33):** Spain access path (Grado + Máster de Acceso + Examen de Estado
  70/30, 600 h practices); recruiting in last year or during the Máster; Spanish top firms by
  revenue (Expansión ranking, April 2026); legal AI (Harvey with Cuatrecasas, Legora entering
  Spain); London Magic Circle vs US firms for those aiming abroad. Complements rs1 notes (Uría,
  Cuatrecasas, Pérez-Llorca, Garrigues, GA_P, Clifford Chance Madrid; Signium/UFV pay).
- **AI roles (p. 34–39):** six families (applied/LLM/agentic engineer, ML engineer/MLOps,
  research engineer, research scientist, FDE, AI PM); Spain AI/LLM engineer junior €25–40K;
  portfolio patterns (agents with permissions, evaluated RAG, fine-tuning with cost judgement,
  MCP); residencies and fellowships; lab interview formats. Complements rs3 notes.
- **Cross-cutting (p. 6–9, 39–40):** EU Blue Card in Spain (Orden PJC/44/2026 thresholds, verify
  in BOE); recruiting calendars close 9–20 months before start in US/London; product ideas
  below.

## Product ideas in the report, mapped to our roadmap

| Idea (p. 40)                                  | Where it fits                                        |
| --------------------------------------------- | ---------------------------------------------------- |
| Diagnostic test of fit across industries      | Wave 2 cross-industry piece on `/industrias` (no AI) |
| Routes for non-target universities            | One section per industry hub ("desde cualquier uni") |
| Library of costly myths                       | Section per industry + tag in `/recursos`            |
| Recruiting calendar + opening alerts          | `cw-alerts` (WS-F) + calendar data in `content/`     |
| Real-pay calculator (net, per effective hour) | Later; needs tax data we can cite; not in wave 2     |

## Gaps (research still to do)

Spain-specific recruiting calendars per firm; Spanish IB boutiques beyond Alantra (AZ Capital,
Arcano, etc.) and their processes; Spanish PE analyst intake; Big Four strategy pay in Spain from
a named study; AI roles in Spanish companies (who hires juniors); data-science roles outside Big
Tech in Spain; Spanish-university clubs, competitions and case libraries; every figure above
needs its primary source opened.
