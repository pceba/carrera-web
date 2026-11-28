import type { ChatMessage } from "../byok";
import type { Feedback } from "./feedback";
import { START_MESSAGE, type Mode } from "./modes";

/** Plain-text transcript for "Descargar transcripción". Never contains the key. */
export function transcriptText(
  mode: Mode,
  messages: ChatMessage[],
  feedback: Feedback | null,
  date = new Date(),
): string {
  const lines = [
    `Práctica de entrevista · ${mode.title}`,
    `Fecha: ${date.toISOString().slice(0, 10)} · Guion ${mode.promptVersion}`,
    "Transcripción generada en tu navegador; Path no guarda nada de esta sesión.",
    "",
  ];
  for (const m of messages) {
    if (m.content === START_MESSAGE) continue;
    lines.push(`${m.role === "user" ? "TÚ" : "ENTREVISTADOR"}:`, m.content, "");
  }
  if (feedback) {
    lines.push("--- FEEDBACK (generado por IA, puede equivocarse) ---", feedback.summary, "");
    for (const c of feedback.criteria) {
      lines.push(
        `${c.label}: ${c.score ? `${c.score}/5` : "sin evaluar"}${c.comment ? ` · ${c.comment}` : ""}`,
      );
    }
    if (feedback.nextSteps.length) {
      lines.push("", "Siguientes pasos:", ...feedback.nextSteps.map((s) => `- ${s}`));
    }
  }
  return lines.join("\n");
}
