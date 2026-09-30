"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";

/**
 * Browser-side Supabase client, used only by the admin login form to call
 * supabase.auth.signInWithPassword(). Every other Supabase read/write in
 * this app happens server-side (Server Components, Route Handlers, Server
 * Actions) — the browser never talks to the database directly.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase isn't configured yet — see SUPABASE_SETUP.md for the env vars this needs."
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
