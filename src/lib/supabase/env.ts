/** Public Supabase settings. Returns null when not configured so the site still builds and runs. */
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

/** Bump when the legal texts (WS-D) change; stored with each consent. */
export { LEGAL_VERSIONS } from "@/app/(public)/legal/versions";
