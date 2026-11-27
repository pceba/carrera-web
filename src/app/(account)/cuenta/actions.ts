"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_VERSIONS } from "@/lib/supabase/env";

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/entrar");
  return { supabase, user: data.user };
}

function readProfile(formData: FormData) {
  const text = (key: string, max: number) => {
    const v = String(formData.get(key) ?? "")
      .trim()
      .slice(0, max);
    return v === "" ? null : v;
  };
  const year = Number(formData.get("study_year"));
  return {
    display_name: text("display_name", 80),
    degree: text("degree", 120),
    study_year: Number.isInteger(year) && year >= 1 && year <= 8 ? year : null,
    target_industries: String(formData.get("target_industries") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[a-z0-9-]{1,40}$/.test(s))
      .slice(0, 12),
  };
}

export async function completeOnboarding(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (formData.get("accept_terms") !== "on") redirect("/cuenta/bienvenida?error=terminos");

  const { error: consentError } = await supabase.from("consents").insert({
    user_id: user.id,
    privacy_version: LEGAL_VERSIONS.privacy,
    terms_version: LEGAL_VERSIONS.terms,
    marketing_opt_in: formData.get("marketing_opt_in") === "on",
  });
  const { error } = await supabase
    .from("profiles")
    .update({ ...readProfile(formData), onboarded_at: new Date().toISOString() })
    .eq("id", user.id);
  if (consentError || error) redirect("/cuenta/bienvenida?error=guardar");
  redirect("/cuenta");
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").update(readProfile(formData)).eq("id", user.id);
  if (error) redirect("/cuenta?error=guardar");
  revalidatePath("/cuenta");
  redirect("/cuenta?guardado=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}

/** GDPR erasure. The DB function deletes the auth user; every table cascades. */
export async function deleteAccount(formData: FormData) {
  const { supabase } = await requireUser();
  if (
    String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== "ELIMINAR"
  ) {
    redirect("/cuenta?error=confirmar");
  }
  const { error } = await supabase.rpc("delete_my_account");
  if (error) redirect("/cuenta?error=eliminar");
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  redirect("/?cuenta=eliminada");
}
