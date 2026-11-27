# Decisions

Newest last. Format: context, decision, why.

## 001 — Separate repo, codename `carrera-web` (2026-11-27)

Separate product from the personal job-hunter. It reuses code (collectors) but never personal data.
Name is pending (`docs/naming.md`).

## 002 — Next.js App Router + TypeScript strict + MDX (2026-11-27)

Bespoke interactive pages per industry need React; MDX lets guides embed components.
`noUncheckedIndexedAccess` is on to catch undefined array access early.

## 003 — Plain CSS with design tokens, no Tailwind (2026-11-27)

Tokens in `src/styles/tokens.css` (light + dark). Zero extra dependencies and one source of truth
that every stream reads. Revisit only if WS-A shows a concrete need.

## 004 — Licences: MIT code, CC BY-SA 4.0 for `content/` (2026-11-27)

Content is the asset; share-alike keeps derivatives open.

## 005 — Zero cost, BYOK, 16+ (2026-11-27)

Free tiers only. AI runs only with the user's own key. Accounts 16+, mentor contact 18+.

## 006 — Ownership by folder (2026-11-27)

One owning stream per folder (`docs/ownership.md`) so parallel sessions never conflict.

## 007 — Tooling (2026-11-27)

ESLint (flat config, `eslint-config-next`), Prettier, Vitest (unit), Playwright (smoke, desktop + 375 px).
CI: typecheck, lint, format check, tests, build, Playwright smoke. `next lint` no longer exists in
Next 16, so ESLint is run directly.

## 008 — Accounts and data (2026-11-27)

- Auth: email magic link only (no passwords). Google is optional and deferred: it cannot supply a birth year.
- Age gate in three layers: form (year + 16+ checkbox), then a DB trigger on `auth.users` that rejects
  sign-up without a birth year giving 16+, plus a `check` on `profiles.birth_year`. Coarse by design (year only).
- RLS on every table; `anon` has no grants. `consents` is append-only for the user.
- Account deletion is a `security definer` SQL function (`delete_my_account`), so no service-role key
  ever exists in the web app. Export is a JSON download built through RLS-filtered selects.
- Protected area is `/cuenta/*`; sign-in is `/entrar`. Middleware runs only on `/cuenta/*`.
- Consent records store legal text versions (`LEGAL_VERSIONS`, placeholder until WS-D publishes texts).
