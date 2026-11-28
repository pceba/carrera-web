"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { WindowFrame } from "../ui/WindowFrame";
import { ROUTES } from "../ui/site-data";
import { FitMock, OffersMock, TrackerMock } from "./Mockups";
import styles from "./showcase.module.css";

const TABS = [
  {
    id: "encaje",
    label: "Encaje",
    short: "Qué industria te encaja",
    address: "path.app/encaje",
    href: ROUTES.fit,
    cta: "Probar Encaje",
    text: "Sube tu CV o cuéntanos tu perfil y ordena las seis industrias. Se analiza en tu navegador.",
    Mock: FitMock,
  },
  {
    id: "candidaturas",
    label: "Candidaturas",
    short: "Cada solicitud en su sitio",
    address: "path.app/candidaturas",
    href: ROUTES.tracker,
    cta: "Abrir Candidaturas",
    text: "Un tablero de guardada a oferta, con las fechas que no puedes perder.",
    Mock: TrackerMock,
  },
  {
    id: "ofertas",
    label: "Ofertas",
    short: "Prácticas y puestos junior",
    address: "path.app/ofertas",
    href: ROUTES.offers,
    cta: "Ver ofertas",
    text: "Cada oferta enlaza al anuncio original, donde te apuntas. Sin intermediarios.",
    Mock: OffersMock,
  },
] as const;

/** Seconds each tab stays before the next one takes over. */
const CYCLE_S = 7;

/**
 * Product window with three tabs that cycle by themselves. The cycle is driven by a CSS
 * animation on the progress bar (its `animationend` advances the tab), so it pauses on hover and
 * focus by pausing the animation, and under `prefers-reduced-motion` there is no animation and
 * therefore no auto-advance. Keyboard: arrows, Home and End like any WAI-ARIA tab list.
 */
export function ProductShowcase() {
  const base = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(i: number, focus = false) {
    setActive(i);
    if (focus) refs.current[i]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = TABS.length - 1;
    const next =
      e.key === "ArrowRight"
        ? (active + 1) % TABS.length
        : e.key === "ArrowLeft"
          ? (active + last) % TABS.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  }

  const tab = TABS[active]!;
  const Mock = tab.Mock;

  return (
    <div
      className={styles.showcase}
      data-paused={paused || undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      // Pause for keyboard focus only: a mouse click on a tab must not freeze the cycle for good.
      onFocus={(e) => e.target.matches(":focus-visible") && setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        role="tablist"
        aria-label="Herramientas de Path"
        className={styles.tabs}
        onKeyDown={onKeyDown}
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-controls={`${base}-panel`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            onClick={() => select(i)}
          >
            <span className={styles.tabLabel}>{t.label}</span>
            <span className={styles.tabShort}>{t.short}</span>
            <span className={styles.bar} aria-hidden="true">
              <i
                key={i === active ? `on-${active}` : "off"}
                style={{ animationDuration: `${CYCLE_S}s` }}
                onAnimationEnd={() => i === active && select((active + 1) % TABS.length)}
              />
            </span>
          </button>
        ))}
      </div>

      <WindowFrame address={tab.address} className={styles.window}>
        <div
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          className={styles.panel}
          key={tab.id}
        >
          <div className={styles.screen} aria-hidden="true">
            <Mock />
          </div>
          <div className={styles.caption}>
            <p className={styles.captionText}>{tab.text}</p>
            <span className={styles.demo}>Datos de ejemplo</span>
            <Link href={tab.href} className={styles.captionLink}>
              {tab.cta} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
