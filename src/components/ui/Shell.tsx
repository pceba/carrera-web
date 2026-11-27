import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./shell.module.css";

/** Public page frame: skip link, header, main landmark, footer. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#contenido" className={styles.skip}>
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}

/** Centered max-width column used by pages for consistent gutters. */
export function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
