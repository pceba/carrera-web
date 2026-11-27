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
