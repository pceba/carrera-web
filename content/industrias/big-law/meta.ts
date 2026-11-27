import type { Source } from "@/components/ui";

/** Front matter shared by every Big Law section (AGENTS.md rule 8). */
export const meta = {
  reviewer: "pendiente",
  reviewed_at: "2026-11-27",
  next_review: "2027-05-27",
} as const;

/** Numbered sources: `<Cite n={1} />` points at sources[0], and so on. */
export const sources: Source[] = [
  {
    title:
      "Ley 34/2006, de 30 de octubre, sobre el acceso a las profesiones de la Abogacía y la Procura (texto consolidado)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-18870",
    publisher: "Boletín Oficial del Estado",
    accessed: "2026-11-27",
  },
  {
    title:
      "Orden PJC/298/2026, de 24 de marzo, por la que se convoca la prueba de evaluación de aptitud profesional para el ejercicio de la profesión de la abogacía para el año 2026",
    url: "https://icab.es/es/actualidad/noticias/noticia/Orden-PJC-298-2026-de-24-de-marzo-por-la-que-se-convoca-la-prueba-de-evaluacion-de-aptitud-profesional-para-el-ejercicio-de-la-profesion-de-la-abogacia-para-el-ano-2026/",
    publisher: "Ilustre Colegio de la Abogacía de Barcelona (ICAB)",
    accessed: "2026-11-27",
  },
  {
    title: "Proceso de selección",
    url: "https://www.uria.com/es/talento/proceso",
    publisher: "Uría Menéndez",
    accessed: "2026-11-27",
  },
  {
    title: "Programas de prácticas",
    url: "https://www.cuatrecasas.com/es/spain/unete/programas-de-practicas",
    publisher: "Cuatrecasas",
    accessed: "2026-11-27",
  },
  {
    title: "Talento: por qué somos únicos",
    url: "https://www.perezllorca.com/es-mx/talento/",
    publisher: "Pérez-Llorca",
    accessed: "2026-11-27",
  },
  {
    title: "Prácticas de verano",
    url: "https://ga-p.com/empleo/practicas-de-verano/",
    publisher: "Gómez-Acebo & Pombo",
    accessed: "2026-11-27",
  },
  {
    title: "Students and graduates (Spain)",
    url: "https://www.aoshearman.com/careers/spain/students-and-graduates",
    publisher: "A&O Shearman",
    accessed: "2026-11-27",
  },
  {
    title: "Graduates (Spain)",
    url: "https://www.freshfields.com/en/your-career/spain/legal-services/graduates",
    publisher: "Freshfields",
    accessed: "2026-11-27",
  },
  {
    title: "Prácticas de Máster de Acceso a la Abogacía 2028 (Madrid)",
    url: "https://jobs.cliffordchance.com/es",
    publisher: "Clifford Chance",
    accessed: "2026-11-27",
  },
  {
    title:
      "Los salarios medios de los abogados españoles varían desde 18.000 hasta 152.000 euros, según Signium (XXI Estudio salarial del sector legal, Signium con la UFV)",
    url: "https://forbes.es/economia/873961/los-salarios-medios-de-los-abogados-espanoles-varian-desde-18-000-hasta-152-000-euros-segun-signium/",
    publisher: "Forbes España",
    accessed: "2026-11-27",
  },
  {
    title: "Cuatrecasas sella una alianza estratégica con Harvey para implantar la IA generativa",
    url: "https://www.cuatrecasas.com/es/spain/art/cuatrecasas-sella-una-alianza-estrategica-con-harvey-para-implantar-la-ia-generativa",
    publisher: "Cuatrecasas",
    accessed: "2026-11-27",
  },
];
