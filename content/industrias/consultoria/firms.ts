export type FirmType = "Estrategia" | "Big Four" | "Tecnología" | "Boutique";

export type Firm = {
  name: string;
  type: FirmType;
  /** Offices in Madrid / Barcelona. `null` = not verified yet (TODO(verify)). */
  madrid: boolean | null;
  barcelona: boolean | null;
  /** Free text; only what a cited source says, or a pointer to the official page. */
  entry: string;
  careersUrl: string;
  /** 1-based indexes into `sources` that back the offices/entry columns. */
  cite?: number[];
};

export const firms: Firm[] = [
  {
    name: "McKinsey & Company",
    type: "Estrategia",
    madrid: true,
    barcelona: true,
    entry: "Business Analyst Intern; programa Atrévete (becas y mentoría).",
    careersUrl: "https://www.mckinsey.com/es/careers", // TODO(verify): site timed out when checked
    cite: [1],
  },
  {
    name: "Boston Consulting Group (BCG)",
    type: "Estrategia",
    madrid: true,
    barcelona: true,
    entry: "BCG Women's Boot Camp Spain (grado y máster, mujeres).",
    careersUrl: "https://careers.bcg.com/spain",
    cite: [1, 2],
  },
  {
    name: "Bain & Company",
    type: "Estrategia",
    madrid: true,
    barcelona: null, // TODO(verify): Barcelona office
    entry: "Prácticas para grado y posgrado, de unos días a un verano completo.",
    careersUrl: "https://www.bain.com/es/careers/",
    cite: [1, 5],
  },
  {
    name: "KPMG España",
    type: "Big Four",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Prácticas de verano, prácticas de últimos cursos, plazas STEM y programa Sin Límites.",
    careersUrl: "https://www.kpmg.com/es/es/carreras.html",
    cite: [3],
  },
  {
    name: "Deloitte España",
    type: "Big Four",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Becas y prácticas: consulta la convocatoria vigente.", // TODO(verify): programme names
    careersUrl: "https://www.deloitte.com/es/es/careers.html",
  },
  {
    name: "EY España",
    type: "Big Four",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Programas de estudiantes y puestos a tiempo completo: consulta la convocatoria.", // TODO(verify)
    careersUrl: "https://www.ey.com/es_es/careers",
  },
  {
    name: "PwC España",
    type: "Big Four",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Consulta la convocatoria vigente.", // TODO(verify)
    careersUrl: "https://www.pwc.es/es/carreras.html", // TODO(verify): returned 403 to a script
  },
  {
    name: "Accenture",
    type: "Tecnología",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Consulta la convocatoria vigente.", // TODO(verify)
    careersUrl: "https://www.accenture.com/es-es/careers",
  },
  {
    name: "Capgemini",
    type: "Tecnología",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Programa de talento junior «Elige futuro».",
    careersUrl: "https://www.capgemini.com/es-es/talento/carreras-profesionales/elige-futuro/",
  },
  {
    name: "Oliver Wyman",
    type: "Boutique",
    madrid: null, // TODO(verify)
    barcelona: null, // TODO(verify)
    entry: "Consulta la convocatoria vigente.", // TODO(verify)
    careersUrl: "https://www.oliverwyman.com/careers.html",
  },
];
