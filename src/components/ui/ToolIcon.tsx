/** Small line icons for the tools (menu, palette, bento). Decorative: always `aria-hidden`. */
export type ToolIconName = "fit" | "diagnostic" | "tracker" | "offers" | "alerts" | "practice";

export function ToolIcon({ name, className }: { name: ToolIconName; className?: string }) {
  const common = {
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
  switch (name) {
    case "fit":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "diagnostic":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2.9-1.2 1.8" />
          <path d="M12 16.8h.01" strokeWidth="2.4" />
        </svg>
      );
    case "tracker":
      return (
        <svg {...common}>
          <rect x="3.5" y="4" width="4.5" height="16" rx="1.5" />
          <rect x="9.75" y="4" width="4.5" height="10" rx="1.5" />
          <rect x="16" y="4" width="4.5" height="13" rx="1.5" />
        </svg>
      );
    case "offers":
      return (
        <svg {...common}>
          <path d="M8 6h12M8 12h12M8 18h12" />
          <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="2.6" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...common}>
          <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z" />
          <path d="M10 21h4" />
        </svg>
      );
    case "practice":
      return (
        <svg {...common}>
          <path d="M4 5.5h16v10H12l-4.5 4v-4H4z" />
          <path d="M8 10.5h8" />
        </svg>
      );
  }
}
