# PROGRESS

Last updated: 2026-11-27 (Claude Sonnet 5.5, WS-A session, branch `claude/ws-a-design-system-375be6`)

## Current step

WS-A design system + public shell: code done; typecheck, lint, unit, build and e2e (desktop + 375 px) pass locally.

## Done this session

- Primitives in `src/components/ui/` (CSS modules on tokens): typography, button, card, tag, callout,
  tabs, accordion, timeline, stat, sources/cite/reviewed-by, header/footer/shell, MDX map, OG card.
- Home, `/industrias` map, `/dev/ui` showcase, `opengraph-image`, unit + e2e tests.

## Next task

Pablo reviews the preview (look, phone), then Lighthouse >= 90 on home. Merge before WS-B/WS-D start.

## Open threads / requests for shared files (not edited here)

- `src/mdx-components.tsx` (WS0): spread `uiMdxComponents` from `@/components/ui`.
- Fonts are system stacks (Georgia display). A webfont would need `next/font` in the root layout.
- `ROUTES.signUp = "/registro"` and legal paths in `ui/site-data.ts`: align with WS-C / WS-D.
- OG card mirrors token hex values (satori can't read CSS vars); `metadataBase` is unset in root layout.
- No new tokens or dependencies were needed.

## Gotchas

- `prettier --write src` rewrites CRLF READMEs/WS0 files on Windows; run it only on owned folders.
