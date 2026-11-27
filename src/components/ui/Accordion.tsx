import type { ReactNode } from "react";
import styles from "./accordion.module.css";

export type AccordionItem = { id: string; title: string; content: ReactNode; open?: boolean };

/** Native <details>: keyboard and screen-reader support for free, works without JS. */
export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className={styles.accordion}>
      {items.map((item) => (
        <details key={item.id} className={styles.item} open={item.open}>
          <summary className={styles.summary}>{item.title}</summary>
          <div className={styles.content}>{item.content}</div>
        </details>
      ))}
    </div>
  );
}
