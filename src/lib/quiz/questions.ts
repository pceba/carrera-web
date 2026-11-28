/**
 * The fit quiz data. Weights are qualitative tendencies (0 to 3), not facts about any industry:
 * they say "this answer points a bit more towards X", nothing about pay, hours or firms.
 * Slugs follow `content/catalog.ts`; `offersSlug` is what `/ofertas?industria=` filters by.
 */

export const QUIZ_INDUSTRIES = [
  { slug: "banca-de-inversion", label: "Banca de inversión", offersSlug: "investment-banking" },
  { slug: "consultoria", label: "Consultoría", offersSlug: "consulting" },
  { slug: "big-law", label: "Big Law", offersSlug: "big-law" },
  { slug: "private-equity", label: "Private equity", offersSlug: "private-equity" },
  { slug: "data-science", label: "Data science", offersSlug: "data-science" },
  { slug: "inteligencia-artificial", label: "Roles de IA", offersSlug: "ai" },
] as const;

export type QuizIndustry = (typeof QUIZ_INDUSTRIES)[number]["slug"];
export const INDUSTRY_ORDER: readonly QuizIndustry[] = QUIZ_INDUSTRIES.map((i) => i.slug);

export type Weights = Partial<Record<QuizIndustry, number>>;

export interface QuizOption {
  label: string;
  /** Shown in the result as "por qué" when this answer pushed the industry up. */
  because: string;
  weights: Weights;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: readonly QuizOption[];
}

const bi = "banca-de-inversion";
const con = "consultoria";
const law = "big-law";
const pe = "private-equity";
const ds = "data-science";
const ai = "inteligencia-artificial";

export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "horas",
    prompt: "¿Cómo llevas las semanas largas e impredecibles?",
    options: [
      {
        label: "Las asumo si lo que aprendo compensa",
        because: "Aceptas ritmos muy exigentes a cambio de aprender rápido.",
        weights: { [bi]: 3, [pe]: 3, [law]: 2, [con]: 1 },
      },
      {
        label: "Aguanto picos de trabajo, pero necesito rutina el resto del tiempo",
        because: "Toleras picos de trabajo, siempre que no sean la norma.",
        weights: { [con]: 2, [law]: 1, [pe]: 1, [ds]: 1, [ai]: 1 },
      },
      {
        label: "Prefiero horarios previsibles",
        because: "Valoras poder prever tu horario.",
        weights: { [ds]: 3, [ai]: 3, [con]: 1 },
      },
    ],
  },
  {
    id: "trabajo",
    prompt: "¿Qué tipo de trabajo te gustaría hacer la mayor parte del día?",
    options: [
      {
        label: "Construir con código y datos",
        because: "Te atrae construir cosas con código y datos.",
        weights: { [ds]: 3, [ai]: 3 },
      },
      {
        label: "Persuadir y asesorar a otras personas",
        because: "Disfrutas persuadiendo y asesorando.",
        weights: { [con]: 3, [bi]: 1, [pe]: 1 },
      },
      {
        label: "Leer, escribir y argumentar con precisión",
        because: "Te gusta leer, escribir y argumentar con precisión.",
        weights: { [law]: 3 },
      },
      {
        label: "Analizar empresas y operaciones financieras",
        because: "Te interesa analizar empresas y operaciones financieras.",
        weights: { [bi]: 3, [pe]: 3, [con]: 1 },
      },
    ],
  },
  {
    id: "especializacion",
    prompt: "¿Prefieres especializarte pronto o mantener opciones abiertas?",
    options: [
      {
        label: "Elegir pronto un campo y profundizar",
        because: "Prefieres elegir un campo y profundizar pronto.",
        weights: { [law]: 2, [ds]: 2, [ai]: 1, [bi]: 1, [pe]: 1 },
      },
      {
        label: "Probar varios sectores antes de decidir",
        because: "Quieres probar varios sectores antes de decidir.",
        weights: { [con]: 3 },
      },
      {
        label: "Una base amplia y especializarme después",
        because: "Buscas una base amplia antes de especializarte.",
        weights: { [con]: 1, [bi]: 1, [pe]: 1, [law]: 1, [ds]: 1, [ai]: 1 },
      },
    ],
  },
  {
    id: "clientes",
    prompt: "¿Cuánto trato directo con clientes quieres?",
    options: [
      {
        label: "Casi cada día",
        because: "Quieres trato frecuente con clientes.",
        weights: { [con]: 3, [bi]: 2, [law]: 2, [pe]: 1 },
      },
      {
        label: "Una mezcla de equipo y trabajo individual concentrado",
        because: "Te encaja combinar equipo y trabajo individual.",
        weights: { [pe]: 2, [ds]: 1, [ai]: 1, [law]: 1, [bi]: 1 },
      },
      {
        label: "Trabajo profundo, solo o con un equipo pequeño",
        because: "Rindes mejor en trabajo profundo, con poco ruido.",
        weights: { [ds]: 3, [ai]: 3, [law]: 1 },
      },
    ],
  },
  {
    id: "numeros",
    prompt: "¿Cómo te llevas con los números?",
    options: [
      {
        label: "Me muevo con soltura con modelos financieros y hojas de cálculo",
        because: "Te sientes cómodo con modelos financieros.",
        weights: { [bi]: 3, [pe]: 3, [con]: 1 },
      },
      {
        label: "Estoy cómodo con estadística y programación",
        because: "Te llevas bien con la estadística y la programación.",
        weights: { [ds]: 3, [ai]: 3 },
      },
      {
        label: "Me sirven, pero no son lo central",
        because: "Usas los números como apoyo, no como centro.",
        weights: { [con]: 2, [law]: 1 },
      },
      {
        label: "Prefiero que el peso recaiga en el texto y los argumentos",
        because: "Prefieres que el peso recaiga en el texto y los argumentos.",
        weights: { [law]: 3 },
      },
    ],
  },
  {
    id: "estructura",
    prompt: "¿Qué tipo de carrera prefieres?",
    options: [
      {
        label: "Una escalera clara, con niveles y ascensos definidos",
        because: "Valoras una escalera de carrera clara.",
        weights: { [law]: 3, [bi]: 2, [con]: 2 },
      },
      {
        label: "Estructura, pero con margen para moverme",
        because: "Buscas estructura con margen de movimiento.",
        weights: { [pe]: 2, [con]: 1, [bi]: 1, [ds]: 1 },
      },
      {
        label: "Un campo que cambia rápido y se aprende sobre la marcha",
        because: "Te atrae un campo que cambia rápido.",
        weights: { [ai]: 3, [ds]: 2 },
      },
    ],
  },
  {
    id: "ritmo",
    prompt: "¿Qué ritmo de trabajo te atrae más?",
    options: [
      {
        label: "Operaciones con principio y fin, a ritmo intenso",
        because: "Te atraen las operaciones con principio y fin.",
        weights: { [bi]: 3, [pe]: 3, [law]: 1 },
      },
      {
        label: "Proyectos de semanas o meses con un entregable claro",
        because: "Prefieres proyectos con entregable claro.",
        weights: { [con]: 3, [ds]: 1, [law]: 1 },
      },
      {
        label: "Casos o productos que evolucionan durante años",
        because: "Te gustan los trabajos que evolucionan durante años.",
        weights: { [law]: 2, [ds]: 2, [ai]: 2 },
      },
    ],
  },
  {
    id: "lugar",
    prompt: "¿Dónde te ves trabajando?",
    options: [
      {
        label: "En España",
        because: "Quieres quedarte en España.",
        weights: { [con]: 1, [law]: 1, [ds]: 1 },
      },
      {
        label: "Abierto a Londres u otras ciudades",
        because: "Estás abierto a trabajar fuera.",
        weights: { [bi]: 2, [pe]: 2, [con]: 1 },
      },
      {
        label: "Me atrae mudarme fuera cuanto antes",
        because: "Te atrae mudarte fuera pronto.",
        weights: { [bi]: 2, [pe]: 2, [ai]: 1, [ds]: 1 },
      },
    ],
  },
];
