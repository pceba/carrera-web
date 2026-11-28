"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./headings";
import styles from "./guide.module.css";

/** Distance from the top of the viewport (sticky header plus a margin) where a heading counts as "current". */
const OFFSET = 112;

/**
 * "En esta página": the page's `##` headings with scroll-spy. Wide screens get a sticky list in
 * the right margin (`rail`); narrower ones get a collapsible row above the article (`compact`,
 * details/summary, so it works before JavaScript). CSS shows only one at a time, so assistive tech
 * sees a single navigation. The current heading carries `aria-current="location"`.
 */
export function GuideToc({
  items,
  variant,
}: {
  items: TocItem[];
  /** `rail` is a grid column on wide screens; `compact` sits above the article. Mount one of each. */
  variant: "rail" | "compact";
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const heads = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!heads.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: string | null = null;
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= OFFSET) current = h.id;
        else break;
      }
      setActive(current);
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
  }, [items]);

  if (items.length < 2) return null;

  const list = (
    <ol className={styles.tocList}>
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            className={styles.tocLink}
            aria-current={active === i.id ? "location" : undefined}
          >
            {i.title}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "rail") {
    return (
      <nav aria-label="En esta página" className={styles.tocRail}>
        <p className={styles.tocTitle}>En esta página</p>
        {list}
      </nav>
    );
  }
  return (
    <nav aria-label="En esta página" className={styles.tocCompact}>
      <details>
        <summary>
          <span className={styles.tocSummary}>En esta página</span>
          <span className={styles.tocCount}>{items.length} apartados</span>
        </summary>
        {list}
      </details>
    </nav>
  );
}
