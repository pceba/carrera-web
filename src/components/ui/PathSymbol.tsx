import { useId } from "react";
import styles from "./wordmark.module.css";

/**
 * The Path symbol: a single step that lights up toward a goal.
 * `full` is the gradient tile with glow (header, footer, OG); `flat` is the flat version for
 * anything under 32px. Gradient and filter ids get a useId() suffix so several symbols on one
 * page never clash.
 */
export function PathSymbol({
  variant = "full",
  className,
}: {
  variant?: "full" | "flat";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const tile = `path-tile-${uid}`;
  const trail = `path-trail-${uid}`;
  const glow = `path-glow-${uid}`;
  const cls = [styles.symbol, className].filter(Boolean).join(" ");

  if (variant === "flat") {
    return (
      <svg className={cls} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <rect width="48" height="48" rx="11" fill="#0B0D10" />
        <path
          d="M14 34 V24 H34 V14"
          fill="none"
          stroke="#C9CED5"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="14" r="6" fill="#FFFFFF" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#262C35" />
          <stop offset="1" stopColor="#06080B" />
        </linearGradient>
        <linearGradient id={trail} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect className={styles.tile} width="48" height="48" rx="11" fill={`url(#${tile})`} />
      <path
        d="M14 34 V24 H34 V14"
        fill="none"
        stroke={`url(#${trail})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="34" r="3" fill="#8A929C" />
      <circle cx="34" cy="14" r="4" fill="#FFFFFF" filter={`url(#${glow})`} />
    </svg>
  );
}
