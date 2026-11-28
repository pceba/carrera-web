# Resend setup (daily alert emails)

Steps for Pablo. The code and the daily job already exist; this only wires the account. **Never
commit keys**: they live in GitHub secrets and in the host's environment settings, nowhere else.

## 1. Account (free)

1. Create a free account at resend.com (the free tier is enough: the job caps itself at 90 emails
   a day, under the free daily limit). Use the EU region if offered.
2. Create an API key with "Sending access" only. Copy it once; you cannot read it again.

## 2. Sender

- **To try it first:** Resend's test sender (`onboarding@resend.dev`) only delivers to the email
  address of your own Resend account. Good enough to check that one digest arrives.
- **For real users:** add and verify a domain in Resend (it asks for SPF and DKIM DNS records at
  your registrar; wait until both show "Verified"). Then use a sender such as
  `Path <avisos@your-domain>`. The domain is still to be decided (`docs/naming.md`).

## 3. GitHub secrets (repo Settings > Secrets and variables > Actions)

| Secret                      | Value                                                         |
| --------------------------- | ------------------------------------------------------------- |
| `RESEND_API_KEY`            | the key from step 1                                           |
| `ALERTS_FROM`               | the sender from step 2                                        |
| `SITE_URL`                  | public site URL, no trailing slash (unsubscribe links use it) |
| `SUPABASE_URL`              | Supabase project URL                                          |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (Supabase > Project settings > API)          |

If any of the five is missing, `.github/workflows/alerts.yml` runs a dry run and sends nothing.
Run it by hand first with "Run workflow" and `dry_run` on, and read the counts in the log.

## 4. `ALERTS_LIVE` (the website)

The page `/cuenta/alertas` says "Los envíos aún están en pruebas" until the **web host's**
environment (for example Vercel > Settings > Environment Variables) has `ALERTS_LIVE=true`. It is a
plain flag, not a secret. Set it only after a real digest has arrived, then redeploy.

## 5. Before opening to everyone

- Apply the migration `20261127180000_alert_subscriptions.sql` (`npx supabase db push`).
- Subscribe with a test account, then open the link in the email: `/alertas/baja?token=...` must
  show "Listo, te hemos dado de baja" and the subscription must show "En pausa" in your account.
