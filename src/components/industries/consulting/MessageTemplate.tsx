"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./message.module.css";

/** Renders an MDX blockquote as a message draft with a copy button (clipboard stays local). */
export function MessageTemplate({ children }: { children?: ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = body.current?.innerText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the text is still selectable by hand.
    }
  }

  return (
    <figure className={styles.message}>
      <figcaption className={styles.head}>
        <span className={styles.label}>Plantilla · cambia lo que va entre corchetes</span>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? "Copiada" : "Copiar"}
        </button>
      </figcaption>
      <div ref={body} className={styles.body}>
        {children}
      </div>
      <p role="status" className={styles.sr}>
        {copied ? "Plantilla copiada al portapapeles" : ""}
      </p>
    </figure>
  );
}
