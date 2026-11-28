"use client";

import { useEffect, useRef } from "react";
import styles from "./guide.module.css";

/**
 * A thin bar at the very top that fills as you read the article (`#guia-articulo`). It writes a
 * CSS variable directly instead of re-rendering on every scroll, and it is decorative: the
 * reading position is already conveyed by the page itself, so it is `aria-hidden`.
 */
export function ReadingProgress({ targetId = "guia-articulo" }: { targetId?: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = bar.current;
    if (!target || !el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      el.style.setProperty("--read", String(done));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return <div ref={bar} className={styles.progress} aria-hidden="true" data-reading-progress />;
}
