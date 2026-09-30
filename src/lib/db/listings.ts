import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { embedText, listingToEmbeddingText } from "@/lib/embeddings";
import {
  listings as staticListings,
  getListingBySlug as getStaticListingBySlug,
} from "@/data/listings";
import type { Listing } from "@/types/listing";

/** Fields an admin can set when creating or editing a listing. */
export type ListingInput = Omit<Listing, "id">;

interface ListingRow {
  id: string;
  slug: string;
  purpose: Listing["purpose"];
  status: Listing["status"];
  property_type: Listing["propertyType"];
  tenure: Listing["tenure"];
  title: string;
  address_line: string;
  area: string;
  postcode_district: string;
  price: number | null;
  rent_pcm: number | null;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  size_sqft: number;
  epc_rating: string;
  council_tax_band: string;
  service_charge_annual: number | null;
  lease_years_remaining: number | null;
  summary: string;
  description: string[] | null;
  features: string[] | null;
  images: Listing["images"] | null;
  date_listed: string;
  featured: boolean | null;
}

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    slug: row.slug,
    purpose: row.purpose,
    status: row.status,
    propertyType: row.property_type,
    tenure: row.tenure,
    title: row.title,
    addressLine: row.address_line,
    area: row.area,
    postcodeDistrict: row.postcode_district,
    price: row.price ?? undefined,
    rentPcm: row.rent_pcm ?? undefined,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    receptions: row.receptions,
    sizeSqft: row.size_sqft,
    epcRating: row.epc_rating as Listing["epcRating"],
    councilTaxBand: row.council_tax_band,
    serviceChargeAnnual: row.service_charge_annual ?? undefined,
    leaseYearsRemaining: row.lease_years_remaining ?? undefined,
    summary: row.summary,
    description: row.description ?? [],
    features: row.features ?? [],
    images: row.images ?? [],
    dateListed: row.date_listed,
    featured: row.featured ?? false,
  };
}

function listingToRow(input: ListingInput) {
  return {
    slug: input.slug,
    purpose: input.purpose,
    status: input.status,
    property_type: input.propertyType,
    tenure: input.tenure,
    title: input.title,
    address_line: input.addressLine,
    area: input.area,
    postcode_district: input.postcodeDistrict,
    price: input.price ?? null,
    rent_pcm: input.rentPcm ?? null,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    receptions: input.receptions,
    size_sqft: input.sizeSqft,
    epc_rating: input.epcRating,
    council_tax_band: input.councilTaxBand,
    service_charge_annual: input.serviceChargeAnnual ?? null,
    lease_years_remaining: input.leaseYearsRemaining ?? null,
    summary: input.summary,
    description: input.description,
    features: input.features,
    images: input.images,
    date_listed: input.dateListed,
    featured: input.featured ?? false,
  };
}

const LISTING_COLUMNS =
  "id, slug, purpose, status, property_type, tenure, title, address_line, area, " +
  "postcode_district, price, rent_pcm, bedrooms, bathrooms, receptions, size_sqft, " +
  "epc_rating, council_tax_band, service_charge_annual, lease_years_remaining, " +
  "summary, description, features, images, date_listed, featured";

/** All listings, newest first. Reads use the RLS-respecting session client — the
 * "listings are publicly readable" policy (schema.sql) makes this safe pre-login. */
export async function getListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) return staticListings;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .order("date_listed", { ascending: false });

  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data as unknown as ListingRow[]).map(rowToListing);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  if (!isSupabaseConfigured) return getStaticListingBySlug(slug);

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load listing "${slug}": ${error.message}`);
  return data ? rowToListing(data as unknown as ListingRow) : undefined;
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  if (!isSupabaseConfigured) return staticListings.find((l) => l.id === id);

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load listing ${id}: ${error.message}`);
  return data ? rowToListing(data as unknown as ListingRow) : undefined;
}

export async function getFeaturedListings(): Promise<Listing[]> {
  const all = await getListings();
  return all.filter((l) => l.featured);
}

export async function getListingsByPurpose(purpose: Listing["purpose"]): Promise<Listing[]> {
  const all = await getListings();
  return all.filter((l) => l.purpose === purpose);
}

/** Rows carrying their stored search_embedding, for src/lib/search.ts. Admin-only client
 * (RLS never exposes this column's semantics to anon, and it's an internal detail anyway). */
export async function getListingsWithEmbeddings(): Promise<
  Array<{ listing: Listing; embedding: number[] | null }>
> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(`${LISTING_COLUMNS}, search_embedding`);

  if (error) throw new Error(`Failed to load listings for search: ${error.message}`);

  return (data as unknown as Array<ListingRow & { search_embedding: string | null }>).map(
    (row) => ({
      listing: rowToListing(row),
      embedding: row.search_embedding ? (JSON.parse(row.search_embedding) as number[]) : null,
    })
  );
}

// --- Admin writes (service-role client, bypasses RLS; only ever called
// from code already gated by src/middleware.ts's session check) ---

export async function createListing(input: ListingInput): Promise<Listing> {
  const admin = createAdminClient();
  const embedding = await embedText(listingToEmbeddingText(input));

  const { data, error } = await admin
    .from("listings")
    .insert({ ...listingToRow(input), search_embedding: embedding })
    .select(LISTING_COLUMNS)
    .single();

  if (error) throw new Error(`Failed to create listing: ${error.message}`);
  return rowToListing(data as unknown as ListingRow);
}

export async function updateListing(id: string, input: ListingInput): Promise<Listing> {
  const admin = createAdminClient();
  const embedding = await embedText(listingToEmbeddingText(input));

  const { data, error } = await admin
    .from("listings")
    .update({ ...listingToRow(input), search_embedding: embedding })
    .eq("id", id)
    .select(LISTING_COLUMNS)
    .single();

  if (error) throw new Error(`Failed to update listing ${id}: ${error.message}`);
  return rowToListing(data as unknown as ListingRow);
}

export async function deleteListing(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("listings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete listing ${id}: ${error.message}`);
}
