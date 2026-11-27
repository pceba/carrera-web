# Brief WS-F1: cw-alerts core, dry run (about 1 hour)

Daily digest of new postings, by email through Resend's free tier, run as a GitHub Actions job.
Supabase and Resend are not connected yet, so everything must work in dry-run mode without
secrets. Read `AGENTS.md`, `docs/architecture.md`, `docs/decisions.md` (008, ADR-001..004),
`crates/cw-match`, `crates/cw-pipeline` (how it talks to PostgREST) and
`supabase/migrations/` first.

## You own

`crates/cw-alerts/` (new), `emails/`, one new migration in `supabase/migrations/`, a new workflow
`.github/workflows/alerts.yml`, `Cargo.toml` members, `docs/decisions.md` (one ADR entry). Do not
touch `src/app/`, `src/components/`, `content/`, other crates' behaviour.

## Deliverable

1. Migration `alert_subscriptions`: user id, profile fields used by `cw-match` (industries from the
   six, roles, skills, locations, remote), `active`, `last_sent_at`, unsubscribe token; RLS so
   users manage only their own row; consent recorded through the existing `consents` table.
2. `crates/cw-alerts`: given subscriptions and postings, build one digest per user (only postings
   newer than `last_sent_at`, ranked by `cw-match`, top 10, skip empty digests). Render plain-text
   and simple HTML in Spanish with an unsubscribe link. Send through Resend's HTTP API only when
   `RESEND_API_KEY` is set; otherwise print what would be sent (`--dry-run` is the default).
   Unit tests with fictional data.
3. `.github/workflows/alerts.yml`: daily, after the postings job, runs `cw-alerts --dry-run`
   unless the secrets exist. Never print secrets or email addresses in logs (count only).

Gates: fmt, clippy -D warnings, test, web checks. Never one email per posting. Commit after each
step; no push, no merge; write `docs/handover/ws-f-alerts.md` before stopping.
