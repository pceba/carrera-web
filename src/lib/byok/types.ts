export type ProviderId = "gemini" | "anthropic" | "openai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatRequest = {
  provider: ProviderId;
  key: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
};

/** Why a call failed, in terms the UI can explain. Messages are Spanish and never contain the key. */
export type ByokErrorKind = "auth" | "rate" | "model" | "network" | "other";

export class ByokError extends Error {
  readonly kind: ByokErrorKind;
  constructor(kind: ByokErrorKind, message: string) {
    super(message);
    this.name = "ByokError";
    this.kind = kind;
  }
}
