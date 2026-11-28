import {
  INDUSTRIES,
  industryHref,
  pageHref,
  PREP_GUIDES,
  prepHref,
} from "../../../content/catalog";
import { ROUTES, TOOLS } from "../ui/site-data";

/**
 * Items of the command palette: everything a visitor can navigate to, built from the catalog so a
 * new industry or guide shows up with no extra work. Pure functions, unit-tested.
 */
export type PaletteGroup =
  "Herramientas" | "Industrias" | "Guías de industria" | "Preparación" | "Cuenta" | "Acciones";

export type PaletteItem = {
  id: string;
  group: PaletteGroup;
  title: string;
  /** Second line: where it lives or what it does. */
  hint: string;
  /** Navigation target. Items without `href` are actions handled by the palette. */
  href?: string;
  /** Extra words that should find the item. */
  keywords?: string;
};

export function buildPaletteItems(): PaletteItem[] {
  const items: PaletteItem[] = [];

  for (const t of TOOLS) {
    items.push({
      id: `tool-${t.href}`,
      group: "Herramientas",
      title: t.label,
      hint: t.text,
      href: t.href,
    });
  }

  items.push({
    id: "industrias",
    group: "Industrias",
    title: "Todas las industrias",
    hint: "El mapa de las seis industrias",
    href: ROUTES.industries,
    keywords: "mapa sectores",
  });
  for (const i of INDUSTRIES) {
    items.push({
      id: `industry-${i.slug}`,
      group: "Industrias",
      title: i.title,
      hint: i.status === "preparing" ? "En preparación" : i.line,
      href: industryHref(i.slug),
    });
    for (const p of [...i.sections, ...i.segments]) {
      items.push({
        id: `page-${i.slug}-${p.slug}`,
        group: "Guías de industria",
        title: `${i.title}: ${p.title}`,
        hint: p.summary,
        href: pageHref(i.slug, p.slug),
      });
    }
  }

  items.push({
    id: "preparacion",
    group: "Preparación",
    title: "Todas las guías de preparación",
    hint: "Entrevistas, pruebas, CV y networking",
    href: ROUTES.prep,
  });
  for (const g of PREP_GUIDES) {
    items.push({
      id: `prep-${g.slug}`,
      group: "Preparación",
      title: g.title,
      hint: g.summary,
      href: prepHref(g.slug),
    });
  }
  items.push({
    id: "recursos",
    group: "Preparación",
    title: "Biblioteca de recursos",
    hint: "Guías, webs oficiales, casos y libros",
    href: ROUTES.resources,
    keywords: "libros podcasts",
  });

  items.push(
    {
      id: "entrar",
      group: "Cuenta",
      title: "Entrar o crear cuenta",
      hint: "Con enlace al correo, sin contraseña",
      href: ROUTES.signIn,
      keywords: "login registro",
    },
    {
      id: "cuenta",
      group: "Cuenta",
      title: "Mi cuenta",
      hint: "Tus datos y tu encaje",
      href: ROUTES.account,
    },
  );

  items.push({
    id: "copiar-enlace",
    group: "Acciones",
    title: "Copiar enlace de esta página",
    hint: "Lo copia al portapapeles",
    keywords: "compartir url",
  });
  return items;
}

/** Lowercase and strip accents so "preparacion" finds "Preparación". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Every word of the query must appear in the title, hint or keywords. Title matches rank first
 * (a match at the start of the title first of all); the catalog order breaks ties.
 */
export function searchPalette(items: readonly PaletteItem[], query: string): PaletteItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [...items];
  const scored: { item: PaletteItem; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    const title = normalize(item.title);
    const rest = normalize(`${item.hint} ${item.keywords ?? ""}`);
    let score = 0;
    for (const w of words) {
      if (title.startsWith(w)) score += 4;
      else if (title.split(/[\s:]+/).some((t) => t.startsWith(w))) score += 3;
      else if (title.includes(w)) score += 2;
      else if (rest.includes(w)) score += 1;
      else return;
    }
    scored.push({ item, score, index });
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.map((s) => s.item);
}
