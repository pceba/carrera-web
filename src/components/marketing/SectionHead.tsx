import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "../ui/Typography";
import styles from "./section-head.module.css";

/** Section opener: mono eyebrow, big heading, optional one-line lead and a link on the right. */
export function SectionHead({
  eyebrow,
  id,
  title,
  lead,
  link,
}: {
  eyebrow: string;
  id: string;
  title: ReactNode;
  lead?: string;
  link?: { href: string; label: string };
}) {
  return (
    <header className={styles.head}>
      <div className={styles.text}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
      </div>
      {link ? (
        <Link href={link.href} className={styles.link}>
          {link.label} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </header>
  );
}
