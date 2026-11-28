"use client";

import { useSyncExternalStore } from "react";
import styles from "./toast.module.css";

type ToastItem = { id: number; message: string };

/**
 * Toasts without a provider: a tiny module-level store. `toast("Enlace copiado")` can be called
 * from any client code; `<Toaster />` (mounted once in the Shell) renders them in a polite
 * live region. They close on their own after 6 s and by hand.
 */
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const NONE: ToastItem[] = [];

function emit() {
  listeners.forEach((l) => l());
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function toast(message: string) {
  const id = nextId++;
  items = [...items.slice(-2), { id, message }];
  emit();
  setTimeout(() => dismissToast(id), 6000);
  return id;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => items,
    () => NONE,
  );
  return (
    <div role="region" aria-label="Avisos" aria-live="polite" className={styles.region}>
      {list.map((t) => (
        <div key={t.id} className={styles.toast}>
          <span>{t.message}</span>
          <button
            type="button"
            className={styles.close}
            aria-label="Cerrar aviso"
            onClick={() => dismissToast(t.id)}
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
        </div>
      ))}
    </div>
  );
}
