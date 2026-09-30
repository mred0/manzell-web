import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./config";

/**
 * Session-aware Supabase client for Server Components, Route Handlers and
 * Server Actions — reads/writes the auth cookie so `auth.getUser()` reflects
 * whoever is actually logged in to /admin. Respects Postgres row-level
 * security as that user (i.e. as the anon role unless they're signed in),
 * so this is the right client for anything that should honour RLS.
 *
 * Admin writes that need to bypass RLS (see src/lib/schema.sql) go through
 * the separate service-role client in ./admin.ts instead.
 */
export async function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase isn't configured yet — see SUPABASE_SETUP.md for the env vars this needs."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies — fine as
          // long as middleware.ts is also refreshing the session (it is).
        }
      },
    },
  });
}
