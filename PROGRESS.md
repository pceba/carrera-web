# PROGRESS

Last updated: 2026-11-27 (Claude Opus 5.5, WS-UI session, branch `claude/ws-ui-redesign-ab4df8`)

## Current step

WS-UI redesign done on its branch, all checks green (format, lint, typecheck, unit, build, 38 e2e).
Not pushed, not merged. Lighthouse itself not run (see below).

## Done this session

- Tokens: paper/ink + terracotta via `light-dark()`, fluid type, `.inverse` panel; fonts
  Instrument Serif + Schibsted Grotesk through `next/font` (self-hosted at build, no new npm deps).
- Shell: wordmark component, header with Ofertas, Popover-API mobile menu, theme switch (system
  default, no flash), designed footer with legal + GitHub links. `/registro` (404) → `/entrar`.
- Home: guide contents preview, entry by year (links to `#c3`/`#c4` tabs), map, offers shortcuts,
  trust signals, closing band. Industry map rebuilt.
- Consulting: section rail + mobile switcher with progress, career ladder, example week, recruiting
  calendar by month, firm chips + desktop table, copyable message template, case as inverse panel
  with stepper and funnel. `seleccion.mdx`: list → `<RecruitingCalendar>`, same facts and cites.
- Offers presentation, account pages in the shell with form primitives, `/dev/ui`, OG card, e2e.
- Screenshots: `docs/screenshots/before|after/`.

## Next task

Pablo reviews the branch (screenshots first), runs Lighthouse locally (command below), then merges.

## Open threads

- Lighthouse: `npx lighthouse` was blocked in-session. Proxy under mobile throttling (4x CPU,
  slow 4G): LCP 1.1 s home / 1.3 s consulting, CLS 0, TBT ~150-180 ms; automated contrast, names,
  targets and heading checks pass. Run: `npx lighthouse http://localhost:3217/ --view`.
- WS-B should review the `seleccion.mdx` markup change and the presentation overrides in
  `src/app/(public)/industrias/consultoria/page.tsx`.

## Gotchas

- Python edits on Windows write CRLF; run `npx prettier --write` before committing.
- `npm run start` leaves an orphan `next start` when stopped from a background shell; kill by port.
