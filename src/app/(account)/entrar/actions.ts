"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isOldEnough, parseBirthYear } from "@/lib/supabase/age";

/**
 * Magic-link sign-in / sign-up, two explicit modes. "crear" needs a birth year and the 16+ box: they
 * are checked here (friendly message) and again in the DB trigger (the real gate). "entrar" only
 * signs in existing users. The answer never reveals whether an email already has an account.
 */
export async function requestMagicLink(formData: FormData) {
  const creating = formData.get("mode") === "crear";
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = String(formData.get("next") ?? "/cuenta");
  const safeNext = next.startsWith("/cuenta") ? next : "/cuenta";
  const back = (error: string) => {
    const q = new URLSearchParams();
    if (creating) q.set("modo", "crear");
    q.set("error", error);
    if (safeNext !== "/cuenta") q.set("next", safeNext);
    return `/entrar?${q.toString()}`;
  };

  if (!/^\S+@\S+\.\S+$/.test(email)) redirect(back("email"));
  const birthYear = creating ? parseBirthYear(formData.get("birth_year")) : null;
  if (creating) {
    if (birthYear === null) redirect(back("anio"));
    if (!isOldEnough(birthYear) || formData.get("age_ok") !== "on") redirect(back("edad"));
  }

  const supabase = await createClient();
  if (!supabase) redirect(back("config"));

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
    if (error.status === 429) redirect(back("limite"));
    if (error.status && error.status >= 500) redirect(back("servicio"));
  }
  redirect(creating ? "/entrar?modo=crear&enviado=1" : "/entrar?enviado=1");
}
