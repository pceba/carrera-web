import { COMPORTAMIENTO_V1 } from "./prompts/comportamiento.v1";
import { CONSULTORIA_V1 } from "./prompts/consultoria.v1";
import { TECNICAS_V1 } from "./prompts/tecnicas.v1";

export type ModeId = "consultoria" | "tecnicas" | "comportamiento";

export type Criterion = { id: string; label: string; hint: string };

export type Mode = {
  id: ModeId;
  title: string;
  /** One line for the picker. */
  summary: string;
  /** Prompt version: shown nowhere in the UI but kept in the transcript file for traceability. */
  promptVersion: string;
  system: string;
  /** Short rubric: the feedback scores exactly these. */
  rubric: readonly Criterion[];
};

/** The first user message of every session. The prompts know to open the exercise when they see it. */
export const START_MESSAGE = "[INICIO]";

export const MODES: readonly Mode[] = [
  {
    id: "consultoria",
    title: "Caso de consultoría",
    summary: "El entrevistador lleva el caso: estructura, cálculo y recomendación.",
    promptVersion: "consultoria.v1",
    system: CONSULTORIA_V1,
    rubric: [
      {
        id: "estructura",
        label: "Estructura",
        hint: "Aclara el objetivo y ordena el problema en bloques claros.",
      },
      {
        id: "calculo",
        label: "Cálculo",
        hint: "Hace las cuentas con orden, comprueba órdenes de magnitud.",
      },
      {
        id: "sintesis",
        label: "Síntesis",
        hint: "Recomienda primero y justifica después, con riesgos.",
      },
      {
        id: "comunicacion",
        label: "Comunicación",
        hint: "Piensa en voz alta, es breve y se adapta a las pistas.",
      },
    ],
  },
  {
    id: "tecnicas",
    title: "Técnicas de finanzas",
    summary: "Contabilidad, valoración y bases de un LBO, de menos a más difícil.",
    promptVersion: "tecnicas.v1",
    system: TECNICAS_V1,
    rubric: [
      {
        id: "precision",
        label: "Precisión técnica",
        hint: "Los conceptos y las relaciones entre estados son correctos.",
      },
      {
        id: "razonamiento",
        label: "Razonamiento",
        hint: "Explica el porqué y llega a la respuesta paso a paso.",
      },
      { id: "claridad", label: "Claridad", hint: "Define los términos y responde sin rodeos." },
      {
        id: "honestidad",
        label: "Honestidad",
        hint: "Dice lo que no sabe y razona desde ahí en vez de inventar.",
      },
    ],
  },
  {
    id: "comportamiento",
    title: "Comportamiento (STAR)",
    summary: "Preguntas de equipo, conflicto, fracaso e iniciativa con el método STAR.",
    promptVersion: "comportamiento.v1",
    system: COMPORTAMIENTO_V1,
    rubric: [
      {
        id: "situacion",
        label: "Situación y tarea",
        hint: "Da contexto justo y deja claro qué se esperaba de él o ella.",
      },
      {
        id: "accion",
        label: "Acción propia",
        hint: "Cuenta lo que hizo personalmente, no solo lo que hizo el grupo.",
      },
      {
        id: "resultado",
        label: "Resultado",
        hint: "Cierra con un resultado concreto y comprobable.",
      },
      {
        id: "reflexion",
        label: "Reflexión",
        hint: "Extrae un aprendizaje creíble y coherente con su historia.",
      },
    ],
  },
];

export function getMode(id: ModeId): Mode {
  const mode = MODES.find((m) => m.id === id);
  if (!mode) throw new Error(`Unknown practice mode: ${id}`);
  return mode;
}
