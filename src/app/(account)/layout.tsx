import type { ReactNode } from "react";
import { Shell } from "@/components/ui";

/** Account pages share the public shell (header, footer, skip link). */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
