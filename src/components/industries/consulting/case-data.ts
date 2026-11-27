import type { Choice } from "./case-logic";

/** Fictional case. All numbers are invented for practice and say so on screen. */

export const PASSENGERS_PER_DAY = 40000;
export const SHARE_BUY_DRINK = 0.18;
export const SHARE_COFFEE = 0.6;
export const SHARE_CAPTURE = 0.25;
/** 40,000 x 18 % x 60 % x 25 % = 1,080 */
export const EXPECTED_COFFEES = Math.round(
  PASSENGERS_PER_DAY * SHARE_BUY_DRINK * SHARE_COFFEE * SHARE_CAPTURE,
);

export const PROMPT =
  "Una cadena de cafeterías quiere abrir un local dentro de una estación de tren de Madrid. " +
  "Su director te pregunta: ¿cuántos cafés al día podríamos vender? (Caso ficticio con datos inventados.)";

export const CLARIFYING: Choice[] = [
  {
    id: "scope",
    label: "¿Contamos solo café, o cualquier bebida caliente?",
    good: true,
    feedback: "Bien: fija qué producto medimos y evita discutir después.",
  },
  {
    id: "horizon",
    label: "¿Hablamos de un día laborable medio o del pico de la hora punta?",
    good: true,
    feedback: "Bien: define el periodo y cambia el orden de magnitud.",
  },
  {
    id: "objective",
    label: "¿Para qué se usa la cifra: decidir si abrir, o dimensionar plantilla?",
    good: true,
    feedback: "Bien: el objetivo decide cuánta precisión necesitas.",
  },
  {
    id: "ceo-name",
    label: "¿Cómo se llama el director general de la cadena?",
    good: false,
    feedback: "No aporta nada a la estimación. Pregunta solo lo que cambia tu respuesta.",
  },
  {
    id: "logo",
    label: "¿De qué color es el logo de la cadena?",
    good: false,
    feedback: "Irrelevante para el cálculo.",
  },
];

export const STRUCTURES: Choice[] = [
  {
    id: "funnel",
    label: "Embudo de demanda: viajeros, compran bebida, café, los que nos eligen",
    good: true,
    feedback: "Es la estructura más directa: cada paso es un porcentaje que puedes estimar.",
  },
  {
    id: "supply",
    label: "Oferta: cuántas tazas puede servir el local por hora × horas abiertas",
    good: false,
    feedback:
      "Sirve como tope de capacidad, no como estimación de demanda. Úsala para contrastar, no para empezar.",
  },
  {
    id: "swot",
    label: "Un análisis DAFO de la cadena",
    good: false,
    feedback:
      "Es un marco genérico: no produce un número. Elige estructuras que lleven a la cifra.",
  },
];

export const SYNTHESES: Choice[] = [
  {
    id: "answer-first",
    label:
      "Unos 1.080 cafés al día: es un orden de magnitud sólido, a validar con aforo real y con la capacidad del local.",
    good: true,
    feedback: "Respuesta primero, supuestos clave y siguiente paso. Así se sintetiza.",
  },
  {
    id: "list-only",
    label: "He multiplicado cuatro porcentajes y me ha salido un número.",
    good: false,
    feedback: "Describe el proceso, no responde. Empieza por la conclusión.",
  },
  {
    id: "no-answer",
    label: "Con estos datos no se puede estimar nada fiable.",
    good: false,
    feedback:
      "En una estimación se avanza con supuestos explícitos; negarse a responder rara vez vale.",
  },
];

export const CHECKLIST = [
  "Repetí la pregunta y fijé producto, periodo y objetivo antes de calcular.",
  "Expliqué mi estructura en voz alta antes de usar números.",
  "Dije cada supuesto y por qué es razonable.",
  "Hice una comprobación de sensatez del resultado (por ejemplo, cafés por hora).",
  "Empecé la conclusión por la respuesta, no por el proceso.",
] as const;
