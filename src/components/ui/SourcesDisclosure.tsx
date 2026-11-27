"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./sources.module.css";

const DESKTOP = "(min-width: 40rem)";

/**
 * Wraps the source list in a <details>. Below 40rem it starts collapsed so long lists don't
 * stretch phone pages; on desktop it is expanded. Clicking an in-text citation (`#fuente-N`)
 * opens it and scrolls to the entry. Native <details> keeps it keyboard-accessible.
 */
export function SourcesDisclosure({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(DESKTOP);
    const sync = () => {
      if (mq.matches) el.open = true;
    };
    sync();
    mq.addEventListener("change", sync);

    const reveal = (id: string): boolean => {
      const target = document.getElementById(id);
      if (!target || !el.contains(target)) return false;
      el.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: "center" }));
      return true;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#fuente-"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (reveal(id)) {
        e.preventDefault();
        history.pushState(null, "", `#${id}`);
      }
    };
    const onHash = () => reveal(location.hash.slice(1));
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    if (location.hash.startsWith("#fuente-")) onHash();
    return () => {
      mq.removeEventListener("change", sync);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  return (
    <details ref={ref} className={styles.sources}>
      <summary className={styles.summary}>
        <h2 className={styles.heading}>
          {title} ({count})
        </h2>
      </summary>
      {children}
    </details>
  );
}
