import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://path-ten-theta.vercel.app").replace(
  /\/$/,
  "",
);

/** Mirrors the root metadata: nothing is indexable unless NEXT_PUBLIC_INDEXABLE=true. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_INDEXABLE !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cuenta/", "/entrar", "/api/", "/dev/"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
