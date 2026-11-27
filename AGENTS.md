# AGENTS.md — Path (repo `path`, formerly `carrera-web`)

Public, free, open-source website in **Spanish** for young people in Spain starting a career:
a hand-crafted guide per industry, selection-process prep, postings, alerts, BYOK practice, mentors.
Product plan and roadmap live in the private job-hunter repo (`docs/web_platform_plan.md`,
`docs/web_platform_roadmap.md`); the decisions that matter here are in `docs/decisions.md`.

## Hard rules

1. **UI copy in Spanish** (tú, direct, no hype). Code, comments, commits, docs in English.
2. **Zero running cost.** Free tiers only (Vercel Hobby, Supabase Free EU, Resend Free). Never add a paid service.
3. **BYOK only.** AI features use the user's own API key, kept in their browser. The owner's keys are never used.
4. **No scraping.** Only official APIs/feeds whose terms were read. No LinkedIn/Indeed scraping.
5. **16+ accounts**; any mentor contact is 18+. Collect the minimum personal data; GDPR, EU region.
6. **No secrets in git.** `.env*` is ignored; `.env.example` lists variable names only. Never read or print keys.
7. **No tracking without consent.** No analytics scripts by default.
8. Every factual claim in `content/` cites a source in front matter (`sources`, `reviewer`, `reviewed_at`, `next_review`).
9. Works at 375 px, keyboard-accessible, contrast AA or better. Colours/sizes come from `src/styles/tokens.css`.

## Ownership

One folder, one owning stream; list in `docs/ownership.md` and in each folder's README.
Edit only your own folders. Anything else is a request in your PR description.
Shared files (`package.json`, `tokens.css`, root layout) change only in WS0 or a tiny PR merged first.

## Workflow

- One branch + one PR per session (`ws-a/design-system`), squash-merged, small PRs.
- Before pushing: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`.
- Ask before adding dependencies or deleting files. Commit after each meaningful step.
- Read `PROGRESS.md` at session start; rewrite it (under ~40 lines) when you stop.

## Map

`src/app/` routes (`(public)`, `(account)`, `api`) · `src/components/` · `src/lib/` · `src/styles/` ·
`content/` (MDX, CC BY-SA) · `supabase/` · `crates/` (Rust engine, see `docs/architecture.md`) · `config/` (YAML rules) · `emails/` · `e2e/` · `docs/`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
