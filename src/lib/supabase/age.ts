import { SITE } from "@/lib/site";

/** Mirrors `public.is_old_enough` in the DB: coarse, year-based (we only collect the birth year). */
export function isOldEnough(birthYear: number, now: Date = new Date()): boolean {
  return (
    Number.isInteger(birthYear) && birthYear >= 1900 && now.getFullYear() - birthYear >= SITE.minAge
  );
}

/** Parses a form value into a plausible birth year, or null. */
export function parseBirthYear(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !/^\d{4}$/.test(value.trim())) return null;
  const year = Number(value);
  return year >= 1900 && year <= new Date().getFullYear() ? year : null;
}
