import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./card.module.css";

export function Card({
  title,
  eyebrow,
  href,
  muted = false,
  headingLevel = "h3",
  children,
  footer,
}: {
  title: string;
  eyebrow?: ReactNode;
  /** When set, the whole card is one link (via the title). */
  href?: string;
  muted?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const Tag = headingLevel;
  const cls = [styles.card, href && styles.interactive, muted && styles.muted]
    .filter(Boolean)
    .join(" ");
  return (
    <article className={cls}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <Tag className={styles.title}>{href ? <Link href={href}>{title}</Link> : title}</Tag>
      {children ? <div className={styles.body}>{children}</div> : null}
      {footer}
    </article>
  );
}
