"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isOldEnough, parseBirthYear } from "@/lib/supabase/age";

/**
 * Magic-link sign-in / sign-up. A birth year means "create account": it is checked here (friendly
 * message) and again in the DB trigger (the real gate). Without it we only sign in existing users.
 * The answer never reveals whether an email already has an account.
 */
export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const birthYear = parseBirthYear(formData.get("birth_year"));
  const creating = String(formData.get("birth_year") ?? "").trim() !== "";
  const next = String(formData.get("next") ?? "/cuenta");
  const safeNext = next.startsWith("/cuenta") ? next : "/cuenta";

  if (!/^\S+@\S+\.\S+$/.test(email)) redirect("/entrar?error=email");
  if (creating) {
    if (birthYear === null) redirect("/entrar?error=anio");
    if (!isOldEnough(birthYear) || formData.get("age_ok") !== "on") redirect("/entrar?error=edad");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: creating,
      data: creating ? { birth_year: birthYear } : undefined,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  });
  if (error) {
    // Logged without the email so the reason shows in the host's runtime logs. The page still
    // answers "sent" for client errors such as "signups not allowed", so it never reveals
    // whether an email already has an account.
    console.error("magic link failed", { status: error.status, code: error.code });
    if (error.status === 429) redirect("/entrar?error=limite");
    if (error.status && error.status >= 500) redirect("/entrar?error=servicio");
  }
  redirect("/entrar?enviado=1");
}
