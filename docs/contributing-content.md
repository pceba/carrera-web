# Contributing content

For industry professionals and anyone who wants to fix or write a guide page. The public version of
this page (Spanish) is `/contribuir`.

## What we ask

1. **Sources.** Every factual claim in `content/` cites a source: an official site, regulation or a
   named study. Experience that has no source is written as experience, not as fact.
2. **Front matter.** Each section keeps `reviewer`, `reviewed_at`, `next_review` and the numbered
   `sources` list in its `meta.ts` (AGENTS.md rule 8). A reviewer replaces `"pendiente"` with their
   name and bumps both dates.
3. **Licence.** Text in `content/` is CC BY-SA 4.0 (ADR-004). Contributions are accepted under it.
4. **No pay per firm.** Pay is shown per level from named studies, never per firm. No sponsored
   content or paid rankings.
5. **Spain first.** Other countries only as a labelled contrast.
6. **Mentors.** Any future mentor contact is 18+ and voluntary.

## Workflow

1. Open an issue with "Revisar una página" or "Proponer una fuente"
   (`.github/ISSUE_TEMPLATE/`). No personal data is collected beyond what the author types.
2. Maintainer checks the source and answers in the issue.
3. A PR edits the MDX and `meta.ts`; the reviewer is credited by name and date.
4. Squash-merge; `next_review` is set (about six months).

Email contact (`contacto@`) is **TODO for Pablo**: not published until a mailbox exists.

## Editing the files

MDX lives in `content/industrias/<slug>/*.mdx`. Use `<Cite n={k} />` for source `k` in `meta.ts`.
Run `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`.
