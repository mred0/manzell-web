import "server-only";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { formatHeadlineFigure, formatPropertyType } from "@/lib/format";
import type { SearchResult } from "@/lib/search";

/**
 * The AI-assisted search's natural-language layer — a small RAG (retrieval-
 * augmented generation) step on top of the existing local semantic search:
 *
 *   1. src/lib/search.ts finds the top matching listings by meaning
 *      (unchanged, still runs fully locally, no external call).
 *   2. Those listings — and ONLY those listings — are handed to Groq's
 *      free-tier hosted model, which writes a short, natural reply that
 *      recommends from the list and cites each one by its listing ID.
 *
 * The model is never allowed to see the full catalogue, so it physically
 * cannot recommend a property that wasn't already found by the semantic
 * search — the retrieval step is what keeps this grounded, not the prompt
 * wording alone.
 *
 * If Groq is unreachable, rate-limited, or GROQ_API_KEY isn't set, this
 * returns null and the caller (the /search page) simply shows the plain
 * search results with no assistant reply — the feature degrades silently
 * rather than breaking the page.
 */

const MODEL_ID = "openai/gpt-oss-20b";

const SYSTEM_PROMPT = `You are the Manzell property assistant, helping a client on Manzell's website find a home.

You will be given the client's request and a short numbered list of candidate properties, each tagged with an exact [ID:...] marker. These are the ONLY properties you know about.

Rules — follow these exactly:
- Only ever refer to properties that appear in the numbered list. Never mention, imply, invent, or guess at any property, address, price, or feature that is not written in that list.
- When you recommend a property, cite it using its exact [ID:...] tag from the list, so the website can link to it.
- If none of the listed properties are a good fit, say so plainly rather than stretching a recommendation to fit.
- Write 2-4 short sentences in a warm, concise, professional estate-agent voice. No headings, no bullet points, no markdown formatting.`;

function buildCandidateContext(results: SearchResult[]): string {
  return results
    .map(({ listing }, index) => {
      const figure = formatHeadlineFigure(listing);
      const type = formatPropertyType(listing.propertyType);
      return `${index + 1}. [ID:${listing.id}] "${listing.title}" — ${listing.area}, ${type}. ${figure}. ${listing.bedrooms} bed / ${listing.bathrooms} bath, ${listing.sizeSqft.toLocaleString()} sqft. ${listing.summary}`;
    })
    .join("\n");
}

/**
 * Returns a short natural-language recommendation grounded only in
 * `results`, or null if the assistant is unavailable / unconfigured / the
 * call failed for any reason — callers should treat null as "fall back to
 * showing the plain results", never as an error to surface to the visitor.
 */
export async function getAssistantReply(
  query: string,
  results: SearchResult[]
): Promise<string | null> {
  if (results.length === 0) return null;
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const { text } = await generateText({
      model: groq(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: `Client's request: "${query}"\n\nCandidate properties:\n${buildCandidateContext(results)}\n\nWrite your recommendation to the client now.`,
      temperature: 0.3,
      maxOutputTokens: 350,
    });
    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch (err) {
    console.error("Groq assistant call failed — falling back to plain search results:", err);
    return null;
  }
}
