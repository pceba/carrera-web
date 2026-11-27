import fs from "node:fs";
import path from "node:path";
import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import type { Source } from "@/components/ui";

/**
 * Loads industry content by convention (see content/catalog.ts). Server-only: pages using it are
 * prerendered at build time, so the file reads below never run on a request.
 */

type MdxModule = {
  default: ComponentType<{ components?: MDXComponents }>;
  /** Extra source numbers cited by components (e.g. a table), not by inline <Cite>. */
  cites?: number[];
};

export type IndustryMeta = {
  meta: { reviewer: string; reviewed_at: string; next_review: string };
  sources: Source[];
};

export async function loadPage(industry: string, page: string): Promise<MdxModule> {
  return import(`../../../../../content/industrias/${industry}/${page}.mdx`);
}

export async function loadMeta(industry: string): Promise<IndustryMeta> {
  return import(`../../../../../content/industrias/${industry}/meta.ts`);
}

/** Source numbers cited on a page: inline `<Cite n={k} />` plus the module's `cites` export. */
export function citedOn(industry: string, page: string, mod?: MdxModule): number[] {
  const file = path.join(process.cwd(), "content", "industrias", industry, `${page}.mdx`);
  const text = fs.readFileSync(file, "utf8");
  const inline = [...text.matchAll(/<Cite\s+n=\{(\d+)\}/g)].map((m) => Number(m[1]));
  return [...new Set([...inline, ...(mod?.cites ?? [])])].sort((a, b) => a - b);
}
