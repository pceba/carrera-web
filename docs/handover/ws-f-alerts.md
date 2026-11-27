# Handover: WS-F1 alerts core

## Done

- `crates/cw-alerts`: `digest` (new postings only, `cw-match` ranking, top 10, min score 50, no empty
  digests), `render` (Spanish text + HTML, unsubscribe link, escaped), `resend` (HTTP API),
  `store` (PostgREST: `alert_recipients()` RPC, new postings, `mark_sent`), `run` (daily cap 90),
  `demo` (fictional data). 15 unit tests, wiremock for Resend and PostgREST.
- Migration `20261127180000_alert_subscriptions.sql`: table, RLS, column grants, `unsubscribe_alerts(token)`,
  `alert_recipients()`. **Not run against a real Postgres** (no database yet): apply it to Supabase
  and try it before trusting it.
- `.github/workflows/alerts.yml`: 06:17 UTC daily, dry run unless all secrets exist.
- ADR-005 in `docs/decisions.md`.

## Dry run today

`cargo run -p cw-alerts -- run --dry-run` (add `--preview` to print one fictional email) prints counts:
`recipients=2 candidates=3 digests=1 skipped_empty=1 over_cap=0 sent=0 would_send=1 failed=0`.

## Left

- Pablo: Supabase EU + apply migrations; Resend account and a verified sender domain; secrets
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ALERTS_FROM`, `SITE_URL`.
- WS-F2: `/cuenta/alertas` (insert a `consents` row with `marketing_opt_in`, then the subscription
  with its `consent_id`) and the `/alertas/baja?token=` route calling `unsubscribe_alerts`.
- Mail deliverability (SPF/DKIM) is a Resend domain setup, not code.

## Gotchas

- "New" means `postings.first_seen_at`, not `posted_at` (many sources have no date).
- Never log addresses or tokens: `Recipient`, `Resend` and `Store` hide them in `Debug`; keep it so.
- The unsubscribe URL path `/alertas/baja` is a contract with WS-F2.
- Sending requires `SITE_URL`; the demo placeholder domain is for dry runs only.
