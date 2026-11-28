# Brief P2: recruiting calendar (P2a) + alerts UI (P2b)

Roadmap item 2, split in two parallel sessions. Read `AGENTS.md`, `docs/naming.md`,
`src/components/ui/README.md` (P3 primitives: pill Button, Dialog, Toast, Reveal, window frame).
UI copy in Spanish (tú). No new dependencies. Branch from main, no push.

## P2a: `/calendario` (owned: `src/app/(public)/calendario/`, `src/components/calendar/`,

`src/lib/calendar/`, `content/calendario/`, `e2e/calendario.spec.ts`, `docs/handover/p2a-calendar.md`)

- Data `content/calendario/programas.yaml`: per row `firm`, `industry` (six UI slugs),
  `programme` (internship / graduate / off-cycle, Spain office first, London only if the firm
  recruits Spanish students there), `opens`, `closes` (ISO date or null), `status_note`,
  `source_url` (the firm's **official** careers page), `checked_at` (today). File header with
  `sources`, `reviewer: "pendiente"`, `reviewed_at`, `next_review` like other content.
- **Dates only if the official page states them.** Otherwise `opens/closes: null` and the UI
  says "Fechas aún no publicadas · ver la web oficial". Never infer dates from blogs or prior
  years. Aim 15-25 rows across the six industries, firms already named in `content/`. Fetch
  pages with web tools; no scraping code in the repo.
- UI: status chips (Abierto ahora / Próximamente / Cerrado / Sin fechas) computed from today;
  desktop a 12-month timeline with bars; 375 px a list grouped by month; industry filter chips;
  per row: "Añadir a candidaturas" (writes to the local tracker via `src/lib/tracker/store.ts`,
  read-only import, stage `interes`, toast on success) and "Añadir al calendario" (.ics generated
  client-side). Validate the YAML in a Vitest test (schema, https URLs, closes ≥ opens).
- Ask in the handover for a header/palette link (the nav is owned by P3 components; you may add
  one entry to the catalog/nav data file if it is a plain list, say so in the handover).

## P2b: alerts UI (owned: `src/app/(account)/cuenta/alertas/`, `src/app/(public)/alertas/`,

`src/components/alerts/`, `src/lib/alerts/`, `e2e/alertas.spec.ts`, `docs/resend-setup.md`,
`docs/handover/p2b-alerts.md`)

- Contract: `supabase/migrations/20261127180000_alert_subscriptions.sql` and
  `docs/handover/ws-f-alerts.md`. Industry values in that table are **English**
  (`consulting`, `ai`, `data-science`, `private-equity`, `investment-banking`, `big-law`): map
  from the UI slugs in one tested function.
- `/cuenta/alertas`: explain what you get (one email a day at most, only new postings that match,
  unsubscribe in one click). Step 1: explicit opt-in checkbox → insert a `consents` row
  (`marketing_opt_in` per the init migration). Step 2: preferences (industries, roles, skills,
  locations, remote) prefilled from the saved Encaje profile if any → insert/update the
  subscription with that `consent_id`. Show status (activa / en pausa), pause and delete.
  Server actions, validated with the table limits. Say "Los envíos aún están en pruebas" while
  Resend is not configured (env `ALERTS_LIVE` not `true`).
- `/alertas/baja?token=`: public, calls `unsubscribe_alerts(token)`, calm confirmation; same page
  for invalid tokens (never reveal whether a token exists). No sign-in needed.
- `docs/resend-setup.md`: steps for Pablo (free account, verify a domain or use the Resend test
  sender, which secrets go in GitHub, how to set `ALERTS_LIVE`). No keys in the repo.
- e2e: baja page with a bogus token; `/cuenta/alertas` redirects to sign-in when signed out.

## Both

Commit after each step. All checks (`typecheck`, `lint`, `format:check`, `test`, `build`,
Playwright; kill orphan `next start` on :3000/:3100 first). Handover ≤25 lines. Final message:
branch, files outside owned folders, anything undone. Aim for ~45 minutes.
