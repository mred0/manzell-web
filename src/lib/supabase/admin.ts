import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceRoleKey, isSupabaseAdminConfigured } from "./config";

/**
 * Service-role Supabase client — bypasses row-level security entirely.
 * Use ONLY in server-only code that has already confirmed the caller is a
 * logged-in admin (every route under src/app/admin is gated by
 * src/middleware.ts, which checks the session before any of this runs).
 *
 * Never import this into anything that runs in the browser, and never wire
 * it up to unauthenticated input — it's the equivalent of a Postgres
 * superuser connection.
 */
export function createAdminClient() {
  if (!isSupabaseAdminConfigured) {
    throw new Error(
      "Supabase admin access isn't configured — SUPABASE_SERVICE_ROLE_KEY is missing. See SUPABASE_SETUP.md."
    );
  }
  return createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
