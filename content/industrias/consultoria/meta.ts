import type { Source } from "@/components/ui";

/** Front matter shared by every consulting section (AGENTS.md rule 8). */
export const meta = {
  reviewer: "founder",
  reviewed_at: "2026-11-27",
  next_review: "2027-05-27",
} as const;

/** Numbered sources: `<Cite n={1} />` points at sources[0], and so on. */
export const sources: Source[] = [
  {
    title: "Spain's top 10 strategy and management consulting firms for graduates",
    url: "https://www.consultancy.eu/news/7425/spains-top-10-strategy-and-management-consulting-firms-for-graduates",
    publisher: "Consultancy.eu",
    accessed: "2026-11-27",
  },
  {
    title: "BCG Women's Boot Camp Spain (VIII edición)",
    url: "https://www.bcg.com/press/17april2026-impulsa-la-viii-edicion-del-bcg-womens-boot-camp-spain-para-acercar-la-consultoria-estrategica-al-talento-femenino",
    publisher: "BCG",
    accessed: "2026-11-27",
  },
  {
    title: "Estudiantes y recién graduados",
    url: "https://www.kpmg.com/es/es/carreras/estudiantes-recien-graduados.html",
    publisher: "KPMG España",
    accessed: "2026-11-27",
  },
  {
    title: "Professional Guide: consulting",
    url: "https://ieconnects.ie.edu/CareersBachelors/guide-consulting/",
    publisher: "IE University, Career Services",
    accessed: "2026-11-27",
  },
  {
    title: "Estudiantes (prácticas de unos días a un verano completo)",
    url: "https://bain.com/es-cl/careers/work-with-us/students/",
    publisher: "Bain & Company",
    accessed: "2026-11-27",
  },
  {
    title: "Las Big 4: vías de entrada (prácticas, internships de verano, curriculares)",
    url: "https://www.ie.edu/uncover-ie/es/las-big-4-ie-business-school/",
    publisher: "IE Business School",
    accessed: "2026-11-27",
  },
  {
    title: "Programa de talento junior: Elige futuro",
    url: "https://www.capgemini.com/es-es/talento/carreras-profesionales/elige-futuro/",
    publisher: "Capgemini España",
    accessed: "2026-11-27",
  },
];

/** Open verification items (also listed in the WS-B report). Never publish these as fact. */
export const todoVerify = [
  "funcionamiento.mdx: pyramid, ladder and up-or-out are general knowledge; need cited sources.",
  "trabajo.mdx: the example week is illustrative; junior pay ranges need a dated source.",
  "seleccion.mdx: recruiting calendar months, tests per firm, final-round format, books and case libraries.",
  "firms.ts: Madrid/Barcelona offices for KPMG, Deloitte, EY, PwC, Accenture, Capgemini, Oliver Wyman, Bain Barcelona; McKinsey and PwC careers URLs.",
] as const;
