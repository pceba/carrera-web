/**
 * DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE.
 *
 * Single source of truth for legal text versions. Bump a version (and its date) whenever the
 * matching text changes in a way users should re-accept or be told about. The consents table
 * stores `privacy` and `terms` (see supabase/migrations: consents.privacy_version / terms_version).
 *
 * WS-C: replace the placeholder `LEGAL_VERSIONS` in `src/lib/supabase/env.ts` with
 *   export { LEGAL_VERSIONS } from "@/app/(public)/legal/versions";
 * (or import it directly where consents are written: `src/app/(account)/cuenta/actions.ts`).
 */
export const LEGAL_VERSIONS = {
  privacy: "2026-11-27",
  terms: "2026-11-27",
} as const;

/** Versions of pages that are not recorded in `consents` (informational only). */
export const OTHER_LEGAL_VERSIONS = {
  cookies: "2026-11-27",
  legalNotice: "2026-11-27",
} as const;

/** Human-readable "last updated" dates, same day as the version string. */
export const LEGAL_DATES = {
  privacy: "27 de noviembre de 2026",
  terms: "27 de noviembre de 2026",
  cookies: "27 de noviembre de 2026",
  legalNotice: "27 de noviembre de 2026",
} as const;

export type LegalVersions = typeof LEGAL_VERSIONS;
