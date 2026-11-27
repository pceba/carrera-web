export type FirmType = "Estrategia" | "Big Four" | "Tecnología";

export type Firm = {
  name: string;
  type: FirmType;
  /** Offices in Madrid / Barcelona. `null` = not confirmed by an official or reputable source. */
  madrid: boolean | null;
  barcelona: boolean | null;
  /** Only what a cited source says, or a pointer to the official page. */
  entry: string;
  careersUrl: string;
  /** 1-based indexes into `sources` that back the offices/entry columns. */
  cite: number[];
};

export const firms: Firm[] = [
  {
    name: "McKinsey & Company",
    type: "Estrategia",
    madrid: true,
    barcelona: true,
    entry: "Business Analyst Intern (Tech & AI).",
    careersUrl: "https://www.mckinsey.com/careers",
    cite: [1, 17],
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
    barcelona: null,
    entry: "Prácticas para grado y posgrado, de unos días a un verano completo.",
    careersUrl: "https://www.bain.com/es/careers/",
    cite: [5, 8],
  },
  {
    name: "Oliver Wyman",
    type: "Estrategia",
    madrid: true,
    barcelona: true,
    entry: "International Mentorship Program (Spain), con plazas en Madrid.",
    careersUrl: "https://www.oliverwyman.com/careers.html",
    cite: [13, 14, 15],
  },
  {
    name: "KPMG España",
    type: "Big Four",
    madrid: true,
    barcelona: true,
    entry: "Prácticas de verano, prácticas de últimos cursos, plazas STEM y programa Sin Límites.",
    careersUrl: "https://www.kpmg.com/es/es/carreras.html",
    cite: [3, 9],
  },
  {
    name: "Deloitte España",
    type: "Big Four",
    madrid: null,
    barcelona: null,
    entry: "Programa de prácticas Glow Up.",
    careersUrl: "https://www.deloitte.com/es/es/careers.html",
    cite: [10],
  },
  {
    name: "EY España",
    type: "Big Four",
    madrid: true,
    barcelona: true,
    entry:
      "Prácticas y programas de incorporación de perfiles junior (convocatorias en careers.ey.com).",
    careersUrl: "https://www.ey.com/es_es/careers",
    cite: [11],
  },
  {
    name: "PwC España",
    type: "Big Four",
    madrid: true,
    barcelona: null,
    entry: "PwC Excellence: programa de talento universitario (bases de la edición de 2022).",
    careersUrl: "https://www.pwc.es",
    cite: [16],
  },
  {
    name: "Accenture",
    type: "Tecnología",
    madrid: null,
    barcelona: null,
    entry: "Programas de prácticas: consulta la convocatoria en su web.",
    careersUrl: "https://www.accenture.com/es-es/careers",
    cite: [12],
  },
  {
    name: "Capgemini",
    type: "Tecnología",
    madrid: null,
    barcelona: null,
    entry: "Programa de talento junior «Elige futuro».",
    careersUrl: "https://www.capgemini.com/es-es/talento/carreras-profesionales/elige-futuro/",
    cite: [7],
  },
];
