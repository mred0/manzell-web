"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";


export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase isn't configured yet — see SUPABASE_SETUP.md for the env vars this needs."
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
