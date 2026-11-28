# P5 handover: `/practica`, interview practice with your own key

Branch `p5/byok` (from main at "Add briefs P5 and P6", not pushed). 2026-11-28.

## What it does

- `/practica`: the visitor pastes their own API key (Gemini, Anthropic or OpenAI), picks a mode and chats
  with an AI interviewer; at the end they get feedback as rubric cards and can download the transcript (.txt).
  Without a key: a demo transcript per mode and "¿Cómo consigo una clave?" (3 steps + official console link).
- **The key never reaches our server.** No API route, server action or proxy exists for this. `fetch` goes
  from the tab to the provider (`src/lib/byok/chat.ts`), key only in a request header (never URL or body),
  `credentials: "omit"`, `referrerPolicy: "no-referrer"`. The key input is not in a `<form>` and has no
  `name`, so it cannot be submitted or land in a URL. Storage: `sessionStorage` by default, `localStorage`
  only with "Recordar en este navegador", "Borrar clave" clears both (all in try/catch, `key-store.ts`).
- Transcript lives in React state only; nothing is persisted. Costs are explained on the page.

## Where things are

- `src/lib/byok/`: provider adapters (`providers.ts`: request builder, SSE delta extraction, 401/429/model/network
  messages), `sse.ts`, `chat.ts`, `key-store.ts`, `use-key.ts` (useSyncExternalStore), unit tests.
- `src/lib/practice/`: `modes.ts` (3 modes + 4-criterion rubrics), `prompts/*.v1.ts` (versioned Spanish prompts,
  shared rules in `shared.ts`), `feedback.ts` (JSON parse + clamp), `transcript.ts`, `demo.ts`, tests.
- `src/components/practice/` + `src/app/(public)/practica/`; `e2e/practica.spec.ts` (mocked provider via
  route interception; asserts no POST to our origin and the key absent from every own-origin request).

## Decisions and gotchas

- Defaults: `gemini-2.5-flash`, `claude-haiku-5-5`, `gpt-4o-mini`; the model field is editable.
- **CSP:** the site sets no CSP today, so nothing was added. If one is added later, `connect-src` needs exactly
  `https://generativelanguage.googleapis.com https://api.anthropic.com https://api.openai.com`.
- The first message of every session is the marker `[INICIO]` (hidden in the UI and the download); prompts
  rely on it. Feedback asks for JSON only; if it is unparseable the raw text is shown instead of cards.
- Prompts forbid inventing firm facts or pay; cases and numbers are fictitious and the page says so.

## Outside the owned folders (one entry, as agreed)

`src/components/ui/site-data.ts` (route + "Práctica con IA" in TOOLS and footer), `ui/Header.tsx` (icon map),
`marketing/ToolsBento.tsx` (the "Práctica con IA" tile is live, no longer "Pronto").

## Not done

- Not tried against the real APIs (no keys here): request shapes follow each provider's documented streaming API;
  if one rejects a field, `providers.ts` is the only place to fix.
- No per-session spend cap or token counter; the page tells users to set one in their provider's console.
