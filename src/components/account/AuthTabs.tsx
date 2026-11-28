import Link from "next/link";
import styles from "./account-ui.module.css";

/**
 * Entrar / Crear cuenta as two real links (the mode lives in `?modo=crear`), so it works without
 * JavaScript and the back button does what people expect.
 */
export function AuthTabs({ mode, next }: { mode: "entrar" | "crear"; next?: string }) {
  const suffix = next && next !== "/cuenta" ? `next=${encodeURIComponent(next)}` : "";
  const href = (m: "entrar" | "crear") => {
    const q = [m === "crear" ? "modo=crear" : "", suffix].filter(Boolean).join("&");
    return q ? `/entrar?${q}` : "/entrar";
  };
  return (
    <nav aria-label="Entrar o crear cuenta" className={styles.tabs}>
      {(["entrar", "crear"] as const).map((m) => (
        <Link
          key={m}
          href={href(m)}
          className={styles.tab}
          aria-current={mode === m ? "page" : undefined}
        >
          {m === "entrar" ? "Entrar" : "Crear cuenta"}
        </Link>
      ))}
    </nav>
  );
}
