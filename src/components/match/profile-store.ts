/**
 * The person's profile lives in this browser only (`localStorage`). Storage can be missing or
 * throw (private mode, blocked cookies), so every access is wrapped and the page works without it.
 * The CV itself is never stored: only the structured fields of `Profile`.
 */
import type { Industry } from "@/lib/generated/Industry";
import type { Profile } from "@/lib/generated/Profile";
import { INDUSTRY_LABELS } from "@/lib/postings/types";

const KEY = "carrera-web.profile.v1";

export const EMPTY_PROFILE: Profile = {
  industries: [],
  roles: [],
  skills: [],
  languages: [],
  education: [],
  locations: [],
  remote: "any",
};

export const INDUSTRIES = Object.keys(INDUSTRY_LABELS) as Industry[];

/** "SQL, Python ,, " -> ["SQL", "Python"]; also splits on new lines and semicolons. */
export function parseList(text: string): string[] {
  const seen = new Set<string>();
  for (const part of text.split(/[,;\n]/)) {
    const item = part.trim();
    if (item) seen.add(item);
  }
  return [...seen];
}

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

/** Accept anything that came out of storage; keep only what is valid (older/newer shapes). */
export function sanitizeProfile(value: unknown): Profile {
  if (typeof value !== "object" || value === null) return { ...EMPTY_PROFILE };
  const v = value as Record<string, unknown>;
  const list = (key: string): string[] => (isStringList(v[key]) ? (v[key] as string[]) : []);
  return {
    industries: list("industries").filter((i): i is Industry => INDUSTRIES.includes(i as Industry)),
    roles: list("roles"),
    skills: list("skills"),
    languages: list("languages"),
    education: list("education"),
    locations: list("locations"),
    remote: v.remote === "remote" || v.remote === "onsite" ? v.remote : "any",
  };
}

export function loadProfile(): Profile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitizeProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable: the profile just won't survive a reload */
  }
}

export function clearProfile(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
