import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/search";
import { getAssistantReply } from "@/lib/assistant";

// Runs on Node.js (not the Edge runtime) since the local embedding model
// needs the filesystem to load its weights from /models — same constraint
// as /api/search, which this route wraps.
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

  // The AI reply is retrieval-augmented: Groq only ever sees the listings
  // semanticSearch already found, so it can't recommend anything outside
  // that set. A failed/unconfigured Groq call resolves to null here rather
  // than throwing, so the response always includes the plain results.
  const aiReply = await getAssistantReply(query, results);

  return NextResponse.json({
    query,
    results: results.map(({ listing, score }) => ({
      listing,
      score: Number(score.toFixed(4)),
    })),
    aiReply,
  });
}
