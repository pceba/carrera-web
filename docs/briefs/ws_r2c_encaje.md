# Brief WS-R2c: /cuenta/encaje, CV matching in the browser (about 1 hour)

WS-R2a/b and WS-IA are on main. Same ownership as `docs/briefs/ws_r2_matching.md`, plus
`src/app/(account)/cuenta/encaje/`, `src/app/dev/encaje/`, `src/components/match/` and e2e specs
for these pages. Use the UI primitives and nav components as they are.

## Deliverable

1. `/cuenta/encaje`: upload a CV (PDF, DOCX, TXT) read by `src/lib/wasm/` (`parse_cv`); say clearly
   on the page that the file never leaves the browser. Review and edit the detected profile
   (industries limited to the six, roles, skills, languages, locations, remote preference). Ranked
   postings from `src/lib/postings/` via `rank`, with the reasons; present it as an order, not a
   verdict (postings have titles only). Profile kept in `localStorage` (try/catch); saving to the
   account is optional, structured fields only, never the CV text. Load the WASM lazily so other
   pages pay nothing.
2. `/dev/encaje`: same component without a session, only when `NODE_ENV !== "production"`.
3. e2e on `/dev/encaje` with the fictional CV fixture: upload, edit a skill, see reasons. Works
   at 375 px and by keyboard.

All checks pass (Rust gates untouched, web checks, e2e). Commit after each step; no push; update
`docs/handover/ws-r2-matching.md`.
