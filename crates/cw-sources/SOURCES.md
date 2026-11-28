# Sources and their terms

Re-read on **2026-11-27** for public display on Path (free, non-commercial, no sign-up needed to
view listings). job-hunter only checked personal use, so each source was checked again. Rule for all of
them: show the source name on every card and link to the **original** listing (`source_url`); never copy
descriptions (the pipeline does not even fetch them). Re-check the terms before adding a new use
(for example, e-mail alerts built from listings).

| Source                                                               | Decision                  | Terms and what we do                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Greenhouse, Lever, Ashby, Workable, SmartRecruiters (company boards) | Kept                      | Public job-board APIs that exist so employers' postings can be listed elsewhere (Greenhouse Job Board API, Lever Postings API, Ashby public posting API, Workable widget, SmartRecruiters Posting API). One GET per company per day; company name shown with the link to its own application page. Boards are listed in `config/companies.yaml`.                                        |
| Remotive (`remotive.com/api/remote-jobs`)                            | Kept, with conditions     | Terms: <https://github.com/remotive-com/remote-jobs-api>. Must link back to the Remotive URL **and** name Remotive; do not pass jobs on to other job sites; do not show jobs to collect sign-ups or e-mails for a listing; max 4 requests/day (we do 1). Jobs are delayed 24 h by Remotive. **Do not use Remotive listings in alert e-mails or behind a login.**                                   |
| Jobicy (`jobicy.com/api/v2/remote-jobs`)                             | Kept, terms partly unread | The terms page (`jobicy.com/remote-jobs-api`) is behind a Cloudflare bot check and could not be read from a script; we did not bypass it. The API's own notice says: credit Jobicy with a direct link and send application buttons to the original URL. job-hunter's earlier note adds one sync per hour at most (we do 1/day). **Pablo: please read the page once by hand.**                      |
| Adzuna (`api.adzuna.com`)                                            | Kept, off until key added | Terms: <https://developer.adzuna.com/docs/terms_of_service>. "Publishing Adzuna ad listings" is a permitted use if each listing is labelled "Adzuna" (at least 116 x 23 px) hyperlinked to the Adzuna site. The free tier is meant for evaluation; commercial use needs a licence. Free tier limits are far above our ~14 requests/day. Skipped when `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` are not set. |

## Company boards: coverage by industry (verified 2026-11-28)

Each slug in `config/companies.yaml` was fetched from its public endpoint (HTTP 200, at least one
Spain location). Terms are the same for all five ATSs: public, unauthenticated feeds published so
employers' postings can be listed elsewhere; one GET per board per day; link to the original.

- Consulting: Sopra Steria, ALTEN (SmartRecruiters), Celonis, Quantexa. Big 4 and MBB use Workday or
  their own sites: none found on the five ATSs.
- Banking / fintech: N26, Stripe, Adyen, Finom, Raisin, Pennylane, Mollie, Qonto, Pleo, Alan, ...
  Investment banks (Lazard, Rothschild, Alantra, Arcano, ...): no public board found.
- Data science and AI roles: Datadog, Databricks, Elastic, Anthropic, OpenAI, ElevenLabs, n8n.
- Private equity (CVC, Permira, Cinven, EQT, Magnum, Portobello, ...): no public board found.
- Big law (Garrigues, Cuatrecasas, Uria, Linklaters, ...): no public board found. Legora and Harvey
  (legal AI) list a few Spain roles.

PE, IB and big law are therefore expected to show few or no rows; we do not force them with
scraping or aggregators. Spanish IB/PE/law postings come only through Adzuna if keys are added.

## Dropped

- LinkedIn, Indeed, InfoJobs-style boards, Google Jobs: no public API for this use and scraping is
  forbidden by `AGENTS.md` rule 4.
- Workday/SuccessFactors boards (Big 4, banks): no official public API; Adzuna covers part of them.

## Secrets

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (required to write), `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
(optional). GitHub Actions secrets only; never in git.
