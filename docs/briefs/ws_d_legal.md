# Brief WS-D: legal and GDPR pages

Read `AGENTS.md`, `PROGRESS.md`, `docs/ownership.md`, `docs/decisions.md` and the schema in
`supabase/migrations/` (read-only) first. Reply to Pablo in Spanish; code in English; pages in Spanish.

## Goal

The legal pages that must exist before accounts go public, written for a free, open-source,
non-commercial project run by one person in Spain, and accurate to what the code actually does.

## You own

`content/legal/`, `src/app/(public)/legal/`. Routes already linked by the account pages:
`/legal/privacidad` and `/legal/terminos`; keep those paths. Use WS-A primitives; never edit them.

## Scope

- **Privacy policy (RGPD + LOPDGDD):** controller (placeholder `{{CONTROLLER_NAME}}` and
  `{{CONTACT_EMAIL}}`, Pablo fills them in), what data is collected (match the schema exactly),
  purposes and legal bases, processors (Supabase EU, Vercel, Resend) with regions, retention,
  rights (access, export, deletion via the account page, AEPD complaint), minimum age 16 (and why),
  BYOK: AI keys stay in the user's browser and are never sent to our servers.
- **Terms of use:** free service, no guarantees, content is guidance not professional advice,
  acceptable use, community rules placeholder (18+ for mentor contact), licences (MIT code,
  CC BY-SA 4.0 content).
- **Cookies:** list only cookies actually set (Supabase auth session = strictly necessary). No
  banner if there is no non-essential cookie; say so and why.
- **Aviso legal (LSSI):** identity placeholders.
- Each page shows a version and a date; export the current versions from one module so the
  consents table can record them (put it in your folder, e.g. `src/app/(public)/legal/versions.ts`,
  and say in your report where WS-C should import it).
- Add a clear note at the top of each source file: drafted with AI, to be checked by Pablo, not
  legal advice.

## Not in scope

Changing the schema or account pages, cookie banners, analytics.

## Done when

typecheck, lint, format, tests and build pass; the four pages render at 375 px; your report lists
every placeholder and every legal point Pablo should double-check. Commit in small steps on your
branch; no push, no merge.
