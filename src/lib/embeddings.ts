import "server-only";
import path from "node:path";
import { pipeline, env, type FeatureExtractionPipeline } from "@xenova/transformers";
import type { Listing } from "@/types/listing";

/**
 * Shared local-embedding machinery — used by both /api/search (embedding a
 * visitor's live query) and the admin listing create/update server actions
 * (embedding a listing's text so it's searchable the moment it's saved, no
 * separate build step). Everything runs through the same quantized MiniLM
 * model bundled under /models — no external API call, no key.
 */

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = path.join(process.cwd(), "models");

const MODEL_ID = "all-MiniLM-L6-v2"; // 384-dim, matches schema.sql vector(384)

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID, {
      quantized: true,
    }) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/** The same field selection scripts/build-embeddings.mjs used to use standalone. */
export function listingToEmbeddingText(
  listing: Pick<Listing, "title" | "summary" | "description" | "area" | "propertyType" | "features">
): string {
  return [
    listing.title,
    listing.summary,
    ...listing.description,
    listing.area,
    listing.propertyType.replace(/-/g, " "),
    ...listing.features,
  ].join(". ");
}

export function cosineSimilarity(a: number[], b: number[]): number {
  // Both vectors are L2-normalized (normalize: true above), so the dot
  // product alone equals cosine similarity.
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
