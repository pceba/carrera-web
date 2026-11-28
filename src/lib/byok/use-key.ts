"use client";

import { useSyncExternalStore } from "react";
import { clearKey, loadKey, saveKey } from "./key-store";
import type { ProviderId } from "./types";

/**
 * React view of the stored key. Storage is an external store, so `useSyncExternalStore` keeps
 * the server render (no key) and the first client render equal, then switches to the real value.
 * Writes go through the helpers below so every mounted component updates at once.
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export type StoredKey = { key: string; remembered: boolean } | null;

export function useStoredKey(provider: ProviderId): StoredKey {
  // The snapshot is a string so React can compare it by value between renders.
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      const k = loadKey(provider);
      return k ? `${k.remembered ? "L" : "S"}${k.key}` : "";
    },
    () => "",
  );
  return snap ? { key: snap.slice(1), remembered: snap[0] === "L" } : null;
}

export function storeKey(provider: ProviderId, key: string, remember: boolean): boolean {
  const ok = saveKey(provider, key, remember);
  emit();
  return ok;
}

export function removeKey(provider: ProviderId) {
  clearKey(provider);
  emit();
}
