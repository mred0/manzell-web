// Precomputes a semantic embedding for every seed listing, using a small
// local sentence-transformer model (all-MiniLM-L6-v2, int8-quantized ONNX)
// that ships inside this repo under /models — there is no call to Hugging
// Face's hub or any other external service, at build time or at request
// time. Run this whenever src/data/listings.ts changes:
//
//   npm run build:embeddings
//
// Output feeds src/lib/search.ts, which only has to embed the user's live
// query at request time and compare it against these precomputed vectors —
// keeping the /api/search route fast.
import { pipeline, env } from "@xenova/transformers";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listings } from "../src/data/listings.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const outPath = path.join(projectRoot, "src", "data", "listing-embeddings.json");

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = path.join(projectRoot, "models");

const MODEL_ID = "all-MiniLM-L6-v2"; // 384-dim, matches schema.sql vector(384)

function listingToText(listing) {
  return [
    listing.title,
    listing.summary,
    ...listing.description,
    listing.area,
    listing.propertyType.replace(/-/g, " "),
    ...listing.features,
  ].join(". ");
}

async function main() {
  console.log(`Loading local model from ./models/${MODEL_ID}…`);
  const extractor = await pipeline("feature-extraction", MODEL_ID, { quantized: true });

  const entries = [];
  for (const listing of listings) {
    const text = listingToText(listing);
    const output = await extractor(text, { pooling: "mean", normalize: true });
    entries.push({ id: listing.id, slug: listing.slug, embedding: Array.from(output.data) });
    console.log(`  embedded ${listing.slug} (${output.data.length}d)`);
  }

  writeFileSync(outPath, JSON.stringify({ model: MODEL_ID, entries }, null, 2));
  console.log(`\nWrote ${entries.length} embeddings to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
