import type { MetadataRoute } from "next";
import { INDUSTRIES, PREP_GUIDES } from "../../content/catalog";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://path-ten-theta.vercel.app").replace(
  /\/$/,
  "",
);

/** Public, indexable routes. Account pages, sign-in, `/dev` and the API are left out on purpose. */
const STATIC_ROUTES = [
  "/",
  "/industrias",
  "/preparacion",
  "/recursos",
  "/ofertas",
  "/candidaturas",
  "/calendario",
  "/diagnostico",
  "/encaje",
  "/practica",
  "/legal/privacidad",
  "/legal/terminos",
  "/legal/cookies",
  "/legal/aviso-legal",
];

/** Content-driven: every industry hub and each of its sections/segments, plus written guides. */
export function paths(): string[] {
  const out = [...STATIC_ROUTES];
  for (const i of INDUSTRIES) {
    out.push(`/industrias/${i.slug}`);
    if (i.status === "live") {
      for (const p of [...i.sections, ...i.segments]) out.push(`/industrias/${i.slug}/${p.slug}`);
    }
  }
  for (const g of PREP_GUIDES) if (g.hasContent) out.push(`/preparacion/${g.slug}`);
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return paths().map((p) => ({ url: `${BASE}${p === "/" ? "" : p}` }));
}
