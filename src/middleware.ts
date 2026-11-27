import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only account routes run auth logic; public content never touches Supabase.
export const config = { matcher: ["/cuenta/:path*"] };
