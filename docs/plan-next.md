# Path: master plan from product beta to public launch (written 2026-11-28)

The goal for the next batches: turn 16 fast, parallel features into **one coherent, beautiful,
verified product** that a student in Spain opens every week from September to March, then launch
it publicly. Ambitious, but every rule in `AGENTS.md` still holds (EUR 0/month, BYOK, no scraping,
no tracking without consent, 16+, GDPR, Spanish UI, sources for every claim).

## Where we are

On main (130 unit, 214 e2e, Cargo gates green), deployed noindex at
https://path-ten-theta.vercel.app:

| Area      | Routes                                                                                                                                                                                                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guides    | `/industrias` (map + comparison), `/industrias/{banca-de-inversion,consultoria,big-law}` (TOC, progress), `/preparacion`, `/recursos` (library + saved)                                                                                                                                               |
| Tools     | `/empezar` (4-step onboarding), `/diagnostico` (quiz), `/encaje` (CV fit, WASM, browser-only), `/candidaturas` (tracker v2: drag, stats, CSV, .ics, Supabase sync), `/calendario` (programmes, dates null), `/practica` (BYOK Gemini/Anthropic/OpenAI), `/ofertas` (27 postings in DB, cards, dialog) |
| Account   | `/entrar` (Entrar / Crear cuenta tabs), `/cuenta` (Mi Path hub), `/cuenta/alertas`, `/cuenta/exportar`, `/alertas/baja`                                                                                                                                                                               |
| Community | `/contribuir` + GitHub issue templates                                                                                                                                                                                                                                                                |
| Plumbing  | sitemap, robots (noindex until `NEXT_PUBLIC_INDEXABLE=true`), manifest, 404/error, OG images, Ctrl/⌘K palette                                                                                                                                                                                         |

Not verified live: anything signed-in (magic link mails nothing yet), alerts sending, `/ofertas`
rendering the DB rows. Content for PE, data science and AI is paused until experts join.

## Principles for every wave

1. **Consolidate before you add.** No new surface until the audit (wave 4) is closed.
2. **One visual language.** Primitives in `src/components/ui/` only; pages compose, never restyle.
3. **Verify in production**, not only in e2e: each wave ends with a live smoke test.
4. **Small owned slices**, 6-7 parallel sessions max, briefs with decisions, merge routine.
5. **Cheap reviews**: every merged wave gets a slow review pass by a simpler model (Haiku or
   Sonnet low), one route per pass, findings in `docs/audit/`.

## Track 0: Pablo's unblockers (do these first; 30 minutes)

1. Supabase > Auth > SMTP settings: Resend as custom SMTP (free tier). Built-in mail only reaches
   org members (~2/h). Site URL and redirect `https://path-ten-theta.vercel.app/auth/callback`.
2. Vercel Production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; redeploy.
3. Resend sender domain; GitHub secrets `RESEND_API_KEY`, `ALERTS_FROM`, `SITE_URL`; then set
   `ALERTS_LIVE=true` (`docs/resend-setup.md`). Optional: `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`.
4. Decisions (answer in chat): real firm logos from official press kits, or keep the typographic
   wall? Domain name? Contact email for `/contribuir` (TODO placeholder)?

## Wave 4: audit, verify, consolidate (read-mostly, run in parallel)

| ID  | Task                                                                                                                                                                                                            | Output                                                                 | Model         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------- |
| R1  | Visual audit: every route at 1280 and 375, light and dark, plus menus, palette, dialogs                                                                                                                         | `docs/audit/ui.md` severity-ranked, screenshots `docs/screenshots/v5/` | Sonnet medium |
| R2  | Live signed-in verification after Track 0: sign-up, tracker sync + import, alerts opt-in and baja, Mi Path, export, delete                                                                                      | `docs/audit/live.md` bug list                                          | Sonnet medium |
| R3  | Code health: dead code from the streams (`PrevNext`, `ResourceList`, unused CSS), duplicated helpers, flaky `consulting.spec.ts` "proceso lists", bundle sizes per route                                        | small PR + `docs/audit/code.md`                                        | Sonnet low    |
| R4  | Facts and rules pass: every number and claim in UI (comparison, quiz, home stats, mockups, practice prompts) traced to `content/` sources; no degree-year segmentation, no pay per firm, no target universities | `docs/audit/facts.md` + fixes                                          | Sonnet medium |
| R5  | Accessibility: axe on every route (Playwright + `@axe-core/playwright` only if Pablo approves the dev dependency), keyboard walk, screen-reader labels, focus order in dialogs                                  | `docs/audit/a11y.md`                                                   | Sonnet medium |
| R6  | Security and privacy: CSP and security headers, RLS tests run in CI with `supabase start`, BYOK key never leaves the browser (network assertions), export/delete completeness, no PII in logs                   | `docs/audit/security.md` + fixes                                       | Sonnet high   |

## Wave 5: Design system 2.0 and UI elevation

Direction: calm, precise, premium. HappyRobot and Notion for structure (big type, product
windows, logo walls, mono eyebrows, pill buttons), Linear and Vercel for density and motion,
Raycast for the command palette feel. Stay inside the Path identity (Geist / Geist Mono,
`#ECEEF1`, `#171C24`, cobalt `#3550B0`, single-step symbol).

| ID  | Task                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | **Primitives consolidation (alone; touches `ui/`)**: `Chip`, `FilterBar` (URL-synced), `EmptyState`, `Skeleton`, `PageHeader` (eyebrow, title, lead, actions), `Card` variants (link, stat, tool, posting), `StatBar`, `Sheet` (bottom sheet at 375 px), `Tooltip`, `Kbd`, `Segmented`, `Progress`. Migrate every page. Storybook-like gallery at `/dev/ui` (dev only). |
| U2  | **Tokens 2.0**: fluid type scale (clamp), 4-pt spacing, elevation levels, radii, motion tokens (durations, easings, spring-like cubic-beziers), z-index scale, dark-mode pairs with AA proofs in `docs/design/tokens.md`.                                                                                                                                               |
| U3  | **Motion system**: View Transitions between routes (industry card → guide hero, posting card → dialog), count-ups, scroll-linked hero window, staggered reveals, press/hover physics, toast choreography. One `motion.css` + a `useReveal` hook; all off under reduced motion.                                                                                          |
| U4  | **Illustration and icon system**: one SVG cover-art generator per industry (seeded, light/dark), 24 px icon set for all tools and states, empty-state illustrations, OG images from the same system.                                                                                                                                                                    |
| U5  | **Real product imagery on the home**: replace mockups with captures of the real tools using fictional data, an interactive "prueba Encaje aquí" with the fictional CV, an animated tour of Empezar → Diagnóstico → Encaje → Candidaturas.                                                                                                                               |
| U6  | **Mobile-first pass**: bottom tool bar, sticky primary actions, sheets instead of dialogs, thumb-reachable filters, 44 px targets, safe areas, installable PWA feel.                                                                                                                                                                                                    |
| U7  | **Page-by-page polish** from the R1 report: guides (pull quotes, callouts, sources drawer), `/ofertas` (density toggle), `/candidaturas` (board polish), `/calendario` (timeline), account hub (progress ring for onboarding).                                                                                                                                          |
| U8  | **Performance**: Lighthouse ≥ 95 every route (Lighthouse CI in GitHub Actions), route bundle budgets, WASM only on `/encaje`, font subsetting, `next/image` everywhere.                                                                                                                                                                                                 |

## Wave 6: product depth (what makes a student come back weekly)

| ID  | Feature                                                                                                                                                                              | Notes                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| F1  | **Mi semana**: a weekly plan built from the tracker (next steps), calendar windows and onboarding gaps; one "next best action" card on `/cuenta` and home when returning             | local first, synced when signed in |
| F2  | **Encaje 2.0**: skill gaps per industry → links to `/recursos` and `/preparacion`; profile versions; explain each ranking reason                                                     | browser-only, WASM                 |
| F3  | **CV review with your key (BYOK)**: section-by-section feedback against the industry's expectations; CV never leaves the browser except to the user's chosen provider                | reuse `src/lib/byok/`              |
| F4  | **Practice 2.0**: history in the browser, rubric scores over time, more case types (market sizing, profitability, M&A), voice mode with the Web Speech API (free, in-browser), timer | BYOK                               |
| F5  | **Outreach kit**: networking email and LinkedIn message templates by industry and stage, with a BYOK "personalise" button; coffee-chat question bank                                 | no sending from Path               |
| F6  | **Interview question bank**: curated, sourced questions per industry and stage, flashcards with spaced repetition in localStorage                                                    | content-light, sourced             |
| F7  | **Calendar alerts**: "Avísame cuando abra" per programme (alerts pipeline), `.ics` subscription feed per industry                                                                    | Resend                             |
| F8  | **Postings 2.0**: Adzuna (Spanish coverage), explanation per match, "guardar búsqueda" → alert, expired-posting handling                                                             | official APIs only                 |
| F9  | **PWA**: installable, offline guides and tracker, optional web push for alerts (VAPID, free, explicit consent)                                                                       | consent first                      |
| F10 | **Mentors (later, 18+)**: design only this batch: safeguarding, moderation, consent flows; no build until reviewed                                                                   | rule 5                             |

## Wave 7: content system and experts

- `/revision` (internal, dev or signed-in maintainer only): pages by `next_review`, reviewer
  status, missing sources; GitHub issue links.
- MDX component kit for authors (callout, comparison row, timeline, source cite) with docs in
  `docs/contributing-content.md`.
- Recruit reviewers via `/contribuir` (Pablo's network, university associations); then PE,
  data science and AI guides, each with a named reviewer. Content sessions resume only then.

## Wave 8: public launch

Domain and trademark check for "Path"; real legal texts (privacy/GDPR, terms, cookies, aviso
legal) reviewed by a human; accessibility statement; `NEXT_PUBLIC_INDEXABLE=true`; Search Console;
security headers verified; backups/export of Supabase (free tier limits documented); status
checks via GitHub Actions; launch page and share cards; outreach kit for university associations.
Metrics without tracking: aggregate counts from the DB (accounts, subscriptions) and GitHub stars;
any analytics only with consent and only free/self-hostable.

## Engineering quality (continuous)

RLS integration tests in CI (`supabase start` on GitHub Actions, free); visual regression with
Playwright screenshots on key routes; Lighthouse CI; e2e against the Vercel preview of each PR;
Dependabot; bundle budget check; remove ~25 stale worktrees (ask Pablo).

## Suggested order

Day 1: Track 0 → wave 4 (R1-R6 in parallel) → merge → U1 alone → U2+U4 in parallel.
Day 2: U3, U5, U6, U7, U8 in parallel → live smoke test → slow review pass (cheap model).
Day 3+: wave 6 in two halves (F1-F4, then F5-F9), wave 7 when reviewers exist, wave 8 when
Pablo decides to launch.
