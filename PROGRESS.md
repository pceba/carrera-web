# PROGRESS

Last updated: 2026-11-27 (Claude Sonnet 5.5, WS0 session)

## Current step

M0 repo foundation: code done and verified locally (typecheck, lint, format, unit, build, e2e).

## Done

- Next 16 App Router + TS strict + MDX, plain-CSS tokens (`src/styles/tokens.css`, light/dark).
- Folder skeleton with owner READMEs (`docs/ownership.md`), tooling, CI workflow, licences, AGENTS.md.
- `docs/naming.md` with 5 name proposals (DNS-only check).

## Next task

Pablo creates the GitHub repo, pushes `main`, turns on branch protection, connects Vercel (Hobby)
and creates a Supabase project in an EU region. Then WS-A (design system) and WS-C (auth/data) start.

## Open threads

- Pick the name (`docs/naming.md`), then rename codename, `SITE.name`, `package.json` name.
- Verify CI is green on GitHub and a Vercel preview shows the placeholder home.

## Gotchas

- Next 16 has no `next lint`: use `npm run lint` (ESLint directly).
- `src/app/(public)/page.tsx` is a placeholder owned by WS-A from now on.
