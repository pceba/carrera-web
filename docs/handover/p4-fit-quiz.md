# Handover: P4 industry fit diagnostic

Branch `claude/p4-fit-quiz` (from local `main`). Not pushed.

## What exists

- `/diagnostico` (public, static page + client component). 8 questions, one per screen, radio
  options, "Siguiente"/"Atrás", progress "n de 8", focus moves to each new question.
- `src/lib/quiz/`: `questions.ts` (data, weights 0-3, one "por qué" phrase per option),
  `score.ts` (`rank`, `reasons`, `encodeAnswers`/`decodeAnswers`), tests in `quiz.test.ts`
  (brute-forces every answer combination: each industry can win outright; ties follow a fixed order).
- Result: six ranked with bars, top 2 highlighted with two "por qué" lines (the answers that pushed
  that industry most) and a guide link. Industries with `status: "preparing"` in `content/catalog.ts`
  say "Guía en preparación" and link to `/ofertas?industria=<rust slug>`.
- Sharing: answers live in the URL hash (`#r=13212431`), nothing is stored or sent. A malformed hash
  shows the first question. "Repetir" clears the hash.
- Motion is CSS only and wrapped in `prefers-reduced-motion: no-preference`.

## Decisions to know

- The AI industry slug is `inteligencia-artificial` (as in `content/catalog.ts`), not `roles-de-ia`;
  its label is "Roles de IA". Guide links are built from `/industrias/<catalog slug>`.
- Bars show score against the most that industry could reach with this question set (a tendency, not
  a measure); the page says so. Weights are qualitative and need a human read for tone.

## Requests for the redesign session

- Link `/diagnostico` from the home and from `/industrias` (and the nav if wanted).

## Not done / not verified

- Nothing outside the owned folders was edited. Wording of questions was not reviewed by Pablo.
