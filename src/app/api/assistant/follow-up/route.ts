import { NextResponse } from "next/server";
import { getAssistantFollowUpReply, type ConversationTurn } from "@/lib/assistant";
import type { SearchResult } from "@/lib/search";

// Answers one follow-up question against the exact candidate list the
// original /api/assistant call already retrieved — never re-runs search,
// so the conversation can never drift onto a property outside what the
// client was already shown. Same Node.js requirement as /api/assistant
// (getAssistantFollowUpReply only calls out to Groq, but keeping the
// runtime consistent with the rest of the assistant API avoids surprises).
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    originalQuery?: string;
    results?: SearchResult[];
    history?: ConversationTurn[];
    question?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { originalQuery, results, history, question } = body;
  const trimmedQuestion = question?.trim();

  if (!originalQuery || !results || !history || !trimmedQuestion) {
    return NextResponse.json(
      { error: "originalQuery, results, history and question are all required." },
      { status: 400 }
    );
  }

  const reply = await getAssistantFollowUpReply(originalQuery, results, history, trimmedQuestion);

  return NextResponse.json({ reply });
}
