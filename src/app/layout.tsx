import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import { THEME_SCRIPT } from "@/components/ui/theme-script";
import "@/styles/tokens.css";
import "@/styles/globals.css";

// next/font downloads these at build time and serves them from our own domain:
// visitors never hit Google, so there is no third-party request and nothing to consent to.
const sans = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-face",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

// Light is the default for everyone; dark is an opt-in toggle (see theme-script.ts).
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#eceef1",
};

// Shared root layout. Navigation/footer shell lives in (public)/layout.tsx and (account)/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets data-theme before paint, so React must not complain about it.
    <html
      lang={SITE.locale}
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
