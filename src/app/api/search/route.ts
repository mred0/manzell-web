import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/search";

// Runs on Node.js (not the Edge runtime) since the local embedding model
// needs the filesystem to load its weights from /models.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { query?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "A search query is required." }, { status: 400 });
  }

  const results = await semanticSearch(query);

  // Full listing objects, not just slug + score — the results power client
  // components (LiveSearchHero, the /search page) directly, so they don't
  // need to import the dataset themselves just to resolve a slug to a
  // listing (which used to mean shipping every listing's full text to the
  // browser even when only 3-6 were ever shown).
  return NextResponse.json({
    query,
    results: results.map(({ listing, score }) => ({
      listing,
      score: Number(score.toFixed(4)),
    })),
  });
}
