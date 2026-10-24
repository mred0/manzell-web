import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceRoleKey, isSupabaseAdminConfigured } from "./config";


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
