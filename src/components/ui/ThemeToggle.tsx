"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";
import styles from "./theme.module.css";

const listeners = new Set<() => void>();

function readDark(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return document.documentElement.dataset.theme === "dark";
  }
}

function setDark(dark: boolean) {
  const root = document.documentElement;
  try {
    if (dark) localStorage.setItem(THEME_KEY, "dark");
    else localStorage.removeItem(THEME_KEY);
  } catch {
    // Storage blocked: the choice still applies to this page view.
  }
  if (dark) root.dataset.theme = "dark";
  else delete root.dataset.theme;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Opt-in dark theme: one toggle button (light is the default for everyone). Every instance on
 * the page stays in sync. `labels` shows the words next to the icon (used in the mobile menu).
 */
export function ThemeToggle({ labels = false }: { labels?: boolean }) {
  const dark = useSyncExternalStore(subscribe, readDark, () => false);
  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={labels ? undefined : "Tema oscuro"}
      title={labels ? undefined : "Tema oscuro"}
      className={`${styles.toggle} ${labels ? styles.withLabel : ""}`}
      onClick={() => setDark(!dark)}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M16.2 12.6A6.6 6.6 0 0 1 7.4 3.8a6.6 6.6 0 1 0 8.8 8.8z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {labels ? <span>Tema oscuro</span> : null}
    </button>
  );
}
