import { describe, expect, it } from "vitest";
import { buildRequest, explainNetwork, explainStatus, extractDelta, PROVIDERS } from "./providers";
import { maskKey } from "./key-store";
import { createSseParser } from "./sse";
import type { ChatRequest, ProviderId } from "./types";

const KEY = "SECRET-KEY-1234567890";
const base = (provider: ProviderId): ChatRequest => ({
  provider,
  key: KEY,
  model: PROVIDERS[provider].defaultModel,
  system: "Eres un entrevistador.",
  messages: [
    { role: "user", content: "Hola" },
    { role: "assistant", content: "Buenas" },
    { role: "user", content: "Sigamos" },
  ],
});

describe("buildRequest", () => {
  it("sends the key only in a header, never in the URL or the body", () => {
    for (const p of Object.keys(PROVIDERS) as ProviderId[]) {
      const { url, init } = buildRequest(base(p));
      expect(url.startsWith(`https://${PROVIDERS[p].host}/`)).toBe(true);
      expect(url).not.toContain(KEY);
      expect(String(init.body)).not.toContain(KEY);
      expect(JSON.stringify(init.headers)).toContain(KEY);
    }
  });

  it("uses each provider's own auth header and roles", () => {
    const g = buildRequest(base("gemini"));
    expect((g.init.headers as Record<string, string>)["x-goog-api-key"]).toBe(KEY);
    expect(JSON.parse(String(g.init.body)).contents[1].role).toBe("model");

    const a = buildRequest(base("anthropic"));
    const ah = a.init.headers as Record<string, string>;
    expect(ah["anthropic-dangerous-direct-browser-access"]).toBe("true");
    expect(ah["x-api-key"]).toBe(KEY);
    expect(JSON.parse(String(a.init.body)).model).toBe("claude-haiku-5-5");

    const o = buildRequest(base("openai"));
    expect((o.init.headers as Record<string, string>).authorization).toBe(`Bearer ${KEY}`);
    expect(JSON.parse(String(o.init.body)).messages[0].role).toBe("system");
  });
});

describe("streaming", () => {
  it("joins lines split across chunks and ignores non-data lines", () => {
    const got: string[] = [];
    const sse = createSseParser((p) => got.push(p));
    sse.feed('event: x\r\ndata: {"a":');
    sse.feed("1}\n\ndata: [DONE]");
    sse.end();
    expect(got).toEqual(['{"a":1}', "[DONE]"]);
  });

  it("extracts text deltas per provider", () => {
    expect(
      extractDelta(
        "gemini",
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "Hola" }] } }] }),
      ),
    ).toBe("Hola");
    expect(
      extractDelta(
        "anthropic",
        JSON.stringify({ type: "content_block_delta", delta: { text: "Qué" } }),
      ),
    ).toBe("Qué");
    expect(extractDelta("anthropic", JSON.stringify({ type: "message_start" }))).toBe("");
    expect(
      extractDelta("openai", JSON.stringify({ choices: [{ delta: { content: "tal" } }] })),
    ).toBe("tal");
    expect(extractDelta("openai", "[DONE]")).toBe("");
    expect(extractDelta("openai", "not json")).toBe("");
  });

  it("turns an Anthropic stream error into a ByokError", () => {
    expect(() =>
      extractDelta(
        "anthropic",
        JSON.stringify({ type: "error", error: { message: "overloaded" } }),
      ),
    ).toThrow(/overloaded/);
  });
});

describe("error messages", () => {
  it("explains 401, 429, model and network failures without leaking the key", () => {
    expect(explainStatus("openai", 401).kind).toBe("auth");
    expect(explainStatus("gemini", 429).kind).toBe("rate");
    expect(explainStatus("anthropic", 404).kind).toBe("model");
    expect(explainNetwork("anthropic").kind).toBe("network");
    expect(explainNetwork("anthropic").message).toContain("api.anthropic.com");
    for (const s of [401, 403, 404, 429, 500]) {
      expect(explainStatus("openai", s).message).not.toContain(KEY);
    }
  });
});

describe("maskKey", () => {
  it("shows only the ends", () => {
    expect(maskKey(KEY)).toBe("SECR••••7890");
    expect(maskKey("short")).toBe("••••");
  });
});
