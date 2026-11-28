"use client";

import { useCallback, useSyncExternalStore } from "react";

/** localStorage key for saved library items. Ids are `r:<resource id>` or `p:<guide slug>`. */
export const SAVED_KEY = "path.saved.v1";

const EMPTY: readonly string[] = [];
let cache: { raw: string | null; value: readonly string[] } = { raw: null, value: EMPTY };
const listeners = new Set<() => void>();

function read(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SAVED_KEY);
  } catch {
    return cache.value;
  }
  if (raw === cache.raw) return cache.value;
  let value: readonly string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    value = EMPTY;
  }
  cache = { raw, value };
  return value;
}

function write(next: readonly string[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: keep it for this visit only.
    cache = { raw: cache.raw, value: next };
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Saved ids (empty on the server and first paint) plus a toggle. */
export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((id: string) => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, []);
  return { saved, toggle };
}
