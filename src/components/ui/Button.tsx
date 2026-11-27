import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type Variant = "primary" | "secondary" | "ghost";

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
  children,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cls(variant)}>
      {children}
    </Link>
  );
}
