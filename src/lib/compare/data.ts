import type { IndustrySlug } from "../../../content/catalog";

/**
 * Side-by-side comparison data for `/industrias`.
 *
 * Rule: a value appears here only if the guide page in `source` already states it AND cites it
 * (AGENTS.md rule 8). Anything else is `null` with a reason, rendered as "—". Pay is by level from
 * a named study, never per firm. `data.test.ts` checks every source path exists.
 */

export const DIMENSIONS = [
  { id: "horario", label: "Horario típico" },
  { id: "entrada", label: "Vías de entrada" },
  { id: "perfil", label: "Perfil que buscan" },
  { id: "sueldo", label: "Sueldo de entrada" },
  { id: "ritmo", label: "Ritmo de carrera" },
  { id: "idiomas", label: "Idiomas" },
  { id: "ciudades", label: "Ciudades" },
] as const;

export type DimensionId = (typeof DIMENSIONS)[number]["id"];

/** A value the guide states and cites, or an honest gap. */
export type Cell =
  | {
      value: string;
      /** `<industry>/<page>`: the page under `content/industrias/` that states and cites it. */
      source: string;
    }
  | { value: null; reason: string };

const PREPARING = "Guía en preparación";
const none = (reason: string): Cell => ({ value: null, reason });
const preparing: Record<DimensionId, Cell> = {
  horario: none(PREPARING),
  entrada: none(PREPARING),
  perfil: none(PREPARING),
  sueldo: none(PREPARING),
  ritmo: none(PREPARING),
  idiomas: none(PREPARING),
  ciudades: none(PREPARING),
};

export const COMPARE: Record<IndustrySlug, Record<DimensionId, Cell>> = {
  "banca-de-inversion": {
    horario: none("Sin encuesta de horas en España"),
    entrada: {
      value:
        "Prácticas de verano de 8 a 10 semanas, prácticas fuera de ciclo todo el año y programas de graduado de un año.",
      source: "banca-de-inversion/proceso",
    },
    perfil: {
      value:
        "Buen expediente, capacidad analítica y numérica, atención al detalle y organización (oferta de Rothschild & Co).",
      source: "banca-de-inversion/proceso",
    },
    sueldo: {
      value:
        "Analista, base anual: 45–50K € en M&A nacional y 50–65K € en M&A internacional, más bonus. Estimación de Michael Page 2026, no una oferta.",
      source: "banca-de-inversion/sueldos",
    },
    ritmo: {
      value: "Cuatro niveles: analista, asociado, VP y director. Sin fuente de años por nivel.",
      source: "banca-de-inversion/el-trabajo",
    },
    idiomas: {
      value: "Inglés y español (oferta de graduado de Rothschild & Co en Madrid).",
      source: "banca-de-inversion/proceso",
    },
    ciudades: {
      value: "Madrid: Santander CIB, Rothschild & Co y Goldman Sachs publican programas allí.",
      source: "banca-de-inversion/empresas",
    },
  },
  "big-law": {
    horario: none("Sin encuesta de horas en España"),
    entrada: {
      value:
        "Grado en Derecho, Máster de Acceso a la Abogacía, Examen de Estado y colegiación; prácticas de verano, de grado y del máster.",
      source: "big-law/proceso",
    },
    perfil: {
      value:
        "Estudiantes de Derecho de penúltimo o último curso para las prácticas de verano y de grado (Uría, Cuatrecasas, GA&P).",
      source: "big-law/proceso",
    },
    sueldo: {
      value:
        "Media bruta anual en despachos de España, 2025: becario 18.276 €, júnior 46.026 €, asociado 71.026 €. Estudio de Signium y la UFV, no una cifra por firma.",
      source: "big-law/sueldos",
    },
    ritmo: {
      value:
        "Becario, júnior (1–3 años), asociado (4–6), asociado sénior (7–9) y dirección (10 o más). Sin fuente de cuánto se tarda en llegar a socio.",
      source: "big-law/el-trabajo",
    },
    idiomas: {
      value:
        "Uría hace una prueba de inglés de 80 minutos y una redacción en castellano; la entrevista puede ser en parte en inglés u otro idioma de tu CV.",
      source: "big-law/proceso",
    },
    ciudades: {
      value: "Madrid y Barcelona; Uría también en Bilbao y Valencia.",
      source: "big-law/empresas",
    },
  },
  consultoria: {
    horario: none("Depende del proyecto y de la firma; sin cifras citadas"),
    entrada: {
      value:
        "En las Big Four: prácticas, internships de verano y prácticas curriculares. Accenture y Capgemini tienen programas de entrada propios.",
      source: "consultoria/como-funciona",
    },
    perfil: {
      value:
        "Estrategia: expedientes con media superior a 8,5/10 (guía de carreras de IE). Big Four: recién graduados de muchas titulaciones.",
      source: "consultoria/como-funciona",
    },
    sueldo: none("Aún no publicamos rangos: solo con fuente citada y año"),
    ritmo: {
      value:
        "Analista o consultor júnior, consultor sénior y gerente, director y socio. En varias firmas de estrategia se espera subir de nivel en un plazo (up-or-out).",
      source: "consultoria/como-funciona",
    },
    idiomas: none("Sin dato citado en la guía"),
    ciudades: {
      value: "McKinsey, BCG y Bain tienen oficina en Madrid; McKinsey y BCG también en Barcelona.",
      source: "consultoria/estrategia",
    },
  },
  "private-equity": preparing,
  "data-science": preparing,
  "inteligencia-artificial": preparing,
};
