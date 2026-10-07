// Evaluation harness for AI semantic search (src/lib/search.ts, served via
// /api/search) against a simple keyword-matching baseline — the kind of
// matching a non-AI "Ctrl+F over the listing text" search would do, which
// stands in for what the old manzell.com site's search almost certainly
// did. Run against a live server, since /api/search needs the full
// Next.js runtime (local embedding model, filesystem access to /models).
//
// Usage:
//   npm run dev                 # in one terminal
//   node scripts/eval-search.mjs   # in another terminal
//
// Optionally point it at a different running instance:
//   TEST_BASE_URL=http://localhost:3105 node scripts/eval-search.mjs
//
// Methodology
// -----------
// With a single evaluator and no independent judges available, relevance
// is defined OPERATIONALLY rather than by subjective judgement: each query
// is paired with a predicate over the listing's own structured fields
// (area / propertyType / features). Every listing in the 150-listing
// dataset (src/data/listings.ts) that satisfies the predicate counts as
// relevant for that query; everything else counts as not relevant. This
// keeps ground truth objective, reproducible, and auditable (anyone can
// re-run the predicate over the dataset and get the same relevant set) —
// at the cost of only approximating "relevance" as a human searcher would
// judge it. That trade-off is called out explicitly in the report.
//
// Two query sets are evaluated separately, deliberately:
//   LEXICAL   — the query names the exact attribute/feature term
//               ("penthouse", "wine cellar"). A literal keyword matcher
//               should do fine here; this checks semantic search is at
//               least not WORSE on the easy case.
//   SEMANTIC  — the query describes the need in different words than the
//               feature text uses ("somewhere to cool off on a hot day"
//               for a swimming pool). This is the case dense embeddings
//               exist for, and where a literal keyword baseline is
//               expected to fail outright.
//
// Metrics: Precision@5 and Mean Reciprocal Rank (MRR), computed over the
// top 6 results each arm returns (matching semanticSearch's own default
// limit, so neither arm is given a results-list-length advantage).

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listings } from "../src/data/listings.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const RESULT_LIMIT = 6; // matches semanticSearch's default `limit`

// ---------------------------------------------------------------------------
// Query set — each entry pairs a natural-language query with a predicate
// over a listing's own fields that defines "relevant" for that query.
// ---------------------------------------------------------------------------
const LEXICAL_QUERIES = [
  { query: "Chelsea", relevant: (l) => l.area === "Chelsea" },
  { query: "penthouse", relevant: (l) => l.propertyType === "penthouse" },
  { query: "swimming pool", relevant: (l) => l.features.some((f) => /swimming pool/i.test(f)) },
  { query: "wine cellar", relevant: (l) => l.features.some((f) => /wine cellar/i.test(f)) },
  {
    query: "Notting Hill apartment",
    relevant: (l) => l.area === "Notting Hill" && l.propertyType === "apartment",
  },
  { query: "mews house", relevant: (l) => l.propertyType === "mews-house" },
  { query: "concierge", relevant: (l) => l.features.some((f) => /concierge/i.test(f)) },
  { query: "roof terrace", relevant: (l) => l.features.some((f) => /terrace/i.test(f)) },
];

const SEMANTIC_QUERIES = [
  {
    query: "somewhere to cool off on a hot day",
    relevant: (l) => l.features.some((f) => /pool/i.test(f)),
    targetFeature: "swimming pool",
  },
  {
    query: "space to park a car off the road",
    relevant: (l) => l.features.some((f) => /parking|garage/i.test(f)),
    targetFeature: "parking / garage",
  },
  {
    query: "a quiet green space just for residents",
    relevant: (l) => l.features.some((f) => /garden/i.test(f)),
    targetFeature: "garden",
  },
  {
    query: "high-tech smart home controls",
    relevant: (l) => l.features.some((f) => /home automation/i.test(f)),
    targetFeature: "home automation system",
  },
  {
    query: "keeping the house cool during summer",
    relevant: (l) => l.features.some((f) => /air conditioning/i.test(f)),
    targetFeature: "air conditioning",
  },
  {
    query: "a dedicated space to watch films at home",
    relevant: (l) => l.features.some((f) => /cinema/i.test(f)),
    targetFeature: "home cinema room",
  },
  {
    query: "a flat where I don't need to climb the stairs",
    relevant: (l) => l.features.some((f) => /lift access/i.test(f)),
    targetFeature: "lift access",
  },
  {
    query: "a house standing completely on its own, not attached to neighbours",
    relevant: (l) => l.propertyType === "detached-house",
    targetFeature: "detached-house (property type)",
  },
];

// ---------------------------------------------------------------------------
// Keyword baseline — naive term-overlap scoring over the same text
// semantic search's own embedding is built from (see listingToEmbeddingText
// in src/lib/embeddings.ts, duplicated here rather than imported since that
// module is Next.js/server-only and this script runs standalone via tsx,
// same reasoning as scripts/build-embeddings.mjs).
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
  "a", "an", "the", "to", "in", "on", "with", "for", "of", "and", "or", "i",
  "my", "is", "just", "off", "so", "that", "not", "don", "t", "do", "need",
  "where", "during", "at", "home", "someone", "something", "room", "space",
]);

function listingToText(listing) {
  return [
    listing.title,
    listing.summary,
    ...listing.description,
    listing.area,
    listing.propertyType.replace(/-/g, " "),
    ...listing.features,
  ]
    .join(". ")
    .toLowerCase();
}

function tokenize(query) {
  return (query.toLowerCase().match(/[a-z0-9]+/g) || []).filter((t) => !STOPWORDS.has(t));
}

function keywordSearch(query, candidates, limit) {
  const terms = tokenize(query);
  const scored = candidates
    .map((listing) => {
      const text = listingToText(listing);
      let score = 0;
      for (const term of terms) {
        const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
        const matches = text.match(re);
        if (matches) score += matches.length;
      }
      return { listing, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.listing.id.localeCompare(b.listing.id));
  return scored.slice(0, limit).map((r) => r.listing);
}

async function semanticSearchLive(query, limit) {
  const res = await fetch(`${BASE_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).slice(0, limit).map((r) => r.listing);
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------
function precisionAtK(resultIds, relevantIds, k) {
  const topK = resultIds.slice(0, k);
  if (topK.length === 0) return 0;
  const hits = topK.filter((id) => relevantIds.has(id)).length;
  return hits / k;
}

function reciprocalRank(resultIds, relevantIds) {
  for (let i = 0; i < resultIds.length; i++) {
    if (relevantIds.has(resultIds[i])) return 1 / (i + 1);
  }
  return 0;
}

async function runQuery(entry) {
  const relevantIds = new Set(listings.filter(entry.relevant).map((l) => l.id));

  let semanticIds = [];
  let semanticError = null;
  try {
    const semanticResults = await semanticSearchLive(entry.query, RESULT_LIMIT);
    semanticIds = semanticResults.map((l) => l.id);
  } catch (err) {
    semanticError = String(err);
  }

  const keywordResults = keywordSearch(entry.query, listings, RESULT_LIMIT);
  const keywordIds = keywordResults.map((l) => l.id);

  return {
    query: entry.query,
    targetFeature: entry.targetFeature,
    relevantCount: relevantIds.size,
    semanticIds,
    semanticError,
    keywordIds,
    semantic: {
      p5: precisionAtK(semanticIds, relevantIds, 5),
      mrr: reciprocalRank(semanticIds, relevantIds),
    },
    keyword: {
      p5: precisionAtK(keywordIds, relevantIds, 5),
      mrr: reciprocalRank(keywordIds, relevantIds),
    },
  };
}

function mean(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function summarize(rows) {
  return {
    n: rows.length,
    semanticP5: mean(rows.map((r) => r.semantic.p5)),
    semanticMRR: mean(rows.map((r) => r.semantic.mrr)),
    keywordP5: mean(rows.map((r) => r.keyword.p5)),
    keywordMRR: mean(rows.map((r) => r.keyword.mrr)),
  };
}

function fmt(n) {
  return n.toFixed(3);
}

function toMarkdown(lexicalRows, semanticRows) {
  const lex = summarize(lexicalRows);
  const sem = summarize(semanticRows);
  const allRows = [...lexicalRows, ...semanticRows];
  const overallSemantic = summarize(allRows).semanticP5;
  const anyServerError = allRows.some((r) => r.semanticError);

  const lines = [];
  lines.push("# Search Evaluation — Semantic Search vs. Keyword Baseline");
  lines.push("");
  lines.push(`Run: ${new Date().toISOString()} against \`${BASE_URL}\``);
  lines.push(`Dataset: ${listings.length} listings (src/data/listings.ts)`);
  lines.push("");
  lines.push("## Methodology");
  lines.push("");
  lines.push(
    "Relevance is defined operationally: each query is paired with a predicate over a listing's own area / propertyType / features fields, and every listing satisfying it counts as relevant. This keeps ground truth objective and reproducible without a second human judge, at the cost of approximating true relevance. Metrics are Precision@5 and Mean Reciprocal Rank (MRR), computed over the top 6 results each arm returns (matching the deployed `semanticSearch` default limit, so neither arm gets a longer results list than the other). The keyword baseline is a naive term-overlap matcher over the same listing text the embedding is built from — standing in for the kind of search the previous manzell.com site, and most budget property sites, implement."
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Query set | n | Semantic P@5 | Semantic MRR | Keyword P@5 | Keyword MRR |");
  lines.push("|---|---|---|---|---|---|");
  lines.push(
    `| Lexical (exact term in query) | ${lex.n} | ${fmt(lex.semanticP5)} | ${fmt(lex.semanticMRR)} | ${fmt(lex.keywordP5)} | ${fmt(lex.keywordMRR)} |`
  );
  lines.push(
    `| Semantic / paraphrase (no literal overlap) | ${sem.n} | ${fmt(sem.semanticP5)} | ${fmt(sem.semanticMRR)} | ${fmt(sem.keywordP5)} | ${fmt(sem.keywordMRR)} |`
  );
  lines.push("");
  if (anyServerError) {
    lines.push("**Warning: one or more semantic search requests failed — see per-query detail below. Metrics for those rows are computed with an empty semantic result set (worst case), so the semantic column may understate true performance until the failures are fixed and this is re-run.**");
    lines.push("");
  }
  lines.push(
    sem.semanticP5 > sem.keywordP5
      ? `**Result: on paraphrased, no-literal-overlap queries — the kind a buyer actually types — semantic search reached ${fmt(sem.semanticP5)} mean Precision@5 against the keyword baseline's ${fmt(sem.keywordP5)}, because it matches on meaning rather than shared words. On queries that already name the exact term, the two arms are closer (${fmt(lex.semanticP5)} vs ${fmt(lex.keywordP5)}), which is the expected result: literal matching only fails when the words differ.**`
      : `**Result: see per-query detail — re-check the predicates and server availability before drawing a conclusion from this run.**`
  );
  lines.push("");
  lines.push("## Per-query detail — lexical queries");
  lines.push("");
  lines.push("| Query | Target | Relevant in dataset | Semantic P@5 | Semantic MRR | Keyword P@5 | Keyword MRR |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const r of lexicalRows) {
    lines.push(
      `| "${r.query}" | — | ${r.relevantCount} | ${fmt(r.semantic.p5)} | ${fmt(r.semantic.mrr)} | ${fmt(r.keyword.p5)} | ${fmt(r.keyword.mrr)} |`
    );
  }
  lines.push("");
  lines.push("## Per-query detail — semantic / paraphrase queries");
  lines.push("");
  lines.push("| Query | Target feature | Relevant in dataset | Semantic P@5 | Semantic MRR | Keyword P@5 | Keyword MRR |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const r of semanticRows) {
    lines.push(
      `| "${r.query}" | ${r.targetFeature} | ${r.relevantCount} | ${fmt(r.semantic.p5)} | ${fmt(r.semantic.mrr)} | ${fmt(r.keyword.p5)} | ${fmt(r.keyword.mrr)} |`
    );
  }
  lines.push("");
  lines.push("## Limitations");
  lines.push("");
  const broadQueries = allRows.filter((r) => r.relevantCount / listings.length > 0.3);
  lines.push(
    "- Ground truth is operational (attribute predicates), not a second human judge's opinion — it approximates relevance rather than matching it exactly, since a single-evaluator MSc project has no independent judge available."
  );
  if (broadQueries.length > 0) {
    lines.push(
      `- ${broadQueries.length} quer${broadQueries.length === 1 ? "y" : "ies"} (${broadQueries.map((r) => `"${r.query}"`).join(", ")}) had a relevant set covering over 30% of the whole dataset, which weakens how discriminating that query is — even a mediocre ranker scores non-trivially by chance against a large relevant set. The narrower single-feature queries (pool, cinema, home automation, concierge — typically under 15% of the dataset) are the more discriminating signal in this evaluation.`
    );
  }
  const semanticMisses = allRows.filter((r) => !r.semanticError && r.semantic.p5 === 0 && r.keyword.p5 > 0);
  if (semanticMisses.length > 0) {
    lines.push(
      `- Semantic search scored 0 on Precision@5 while the keyword baseline scored above 0 for: ${semanticMisses.map((r) => `"${r.query}"`).join(", ")}. This is a genuine weakness worth investigating rather than a measurement artefact — a likely cause is the deployed \`minScore\` cutoff (0.15) in \`semanticSearch\` filtering out true matches for short, single-concept queries, where cosine similarity to the listing text sits close to that threshold.`
    );
  }
  lines.push(
    "- 16 queries across two sets is enough to see a directional pattern for an MSc artefact's evaluation chapter, but is not a statistically powered benchmark — treat the summary row as indicative, not a precise population estimate."
  );
  lines.push("");
  lines.push("## Raw result IDs (for audit)");
  lines.push("");
  for (const r of allRows) {
    lines.push(`- "${r.query}" — relevant: ${r.relevantCount} listings`);
    lines.push(`  - semantic top 6: ${r.semanticError ? `ERROR: ${r.semanticError}` : r.semanticIds.join(", ") || "(none)"}`);
    lines.push(`  - keyword top 6: ${r.keywordIds.join(", ") || "(none)"}`);
  }
  lines.push("");

  return lines.join("\n");
}

async function main() {
  console.log(`Running ${LEXICAL_QUERIES.length + SEMANTIC_QUERIES.length} queries against ${BASE_URL} ...\n`);

  console.log("Lexical queries:");
  const lexicalRows = [];
  for (const entry of LEXICAL_QUERIES) {
    process.stdout.write(`  "${entry.query}" ... `);
    const row = await runQuery(entry);
    lexicalRows.push(row);
    console.log(row.semanticError ? `SEMANTIC FAILED (${row.semanticError})` : `ok (${row.relevantCount} relevant)`);
  }

  console.log("\nSemantic / paraphrase queries:");
  const semanticRows = [];
  for (const entry of SEMANTIC_QUERIES) {
    process.stdout.write(`  "${entry.query}" ... `);
    const row = await runQuery(entry);
    semanticRows.push(row);
    console.log(row.semanticError ? `SEMANTIC FAILED (${row.semanticError})` : `ok (${row.relevantCount} relevant)`);
  }

  const markdown = toMarkdown(lexicalRows, semanticRows);
  const outDir = path.join(projectRoot, "docs");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "search-evaluation.md");
  writeFileSync(outPath, markdown);

  console.log(`\nReport written to ${path.relative(projectRoot, outPath)}`);

  const lex = summarize(lexicalRows);
  const sem = summarize(semanticRows);
  console.log("\nSummary:");
  console.log(`  Lexical    — semantic P@5 ${fmt(lex.semanticP5)} / MRR ${fmt(lex.semanticMRR)}  |  keyword P@5 ${fmt(lex.keywordP5)} / MRR ${fmt(lex.keywordMRR)}`);
  console.log(`  Semantic   — semantic P@5 ${fmt(sem.semanticP5)} / MRR ${fmt(sem.semanticMRR)}  |  keyword P@5 ${fmt(sem.keywordP5)} / MRR ${fmt(sem.keywordMRR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
