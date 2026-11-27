"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { NAV_LINKS, ROUTES } from "./site-data";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";
import styles from "./header.module.css";

/** Most specific nav entry that contains the current path, so only one link is "current". */
function currentHref(path: string): string | null {
  const hits = NAV_LINKS.filter((l) => path === l.match || path.startsWith(`${l.match}/`));
  hits.sort((a, b) => b.match.length - a.match.length);
  return hits[0]?.href ?? null;
}

/**
 * Site header: four sections plus "Entrar". Desktop: inline links, dark-theme toggle, sign-in.
 * Phone: a menu button that opens a native popover (Esc and tapping outside close it,
 * focus returns to the button, and it works before JavaScript loads).
 */
export function Header() {
  const path = usePathname() ?? "/";
  const current = currentHref(path);
  const menu = useRef<HTMLDivElement>(null);
  const close = () => menu.current?.hidePopover?.();

  const links = NAV_LINKS.map((l) => (
    <li key={l.href}>
      <Link
        href={l.href}
        className={styles.link}
        aria-current={current === l.href ? "page" : undefined}
        onClick={close}
      >
        {l.label}
      </Link>
    </li>
  ));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={ROUTES.home} className={styles.brand} aria-label="Inicio">
          <Wordmark />
        </Link>

        <nav aria-label="Principal" className={styles.desktopNav}>
          <ul className={styles.list}>{links}</ul>
        </nav>

        <div className={styles.tools}>
          <div className={styles.desktopOnly}>
            <ThemeToggle />
          </div>
          <Link href={ROUTES.signIn} className={styles.signIn}>
            Entrar
          </Link>
          <button type="button" className={styles.menuButton} popoverTarget="menu-movil">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 8h16M4 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Menú</span>
          </button>
        </div>
      </div>

      <div id="menu-movil" popover="auto" ref={menu} className={styles.sheet}>
        <div className={styles.sheetHead}>
          <span className={styles.sheetLabel}>Menú</span>
          <button
            type="button"
            className={styles.closeButton}
            popoverTarget="menu-movil"
            popoverTargetAction="hide"
            aria-label="Cerrar menú"
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
        <nav aria-label="Principal (móvil)">
          <ul className={styles.sheetList}>
            {links}
            <li>
              <Link href={ROUTES.signIn} className={styles.link} onClick={close}>
                Entrar o crear cuenta
              </Link>
            </li>
          </ul>
        </nav>
        <ThemeToggle labels />
      </div>
    </header>
  );
}
