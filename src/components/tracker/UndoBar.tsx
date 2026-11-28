"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import styles from "./tracker.module.css";

const SECONDS = 8;

/** Polite live region with an undo button. The shared Toast has no action, so this one lives here. */
export function UndoBar({
  message,
  onUndo,
  onDismiss,
}: {
  message: string | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDismiss, SECONDS * 1000);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  return (
    <div role="status" aria-live="polite" className={styles.undoRegion}>
      {message ? (
        <div className={styles.undo}>
          <span>{message}</span>
          <Button variant="secondary" onClick={onUndo}>
            Deshacer
          </Button>
        </div>
      ) : null}
    </div>
  );
}
