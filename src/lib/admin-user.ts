import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * The logged-in admin's email, for the Control Room sidebar/greeting —
 * Supabase Auth email/password has no separate display-name field, so the
 * email (or its local part, where a short label is needed) is all there
 * is to show. Returns null in static-fallback mode (no Supabase configured
 * yet) rather than throwing, so the dashboard still renders during setup.
 */
export async function getAdminEmail(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}
