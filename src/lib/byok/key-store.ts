import type { ProviderId } from "./types";

/**
 * Where the user's API key lives: this browser only. `sessionStorage` by default (gone when the
 * tab closes); `localStorage` only if the user ticks "Recordar en este navegador". Every access is
 * wrapped in try/catch because storage can be blocked. Nothing here ever sends the key anywhere.
 */
const KEY_PREFIX = "path.byok.key.";
const REMEMBER = "path.byok.remember";

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function loadKey(provider: ProviderId): { key: string; remembered: boolean } | null {
  const name = KEY_PREFIX + provider;
  const session = safe(() => sessionStorage.getItem(name), null);
  if (session) return { key: session, remembered: false };
  const local = safe(() => localStorage.getItem(name), null);
  if (local) return { key: local, remembered: true };
  return null;
}

/** Saves the key in exactly one place: the other storage is cleared, so "remember" is honest. */
export function saveKey(provider: ProviderId, key: string, remember: boolean): boolean {
  const name = KEY_PREFIX + provider;
  return safe(() => {
    if (remember) {
      localStorage.setItem(name, key);
      sessionStorage.removeItem(name);
    } else {
      sessionStorage.setItem(name, key);
      localStorage.removeItem(name);
    }
    return true;
  }, false);
}

export function clearKey(provider: ProviderId) {
  const name = KEY_PREFIX + provider;
  safe(() => sessionStorage.removeItem(name), undefined);
  safe(() => localStorage.removeItem(name), undefined);
}

/** Last choice of the checkbox (not the key). */
export function loadRememberPreference(): boolean {
  return safe(() => localStorage.getItem(REMEMBER) === "1", false);
}
export function saveRememberPreference(on: boolean) {
  safe(
    () => (on ? localStorage.setItem(REMEMBER, "1") : localStorage.removeItem(REMEMBER)),
    undefined,
  );
}

/** `AIza••••1a2b`: enough to recognise the key, never enough to use it. */
export function maskKey(key: string): string {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
