/**
 * Whether Supabase is configured at all. Every Supabase-touching module
 * checks this first and falls back to the static seed data (src/data/listings.ts)
 * when it's false, so the site keeps working exactly as before right up
 * until Hemang finishes the Supabase setup (see SUPABASE_SETUP.md) — nothing
 * breaks just because .env.local doesn't exist yet.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);
