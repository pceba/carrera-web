import { isValidElement, type ReactNode } from "react";

/**
 * Reading helpers for guide pages: heading ids, the table of contents and the reading time.
 * Everything is derived from the MDX source or the rendered children; no text is ever changed.
 */

export type TocItem = { id: string; title: string };

/** "Cómo se entra" -> "como-se-entra". */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "seccion"
  );
}

/** Unique ids in document order: the second "Resumen" becomes "resumen-2". One per page render. */
export function makeSlugger() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/** Plain text of rendered children (a heading with <strong> or a <Cite /> inside still works). */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/** Markdown inline syntax and JSX tags out, leaving what a reader sees. */
function plain(md: string): string {
  return md
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The `##` headings of an MDX source, outside code fences, with the ids the page will give them. */
export function extractHeadings(source: string): TocItem[] {
  const slug = makeSlugger();
  const items: TocItem[] = [];
  let fenced = false;
  for (const line of source.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m?.[1]) continue;
    const title = plain(m[1]);
    if (title) items.push({ id: slug(title), title });
  }
  return items;
}

/** Whole minutes at 220 words per minute (Spanish, reading to learn), never less than 1. */
export function readingMinutes(source: string): number {
  const text = source
    .replace(/^\s*(import|export)\s.*$/gm, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>|-]/g, " ");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.round(words / 220));
}
