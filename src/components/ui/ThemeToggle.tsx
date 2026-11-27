"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";
import styles from "./theme.module.css";

type Theme = "system" | "light" | "dark";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "Automático",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "light",
    label: "Claro",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Oscuro",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M16.2 12.6A6.6 6.6 0 0 1 7.4 3.8a6.6 6.6 0 1 0 8.8 8.8z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function write(theme: Theme) {
  const root = document.documentElement;
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies to this page view.
  }
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Three-way theme switch (automatic by default). Every instance on the page stays in sync.
 * `labels` shows the words next to the icons (used in the mobile menu).
 */
export function ThemeToggle({ labels = false }: { labels?: boolean }) {
  const current = useSyncExternalStore(subscribe, read, () => "system" as Theme);
  return (
    <div
      role="group"
      aria-label="Tema de color"
      className={`${styles.group} ${labels ? styles.withLabels : ""}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={current === o.value}
          aria-label={labels ? undefined : o.label}
          title={labels ? undefined : o.label}
          className={styles.option}
          onClick={() => write(o.value)}
        >
          {o.icon}
          {labels ? <span>{o.label}</span> : null}
        </button>
      ))}
    </div>
  );
}
