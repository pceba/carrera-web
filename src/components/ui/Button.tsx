import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const cls = (v: Variant, size: Size) =>
  `${styles.button} ${styles[v]} ${size === "lg" ? styles.lg : ""}`;

/** Real <button>. For navigation use ButtonLink so the semantics stay correct. */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={cls(variant, size)} {...rest} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  arrow = false,
  children,
}: {
  href: string;
  variant?: Variant;
  /** `lg` is the hero and band size. */
  size?: Size;
  /** Adds a trailing arrow: use for the one forward action in a view. */
  arrow?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cls(variant, size)}>
      {children}
      {arrow ? (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      ) : null}
    </Link>
  );
}
