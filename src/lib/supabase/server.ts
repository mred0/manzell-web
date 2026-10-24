import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./config";


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
