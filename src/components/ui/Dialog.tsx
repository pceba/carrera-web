"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./dialog.module.css";

/**
 * Modal dialog on the native <dialog> element: the browser handles the focus trap, Esc, inert
 * background and returning focus to the opener. We add the backdrop-click close and the enter and
 * exit animation (CSS only, off under reduced motion).
 *
 * `title` is always the accessible name; `hideTitle` keeps it for screen readers only
 * (the command palette has its own search field as the visible header).
 */
export function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  placement = "center",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  /** `top` sits near the top edge (palette); `center` is the default. */
  placement?: "center" | "top";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`${styles.dialog} ${placement === "top" ? styles.top : ""}`}
      onClose={onClose}
      // Clicks on the backdrop land on the <dialog> itself; the panel inside fills it.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className={styles.panel}>
        <div className={hideTitle ? styles.srOnly : styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {hideTitle ? null : (
            <button
              type="button"
              className={styles.close}
              aria-label="Cerrar"
              onClick={() => ref.current?.close()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
