# Handover: P2b alerts UI

Branch `claude/p2b-alerts` (from local `main`). Not pushed.

## What exists

- `/cuenta/alertas` (signed-in only; middleware sends others to `/entrar?next=...`).
  Step 1: explicit opt-in checkbox, inserts a `consents` row with `marketing_opt_in`. Step 2
  (`?paso=2`): preferences, prefilled from the Encaje profile in this browser if one exists, then
  inserts the subscription with the latest opt-in `consent_id`. With a subscription: status
  (Activa / En pausa), pause/resume, edit, delete (confirm in a `Dialog`).
- "Los envíos aún están en pruebas" shows until the web host has `ALERTS_LIVE=true`.
- `/alertas/baja?token=`: public, calls `unsubscribe_alerts(token)`. A non-UUID token never hits the
  DB; the answer is the same for valid, used and unknown tokens. Only an RPC/config failure shows
  an error page.
- `src/lib/alerts/`: UI-slug to English mapping (`industries.ts`, tested), preference validation
  with the table limits (`validate.ts`), tests in `alerts.test.ts`.
- `docs/resend-setup.md`: account, sender, GitHub secrets, `ALERTS_LIVE`.

## Not verified

- Signed-in flows (consent, subscribe, pause, delete, real unsubscribe): they need a Supabase with
  `20261127180000_alert_subscriptions.sql` applied (never run on a real DB, see `ws-f-alerts.md`).
  e2e covers only the bogus-token page and the signed-out redirect.
- Prefill from Encaje relies on `loadProfile()` in the browser; not exercised in e2e.

## Requests (not my folders)

- Link `/cuenta/alertas` from `src/app/(account)/cuenta/page.tsx` (P1 added a panel there too).
- A GET unsubscribe can be triggered by mail scanners that prefetch links; fine for now, consider a
  confirm button if it shows up in practice.

## Edits outside owned folders

None.
