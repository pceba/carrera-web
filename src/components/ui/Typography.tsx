import type { ElementType, ReactNode } from "react";
import styles from "./typography.module.css";

type Level = "display" | "h1" | "h2" | "h3";

/** Headings: pick the visual `level` independently of the semantic tag via `as`. */
export function Heading({
  level = "h2",
  as,
  children,
  id,
}: {
  level?: Level;
  as?: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  id?: string;
}) {
  const Tag: ElementType = as ?? (level === "display" ? "h1" : level);
  return (
    <Tag id={id} className={styles[level]}>
      {children}
    </Tag>
  );
}

/** Small mono label above a heading (section marker). */
export function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

/** Mono caps label (`SEIS INDUSTRIAS`) above a heading or a figure. Decorative rhythm, not a heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}

export function Text({
  variant = "body",
  children,
}: {
  variant?: "body" | "lead" | "muted";
  children: ReactNode;
}) {
  const cls =
    variant === "lead"
      ? styles.lead
      : variant === "muted"
        ? `${styles.text} ${styles.muted}`
        : styles.text;
  return <p className={cls}>{children}</p>;
}

/** Wrapper that styles long-form content (MDX bodies). */
export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
