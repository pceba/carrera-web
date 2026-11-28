import { toDbIndustries, type DbIndustry } from "./industries";

/** Same limits as the `alert_subscriptions` check constraints (plus a per-item length cap). */
export const LIMITS = { industries: 6, roles: 10, skills: 20, locations: 10, item: 80 } as const;
export const REMOTE_VALUES = ["any", "remote", "onsite"] as const;
export type RemotePref = (typeof REMOTE_VALUES)[number];

export interface Preferences {
  industries: DbIndustry[];
  roles: string[];
  skills: string[];
  locations: string[];
  remote: RemotePref;
}

/** "SQL, Python ,, " -> ["SQL", "Python"]; splits on commas, semicolons and new lines. */
export function splitList(text: string): string[] {
  const seen = new Set<string>();
  for (const part of text.split(/[,;\n]/)) {
    const item = part.trim();
    if (item) seen.add(item);
  }
  return [...seen];
}

export type PreferencesResult = { ok: true; value: Preferences } | { ok: false; error: string };

/** Validates untrusted form input on the server; the database enforces the same numbers. */
export function validatePreferences(input: {
  industries: readonly string[];
  roles: string;
  skills: string;
  locations: string;
  remote: string;
}): PreferencesResult {
  const industries = toDbIndustries(input.industries);
  const roles = splitList(input.roles);
  const skills = splitList(input.skills);
  const locations = splitList(input.locations);

  if (industries.length === 0) return { ok: false, error: "Elige al menos una industria." };
  if (roles.length > LIMITS.roles) return { ok: false, error: `Puestos: máximo ${LIMITS.roles}.` };
  if (skills.length > LIMITS.skills)
    return { ok: false, error: `Habilidades: máximo ${LIMITS.skills}.` };
  if (locations.length > LIMITS.locations)
    return { ok: false, error: `Ciudades: máximo ${LIMITS.locations}.` };
  if ([...roles, ...skills, ...locations].some((s) => s.length > LIMITS.item))
    return { ok: false, error: `Cada elemento admite como máximo ${LIMITS.item} caracteres.` };
  if (!REMOTE_VALUES.includes(input.remote as RemotePref))
    return { ok: false, error: "Preferencia de trabajo remoto no válida." };

  return {
    ok: true,
    value: { industries, roles, skills, locations, remote: input.remote as RemotePref },
  };
}

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** The unsubscribe token is a UUID; anything else is treated as "no subscription" without a query. */
export const isToken = (value: unknown): value is string =>
  typeof value === "string" && TOKEN_RE.test(value);
