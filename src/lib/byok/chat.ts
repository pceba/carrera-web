import { buildRequest, explainNetwork, explainStatus, extractDelta } from "./providers";
import { createSseParser } from "./sse";
import { ByokError, type ChatRequest } from "./types";

/**
 * Streams one reply straight from the provider to this browser tab. There is deliberately no
 * route, server action or proxy of ours in between: the key never reaches our server.
 * `onText` receives the text so far (not the delta); the promise resolves with the full reply.
 */
export async function streamChat(
  req: ChatRequest,
  opts: { signal?: AbortSignal; onText?: (textSoFar: string) => void } = {},
): Promise<string> {
  const { url, init } = buildRequest(req);
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      signal: opts.signal,
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
  } catch (e) {
    if (opts.signal?.aborted) throw e;
    throw explainNetwork(req.provider);
  }
  if (!res.ok) throw explainStatus(req.provider, res.status);
  if (!res.body) throw new ByokError("other", "La respuesta llegó vacía.");

  let text = "";
  const parser = createSseParser((payload) => {
    const delta = extractDelta(req.provider, payload);
    if (!delta) return;
    text += delta;
    opts.onText?.(text);
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
  parser.end();
  if (!text.trim()) {
    throw new ByokError(
      "other",
      "El modelo no devolvió texto. Prueba de nuevo o cambia de modelo.",
    );
  }
  return text;
}
