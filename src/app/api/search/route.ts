import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/search";

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

  return NextResponse.json({
    query,
    results: results.map(({ listing, score }) => ({
      listing,
      score: Number(score.toFixed(4)),
    })),
  });
}
