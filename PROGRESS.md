# PROGRESS

Last updated: 2026-11-27 (Claude Sonnet 5.5, WS-D session, branch `claude/ws-d-legal-674ceb`)

## Current step

WS-D legal pages: drafted, all checks pass. Awaiting Pablo's review of the texts and placeholders.

## Done this session

- Pages `/legal/privacidad`, `/terminos`, `/cookies`, `/aviso-legal` (`src/app/(public)/legal/`), bodies in `content/legal/*.tsx`.
- `src/app/(public)/legal/versions.ts` exports `LEGAL_VERSIONS` (privacy, terms) for the consents table.
- Unit test for versions, e2e for the four pages (desktop + 375 px).

## Next task

Pablo fills placeholders and checks the legal points. WS-C: use `LEGAL_VERSIONS` from `@/app/(public)/legal/versions`
instead of the placeholder in `src/lib/supabase/env.ts`. WS-A: add cookies / aviso legal links to the footer.

## Placeholders

`{{CONTROLLER_NAME}}`, `{{CONTACT_EMAIL}}`, `{{CONTROLLER_ID}}`, `{{CONTROLLER_ADDRESS}}`,
`{{BACKUP_RETENTION_DAYS}}`, `{{COMMUNITY_RULES_URL}}`.

## Gotchas

- Worktree `node_modules` is empty: `next build` (Turbopack) fails; `npx next build --webpack` works.
