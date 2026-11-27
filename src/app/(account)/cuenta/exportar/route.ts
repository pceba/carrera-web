import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GDPR portability: everything we hold about the signed-in user, as a JSON download. */
export async function GET() {
  const supabase = await createClient();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!supabase || !data.user) return new NextResponse("No autorizado", { status: 401 });

  const [profile, consents, savedItems] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle(),
    supabase.from("consents").select("*").order("accepted_at"),
    supabase.from("saved_items").select("*").order("created_at"),
  ]);

  const body = {
    exported_at: new Date().toISOString(),
    account: { id: data.user.id, email: data.user.email, created_at: data.user.created_at },
    profile: profile.data,
    consents: consents.data ?? [],
    saved_items: savedItems.data ?? [],
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mis-datos.json"',
      "Cache-Control": "no-store",
    },
  });
}
