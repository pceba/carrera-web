"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./guide-nav.module.css";

export type GuideSection = { id: string; n: string; title: string };

/**
 * "En esta guía": a sticky rail with reading progress on desktop, a compact switcher bar on
 * phones. Highlights the section in view (IntersectionObserver) and writes progress to a CSS
 * variable, so scrolling never re-renders React.
 */
export function GuideNav({ sections }: { sections: GuideSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting);
        const last = hit[hit.length - 1];
        if (last) setActive(last.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = els[0];
        const last = els[els.length - 1];
        if (!first || !last || !nav.current) return;
        const start = first.getBoundingClientRect().top + window.scrollY;
        const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        const p = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
        nav.current.style.setProperty("--read", p.toFixed(3));
        nav.current.dataset.pct = String(Math.round(p * 100));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // Close the phone dropdown on Escape or a tap outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (nav.current && !nav.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const current = sections.find((s) => s.id === active) ?? sections[0];
  const index = current ? sections.indexOf(current) + 1 : 0;

  return (
    <nav ref={nav} aria-label="En esta guía" className={styles.nav} data-open={open}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="guia-secciones"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.toggleN} aria-hidden="true">
          {current?.n}
        </span>
        <span className={styles.toggleTitle}>
          <span className={styles.sr}>Sección actual: </span>
          {current?.title}
        </span>
        <span className={styles.toggleCount} aria-hidden="true">
          {index}/{sections.length}
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.chevron}>
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <p className={styles.railTitle} aria-hidden="true">
        En esta guía
      </p>
      <ol id="guia-secciones" className={styles.list}>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={styles.link}
              aria-current={s.id === active ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className={styles.n} aria-hidden="true">
                {s.n}
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.bar} />
      </div>
    </nav>
  );
}
