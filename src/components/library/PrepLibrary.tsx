"use client";

import Link from "next/link";
import { useState } from "react";
import { useSaved } from "./saved";
import styles from "./library.module.css";

export type PrepCard = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  /** Industry slugs it applies to. */
  industries: string[];
  /** Printable "where it is used" line. */
  where: string;
  ready: boolean;
};

/** Search, industry chips and saved-only filter over the preparation guides. */
export function PrepLibrary({
  cards,
  industries,
}: {
  cards: PrepCard[];
  industries: { slug: string; title: string }[];
}) {
  const { saved, toggle } = useSaved();
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [onlySaved, setOnlySaved] = useState(false);
  const mine = cards.filter((c) => saved.includes(`p:${c.slug}`)).length;
  const term = q.trim().toLowerCase();
  const shown = cards.filter(
    (c) =>
      (!industry || c.industries.includes(industry)) &&
      (!onlySaved || saved.includes(`p:${c.slug}`)) &&
      (!term || `${c.title} ${c.summary} ${c.where}`.toLowerCase().includes(term)),
  );

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <label className={styles.search}>
          <span className={styles.srOnly}>Buscar guías</span>
          <input
            type="search"
            value={q}
            placeholder="Buscar una guía"
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <button
          type="button"
          className={styles.savedToggle}
          aria-pressed={onlySaved}
          onClick={() => setOnlySaved((v) => !v)}
        >
          Guardados <span className={styles.count}>{mine}</span>
        </button>
      </div>
      <div role="group" aria-label="Filtrar por industria" className={styles.chips}>
        <button
          type="button"
          className={styles.chip}
          aria-pressed={industry === null}
          onClick={() => setIndustry(null)}
        >
          Todas
        </button>
        {industries.map((i) => (
          <button
            key={i.slug}
            type="button"
            className={styles.chip}
            aria-pressed={industry === i.slug}
            onClick={() => setIndustry(industry === i.slug ? null : i.slug)}
          >
            {i.title}
          </button>
        ))}
      </div>
      <p className={styles.status} aria-live="polite">
        Mostrando {shown.length} de {cards.length} guías
      </p>
      {shown.length === 0 ? (
        <p className={styles.empty}>
          {onlySaved && !term && !industry
            ? "Aún no has guardado ninguna guía. Usa «Guardar» en cualquier tarjeta."
            : "Ninguna guía coincide con tu búsqueda."}
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((g) => {
            const isSaved = saved.includes(`p:${g.slug}`);
            return (
              <li key={g.slug} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.type}>{g.ready ? "Guía" : "En preparación"}</span>
                  <button
                    type="button"
                    className={styles.save}
                    aria-pressed={isSaved}
                    aria-label={`${isSaved ? "Quitar de guardados" : "Guardar"}: ${g.title}`}
                    onClick={() => toggle(`p:${g.slug}`)}
                  >
                    {isSaved ? "Guardado" : "Guardar"}
                  </button>
                </div>
                <h2 className={styles.title}>
                  <Link href={g.href}>{g.title}</Link>
                </h2>
                <p className={styles.note}>{g.summary}</p>
                <p className={styles.meta}>{g.where}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
