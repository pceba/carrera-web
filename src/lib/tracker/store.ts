/**
 * Applications of a visitor without an account live in this browser only (`localStorage`).
 * Storage can be missing or throw (private mode, blocked cookies): every access is wrapped and the
 * page just renders empty.
 */
import type { Application } from "./types";
import { validateDraft } from "./validate";

export const STORAGE_KEY = "path.applications.v1";
const VERSION = 1;

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Keep only entries that pass validation; tolerate older/newer or hand-edited shapes. */
export function sanitizeStored(value: unknown): Application[] {
  if (typeof value !== "object" || value === null) return [];
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  const out: Application[] = [];
  for (const raw of items) {
    const result = validateDraft(raw);
    if (!result.ok) continue;
    const r = raw as Record<string, unknown>;
    const now = new Date().toISOString();
    out.push({
      ...result.value,
      id: typeof r.id === "string" && r.id ? r.id : newId(),
      created_at: typeof r.created_at === "string" ? r.created_at : now,
      updated_at: typeof r.updated_at === "string" ? r.updated_at : now,
    });
  }
  return out;
}

export function loadLocal(): Application[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeStored(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function serialize(items: Application[]): string {
  return JSON.stringify({ version: VERSION, items });
}

/** Returns false when the browser refused to store (the UI warns that nothing will persist). */
export function saveLocal(items: Application[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, serialize(items));
    return true;
  } catch {
    return false;
  }
}

export function clearLocal(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
