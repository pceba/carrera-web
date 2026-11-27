/** Navigation and catalogue data shared by the shell, the home and the industry map. */

export const ROUTES = {
  home: "/",
  industries: "/industrias",
  consulting: "/industrias/consultoria",
  /** Owned by WS-C; link only. Update here if WS-C picks a different path. */
  signUp: "/registro",
  privacy: "/legal/privacidad",
  terms: "/legal/terminos",
} as const;

export const NAV_LINKS = [
  { href: ROUTES.industries, label: "Industrias" },
  { href: "/#pilares", label: "Qué encontrarás" },
] as const;

export const PILLARS = [
  {
    n: "01",
    title: "El mapa",
    text: "Qué industrias existen y cuál encaja contigo, sin folletos de empresa.",
  },
  {
    n: "02",
    title: "Cómo funciona",
    text: "Modelo de negocio, quién es quién y cómo se sube de escalón.",
  },
  {
    n: "03",
    title: "El trabajo real",
    text: "Una semana cualquiera, las habilidades que piden y rangos salariales con fuente.",
  },
  {
    n: "04",
    title: "Empresas en España",
    text: "Quién contrata, en qué oficinas y con qué programas de entrada.",
  },
  {
    n: "05",
    title: "Los procesos",
    text: "Fases, calendario y práctica para llegar preparado a cada entrevista.",
  },
  {
    n: "06",
    title: "Personas",
    text: "Profesionales que ya han pasado por ahí (mayores de 18, con consentimiento).",
  },
] as const;

export type IndustryStatus = "live" | "soon";

export const INDUSTRIES: readonly {
  slug: string;
  name: string;
  blurb: string;
  status: IndustryStatus;
}[] = [
  {
    slug: "consultoria",
    name: "Consultoría",
    blurb: "Estrategia y gestión: procesos de selección, casos y firmas en España.",
    status: "live",
  },
  {
    slug: "tecnologia",
    name: "Tecnología y software",
    blurb: "Producto, ingeniería y datos en empresas tecnológicas.",
    status: "soon",
  },
  {
    slug: "banca-finanzas",
    name: "Banca y finanzas",
    blurb: "Banca de inversión, corporativa y mercados.",
    status: "soon",
  },
  {
    slug: "big-four",
    name: "Big Four y auditoría",
    blurb: "Auditoría, fiscal y asesoramiento en las grandes firmas.",
    status: "soon",
  },
  {
    slug: "datos-ia",
    name: "Datos e IA",
    blurb: "Analítica, ciencia de datos e ingeniería de IA.",
    status: "soon",
  },
  {
    slug: "marketing",
    name: "Marketing",
    blurb: "Marca, crecimiento y publicidad.",
    status: "soon",
  },
  {
    slug: "startups",
    name: "Startups",
    blurb: "Entrar en una empresa joven: roles, equity y riesgos.",
    status: "soon",
  },
  {
    slug: "sector-publico",
    name: "Sector público",
    blurb: "Oposiciones y carrera en la Administración.",
    status: "soon",
  },
  {
    slug: "ingenieria",
    name: "Ingeniería",
    blurb: "Industria, infraestructuras y energía.",
    status: "soon",
  },
  {
    slug: "salud",
    name: "Salud",
    blurb: "Itinerarios profesionales en el ámbito sanitario.",
    status: "soon",
  },
];
