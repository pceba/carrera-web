import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import "@/styles/tokens.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

// Shared root layout (WS0). Navigation/footer shell lives in (public)/layout.tsx, owned by WS-A.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={SITE.locale}>
      <body>{children}</body>
    </html>
  );
}
