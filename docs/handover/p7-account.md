# Handover: P7 sign-in UX and "Mi Path" hub

Branch `claude/p7-account` (from local `main`). Not pushed.

## What changed

- `/entrar` has two tabs, **Entrar** and **Crear cuenta** (`?modo=crear`), as plain links
  (`src/components/account/AuthTabs.tsx`). Crear cuenta requires birth year and the 16+ box
  (browser-required and re-checked in the action); Entrar sends only the email with
  `shouldCreateUser: false`. The action takes a hidden `mode` field, and every error redirect keeps
  the mode (and `next`). Error codes are unchanged, `limite` included.
- After "enviado": tips (spam, link valid about an hour and single use, same browser). In Entrar
  mode a generic "create an account" hint is shown to everyone, so it reveals nothing.
- `/cuenta` is now "Mi Path": greeting, Candidaturas (counts per stage + next 14 days from
  `public.applications`), Alertas (state from `alert_subscriptions`), Encaje (client card that reads
  the profile saved in this browser), Diagnostico and Calendario CTAs, "Tus datos" (export, sign
  out). The profile form and delete-account panel stay below, with the existing actions.
- Reads are server-side under RLS; a failed query (table not migrated) shows the empty state.

## Not verified

- The signed-in hub and the real magic-link send need Supabase: only the signed-out pages are in
  e2e (tabs, errors, tips, `/cuenta` redirect). Check the hub by hand once with a test account.
- `/calendario` is linked but belongs to P2a; if it is not merged yet the link 404s.
- Encaje card links to `/cuenta/encaje`; P8 may move Encaje to a public `/encaje`, update the link.

## Edits outside owned folders

None (`account.module.css` untouched; new styles live in `src/components/account/`).
