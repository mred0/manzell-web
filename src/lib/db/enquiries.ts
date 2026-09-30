import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface Enquiry {
  id: string;
  listingId: string | null;
  listingRef: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
}

export interface NewEnquiry {
  /** The listing's uuid, when the enquiry came from a property page — only
   * stored as the FK if it's actually a valid uuid (won't be, yet, for any
   * enquiry submitted before the Supabase migration is complete). */
  listingId?: string | null;
  /** Human-readable snapshot (the listing's title) — always safe to store,
   * shown as-is in the admin inbox regardless of the FK above. */
  listingRef?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface EnquiryRow {
  id: string;
  listing_id: string | null;
  listing_ref: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  handled: boolean;
  created_at: string;
}

function rowToEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingRef: row.listing_ref,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    handled: row.handled,
    createdAt: row.created_at,
  };
}

/**
 * Called from /api/enquiries — the public contact form. This runs
 * server-side only (a Route Handler), so using the service-role client is
 * safe even though the "anyone can submit an enquiry" RLS policy in
 * schema.sql would let the ordinary anon client do the same insert; it
 * just keeps this route simple, with input already validated above it.
 * Returns false (never throws) when Supabase isn't configured yet, so the
 * route can fall back to just logging, like it did before the DB existed.
 */
export async function createEnquiry(input: NewEnquiry): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const admin = createAdminClient();
  const { error } = await admin.from("enquiries").insert({
    listing_id: input.listingId && UUID_RE.test(input.listingId) ? input.listingId : null,
    listing_ref: input.listingRef ?? null,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message,
  });

  if (error) throw new Error(`Failed to save enquiry: ${error.message}`);
  return true;
}

/** Admin-only: full enquiry list, unhandled first then newest first. */
export async function getEnquiries(): Promise<Enquiry[]> {
  if (!isSupabaseConfigured) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("enquiries")
    .select("*")
    .order("handled", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load enquiries: ${error.message}`);
  return (data as EnquiryRow[]).map(rowToEnquiry);
}

export async function setEnquiryHandled(id: string, handled: boolean): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("enquiries").update({ handled }).eq("id", id);
  if (error) throw new Error(`Failed to update enquiry ${id}: ${error.message}`);
}
