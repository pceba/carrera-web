"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { INDUSTRIES, industryHref, PREP_GUIDES, prepHref } from "../../../content/catalog";
import { CommandPalette } from "../nav/CommandPalette";
import { ROUTES, TOOLS } from "./site-data";
import { ThemeToggle } from "./ThemeToggle";
import { ToolIcon } from "./ToolIcon";
import { Wordmark } from "./Wordmark";
import styles from "./header.module.css";

type MenuLink = { href: string; title: string; text?: string; badge?: string; icon?: ReactNode };
type Menu = { id: string; label: string; links: MenuLink[]; all?: MenuLink; cols?: 1 | 2 };

const TOOL_ICONS = {
  [ROUTES.diagnostic]: "diagnostic",
  [ROUTES.fit]: "fit",
  [ROUTES.tracker]: "tracker",
  [ROUTES.offers]: "offers",
} as const;

/** The three header menus. Industries and guides come from the catalog, so they never go stale. */
const MENUS: Menu[] = [
  {
    id: "industrias",
    label: "Industrias",
    cols: 2,
    all: { href: ROUTES.industries, title: "Ver todas las industrias" },
    links: INDUSTRIES.map((i) => ({
      href: industryHref(i.slug),
      title: i.title,
      text: i.line,
      badge: i.status === "preparing" ? "Pronto" : undefined,
    })),
  },
  {
    id: "herramientas",
    label: "Herramientas",
    links: TOOLS.map((t) => ({
      href: t.href,
      title: t.label,
      text: t.text,
      icon: <ToolIcon name={TOOL_ICONS[t.href]} className={styles.itemIcon} />,
    })),
  },
  {
    id: "recursos",
    label: "Recursos",
    all: { href: ROUTES.resources, title: "Biblioteca de recursos" },
    links: [
      ...PREP_GUIDES.slice(0, 4).map((g) => ({ href: prepHref(g.slug), title: g.title })),
      { href: ROUTES.prep, title: "Todas las guías de preparación" },
    ],
  },
];

const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** Most specific link of a menu that contains the current path. */
function activeHref(menu: Menu, path: string): string | null {
  const hits = [...menu.links, ...(menu.all ? [menu.all] : [])].filter((l) =>
    l.href === ROUTES.industries ? path === l.href : isActive(path, l.href),
  );
  hits.sort((a, b) => b.href.length - a.href.length);
  return hits[0]?.href ?? null;
}

function useIsMac() {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.searchIcon}>
    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * Sticky site header. Desktop: three dropdown menus (disclosure pattern: a button with
 * aria-expanded that reveals a panel of links; hover opens, click and keyboard work too),
 * a search button that opens the command palette (Ctrl/⌘K), theme toggle and sign-in.
 * Phone: search icon plus a menu button that opens a full-screen native popover.
 */
export function Header() {
  const path = usePathname() ?? "/";
  const mac = useIsMac();
  const [open, setOpen] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeSheet = () => sheet.current?.hidePopover?.();
  const closeMenus = () => setOpen(null);

  // Ctrl/⌘K toggles the palette from anywhere.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        setOpen(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openPalette() {
    closeSheet();
    setOpen(null);
    setPalette(true);
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLLIElement>, id: string) {
    const root = e.currentTarget;
    const items = [...root.querySelectorAll<HTMLElement>("[data-menu-item]")];
    const trigger = root.querySelector<HTMLElement>("[data-menu-trigger]");
    if (e.key === "Escape" && open === id) {
      e.preventDefault();
      setOpen(null);
      trigger?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open !== id) {
        setOpen(id);
        // The panel mounts on the next render; focus its first link then.
        requestAnimationFrame(() => root.querySelector<HTMLElement>("[data-menu-item]")?.focus());
      } else {
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[Math.min(i + 1, items.length - 1)]?.focus();
      }
    } else if (e.key === "ArrowUp" && open === id) {
      e.preventDefault();
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (i <= 0) trigger?.focus();
      else items[i - 1]?.focus();
    }
  }

  const desktopMenus = MENUS.map((menu) => {
    const isOpen = open === menu.id;
    const current = activeHref(menu, path);
    const renderLink = (l: MenuLink, extra?: string) => (
      <Link
        key={l.href}
        href={l.href}
        data-menu-item
        className={`${styles.item} ${extra ?? ""}`}
        aria-current={current === l.href ? "page" : undefined}
        onClick={closeMenus}
      >
        {l.icon}
        <span className={styles.itemText}>
          <span className={styles.itemTitle}>
            {l.title}
            {l.badge ? <span className={styles.badge}>{l.badge}</span> : null}
          </span>
          {l.text ? <span className={styles.itemLine}>{l.text}</span> : null}
        </span>
      </Link>
    );
    return (
      <li
        key={menu.id}
        className={styles.menu}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          clearTimeout(closeTimer.current);
          setOpen(menu.id);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          closeTimer.current = setTimeout(() => {
            setOpen((o) => (o === menu.id ? null : o));
          }, 140);
        }}
        onKeyDown={(e) => onMenuKeyDown(e, menu.id)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setOpen((o) => (o === menu.id ? null : o));
          }
        }}
      >
        <button
          type="button"
          data-menu-trigger
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={`panel-${menu.id}`}
          data-current={current ? "" : undefined}
          onClick={() => setOpen(isOpen ? null : menu.id)}
        >
          {menu.label}
          <svg viewBox="0 0 12 12" aria-hidden="true" className={styles.chevron}>
            <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        {isOpen ? (
          <div id={`panel-${menu.id}`} className={styles.panel} data-cols={menu.cols ?? 1}>
            <div className={styles.panelGrid}>{menu.links.map((l) => renderLink(l))}</div>
            {menu.all ? (
              <div className={styles.panelFoot}>{renderLink(menu.all, styles.itemAll)}</div>
            ) : null}
          </div>
        ) : null}
      </li>
    );
  });

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={ROUTES.home} className={styles.brand} aria-label="Inicio">
          <Wordmark />
        </Link>

        <nav aria-label="Principal" className={styles.desktopNav}>
          <ul className={styles.list}>{desktopMenus}</ul>
        </nav>

        <div className={styles.tools}>
          <button
            type="button"
            className={styles.searchPill}
            onClick={openPalette}
            aria-keyshortcuts="Control+K Meta+K"
          >
            <SearchIcon />
            <span className={styles.searchLabel}>Buscar</span>
            <kbd className={styles.kbd} aria-hidden="true">
              {mac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <button
            type="button"
            className={styles.searchIconButton}
            onClick={openPalette}
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
          <div className={styles.desktopOnly}>
            <ThemeToggle />
          </div>
          <Link href={ROUTES.signIn} className={styles.signIn}>
            Entrar
          </Link>
          <Link href={ROUTES.fit} className={styles.cta}>
            Probar Encaje
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

      <div id="menu-movil" popover="auto" ref={sheet} className={styles.sheet}>
        <div className={styles.sheetHead}>
          <Link
            href={ROUTES.home}
            className={styles.brand}
            aria-label="Inicio"
            onClick={closeSheet}
          >
            <Wordmark />
          </Link>
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
        <nav aria-label="Principal (móvil)" className={styles.sheetNav}>
          {MENUS.map((menu) => {
            const current = activeHref(menu, path);
            const links = [...menu.links, ...(menu.all ? [menu.all] : [])];
            return (
              <section key={menu.id} className={styles.sheetGroup} aria-labelledby={`m-${menu.id}`}>
                <h2 id={`m-${menu.id}`} className={styles.sheetLabel}>
                  {menu.label}
                </h2>
                <ul className={styles.sheetList}>
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={styles.sheetLink}
                        aria-current={current === l.href ? "page" : undefined}
                        onClick={closeSheet}
                      >
                        {l.title}
                        {l.badge ? <span className={styles.badge}>{l.badge}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
        <div className={styles.sheetFoot}>
          <Link href={ROUTES.fit} className={styles.sheetCta} onClick={closeSheet}>
            Probar Encaje
          </Link>
          <Link href={ROUTES.signIn} className={styles.sheetSecondary} onClick={closeSheet}>
            Entrar o crear cuenta
          </Link>
          <ThemeToggle labels />
        </div>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </header>
  );
}
