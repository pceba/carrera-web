import type { ChatMessage } from "../byok";
import { START_MESSAGE, type Mode } from "./modes";
import { feedbackPromptV1 } from "./prompts/feedback.v1";

export type Feedback = {
  summary: string;
  criteria: { id: string; label: string; score: number; comment: string }[];
  nextSteps: string[];
};

/** The request that asks for feedback: the whole transcript as one user message. */
export function feedbackRequest(mode: Mode, messages: ChatMessage[]) {
  const transcript = messages
    .filter((m) => m.content !== START_MESSAGE)
    .map((m) => `${m.role === "user" ? "CANDIDATO" : "ENTREVISTADOR"}: ${m.content}`)
    .join("\n\n");
  return {
    system: feedbackPromptV1(mode.rubric),
    messages: [{ role: "user" as const, content: `Transcripción de la sesión:\n\n${transcript}` }],
  };
}

/** Pulls the first {...} block out of the reply, so a stray code fence or sentence doesn't break it. */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no json");
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Validates the model's JSON against the mode's rubric. Missing criteria get score 0 ("sin
 * evaluar") rather than inventing one; scores are clamped to 1-5. Returns null if unusable.
 */
export function parseFeedback(text: string, mode: Mode): Feedback | null {
  let raw: unknown;
  try {
    raw = extractJson(text);
  } catch {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const list = Array.isArray(o.criterios) ? (o.criterios as Record<string, unknown>[]) : [];
  const criteria = mode.rubric.map((c) => {
    const found = list.find((x) => x?.id === c.id);
    const n = Number(found?.puntuacion);
    return {
      id: c.id,
      label: c.label,
      score: Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 0,
      comment: typeof found?.comentario === "string" ? found.comentario : "",
    };
  });
  if (criteria.every((c) => c.score === 0)) return null;
  const steps = Array.isArray(o.siguientes_pasos)
    ? (o.siguientes_pasos as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  return {
    summary: typeof o.resumen === "string" ? o.resumen : "",
    criteria,
    nextSteps: steps.slice(0, 5),
  };
}
