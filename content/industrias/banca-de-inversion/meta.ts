import type { Source } from "@/components/ui";

/** Front matter shared by every investment-banking section (AGENTS.md rule 8). */
export const meta = {
  reviewer: "pendiente",
  reviewed_at: "2026-11-27",
  next_review: "2027-05-27",
} as const;

/** Numbered sources: `<Cite n={1} />` points at sources[0], and so on. */
export const sources: Source[] = [
  {
    title: "Global Advisory - Spain - Madrid - Graduate 2027",
    url: "https://www.rothschildandco.com/en/careers/students-and-graduates/opportunities/global-advisory-spain-madrid-graduate-2027/",
    publisher: "Rothschild & Co",
    accessed: "2026-11-27",
  },
  {
    title:
      "Santander offers over 300 positions for young people looking to launch their career in investment banking",
    url: "https://www.santander.com/en/press-room/press-releases/2025/09/santander-offers-over-300-positions-for-young-people-looking-to-launch-their-career-in-investment-banking",
    publisher: "Banco Santander",
    accessed: "2026-11-27",
  },
  {
    title: "Students & Graduates",
    url: "https://www.alantra.com/careers/students-graduates/",
    publisher: "Alantra",
    accessed: "2026-11-27",
  },
  {
    title:
      "PwC lidera el asesoramiento en transacciones en España en 2025 por decimocuarto año consecutivo (rankings de LSEG, Mergermarket, Dealogic y Bloomberg, según PwC)",
    url: "https://forbes.es/liderazgo/852987/pwc-lidera-el-asesoramiento-en-transacciones-en-espana-en-2025-por-decimocuarto-ano-consecutivo-segun-varios-rankings/",
    publisher: "Forbes España",
    accessed: "2026-11-27",
  },
  {
    title: "Transactions and Corporate Finance EY-Parthenon",
    url: "https://www.ey.com/es_es/services/strategy-transactions",
    publisher: "EY España",
    accessed: "2026-11-27",
  },
  {
    title:
      "Estudio de Remuneración 2026 (España), sección Investment Banking / Private Equity / Fondos de deuda",
    url: "https://eiposgrados.com/wp-content/uploads/2026/06/Estudio-de-Remuneracion-2026-Michael-Page-Spain.pdf",
    publisher: "Michael Page (copia alojada por EIP Business School)",
    accessed: "2026-11-27",
  },
  {
    title: "2027 | EMEA | Madrid | Investment Banking, Classic | Seasonal/Off Cycle Internship",
    url: "https://higher.gs.com/roles/170833",
    publisher: "Goldman Sachs",
    accessed: "2026-11-27",
  },
  {
    title: "JPMorgan just capped junior bankers' hours—at 80 per week",
    url: "https://fortune.com/2024/09/12/jpmorgan-cap-junior-bankers-hours/",
    publisher: "Fortune",
    accessed: "2026-11-27",
  },
  {
    title: "Las Big 4: vías de entrada (prácticas, internships de verano, curriculares)",
    url: "https://www.ie.edu/uncover-ie/es/las-big-4-ie-business-school/",
    publisher: "IE Business School",
    accessed: "2026-11-27",
  },
];
