# P16 `/contribuir`

Branch `claude/p16-contribuir-feef42`. Done: page `src/app/(public)/contribuir/` (what we ask,
4-step workflow, what reviewers get, mentors 18+ callout, no form), `docs/contributing-content.md`,
issue templates `review-page.yml` and `propose-source.yml`, `e2e/contribuir.spec.ts`.

Requests for other owners (not touched):

- Link `/contribuir` from the footer/header (`site-data.ts`, `Footer`) and the sitemap (P13).
- Issue templates use labels `revisión` and `fuente`; create them in the repo (GitHub otherwise
  ignores unknown labels silently).
- Pablo: `contacto@` mailbox is a TODO; no address is shown on the page (comment in `page.tsx`).
- Issue links assume repo `pceba/path` (`REPO_URL`) and that issue forms are enabled.
- Decide if reviewer credit should also appear in `meta.ts` automatically: today a PR replaces
  `reviewer: "pendiente"` by hand.
