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
  {
    title: "Oficina de Madrid",
    url: "https://www.bain.com/es-es/offices/madrid/",
    publisher: "Bain & Company",
    accessed: "2026-11-27",
  },
  {
    title: "Oficinas de KPMG en España",
    url: "https://www.kpmg.com/es/es/sobre-kpmg/oficinas.html",
    publisher: "KPMG España",
    accessed: "2026-11-27",
  },
  {
    title: "Glow Up: programa de prácticas",
    url: "https://www.deloitte.com/es/es/careers/programa-de-practicas-glow-up.html",
    publisher: "Deloitte España",
    accessed: "2026-11-27",
  },
  {
    title: "EY incorpora más de 550 nuevos profesionales en 15 oficinas de España (2023)",
    url: "https://www.ey.com/es_es/newsroom/2023/10/ey-incorpora-mas-550-nuevos-profesionales-15-oficinas-espana",
    publisher: "EY España",
    accessed: "2026-11-27",
  },
  {
    title: "Prácticas en Accenture",
    url: "https://www.accenture.com/es-es/careers/life-at-accenture/internships-careers",
    publisher: "Accenture España",
    accessed: "2026-11-27",
  },
  {
    title: "Oficina de Madrid",
    url: "https://www.oliverwyman.com/our-expertise/global-locations/europe-middle-east-africa/spain/madrid.html",
    publisher: "Oliver Wyman",
    accessed: "2026-11-27",
  },
  {
    title: "Oficina de Barcelona",
    url: "https://www.oliverwyman.com/our-expertise/global-locations/europe-middle-east-africa/spain/barcelona.html",
    publisher: "Oliver Wyman",
    accessed: "2026-11-27",
  },
  {
    title: "International Mentorship Program: Spain",
    url: "https://www.oliverwyman.com/careers/recruiting-events/international-mentorship-program/spain.html",
    publisher: "Oliver Wyman",
    accessed: "2026-11-27",
  },
  {
    title: "Bases legales PwC Excellence (quinta edición, 2022)",
    url: "https://www.pwc.es/es/excellence/bases-legales-pwc-excellence-quinta-edicion-2022.pdf",
    publisher: "PwC España",
    accessed: "2026-11-27",
  },
  {
    title: "Business Analyst Intern, Tech & AI",
    url: "https://www.mckinsey.com/careers/search-jobs/jobs/businessanalystintern-techai-110126",
    publisher: "McKinsey & Company",
    accessed: "2026-11-27",
  },
  {
    title: "Digital assessment (Sova / TestGorilla)",
    url: "https://www.bain.com/careers/hiring-process/digital-assessment/",
    publisher: "Bain & Company",
    accessed: "2026-11-27",
  },
  {
    title: "BCG interview process",
    url: "https://careers.bcg.com/global/en/interview-process",
    publisher: "BCG",
    accessed: "2026-11-27",
  },
  {
    title: "Using AI in your application process",
    url: "https://careers.bcg.com/global/en/careers-in-ai/using-ai-application-process",
    publisher: "BCG",
    accessed: "2026-11-27",
  },
];

/** Items that still need a source or Pablo's own knowledge. Never publish these as fact. */
export const todoVerify = [
  "funcionamiento.mdx: pyramid, ladder and up-or-out are general knowledge; need cited sources.",
  "trabajo.mdx: the example week is illustrative; junior pay ranges need a dated source.",
  "firms.ts: Madrid/Barcelona offices not confirmed for Bain Barcelona, Deloitte, PwC Barcelona, Accenture, Capgemini.",
  "proceso.mdx: McKinsey Solve, BCG Casey and AI-assisted case interviews are not confirmed by an official page we could open (McKinsey interviewing page timed out).",
  "firms.ts: McKinsey and PwC sites block scripts, so their URLs were not opened by a script.",
] as const;
