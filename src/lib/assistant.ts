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
 * getAssistantFollowUpReply() extends the same grounding to a short
 * conversation: the candidate list never changes after the first reply, so
 * a follow-up question ("does it have a garden?") is answered from exactly
 * the same fixed set of properties, with the prior exchange passed back in
 * as conversation history rather than re-running retrieval.
 *
 * If Groq is unreachable, rate-limited, or GROQ_API_KEY isn't set, these
 * return null and the caller (the /search page) simply shows the plain
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
- The client may ask follow-up questions about the same properties. Keep following these same rules for every question in the conversation — never introduce a property partway through that wasn't in the original numbered list.
- Never write a URL and never use markdown link syntax like [some text](a-url) — the website does not render it and it will show up broken. The ONLY bracketed thing you may ever write is a property's exact [ID:...] tag, on its own, right after you mention that property by name.
- Never use markdown formatting of any kind, in any answer, however many properties you're discussing: no **bold**, no *italic*, no numbered lists ("1. ... 2. ..."), no bullet points, no headings. Even when covering several properties — including a question like "what's nearest to each one" — weave them into flowing sentences, not a list or breakdown. The website displays your reply as plain text, so any such formatting shows up broken, literally, on the page.
- Write 2-4 short sentences in a warm, concise, professional estate-agent voice.`;

function buildCandidateContext(results: SearchResult[]): string {
  return results
    .map(({ listing }, index) => {
      const figure = formatHeadlineFigure(listing);
      const type = formatPropertyType(listing.propertyType);
      return `${index + 1}. [ID:${listing.id}] "${listing.title}" — ${listing.area}, ${type}. ${figure}. ${listing.bedrooms} bed / ${listing.bathrooms} bath, ${listing.sizeSqft.toLocaleString()} sqft. ${listing.summary}`;
    })
    .join("\n");
}

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Shared call path for both the first reply and any follow-up: same model,
 * same system rules, same reasoning-token headroom (see the maxOutputTokens
 * note below) — only the prompt shape differs between the two callers.
 */
async function callAssistantModel(
  input: { prompt: string } | { messages: ChatMessage[] }
): Promise<string | null> {
  try {
    const { text, finishReason } = await generateText({
      model: groq(MODEL_ID),
      system: SYSTEM_PROMPT,
      ...input,
      temperature: 0.3,
      // gpt-oss-20b is a reasoning model: it spends most of this budget on
      // internal reasoning tokens before writing the visible reply, so this
      // needs real headroom above a short 2-4 sentence answer — at 350 it
      // was reliably running out mid-thought and returning empty text
      // (finishReason "length" with ~348 reasoning tokens and 0-5 text
      // tokens), confirmed via diagnostic logging during evaluation.
      maxOutputTokens: 900,
    });
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      console.error(`Groq assistant call returned empty text (finishReason=${finishReason}).`);
      return null;
    }
    return trimmed;
  } catch (err) {
    console.error("Groq assistant call failed:", err);
    return null;
  }
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

  return callAssistantModel({
    prompt: `Client's request: "${query}"\n\nCandidate properties:\n${buildCandidateContext(results)}\n\nWrite your recommendation to the client now.`,
  });
}

/** One exchange in the conversation: the client's question and the assistant's reply. */
export interface ConversationTurn {
  question: string;
  reply: string;
}

/**
 * Answers a follow-up question in an ongoing conversation about the same
 * fixed candidate list — `results` and `originalQuery` are the exact same
 * values the first getAssistantReply() call used, never re-retrieved, so
 * the grounding guarantee holds across the whole exchange: the model can
 * only ever talk about the properties it was shown in the first turn.
 *
 * `history` is every prior exchange in order (always starting with the
 * original query + its reply); `followUpQuestion` is the new question to
 * answer. Returns null under the same conditions as getAssistantReply —
 * callers should show a small "couldn't answer that" message, not treat
 * it as fatal.
 */
export async function getAssistantFollowUpReply(
  originalQuery: string,
  results: SearchResult[],
  history: ConversationTurn[],
  followUpQuestion: string
): Promise<string | null> {
  if (results.length === 0) return null;
  if (!process.env.GROQ_API_KEY) return null;
  if (history.length === 0) return null;

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `Client's request: "${originalQuery}"\n\nCandidate properties:\n${buildCandidateContext(results)}\n\nWrite your recommendation to the client now.`,
    },
    { role: "assistant", content: history[0].reply },
  ];

  for (const turn of history.slice(1)) {
    messages.push({ role: "user", content: turn.question });
    messages.push({ role: "assistant", content: turn.reply });
  }

  messages.push({ role: "user", content: followUpQuestion });

  return callAssistantModel({ messages });
}
