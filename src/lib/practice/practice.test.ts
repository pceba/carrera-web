import { describe, expect, it } from "vitest";
import { feedbackRequest, parseFeedback } from "./feedback";
import { getMode, MODES, START_MESSAGE } from "./modes";
import { transcriptText } from "./transcript";

const mode = getMode("consultoria");

describe("modes", () => {
  it("has three modes, each with a Spanish prompt, a rubric of four and the start convention", () => {
    expect(MODES.map((m) => m.id)).toEqual(["consultoria", "tecnicas", "comportamiento"]);
    for (const m of MODES) {
      expect(m.rubric).toHaveLength(4);
      expect(m.system).toContain(START_MESSAGE);
      expect(m.system).toContain("No inventes datos reales");
      expect(m.promptVersion).toMatch(/\.v\d+$/);
    }
  });
});

describe("parseFeedback", () => {
  const good = JSON.stringify({
    resumen: "Buen inicio.",
    criterios: [
      { id: "estructura", puntuacion: 4, comentario: "Ordenaste en ingresos y costes." },
      { id: "calculo", puntuacion: 9, comentario: "" },
      { id: "sintesis", puntuacion: 2, comentario: "Sin recomendación." },
    ],
    siguientes_pasos: ["Practica estimaciones", "Resume en 30 segundos", 7],
  });

  it("clamps scores, leaves missing criteria unrated and keeps rubric order", () => {
    const f = parseFeedback(good, mode)!;
    expect(f.criteria.map((c) => c.id)).toEqual(mode.rubric.map((c) => c.id));
    expect(f.criteria.map((c) => c.score)).toEqual([4, 5, 2, 0]);
    expect(f.nextSteps).toEqual(["Practica estimaciones", "Resume en 30 segundos"]);
  });

  it("finds JSON inside a code fence or surrounding prose", () => {
    expect(parseFeedback("Aquí está:\n```json\n" + good + "\n```", mode)).not.toBeNull();
  });

  it("returns null for unusable replies", () => {
    expect(parseFeedback("lo siento, no puedo", mode)).toBeNull();
    expect(parseFeedback('{"criterios": []}', mode)).toBeNull();
  });
});

describe("feedbackRequest and transcript", () => {
  const messages = [
    { role: "user" as const, content: START_MESSAGE },
    { role: "assistant" as const, content: "Caso: una panadería." },
    { role: "user" as const, content: "Preguntaría por el objetivo." },
  ];

  it("leaves the start marker out of the transcript sent for feedback", () => {
    const req = feedbackRequest(mode, messages);
    const body = req.messages[0]!.content;
    expect(body).not.toContain(START_MESSAGE);
    expect(body).toContain("ENTREVISTADOR: Caso: una panadería.");
    expect(req.system).toContain("estructura");
  });

  it("writes a plain-text download without the marker and with the feedback", () => {
    const f = parseFeedback(
      JSON.stringify({
        resumen: "Ok",
        criterios: [{ id: "estructura", puntuacion: 3, comentario: "x" }],
      }),
      mode,
    );
    const text = transcriptText(mode, messages, f, new Date("2026-11-28T10:00:00Z"));
    expect(text).toContain("Fecha: 2026-11-28 · Guion consultoria.v1");
    expect(text).not.toContain(START_MESSAGE);
    expect(text).toContain("TÚ:\nPreguntaría por el objetivo.");
    expect(text).toContain("Estructura: 3/5");
    expect(text).toContain("Cálculo: sin evaluar");
  });
});
