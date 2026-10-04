// One-time (or re-run-safe) seed: pushes the existing 52 example listings
// from src/data/listings.ts into Supabase, computing each one's search
// embedding on the way in so AI search works immediately — no separate
// build-embeddings step needed once the database is the source of truth.
//
// Run after finishing the Supabase setup in SUPABASE_SETUP.md:
//
//   npm run db:seed
//
// Safe to re-run: it upserts on `slug`, so re-running after editing
// src/data/listings.ts updates existing rows instead of duplicating them.
//
// This is a standalone script (not importing from src/lib/*) because a few
// of those modules start with `import "server-only"`, which throws outside
// Next.js's own build — same reason scripts/build-embeddings.mjs has
// always duplicated its own model-loading code rather than importing
// src/lib/search.ts.
import { pipeline, env } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";
// realtime-js (a supabase-js dependency) needs a WebSocket implementation on
// Node < 22, which lacks a native global WebSocket. This script doesn't use
// realtime subscriptions at all, but supabase-js still constructs a
// RealtimeClient internally, so we hand it the `ws` package explicitly
// rather than requiring everyone running this script to be on Node 22+.
// See: https://supabase.com/changelog/37869-change-in-realtime-js-affecting-node-js-22
import ws from "ws";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listings } from "../src/data/listings.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Node has no built-in .env.local loading outside Next.js itself — this
// script runs standalone, so load it manually rather than adding a new
// dependency just for this.
function loadDotEnvLocal() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add them to .env.local first — see SUPABASE_SETUP.md."
  );
  process.exit(1);
}

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = path.join(projectRoot, "models");

const MODEL_ID = "all-MiniLM-L6-v2"; // 384-dim, matches schema.sql vector(384)

function listingToEmbeddingText(listing) {
  return [
    listing.title,
    listing.summary,
    ...listing.description,
    listing.area,
    listing.propertyType.replace(/-/g, " "),
    ...listing.features,
  ].join(". ");
}

function listingToRow(listing) {
  return {
    slug: listing.slug,
    purpose: listing.purpose,
    status: listing.status,
    property_type: listing.propertyType,
    tenure: listing.tenure,
    title: listing.title,
    address_line: listing.addressLine,
    area: listing.area,
    postcode_district: listing.postcodeDistrict,
    price: listing.price ?? null,
    rent_pcm: listing.rentPcm ?? null,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    receptions: listing.receptions,
    size_sqft: listing.sizeSqft,
    epc_rating: listing.epcRating,
    council_tax_band: listing.councilTaxBand,
    service_charge_annual: listing.serviceChargeAnnual ?? null,
    lease_years_remaining: listing.leaseYearsRemaining ?? null,
    summary: listing.summary,
    description: listing.description,
    features: listing.features,
    images: listing.images,
    date_listed: listing.dateListed,
    featured: listing.featured ?? false,
  };
}

async function main() {
  console.log(`Loading local model from ./models/${MODEL_ID}…`);
  const extractor = await pipeline("feature-extraction", MODEL_ID, { quantized: true });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  const rows = [];
  for (const listing of listings) {
    const text = listingToEmbeddingText(listing);
    const output = await extractor(text, { pooling: "mean", normalize: true });
    rows.push({ ...listingToRow(listing), search_embedding: Array.from(output.data) });
    console.log(`  embedded ${listing.slug}`);
  }

  console.log(`\nUpserting ${rows.length} listings into Supabase…`);
  const { error, count } = await supabase
    .from("listings")
    .upsert(rows, { onConflict: "slug", count: "exact" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Done — ${count ?? rows.length} listings upserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
