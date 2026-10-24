import { NextResponse } from "next/server";
import { getAssistantFollowUpReply, type ConversationTurn } from "@/lib/assistant";
import type { SearchResult } from "@/lib/search";

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
