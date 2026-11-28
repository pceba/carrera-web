"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Dialog } from "../ui/Dialog";
import { toast } from "../ui/Toast";
import { buildPaletteItems, searchPalette, type PaletteItem } from "./palette-data";
import styles from "./palette.module.css";

/**
 * Command palette (Ctrl/⌘K or the header search button): one search field over the whole catalog
 * (tools, industries, guide pages, preparation, account) plus a couple of actions.
 * ARIA combobox pattern: focus stays in the input, `aria-activedescendant` points at the option.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const all = useMemo(buildPaletteItems, []);

  // Groups appear in order of their best match, and the flat `results` list follows the same
  // order, so the keyboard order always equals the visual order.
  const groups = useMemo(() => {
    const found = query.trim()
      ? searchPalette(all, query)
      : // Without a query keep it short: the guide pages are one search away.
        all.filter((i) => i.group !== "Guías de industria");
    const map = new Map<string, PaletteItem[]>();
    for (const item of found) map.set(item.group, [...(map.get(item.group) ?? []), item]);
    return [...map.entries()];
  }, [all, query]);
  const results = useMemo(() => groups.flatMap(([, items]) => items), [groups]);

  const optionId = (item: PaletteItem) => `${uid}-${item.id}`;
  const current = results[Math.min(active, results.length - 1)];

  function run(item: PaletteItem) {
    onClose();
    if (item.href) {
      router.push(item.href);
      return;
    }
    if (item.id === "copiar-enlace") {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast("Enlace copiado"))
        .catch(() => toast("No se pudo copiar el enlace"));
    }
  }

  function move(next: number) {
    const i = (next + results.length) % results.length;
    setActive(i);
    const el = results[i] ? document.getElementById(optionId(results[i])) : null;
    el?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(active - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(results.length - 1);
    } else if (e.key === "Enter" && current) {
      e.preventDefault();
      run(current);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setQuery("");
        setActive(0);
        onClose();
      }}
      title="Buscar en Path"
      hideTitle
      placement="top"
    >
      <div className={styles.search}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-activedescendant={current ? optionId(current) : undefined}
          aria-autocomplete="list"
          aria-label="Buscar industrias, guías y herramientas"
          placeholder="Busca una industria o guía…"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          className={styles.input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        <kbd className={styles.esc}>Esc</kbd>
      </div>

      <div
        id={`${uid}-list`}
        role="listbox"
        aria-label="Resultados"
        className={styles.list}
        ref={listRef}
      >
        {results.length === 0 ? (
          <p className={styles.empty} role="status">
            Nada para «{query.trim()}». Prueba con el nombre de una industria o de una guía.
          </p>
        ) : (
          groups.map(([group, items]) => (
            <div
              key={group}
              role="group"
              aria-labelledby={`${uid}-g-${group}`}
              className={styles.group}
            >
              <p id={`${uid}-g-${group}`} className={styles.groupLabel}>
                {group}
              </p>
              {items.map((item) => {
                const selected = item === current;
                return (
                  <div
                    key={item.id}
                    id={optionId(item)}
                    role="option"
                    aria-selected={selected}
                    className={styles.option}
                    data-selected={selected || undefined}
                    onMouseMove={() => {
                      const i = results.indexOf(item);
                      if (i !== active) setActive(i);
                    }}
                    onClick={() => run(item)}
                  >
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>{item.title}</span>
                      <span className={styles.optionHint}>{item.hint}</span>
                    </span>
                    <span className={styles.enter} aria-hidden="true">
                      ↵
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <p className={styles.footer} aria-hidden="true">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> moverse
        </span>
        <span>
          <kbd>↵</kbd> abrir
        </span>
      </p>
    </Dialog>
  );
}
