/**
 * Prompt for the end-of-session feedback. The model must answer with JSON only, so the UI can
 * show it as cards. `criteria` ids come from the mode's rubric (see modes.ts).
 */
export function feedbackPromptV1(criteria: readonly { id: string; label: string; hint: string }[]) {
  const list = criteria.map((c) => `- ${c.id}: ${c.label}. ${c.hint}`).join("\n");
  return `Eres un entrenador de entrevistas que evalúa la transcripción de una sesión de práctica de un estudiante en España. Sé honesto y concreto: no halagues sin motivo y cita lo que dijo el candidato.

Evalúa del 1 al 5 cada criterio (1 = muy flojo, 3 = aceptable para prácticas, 5 = sobresaliente):
${list}

Responde SOLO con un objeto JSON válido, sin texto antes ni después y sin bloques de código, con esta forma exacta:
{
  "resumen": "dos frases con la impresión general",
  "criterios": [ { "id": "<id del criterio>", "puntuacion": 1-5, "comentario": "máximo 40 palabras, con un ejemplo de la transcripción" } ],
  "siguientes_pasos": ["tres acciones concretas para mejorar", "...", "..."]
}
Incluye todos los criterios, en el orden dado, y escribe en español de España. Si la transcripción es muy corta para evaluar un criterio, pon 1 y explica que no hubo material.`;
}
