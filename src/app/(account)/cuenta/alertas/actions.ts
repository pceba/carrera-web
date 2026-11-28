"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_VERSIONS } from "@/lib/supabase/env";
import { validatePreferences } from "@/lib/alerts/validate";

const BASE = "/cuenta/alertas";

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/entrar?next=${BASE}`);
  return { supabase, user: data.user };
}

/** Step 1: an explicit, separate opt-in. Appends a consent row (the table is append-only). */
export async function giveConsent(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (formData.get("opt_in") !== "on") redirect(`${BASE}?error=consentimiento`);
  const { error } = await supabase.from("consents").insert({
    user_id: user.id,
    privacy_version: LEGAL_VERSIONS.privacy,
    terms_version: LEGAL_VERSIONS.terms,
    marketing_opt_in: true,
  });
  if (error) redirect(`${BASE}?error=guardar`);
  redirect(`${BASE}?paso=2`);
}

function readPreferences(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "");
  return validatePreferences({
    industries: formData.getAll("industries").map(String),
    roles: text("roles"),
    skills: text("skills"),
    locations: text("locations"),
    remote: text("remote") || "any",
  });
}

/** Step 2: create the subscription, tied to the latest marketing opt-in consent. */
export async function subscribe(formData: FormData) {
  const { supabase, user } = await requireUser();
  const prefs = readPreferences(formData);
  if (!prefs.ok) redirect(`${BASE}?paso=2&error=datos`);

  const { data: consent } = await supabase
    .from("consents")
    .select("id")
    .eq("marketing_opt_in", true)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!consent) redirect(BASE);

  const { error } = await supabase
    .from("alert_subscriptions")
    .insert({ user_id: user.id, consent_id: consent.id, active: true, ...prefs.value });
  if (error) redirect(`${BASE}?paso=2&error=guardar`);
  revalidatePath(BASE);
  redirect(`${BASE}?guardado=1`);
}

export async function updatePreferences(formData: FormData) {
  const { supabase, user } = await requireUser();
  const prefs = readPreferences(formData);
  if (!prefs.ok) redirect(`${BASE}?error=datos`);
  const { error } = await supabase
    .from("alert_subscriptions")
    .update(prefs.value)
    .eq("user_id", user.id);
  if (error) redirect(`${BASE}?error=guardar`);
  revalidatePath(BASE);
  redirect(`${BASE}?guardado=1`);
}

/** Pause or resume: only the `active` flag changes. */
export async function setActive(formData: FormData) {
  const { supabase, user } = await requireUser();
  const active = formData.get("active") === "true";
  const { error } = await supabase
    .from("alert_subscriptions")
    .update({ active })
    .eq("user_id", user.id);
  if (error) redirect(`${BASE}?error=guardar`);
  revalidatePath(BASE);
  redirect(`${BASE}?${active ? "reanudada=1" : "pausada=1"}`);
}

export async function deleteSubscription() {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("alert_subscriptions").delete().eq("user_id", user.id);
  if (error) redirect(`${BASE}?error=guardar`);
  revalidatePath(BASE);
  redirect(`${BASE}?eliminada=1`);
}
