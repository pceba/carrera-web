"use server";

import { createClient } from "@/lib/supabase/server";
import { STAGE_SLUGS, type Application, type Stage } from "./types";
import { validateDraft } from "./validate";

/** Result of a write. `item(s)` are the rows as stored, so the client shows what the DB holds. */
export type ItemResult = { error: string | null; item?: Application };
export type ItemsResult = { error: string | null; items?: Application[] };

const COLUMNS =
  "id, firm, industry, role, stage, applied_on, next_step, next_step_on, url, notes, created_at, updated_at";
const MAX_IMPORT = 200;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOT_SIGNED_IN = "Inicia sesión para guardar en tu cuenta.";
const GENERIC = "No hemos podido guardar los cambios. Inténtalo de nuevo.";

async function authed() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ? supabase : null;
}

export async function addApplication(input: unknown): Promise<ItemResult> {
  const supabase = await authed();
  if (!supabase) return { error: NOT_SIGNED_IN };
  const checked = validateDraft(input);
  if (!checked.ok) return { error: "Revisa los campos del formulario." };
  const { data, error } = await supabase
    .from("applications")
    .insert(checked.value)
    .select(COLUMNS)
    .single();
  return error ? { error: GENERIC } : { error: null, item: data as Application };
}

export async function updateApplication(id: string, input: unknown): Promise<ItemResult> {
  const supabase = await authed();
  if (!supabase) return { error: NOT_SIGNED_IN };
  if (!UUID_RE.test(id)) return { error: GENERIC };
  const checked = validateDraft(input);
  if (!checked.ok) return { error: "Revisa los campos del formulario." };
  const { data, error } = await supabase
    .from("applications")
    .update(checked.value)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  return error || !data ? { error: GENERIC } : { error: null, item: data as Application };
}

export async function moveApplication(id: string, stage: string): Promise<ItemResult> {
  const supabase = await authed();
  if (!supabase) return { error: NOT_SIGNED_IN };
  if (!UUID_RE.test(id) || !STAGE_SLUGS.includes(stage as Stage)) return { error: GENERIC };
  const { data, error } = await supabase
    .from("applications")
    .update({ stage })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  return error || !data ? { error: GENERIC } : { error: null, item: data as Application };
}

export async function deleteApplication(id: string): Promise<{ error: string | null }> {
  const supabase = await authed();
  if (!supabase) return { error: NOT_SIGNED_IN };
  if (!UUID_RE.test(id)) return { error: GENERIC };
  const { error } = await supabase.from("applications").delete().eq("id", id);
  return { error: error ? GENERIC : null };
}

/** Explicit import of the entries held in this browser. Invalid ones are skipped, never fixed. */
export async function importApplications(input: unknown): Promise<ItemsResult> {
  const supabase = await authed();
  if (!supabase) return { error: NOT_SIGNED_IN };
  if (!Array.isArray(input)) return { error: GENERIC };
  const rows = input
    .slice(0, MAX_IMPORT)
    .map((raw) => validateDraft(raw))
    .flatMap((r) => (r.ok ? [r.value] : []));
  if (rows.length === 0) return { error: null, items: [] };
  const { data, error } = await supabase.from("applications").insert(rows).select(COLUMNS);
  return error ? { error: GENERIC } : { error: null, items: data as Application[] };
}
