import type { ResourceType } from "../../../content/catalog";

/** Small line icon per resource type. Decorative. */
export function TypeIcon({ type, className }: { type: ResourceType; className?: string }) {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    className,
  };
  switch (type) {
    case "guia":
      return (
        <svg {...p}>
          <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      );
    case "web-oficial":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
      );
    case "casos":
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 12l3 3 5-6" />
        </svg>
      );
    case "libro":
      return (
        <svg {...p}>
          <path d="M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z" />
          <path d="M5 21V5" />
        </svg>
      );
    case "curso":
      return (
        <svg {...p}>
          <path d="M3 9l9-5 9 5-9 5z" />
          <path d="M7 11.5V16c3 2 7 2 10 0v-4.5" />
        </svg>
      );
    case "podcast":
      return (
        <svg {...p}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      );
    case "newsletter":
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M3 8l9 6 9-6" />
        </svg>
      );
    case "comunidad":
      return (
        <svg {...p}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="17" cy="10" r="2.3" />
          <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M15.5 15c3 0 5.5 1.2 5.5 4" />
        </svg>
      );
  }
}
