"use client";

import { toast } from "@/components/ui";
import styles from "./guide.module.css";

/** "Copiar enlace": copies the current page address and says so with a toast. */
export function CopyLink() {
  return (
    <button
      type="button"
      className={styles.copy}
      onClick={() => {
        // The address without any #fragment from the table of contents.
        const url = window.location.href.split("#")[0] ?? window.location.href;
        navigator.clipboard
          .writeText(url)
          .then(() => toast("Enlace copiado"))
          .catch(() => toast("No se pudo copiar el enlace"));
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.copyIcon}>
        <path
          d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      Copiar enlace
    </button>
  );
}
