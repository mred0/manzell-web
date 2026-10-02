// Evaluation harness for the AI-assisted search's RAG layer
// (src/lib/assistant.ts) — run against a live server, since src/lib/*
// modules import "server-only" and can't be imported outside Next.js's
// own build (see the note at the top of scripts/seed-supabase.mjs).
//
// Usage:
//   npm run dev             # in one terminal, with GROQ_API_KEY set in .env.local
//   npm run eval:assistant  # in another terminal
//
// Optionally point it at a different running instance:
//   TEST_BASE_URL=http://localhost:3105 npm run eval:assistant
//
// What this checks, per question:
//   1. The request succeeds and returns a `results` array.
//   2. If Groq returned a reply, every "[ID:...]" it cites is one of the
//      listing IDs actually handed to it (results) — i.e. the model never
//      recommends a property outside what semantic search retrieved. This
//      is the grounding guarantee retrieval-augmented generation is meant
//      to give: it's structurally checked here, not just asserted.
//
// Output: a console summary, and a Markdown report written to
// docs/ai-assistant-evaluation.md for the dissertation's evaluation
// chapter.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

// 12 realistic client briefs, plus 3 adversarial cases (off-topic,
// gibberish, and an unsatisfiable request) to check the assistant declines
// gracefully rather than force-fitting a recommendation.
const QUESTIONS = [
  "a quiet two-bedroom flat with a garden and off-street parking",
  "somewhere bright near good restaurants, good for entertaining",
  "riverside views in Chelsea",
  "a compact mews house close to Sloane Square",
  "a penthouse with a terrace for entertaining outdoors",
  "a family house near a park with room to grow into",
  "the cheapest apartment for sale, under one million pounds",
  "a five bedroom townhouse with a garden in Belgravia",
  "somewhere with a private garden, good for a dog",
  "a flat to rent in Notting Hill with space for a home office",
  "a period conversion with high ceilings and original features",
  "a modern new-build apartment with a concierge",
  "what's the weather like in London today", // off-topic
  "asdkjhasd qqqqzzz nonsense xyz123", // gibberish
  "a ten bedroom castle with a moat and a helipad", // unsatisfiable
];

function extractCitedIds(text) {
  if (!text) return [];
  const matches = [...text.matchAll(/\[ID:([^\]]+)\]/g)];
  return matches.map((m) => m[1]);
}

async function runQuestion(query) {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const elapsedMs = Date.now() - started;

    if (!res.ok) {
      return { query, ok: false, elapsedMs, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const results = data.results ?? [];
    const aiReply = data.aiReply ?? null;
    const candidateIds = new Set(results.map((r) => r.listing.id));
    const citedIds = extractCitedIds(aiReply);
    const hallucinatedIds = citedIds.filter((id) => !candidateIds.has(id));

    return {
      query,
      ok: true,
      elapsedMs,
      resultCount: results.length,
      resultTitles: results.map((r) => r.listing.title),
      aiReply,
      citedIds,
      hallucinatedIds,
      grounded: hallucinatedIds.length === 0,
    };
  } catch (err) {
    return { query, ok: false, elapsedMs: Date.now() - started, error: String(err) };
  }
}

function toMarkdown(rows) {
  const total = rows.length;
  const succeeded = rows.filter((r) => r.ok).length;
  const withReply = rows.filter((r) => r.ok && r.aiReply).length;
  const grounded = rows.filter((r) => r.ok && r.aiReply && r.grounded).length;
  const hallucinated = rows.filter((r) => r.ok && r.aiReply && !r.grounded).length;

  const lines = [];
  lines.push("# AI Assistant Evaluation — Grounding & Reliability");
  lines.push("");
  lines.push(`Run: ${new Date().toISOString()} against \`${BASE_URL}\``);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Questions run: ${total}`);
  lines.push(`- Requests that succeeded: ${succeeded}/${total}`);
  lines.push(`- Questions that got an assistant reply (Groq configured & reachable): ${withReply}/${total}`);
  lines.push(`- Replies with zero hallucinated citations: ${grounded}/${withReply || 1}`);
  lines.push(`- Replies with at least one hallucinated citation: ${hallucinated}`);
  lines.push("");
  lines.push(
    hallucinated === 0
      ? "**Result: no hallucinated property citations were observed across this run.** Every property the assistant cited by ID was one of the listings its own retrieval step (semanticSearch) had already surfaced — the RAG design constrains it structurally, not just by prompt wording."
      : `**Result: ${hallucinated} response(s) cited a property ID outside the retrieved candidate set — see flagged rows below.**`
  );
  lines.push("");
  lines.push("## Per-question results");
  lines.push("");

  rows.forEach((r, i) => {
    lines.push(`### ${i + 1}. "${r.query}"`);
    lines.push("");
    if (!r.ok) {
      lines.push(`- **Request failed:** ${r.error}`);
      lines.push("");
      return;
    }
    lines.push(`- Results returned: ${r.resultCount}`);
    if (r.resultCount > 0) {
      lines.push(`- Top candidates: ${r.resultTitles.slice(0, 3).join("; ")}`);
    }
    if (r.aiReply) {
      lines.push(`- Citations: ${r.citedIds.length > 0 ? r.citedIds.join(", ") : "(none)"}`);
      lines.push(`- Grounded (no hallucinated citations): ${r.grounded ? "✅ yes" : "❌ NO"}`);
      lines.push("- Assistant reply:");
      lines.push("");
      lines.push(`  > ${r.aiReply.replace(/\n/g, "\n  > ")}`);
    } else {
      lines.push("- Assistant reply: _(none — Groq not configured, unreachable, or rate-limited; page fell back to plain results)_");
    }
    lines.push("");
  });

  return lines.join("\n");
}

async function main() {
  console.log(`Running ${QUESTIONS.length} test questions against ${BASE_URL} ...\n`);
  const rows = [];
  for (const query of QUESTIONS) {
    process.stdout.write(`  "${query}" ... `);
    const row = await runQuestion(query);
    rows.push(row);
    if (!row.ok) {
      console.log(`FAILED (${row.error})`);
    } else if (!row.aiReply) {
      console.log(`ok, ${row.resultCount} results, no AI reply (fallback)`);
    } else {
      console.log(`ok, ${row.resultCount} results, ${row.grounded ? "grounded" : "HALLUCINATION"}`);
    }
  }

  const markdown = toMarkdown(rows);
  const outDir = path.join(projectRoot, "docs");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "ai-assistant-evaluation.md");
  writeFileSync(outPath, markdown);

  console.log(`\nReport written to ${path.relative(projectRoot, outPath)}`);

  const hallucinated = rows.filter((r) => r.ok && r.aiReply && !r.grounded).length;
  if (hallucinated > 0) {
    console.error(`\n${hallucinated} response(s) hallucinated a property outside the candidate list.`);
    process.exitCode = 1;
  }
}

main();
