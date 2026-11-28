import { ByokError, type ChatRequest, type ProviderId } from "./types";

/**
 * One small adapter per provider. Requests go straight from the browser to the provider's API:
 * the key travels only in a header of that request (never in a URL, never to our server).
 * These three hosts are the only `connect-src` the site would need if it ever sets a CSP.
 */
export type ProviderInfo = {
  id: ProviderId;
  label: string;
  host: string;
  defaultModel: string;
  keyPlaceholder: string;
  /** Short note shown next to the provider choice. */
  blurb: string;
  consoleUrl: string;
  /** Three steps to get a key, in Spanish, pointing at the official console. */
  steps: readonly [string, string, string];
};

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    host: "generativelanguage.googleapis.com",
    defaultModel: "gemini-2.5-flash",
    keyPlaceholder: "AIza…",
    blurb: "Tiene nivel gratuito con límites: la opción más sencilla para empezar.",
    consoleUrl: "https://aistudio.google.com/apikey",
    steps: [
      "Entra en Google AI Studio con tu cuenta de Google.",
      "Pulsa «Create API key» y elige un proyecto (o crea uno nuevo).",
      "Copia la clave y pégala aquí. Comprueba en la consola los límites del nivel gratuito.",
    ],
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic (Claude)",
    host: "api.anthropic.com",
    defaultModel: "claude-haiku-5-5",
    keyPlaceholder: "sk-ant-…",
    blurb: "Se paga por uso: añade saldo en la consola antes de empezar.",
    consoleUrl: "https://console.anthropic.com/settings/keys",
    steps: [
      "Entra en la consola de Anthropic y añade un poco de saldo en «Billing».",
      "En «API keys» pulsa «Create key» y ponle un nombre.",
      "Copia la clave (solo se muestra una vez) y pégala aquí.",
    ],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    host: "api.openai.com",
    defaultModel: "gpt-4o-mini",
    keyPlaceholder: "sk-…",
    blurb: "Se paga por uso: necesita saldo en tu cuenta de la plataforma.",
    consoleUrl: "https://platform.openai.com/api-keys",
    steps: [
      "Entra en la plataforma de OpenAI y añade saldo en «Billing».",
      "En «API keys» pulsa «Create new secret key».",
      "Copia la clave (solo se muestra una vez) y pégala aquí.",
    ],
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

/** Builds the `fetch` arguments for a streaming chat call. Pure, so it can be unit-tested. */
export function buildRequest(req: ChatRequest): { url: string; init: RequestInit } {
  const { provider, key, model, system, messages } = req;
  const maxTokens = req.maxTokens ?? 1024;
  const json = { "content-type": "application/json" };

  if (provider === "gemini") {
    return {
      url: `https://${PROVIDERS.gemini.host}/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      init: {
        method: "POST",
        headers: { ...json, "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        }),
      },
    };
  }

  if (provider === "anthropic") {
    return {
      url: `https://${PROVIDERS.anthropic.host}/v1/messages`,
      init: {
        method: "POST",
        headers: {
          ...json,
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          // Required by Anthropic to allow calls from a browser with the user's own key.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system,
          stream: true,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      },
    };
  }

  return {
    url: `https://${PROVIDERS.openai.host}/v1/chat/completions`,
    init: {
      method: "POST",
      headers: { ...json, authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: maxTokens,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    },
  };
}

/** Text carried by one streamed `data:` payload ("" when it carries none). */
export function extractDelta(provider: ProviderId, payload: string): string {
  if (!payload || payload === "[DONE]") return "";
  let data: unknown;
  try {
    data = JSON.parse(payload);
  } catch {
    return "";
  }
  const d = data as Record<string, unknown>;

  if (provider === "gemini") {
    const parts = (d.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined)?.[0]
      ?.content?.parts;
    return (parts ?? []).map((p) => p.text ?? "").join("");
  }
  if (provider === "anthropic") {
    if (d.type === "error") {
      const message = (d.error as { message?: string } | undefined)?.message;
      throw new ByokError(
        "other",
        `Anthropic devolvió un error durante la respuesta: ${message ?? "desconocido"}.`,
      );
    }
    if (d.type === "content_block_delta") {
      return (d.delta as { text?: string } | undefined)?.text ?? "";
    }
    return "";
  }
  return (d.choices as { delta?: { content?: string } }[] | undefined)?.[0]?.delta?.content ?? "";
}

/** A clear Spanish message for an HTTP failure. Never includes the key or the raw body. */
export function explainStatus(provider: ProviderId, status: number): ByokError {
  const name = PROVIDERS[provider].label;
  if (status === 401 || status === 403) {
    return new ByokError(
      "auth",
      `${name} no acepta la clave (error ${status}). Revisa que la has copiado entera y que está activa en su consola.`,
    );
  }
  if (status === 429) {
    return new ByokError(
      "rate",
      `${name} dice que has llegado al límite (error 429): demasiadas peticiones, o sin saldo o cuota. Espera un minuto o revisa tu plan y tu saldo en la consola.`,
    );
  }
  if (status === 404 || status === 400) {
    return new ByokError(
      "model",
      `${name} rechazó la petición (error ${status}). Lo más probable es que el nombre del modelo no exista en tu cuenta: prueba con el modelo por defecto.`,
    );
  }
  if (status >= 500) {
    return new ByokError(
      "other",
      `${name} tiene un problema ahora mismo (error ${status}). Inténtalo en unos minutos.`,
    );
  }
  return new ByokError("other", `${name} devolvió el error ${status}.`);
}

/** A `fetch` that throws before any response (offline, blocked, or CORS refused). */
export function explainNetwork(provider: ProviderId): ByokError {
  const { label, host } = PROVIDERS[provider];
  return new ByokError(
    "network",
    `No se pudo conectar con ${label} (${host}). Comprueba tu conexión y que ninguna extensión o red (bloqueadores, VPN de empresa o de la universidad) bloquee esa dirección. Si el navegador es muy antiguo, el servicio puede rechazar llamadas directas (CORS).`,
  );
}
