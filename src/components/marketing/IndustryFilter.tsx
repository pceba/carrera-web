"use client";

import { useState, type ReactNode } from "react";
import styles from "./industry-filter.module.css";

type Filter = "todas" | "live" | "preparing";

/**
 * Filter chips over a grid of already-rendered cards. The server builds the cards (so the
 * links and text are in the HTML); this only decides which ones show. Chips are toggle buttons
 * (`aria-pressed`) and a polite status line says how many are shown.
 */
export function IndustryFilter({
  items,
}: {
  items: { slug: string; status: "live" | "preparing"; card: ReactNode }[];
}) {
  const [filter, setFilter] = useState<Filter>("todas");
  const count = (s: "live" | "preparing") => items.filter((i) => i.status === s).length;
  const chips: { id: Filter; label: string; n: number }[] = [
    { id: "todas", label: "Todas", n: items.length },
    { id: "live", label: "Con guía", n: count("live") },
    { id: "preparing", label: "Próximamente", n: count("preparing") },
  ];
  const shown = items.filter((i) => filter === "todas" || i.status === filter);

  return (
    <div className={styles.root}>
      <div role="group" aria-label="Filtrar industrias" className={styles.chips}>
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.chip}
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
            <span className={styles.n}>{c.n}</span>
          </button>
        ))}
      </div>
      <p className={styles.status} role="status">
        Mostrando {shown.length} de {items.length} industrias
      </p>
      <ul className={styles.grid}>
        {shown.map((i) => (
          <li key={i.slug}>{i.card}</li>
        ))}
      </ul>
    </div>
  );
}
