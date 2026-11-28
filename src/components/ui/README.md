# src/components/ui

**Owner:** WS-A Design system + shell (M1). Redesigned by WS-UI (2026-11-27).

Shared UI primitives. Read tokens only from `src/styles/tokens.css`; see every primitive live at
`/dev/ui`.

## Direction

"Precise tool" (identity in `docs/naming.md`): Geist and Geist Mono, silver-grey ground, ink text,
one cobalt accent. P3 (2026-11-28) made it feel like a product: pill buttons, a product window
frame, mono caps eyebrows, thin 1 px grid borders, quiet motion. Fonts are self-hosted by
`next/font` at build time, so visitors never contact Google.

## Theme

- Colour tokens use `light-dark()`; the theme is chosen by `color-scheme` only.
- `ThemeToggle` stores `light`/`dark` in `localStorage` (absent = follow the OS) and
  `theme-script.ts` applies it before first paint.
- `.inverse` (global, in tokens.css) is a dark panel that stays a lifted charcoal in dark mode.
  Use it for one emphatic block per page (the consulting case, the home closing band).

## Pieces

| Component                                                                                                             | Use                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Shell`, `Page` (`narrow`)                                                                                            | Skip link, header, main, footer; centred page column                                                                    |
| `Header`, `Footer`, `Wordmark`, `ThemeToggle`                                                                         | Navigation (Popover API menu on phones), brand mark, theme switch                                                       |
| `Heading`, `Kicker`, `Text`, `Prose`                                                                                  | Type scale; `Prose` keeps text at a readable measure, widgets go wide                                                   |
| `Button`, `ButtonLink` (`primary`/`accent`/`secondary`/`ghost`/`danger`, `arrow`)                                     | Actions; use `accent` once per view                                                                                     |
| `Card`, `Tag`, `Callout`, `Stat`                                                                                      | Content blocks                                                                                                          |
| `Accordion`, `Tabs`, `Timeline`                                                                                       | Disclosure, tabbed panels (deep-link a tab with `#<id>`), ordered steps                                                 |
| `Cite`, `SourceList`, `ReviewedBy`                                                                                    | Sources and review dates (AGENTS.md rule 8)                                                                             |
| `Dialog`, `Toast` (`toast()` + `Toaster`), `Reveal`/`useReveal`, `WindowFrame`, `Eyebrow`, `ToolIcon`, `Announcement` | P3: native `<dialog>` modal, provider-free toasts, scroll reveal (off under reduced motion), product window, mono label |
| `Field`, `Input`, `Checkbox`, `Fieldset`, `Notice`, `Panel`                                                           | Forms (account pages)                                                                                                   |

The wordmark reads `SITE.name`; when the project gets its real name, change `src/lib/site.ts` and,
if wanted, the three-step mark in `Wordmark.tsx` and `og-template.tsx`.

Only the owning stream edits this folder. Anything else is a request in the PR description. See `docs/ownership.md`.
