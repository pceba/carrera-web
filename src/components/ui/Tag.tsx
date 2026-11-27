import type { ReactNode } from "react";
import styles from "./tag.module.css";

export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "success" | "muted";
  children: ReactNode;
}) {
  return (
    <span className={`${styles.tag} ${tone === "neutral" ? "" : styles[tone]}`}>{children}</span>
  );
}
