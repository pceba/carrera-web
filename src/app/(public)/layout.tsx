import type { ReactNode } from "react";
import { Shell } from "@/components/ui";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
