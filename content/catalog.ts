/**
 * The site's catalogue: industries, their sections and segments, cross-industry preparation
 * guides and the resource library. Navigation, breadcrumbs, previous/next, "related" links, the
 * map and the home all read from here, so content sessions add pages by editing data and
 * dropping MDX files, never navigation code.
 *
 * Conventions (see content/README.md):
 * - An industry page `/industrias/<slug>/<page>` renders `content/industrias/<slug>/<page>.mdx`.
 *   Every section and segment listed for a `live` industry must have that file.
 * - Sources for an industry live in `content/industrias/<slug>/meta.ts` (`meta`, `sources`);
 *   `<Cite n={k} />` in any of its MDX points at `sources[k - 1]`.
 * - A preparation guide with `hasContent: true` renders `content/preparacion/<slug>.mdx`.
 *
 * Plain data and pure helpers only: safe to import from server and client components.
 */

export type IndustrySlug =
  | "consultoria"
  | "inteligencia-artificial"
  | "data-science"
  | "private-equity"
  | "banca-de-inversion"
  | "big-law";

/** Matches the Rust `Industry` enum (crates/cw-domain) used by postings and matching. */
export type RustIndustry =
  "consulting" | "ai" | "data-science" | "private-equity" | "investment-banking" | "big-law";

/** `live`: hub and sections are published. `preparing`: hub only, marked "en preparación". */
export type Status = "live" | "preparing";

export type Page = {
  slug: string;
  title: string;
  /** One line shown in lists, section nav and previous/next. */
  summary: string;
  /** Preparation guides this page feeds into (drives the "related" links). */
  prep?: PrepSlug[];
};

export type Industry = {
  slug: IndustrySlug;
  title: string;
  rust: RustIndustry;
  /** One certain sentence: what the industry is. Shown on the map, the home and the hub. */
  line: string;
  status: Status;
  /** The reading path, in order. Previous/next follows this list. Empty while preparing. */
  sections: Page[];
  /** Sub-fields with their own page (e.g. strategy consulting). Same URL level as sections. */
  segments: Page[];
  /** Section slug to suggest as the first read on the hub. */
  startHere?: string;
};

/** Canonical section slugs. Industries may add their own (e.g. `caso-practico`). */
export const SECTION_SLUGS = [
  "como-funciona",
  "el-trabajo",
  "sueldos",
  "empresas",
  "proceso",
  "recursos",
  "personas",
] as const;

export const INDUSTRIES: readonly Industry[] = [
  {
    slug: "consultoria",
    title: "Consultoría",
    rust: "consulting",
    line: "Asesorar a empresas por proyectos: estrategia, gestión y tecnología.",
    status: "live",
    startHere: "como-funciona",
    sections: [
      {
        slug: "como-funciona",
        title: "Cómo funciona",
        summary: "Tipos de firma, cómo se organiza el trabajo y cómo se sube de nivel.",
      },
      {
        slug: "el-trabajo",
        title: "El trabajo",
        summary: "Una semana de ejemplo, las habilidades que se usan, viajes y horas.",
      },
      {
        slug: "empresas",
        title: "Empresas en España",
        summary: "Quién contrata, en qué oficinas y con qué programas de entrada.",
      },
      {
        slug: "proceso",
        title: "Proceso de selección",
        summary: "Fases, fechas publicadas y cómo prepararte.",
        prep: ["entrevistas-de-caso", "cv-y-carta"],
      },
      {
        slug: "caso-practico",
        title: "Caso práctico",
        summary: "Una estimación de mercado paso a paso, con pistas. Sin IA y sin cuenta.",
        prep: ["entrevistas-de-caso"],
      },
      {
        slug: "recursos",
        title: "Recursos",
        summary: "Webs oficiales de las firmas, guías y material para practicar.",
      },
      {
        slug: "personas",
        title: "Personas",
        summary: "Networking bien hecho y una plantilla de mensaje.",
        prep: ["networking"],
      },
    ],
    segments: [
      {
        slug: "estrategia",
        title: "Consultoría de estrategia",
        summary: "McKinsey, BCG y Bain: qué hacen, dónde están en España y qué programas abren.",
        prep: ["entrevistas-de-caso"],
      },
    ],
  },
  {
    slug: "inteligencia-artificial",
    title: "Roles de IA",
    rust: "ai",
    line: "Puestos que construyen, integran y evalúan sistemas de inteligencia artificial.",
    status: "preparing",
    sections: [],
    segments: [],
  },
  {
    slug: "data-science",
    title: "Data science",
    rust: "data-science",
    line: "Analizar datos y construir modelos que ayudan a tomar decisiones.",
    status: "preparing",
    sections: [],
    segments: [],
  },
  {
    slug: "private-equity",
    title: "Private equity",
    rust: "private-equity",
    line: "Fondos que compran participaciones en empresas, las gestionan durante años y las venden.",
    status: "preparing",
    sections: [],
    segments: [],
  },
  {
    slug: "banca-de-inversion",
    title: "Banca de inversión",
    rust: "investment-banking",
    line: "Asesorar a empresas en compras, ventas, fusiones y salidas a bolsa.",
    status: "live",
    startHere: "como-funciona",
    sections: [
      {
        slug: "como-funciona",
        title: "Cómo funciona",
        summary:
          "Qué hace un banco de inversión, quién contrata en España y por qué puertas se entra.",
      },
      {
        slug: "empresas",
        title: "Empresas en España",
        summary: "Bancos españoles, boutiques, Big Four y bancos internacionales: quién contrata.",
      },
      {
        slug: "el-trabajo",
        title: "El trabajo",
        summary: "La semana de un analista, la escalera de niveles y las horas.",
      },
      {
        slug: "sueldos",
        title: "Sueldos",
        summary: "Rangos por nivel de un estudio de remuneración, con su año y sus límites.",
      },
      {
        slug: "proceso",
        title: "Proceso de selección",
        summary: "Calendario en España, lo que sabemos de las fases y los temas técnicos.",
        prep: [
          "entrevistas-tecnicas",
          "pruebas-de-modelizacion",
          "assessment-centres",
          "cv-y-carta",
        ],
      },
      {
        slug: "recursos",
        title: "Recursos",
        summary: "Webs oficiales, prensa y material para prepararte.",
      },
      {
        slug: "personas",
        title: "Personas",
        summary: "Cómo hablar con quien ya trabaja ahí, sin universidad «target».",
        prep: ["networking"],
      },
    ],
    segments: [],
  },
  {
    slug: "big-law",
    title: "Big Law",
    rust: "big-law",
    line: "Los grandes despachos de abogados de negocios: operaciones, litigios y regulación.",
    status: "preparing",
    sections: [],
    segments: [],
  },
];

/* ---------------------------------------------------------------- preparation guides */

export type PrepSlug =
  | "entrevistas-de-caso"
  | "entrevistas-tecnicas"
  | "pruebas-de-modelizacion"
  | "assessment-centres"
  | "cv-y-carta"
  | "networking";

export type PrepGuide = {
  slug: PrepSlug;
  title: string;
  summary: string;
  /** Industries where this kind of preparation matters; drives cross-industry links. */
  industries: IndustrySlug[];
  /** When true, `content/preparacion/<slug>.mdx` exists and is rendered. */
  hasContent: boolean;
};

export const PREP_GUIDES: readonly PrepGuide[] = [
  {
    slug: "entrevistas-de-caso",
    title: "Entrevistas de caso",
    summary: "Estructurar un problema de negocio en voz alta, con números y una recomendación.",
    industries: ["consultoria", "private-equity"],
    hasContent: false,
  },
  {
    slug: "entrevistas-tecnicas",
    title: "Entrevistas técnicas",
    summary: "Preguntas de conocimiento y ejercicios prácticos sobre la materia del puesto.",
    industries: ["inteligencia-artificial", "data-science", "banca-de-inversion"],
    hasContent: false,
  },
  {
    slug: "pruebas-de-modelizacion",
    title: "Pruebas de modelización",
    summary: "Construir o revisar un modelo financiero con tiempo limitado.",
    industries: ["banca-de-inversion", "private-equity"],
    hasContent: false,
  },
  {
    slug: "assessment-centres",
    title: "Assessment centres",
    summary: "Jornadas con dinámicas de grupo, presentaciones y entrevistas seguidas.",
    industries: ["consultoria", "banca-de-inversion", "big-law"],
    hasContent: false,
  },
  {
    slug: "cv-y-carta",
    title: "CV y carta de presentación",
    summary: "El primer filtro de casi todos los procesos: qué contar y cómo.",
    industries: [
      "consultoria",
      "inteligencia-artificial",
      "data-science",
      "private-equity",
      "banca-de-inversion",
      "big-law",
    ],
    hasContent: false,
  },
  {
    slug: "networking",
    title: "Networking",
    summary: "Hablar con quien ya trabaja ahí, sin pedir trabajo y sin incomodar.",
    industries: [
      "consultoria",
      "inteligencia-artificial",
      "data-science",
      "private-equity",
      "banca-de-inversion",
      "big-law",
    ],
    hasContent: false,
  },
];

/* ---------------------------------------------------------------- resource library */

export type ResourceType =
  "guia" | "web-oficial" | "casos" | "libro" | "curso" | "podcast" | "newsletter" | "comunidad";

export const RESOURCE_TYPES: readonly { slug: ResourceType; label: string; one: string }[] = [
  { slug: "guia", label: "Guías", one: "Guía" },
  { slug: "web-oficial", label: "Webs oficiales", one: "Web oficial" },
  { slug: "casos", label: "Casos para practicar", one: "Caso" },
  { slug: "libro", label: "Libros", one: "Libro" },
  { slug: "curso", label: "Cursos", one: "Curso" },
  { slug: "podcast", label: "Podcasts", one: "Podcast" },
  { slug: "newsletter", label: "Newsletters", one: "Newsletter" },
  { slug: "comunidad", label: "Comunidades", one: "Comunidad" },
];

export type Resource = {
  id: string;
  title: string;
  /** Absolute URL, or a site path for our own material. */
  url: string;
  type: ResourceType;
  industries: IndustrySlug[];
  publisher: string;
  /** One factual line, taken from the cited source. */
  note: string;
  /** Preparation guides it helps with. */
  prep?: PrepSlug[];
  /** ISO date the link was last opened by a person. */
  checked: string;
};

/** Entries are taken from the consulting guide's cited sources (content/industrias/consultoria). */
export const RESOURCES: readonly Resource[] = [
  {
    id: "ie-guide-consulting",
    title: "Professional Guide: consulting",
    url: "https://ieconnects.ie.edu/CareersBachelors/guide-consulting/",
    type: "guia",
    industries: ["consultoria"],
    publisher: "IE University, Career Services",
    note: "La guía del servicio de carreras de IE sobre la consultoría como salida profesional.",
    prep: ["cv-y-carta"],
    checked: "2026-11-27",
  },
  {
    id: "consultancy-eu-top10",
    title: "Spain's top 10 strategy and management consulting firms for graduates",
    url: "https://www.consultancy.eu/news/7425/spains-top-10-strategy-and-management-consulting-firms-for-graduates",
    type: "guia",
    industries: ["consultoria"],
    publisher: "Consultancy.eu",
    note: "Las diez firmas de estrategia y gestión para recién graduados en España, según el medio.",
    checked: "2026-11-27",
  },
  {
    id: "caso-cafeteria",
    title: "Caso práctico: estimación de mercado",
    url: "/industrias/consultoria/caso-practico",
    type: "casos",
    industries: ["consultoria"],
    publisher: "Esta guía",
    note: "Un caso interactivo paso a paso, con pistas en cada decisión. Funciona sin IA y sin cuenta.",
    prep: ["entrevistas-de-caso"],
    checked: "2026-11-27",
  },
  {
    id: "bcg-womens-boot-camp",
    title: "BCG Women's Boot Camp Spain",
    url: "https://www.bcg.com/press/17april2026-impulsa-la-viii-edicion-del-bcg-womens-boot-camp-spain-para-acercar-la-consultoria-estrategica-al-talento-femenino",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "BCG",
    note: "Para mujeres de grado y máster. Plazo de la octava edición: hasta el 26 de abril de 2026.",
    checked: "2026-11-27",
  },
  {
    id: "ow-mentorship",
    title: "International Mentorship Program: Spain",
    url: "https://www.oliverwyman.com/careers/recruiting-events/international-mentorship-program/spain.html",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "Oliver Wyman",
    note: "De septiembre a diciembre de 2026, con plazas en Madrid.",
    checked: "2026-11-27",
  },
  {
    id: "bain-students",
    title: "Estudiantes",
    url: "https://bain.com/es-cl/careers/work-with-us/students/",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "Bain & Company",
    note: "Prácticas para grado y posgrado, de unos días a un verano completo.",
    checked: "2026-11-27",
  },
  {
    id: "kpmg-students",
    title: "Estudiantes y recién graduados",
    url: "https://www.kpmg.com/es/es/carreras/estudiantes-recien-graduados.html",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "KPMG España",
    note: "Prácticas de verano, prácticas de últimos cursos, plazas STEM y programa Sin Límites.",
    checked: "2026-11-27",
  },
  {
    id: "deloitte-glow-up",
    title: "Glow Up: programa de prácticas",
    url: "https://www.deloitte.com/es/es/careers/programa-de-practicas-glow-up.html",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "Deloitte España",
    note: "El programa de prácticas de Deloitte en España.",
    checked: "2026-11-27",
  },
  {
    id: "accenture-internships",
    title: "Prácticas en Accenture",
    url: "https://www.accenture.com/es-es/careers/life-at-accenture/internships-careers",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "Accenture España",
    note: "Convocatorias de prácticas de Accenture en España.",
    checked: "2026-11-27",
  },
  {
    id: "capgemini-elige-futuro",
    title: "Elige futuro",
    url: "https://www.capgemini.com/es-es/talento/carreras-profesionales/elige-futuro/",
    type: "web-oficial",
    industries: ["consultoria"],
    publisher: "Capgemini España",
    note: "Programa de talento junior de Capgemini en España.",
    checked: "2026-11-27",
  },
  {
    id: "ib-alantra-students",
    title: "Students & Graduates",
    url: "https://www.alantra.com/careers/students-graduates/",
    type: "web-oficial",
    industries: ["banca-de-inversion"],
    publisher: "Alantra",
    note: "Programa de analistas, prácticas largas de 6 a 12 meses y prácticas de verano de 8 a 10 semanas.",
    checked: "2026-11-27",
  },
  {
    id: "ib-santander-cib",
    title: "Graduates & early careers",
    url: "https://www.santandercib.com/about-us/careers/graduates-young-talent",
    type: "web-oficial",
    industries: ["banca-de-inversion"],
    publisher: "Santander Corporate & Investment Banking",
    note: "Programa internacional de graduados y prácticas de verano de 8 a 10 semanas.",
    prep: ["cv-y-carta"],
    checked: "2026-11-27",
  },
  {
    id: "ib-goldman-students",
    title: "Students",
    url: "https://www.goldmansachs.com/careers/students",
    type: "web-oficial",
    industries: ["banca-de-inversion"],
    publisher: "Goldman Sachs",
    note: "Punto de entrada a sus programas para estudiantes.",
    checked: "2026-11-27",
  },
  {
    id: "ib-jpm-spring-insights",
    title: "Spring Insights",
    url: "https://www.jpmorganchase.com/careers/explore-opportunities/programs/spring-insights",
    type: "web-oficial",
    industries: ["banca-de-inversion"],
    publisher: "J.P. Morgan",
    note: "Programa de primeros cursos que conecta con prácticas y programas de graduados.",
    checked: "2026-11-27",
  },
  {
    id: "ib-expansion",
    title: "Expansión",
    url: "https://www.expansion.com/",
    type: "newsletter",
    industries: ["banca-de-inversion"],
    publisher: "Expansión",
    note: "Diario económico con información de mercados, para seguir operaciones en España.",
    checked: "2026-11-27",
  },
  {
    id: "ib-funds-society",
    title: "Funds Society",
    url: "https://www.fundssociety.com/es/",
    type: "newsletter",
    industries: ["banca-de-inversion"],
    publisher: "Funds Society",
    note: "Medio de la industria de gestión de activos y patrimonios, en español.",
    checked: "2026-11-27",
  },
  {
    id: "ib-damodaran",
    title: "Damodaran Online",
    url: "https://pages.stern.nyu.edu/~adamodar/",
    type: "guia",
    industries: ["banca-de-inversion"],
    publisher: "NYU Stern",
    note: "Página de Aswath Damodaran con datos y materiales de valoración.",
    prep: ["entrevistas-tecnicas"],
    checked: "2026-11-27",
  },
  {
    id: "ib-mergers-inquisitions",
    title: "Mergers & Inquisitions",
    url: "https://mergersandinquisitions.com/",
    type: "guia",
    industries: ["banca-de-inversion"],
    publisher: "Mergers & Inquisitions",
    note: "Blog de carreras en banca de inversión, en inglés. Vende cursos.",
    prep: ["entrevistas-tecnicas"],
    checked: "2026-11-27",
  },
  {
    id: "ib-cfi",
    title: "Corporate Finance Institute",
    url: "https://corporatefinanceinstitute.com/",
    type: "curso",
    industries: ["banca-de-inversion"],
    publisher: "Corporate Finance Institute",
    note: "Cursos de finanzas corporativas y modelización, en inglés. Hay contenido de pago.",
    prep: ["pruebas-de-modelizacion"],
    checked: "2026-11-27",
  },
  {
    id: "ib-ie-finance-clubs",
    title: "IE Finance Clubs",
    url: "https://ieconnects.ie.edu/iefinanceclubs/",
    type: "comunidad",
    industries: ["banca-de-inversion"],
    publisher: "IE University",
    note: "Clubes de finanzas de estudiantes de IE.",
    prep: ["networking"],
    checked: "2026-11-27",
  },
  {
    id: "ib-navarra-investment-society",
    title: "Investment Society",
    url: "https://www.unav.edu/web/investment-society/actividades",
    type: "comunidad",
    industries: ["banca-de-inversion"],
    publisher: "Universidad de Navarra",
    note: "Sociedad de estudiantes de inversión con página de actividades.",
    prep: ["networking"],
    checked: "2026-11-27",
  },
  {
    id: "ib-cfa-spain",
    title: "CFA Society Spain",
    url: "https://www.cfasociety.org/spain/home",
    type: "comunidad",
    industries: ["banca-de-inversion"],
    publisher: "CFA Society Spain",
    note: "Página de la sociedad local del CFA Institute.",
    prep: ["networking"],
    checked: "2026-11-27",
  },
];

/* ---------------------------------------------------------------- helpers */

export const industryHref = (slug: string) => `/industrias/${slug}`;
export const pageHref = (industry: string, page: string) => `/industrias/${industry}/${page}`;
export const prepHref = (slug: string) => `/preparacion/${slug}`;

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getPrepGuide(slug: string): PrepGuide | undefined {
  return PREP_GUIDES.find((g) => g.slug === slug);
}

export type PageKind = "section" | "segment";

/** A section or segment of an industry, with its kind. */
export function getPage(
  industry: Industry,
  slug: string,
): { page: Page; kind: PageKind } | undefined {
  const section = industry.sections.find((s) => s.slug === slug);
  if (section) return { page: section, kind: "section" };
  const segment = industry.segments.find((s) => s.slug === slug);
  return segment ? { page: segment, kind: "segment" } : undefined;
}

export type Link = { href: string; title: string; summary?: string };

/**
 * Previous and next along the reading path: hub -> sections in order. A segment page goes back
 * to the hub and forward to the industry's first section.
 */
export function neighbours(industry: Industry, slug: string): { prev?: Link; next?: Link } {
  const hub: Link = { href: industryHref(industry.slug), title: industry.title };
  const toLink = (p: Page): Link => ({
    href: pageHref(industry.slug, p.slug),
    title: p.title,
    summary: p.summary,
  });
  const i = industry.sections.findIndex((s) => s.slug === slug);
  if (i === -1) {
    const first = industry.sections[0];
    return { prev: hub, next: first ? toLink(first) : undefined };
  }
  const prev = industry.sections[i - 1];
  const next = industry.sections[i + 1];
  return { prev: prev ? toLink(prev) : hub, next: next ? toLink(next) : undefined };
}

/** Pages across the site that link a preparation guide to industry pages that use it. */
export function pagesForPrep(slug: PrepSlug): (Link & { industry: Industry })[] {
  const out: (Link & { industry: Industry })[] = [];
  for (const industry of INDUSTRIES) {
    for (const p of [...industry.segments, ...industry.sections]) {
      if (p.prep?.includes(slug)) {
        out.push({
          industry,
          href: pageHref(industry.slug, p.slug),
          title: p.title,
          summary: p.summary,
        });
      }
    }
  }
  return out;
}

/**
 * "Related" for a page: the preparation guides it feeds, plus the other industries that share
 * them. Never links to the page itself or its own industry hub.
 */
export function related(industry: Industry, page?: Page): Link[] {
  const guides = page?.prep?.length
    ? PREP_GUIDES.filter((g) => page.prep!.includes(g.slug))
    : PREP_GUIDES.filter((g) => g.industries.includes(industry.slug)).slice(0, 3);
  const links: Link[] = guides.map((g) => ({
    href: prepHref(g.slug),
    title: g.title,
    summary: "Guía de preparación",
  }));
  const seen = new Set<string>([industry.slug]);
  for (const g of guides) {
    for (const slug of g.industries) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      const other = getIndustry(slug);
      if (other) {
        links.push({
          href: industryHref(other.slug),
          title: other.title,
          summary: `También usa: ${g.title.toLowerCase()}`,
        });
      }
    }
  }
  return links.slice(0, 5);
}

export function resourcesFor(filter: { industry?: string; type?: string; prep?: string }) {
  return RESOURCES.filter(
    (r) =>
      (!filter.industry || r.industries.includes(filter.industry as IndustrySlug)) &&
      (!filter.type || r.type === filter.type) &&
      (!filter.prep || r.prep?.includes(filter.prep as PrepSlug)),
  );
}
