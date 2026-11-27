import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type Variant = "primary" | "accent" | "secondary" | "ghost";

const cls = (v: Variant) => `${styles.button} ${styles[v]}`;

/** Real <button>. For navigation use ButtonLink so the semantics stay correct. */
export function Button({
  variant = "primary",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={cls(variant)} {...rest} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  arrow = false,
  children,
}: {
  href: string;
  variant?: Variant;
  /** Adds a trailing arrow: use for the one forward action in a view. */
  arrow?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cls(variant)}>
      {children}
      {arrow ? (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      ) : null}
    </Link>
  );
}
