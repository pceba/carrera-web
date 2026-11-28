"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { clearLocal, sanitizeStored, saveLocal, serialize, STORAGE_KEY } from "@/lib/tracker/store";
import type { Application } from "@/lib/tracker/types";

const EVENT = "path:applications";
/** Copy kept in memory when the browser refuses to store, so the page still works until reload. */
let memory: string | null = null;
let failed = false;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function snapshot(): string {
  if (memory !== null) return memory;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * The entries of a visitor without an account. `items` is `null` until the browser has hydrated
 * (so server and client render the same first frame) and `persisted` is false when storage failed.
 */
export function useLocalApplications() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const items = useMemo<Application[] | null>(() => {
    if (raw === null) return null;
    try {
      return raw ? sanitizeStored(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  }, [raw]);

  const save = useCallback((next: Application[]) => {
    failed = !saveLocal(next);
    memory = failed ? serialize(next) : null;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const clear = useCallback(() => {
    clearLocal();
    memory = null;
    failed = false;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { items, save, clear, persisted: !failed };
}
