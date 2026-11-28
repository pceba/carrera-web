# P15 Onboarding `/empezar` (handover)

Branch `claude/p15-onboarding-8d7fba`. Route `/empezar`, 4-step progress rail.

- `src/lib/onboarding/state.ts` (+ test): `path.onboarding.v1` = `{diagnostico|guia|encaje|candidatura: true}`.
  Pure helpers: sanitize, toggle, doneSteps (ticked OR detected), currentStep.
- `src/components/onboarding/Onboarding.tsx`: `useSyncExternalStore` over localStorage (no setState
  in effect; SSR renders "not ready"). Finish card when all four are done.
- Detection: step 3 via Encaje profile (`carrera-web.profile.v1`), step 4 via tracker entries
  (`path.applications.v1`). Steps 1 and 2 have a manual "Hecho" checkbox: the quiz keeps its result
  only in the `/diagnostico` URL hash and guides keep no read state, so nothing is detectable.
- `e2e/empezar.spec.ts`: tick persists, tracker detection, finish state, no overflow at 375 px.

## Requests (outside owned files)

- Link to `/empezar` from home hero and/or header nav (`src/components/ui/site-data.ts`,
  `src/app/(public)/page.tsx`), e.g. "Empieza aquí".
- Add `/empezar` to the sitemap if routes are listed there (P13).
- Step 2 links to `/industrias`; if the quiz ever stores its result locally, step 1 can auto-detect
  and step 2 can link to the top industry.

## Gotchas

- `npm run format:check` fails on 12 files not mine (others' parallel work); mine pass.
- Port 3000 was held by another session; I ran e2e with `BASE_URL=http://localhost:3200`.
