"use client";

import Link from "next/link";
import { useState } from "react";
import type { ResourceType } from "../../../content/catalog";
import { TypeIcon } from "./TypeIcon";
import { useSaved } from "./saved";
import styles from "./library.module.css";

/** Serializable card data, built on the server. */
export type ResourceCard = {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  typeLabel: string;
  publisher: string;
  industries: string;
  note: string;
  checked: string;
  checkedLabel: string;
};

/** Host of the link without "www.", so people see where they are going. */
function domain(url: string): string {
  if (url.startsWith("/")) return "esta web";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Search, saved-only filter and save buttons over the (server-filtered) resource cards. */
export function ResourceLibrary({
  cards,
  emptyText,
}: {
  cards: ResourceCard[];
  emptyText: string;
}) {
  const { saved, toggle } = useSaved();
  const [q, setQ] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const mine = cards.filter((c) => saved.includes(`r:${c.id}`)).length;
  const term = q.trim().toLowerCase();
  const shown = cards.filter(
    (c) =>
      (!onlySaved || saved.includes(`r:${c.id}`)) &&
      (!term ||
        `${c.title} ${c.publisher} ${c.note} ${c.industries} ${c.typeLabel}`
          .toLowerCase()
          .includes(term)),
  );

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <label className={styles.search}>
          <span className={styles.srOnly}>Buscar recursos</span>
          <input
            type="search"
            value={q}
            placeholder="Buscar por título, editor o tema"
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
      <p className={styles.status} aria-live="polite">
        Mostrando {shown.length} de {cards.length} recursos
      </p>

      {cards.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty}>
          {onlySaved && !term
            ? "Aún no has guardado ningún recurso. Usa «Guardar» en cualquier tarjeta."
            : "Ningún recurso coincide con tu búsqueda."}
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((r) => {
            const internal = r.url.startsWith("/");
            const isSaved = saved.includes(`r:${r.id}`);
            return (
              <li key={r.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.type}>
                    <TypeIcon type={r.type} className={styles.icon} />
                    {r.typeLabel}
                  </span>
                  <button
                    type="button"
                    className={styles.save}
                    aria-pressed={isSaved}
                    aria-label={`${isSaved ? "Quitar de guardados" : "Guardar"}: ${r.title}`}
                    onClick={() => toggle(`r:${r.id}`)}
                  >
                    {isSaved ? "Guardado" : "Guardar"}
                  </button>
                </div>
                <h2 className={styles.title}>
                  {internal ? (
                    <Link href={r.url}>{r.title}</Link>
                  ) : (
                    <a href={r.url} rel="noopener noreferrer" target="_blank">
                      {r.title}
                      <span className={styles.srOnly}> (se abre en otra pestaña)</span>
                    </a>
                  )}
                </h2>
                <p className={styles.meta}>
                  {r.publisher} · <span className={styles.domain}>{domain(r.url)}</span>
                  {r.industries ? ` · ${r.industries}` : ""}
                </p>
                <p className={styles.note}>{r.note}</p>
                <p className={styles.checked}>
                  Revisado el <time dateTime={r.checked}>{r.checkedLabel}</time>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
