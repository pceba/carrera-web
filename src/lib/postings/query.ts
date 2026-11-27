import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Filters, Posting } from "./types";

export const PAGE_SIZE = 60;
const COLUMNS =
  "id,source,source_url,company,title,location,city,remote,level,industry,posted_at,first_seen_at";

/** PostgREST query string for the filters. Values come from `parseFilters`, never raw input. */
export function buildQuery(filters: Filters): string {
  const q = new URLSearchParams({
    select: COLUMNS,
    active: "eq.true",
    order: "posted_at.desc.nullslast,first_seen_at.desc",
    limit: String(PAGE_SIZE),
  });
  if (filters.industry) q.set("industry", `eq.${filters.industry}`);
  if (filters.level) q.set("level", `eq.${filters.level}`);
  if (filters.city) q.set("city", `eq.${filters.city}`);
  if (filters.remote) q.set("remote", "eq.true");
  return q.toString();
}

/**
 * Live postings, newest first. Reads with the anon key (RLS only exposes active rows). Returns an
 * empty list when Supabase is not configured or unreachable, so the page always renders.
 */
export async function fetchPostings(
  filters: Filters,
  fetcher: typeof fetch = fetch,
): Promise<Posting[]> {
  const env = getSupabaseEnv();
  if (!env) return [];
  try {
    const res = await fetcher(`${env.url}/rest/v1/postings?${buildQuery(filters)}`, {
      headers: { apikey: env.anonKey, Authorization: `Bearer ${env.anonKey}` },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const rows: unknown = await res.json();
    return Array.isArray(rows) ? (rows as Posting[]) : [];
  } catch {
    return [];
  }
}
