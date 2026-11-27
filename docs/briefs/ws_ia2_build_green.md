# Brief WS-IA slice 1: make the calm redesign build (about 1 hour)

Continues `claude/ws-ia-calm-structure-305a1a` (full brief: `docs/briefs/ws_ia_calm_structure.md`,
state: `docs/handover/ws-ia-calm-structure.md`). Same ownership as the full brief.

## Deliverable

`npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` pass.

1. Rewrite `src/app/(public)/page.tsx` (short home: hero, the six industries from
   `content/catalog.ts`, three steps, trust line) and `src/app/(public)/industrias/page.tsx` (map:
   six industries, one line each, how they relate). Remove every use of `INDUSTRIES`/`PILLARS`.
2. Add the classes the hub and section pages use to `industrias.module.css` (hubHead, hubActions,
   hubMeta, block, blockTitle, toc\*, guide, article, articleHead, articleFoot, kind). Calm: few
   borders, whitespace, tokens only.
3. Delete the unused `GuideNav` and its CSS; fix `/dev/ui` and the og-template if they break.
4. Unit test for `content/catalog.ts` helpers (neighbours, related) next to `src/components/nav/`.

Out of scope (later slices): `/preparacion`, `/recursos`, e2e rewrite, Lighthouse, screenshots.
If e2e fails because of old URLs, leave it and list the failing specs in the handover.

## Rules

Commit after each numbered step. No push, no merge. Before stopping, rewrite
`docs/handover/ws-ia-calm-structure.md` (what is done, what is left, gotchas). Worktree needs
`npm ci` first.
