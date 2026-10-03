"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2, SearchX } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { EXAMPLE_QUERIES } from "@/data/example-queries";
import type { Listing } from "@/types/listing";

type Status = "idle" | "loading" | "done" | "error";
type SearchResultRow = { listing: Listing; score: number };
type ConversationTurn = { question: string; reply: string };

// Next.js unmounts this page's component on every route change, which
// wipes its React state — so leaving /search and coming back (even via
// the browser back button) looked like the whole search had reset. The
// session is cached here instead, under the user's own tab (cleared when
// the tab closes, never shared across tabs or persisted server-side), and
// restored on mount — skipped when arriving with its own ?q=... (e.g. from
// the homepage's live demo), since that's a deliberate new search.
const STORAGE_KEY = "manzell-ai-search-session";
type StoredSearchSession = {
  query: string;
  searchedQuery: string;
  results: SearchResultRow[];
  history: ConversationTurn[];
};

const fieldClasses =
  "w-full border-0 border-b-[1.5px] border-brand-border bg-transparent px-0.5 py-3.5 text-[15px] text-brand-ink outline-none transition-colors placeholder:text-brand-ink/40 focus:border-brand-gold-deep";
const labelTextClasses =
  "block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50";

// useSearchParams() bails a static page out to client-side rendering for
// everything below its nearest Suspense boundary, so the page reading it
// (to support a shareable /search?q=... link, e.g. from the homepage's
// live search demo) is split out and wrapped below.
export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

// The assistant is instructed (src/lib/assistant.ts) to cite each property
// it recommends with an exact "[ID:...]" tag drawn from the candidates it
// was given. Turning those tags into links here — rather than leaving them
// as raw bracket text — is also what makes the grounding visible: every
// citation resolves to one of the cards on the page, or is silently
// dropped if it doesn't (which would mean the model cited something
// outside the list it was given).
//
// Belt-and-suspenders: the system prompt forbids markdown link syntax
// ("[label](url)"), but a follow-up turn was observed producing it anyway
// (the model inventing a plausible-looking but ungrounded URL). Rather
// than trust an arbitrary model-written URL, any such syntax is stripped
// down to its plain label before the [ID:...] citations are parsed, so a
// prompt slip degrades to plain text instead of showing broken raw
// brackets on the page.
function renderAssistantReply(text: string, results: SearchResultRow[]): ReactNode[] {
  const listingById = new Map(results.map((r) => [r.listing.id, r.listing]));
  const withoutMarkdownLinks = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Also strip markdown bold/italic emphasis (**text**, *text*) the model
  // is instructed not to use but was observed adding anyway on a
  // list-style follow-up question — same belt-and-suspenders reasoning as
  // the markdown-link strip above: degrade to plain text rather than show
  // literal asterisks on the page.
  const withoutEmphasis = withoutMarkdownLinks
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<!\d)\*([^*]+)\*(?!\d)/g, "$1");
  const segments = withoutEmphasis.split(/(\[ID:[^\]]+\])/g);

  return segments.map((segment, index) => {
    const match = segment.match(/^\[ID:([^\]]+)\]$/);
    if (!match) {
      return <span key={index}>{segment}</span>;
    }
    const listing = listingById.get(match[1]);
    if (!listing) return null;
    return (
      <a
        key={index}
        href={`/property/${listing.slug}`}
        className="font-semibold text-brand-gold-deep underline decoration-brand-gold/50 underline-offset-2 transition-colors hover:decoration-brand-gold-deep"
      >
        {listing.title}
      </a>
    );
  });
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const hasAutoRun = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<SearchResultRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // The follow-up conversation thread. history[0] is always the original
  // query + its reply, set once a search succeeds with a reply (absent
  // whenever Groq isn't configured or the call failed — the page then
  // simply shows the plain results, same as before this feature existed).
  // Every entry after that is one round-trip to /api/assistant/follow-up
  // against the same fixed `results` — the candidate list is never
  // re-retrieved mid-conversation.
  const [searchedQuery, setSearchedQuery] = useState("");
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState<"idle" | "loading" | "error">("idle");

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setStatus("loading");
    setErrorMessage(null);
    setHistory([]);
    setFollowUpQuestion("");
    setFollowUpStatus("idle");
    setSearchedQuery(q);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Search failed. Please try again.");
      }

      const data: { results: SearchResultRow[]; aiReply: string | null } = await res.json();
      setResults(data.results);
      if (data.aiReply) {
        setHistory([{ question: q, reply: data.aiReply }]);
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runSearch(query);
  }

  async function handleFollowUpSubmit(event: FormEvent) {
    event.preventDefault();
    const question = followUpQuestion.trim();
    if (!question || history.length === 0 || followUpStatus === "loading") return;

    setFollowUpStatus("loading");
    try {
      const res = await fetch("/api/assistant/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalQuery: searchedQuery, results, history, question }),
      });

      if (!res.ok) throw new Error();
      const data: { reply: string | null } = await res.json();
      if (!data.reply) throw new Error();

      setHistory((prev) => [...prev, { question, reply: data.reply as string }]);
      setFollowUpQuestion("");
      setFollowUpStatus("idle");
    } catch {
      setFollowUpStatus("error");
    }
  }

  // Auto-run once for a query arriving via ?q=... (e.g. someone followed
  // "Search" from the homepage's live demo, or a shared link). Guarded by
  // a ref so it fires exactly once per mount, not on every render.
  useEffect(() => {
    if (hasAutoRun.current) return;
    hasAutoRun.current = true;
    if (initialQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time fetch triggered by an incoming URL query param, not a render-derived setState.
      runSearch(initialQuery);
      return;
    }

    // No incoming query — this is a plain visit to /search, which includes
    // coming back after navigating away. Restore the last session if one
    // was saved, rather than starting from a blank page.
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: StoredSearchSession = JSON.parse(raw);
      if (!saved.results?.length) return;
      setQuery(saved.query);
      setSearchedQuery(saved.searchedQuery);
      setResults(saved.results);
      setHistory(saved.history ?? []);
      setStatus("done");
    } catch {
      // A missing/corrupted/inaccessible session store just means a
      // normal blank page — never worth surfacing to the visitor.
    }
  }, [initialQuery]);

  // Keep the saved session in step with the current one, so a later visit
  // restores exactly this state. Only meaningful once a search has
  // actually completed — an idle/loading/error page has nothing worth
  // saving.
  useEffect(() => {
    if (status !== "done") return;
    try {
      const toStore: StoredSearchSession = { query, searchedQuery, results, history };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // sessionStorage can throw (private browsing, storage disabled,
      // quota) — persistence here is a convenience, not a requirement.
    }
  }, [status, query, searchedQuery, results, history]);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
          <Sparkles size={13} /> AI&#8209;Assisted Search
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold italic text-brand-ink md:text-4xl">
          Describe the home you&rsquo;re picturing
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/72 md:text-[15px]">
          This searches by meaning, not just matching words &mdash; a local
          language model compares your description against every listing&rsquo;s
          full write-up, so &ldquo;somewhere quiet with a garden&rdquo; can surface a
          property that never uses the word &ldquo;quiet&rdquo; at all.
        </p>
      </div>

      {/* Search card — same bordered/shadowed white-card family as the
          Contact enquiry form, rather than a bare input row floating on
          the page background. */}
      <div className="mx-auto mt-10 max-w-4xl border border-brand-border bg-white p-8 shadow-[0_30px_60px_-30px_rgba(36,26,28,0.3)] md:p-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <label className="block flex-1 text-left">
            <span className={labelTextClasses}>What are you picturing?</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. a bright flat near good restaurants, not too far from the park"
              className={fieldClasses}
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex shrink-0 items-center justify-center gap-2 border border-brand-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-all duration-300 hover:border-brand-gold hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] hover:text-brand-plum hover:shadow-[0_0_18px_-2px_rgba(233,201,138,0.7)] disabled:opacity-60"
          >
            {status === "loading" && <Loader2 className="animate-spin" size={16} />}
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                runSearch(example);
              }}
              className="search-chip border border-brand-border bg-background px-4 py-2 text-xs text-brand-ink/75"
            >
              <span className="search-chip-shine" aria-hidden />
              <span className="relative">{example}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14">
        {status === "error" && errorMessage && (
          <p className="text-center text-sm font-medium text-status-reduced">{errorMessage}</p>
        )}

        {status === "done" && results.length === 0 && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 border border-dashed border-brand-border p-10 text-center text-brand-ink/60">
            <SearchX size={28} />
            <p>
              Nothing scored highly enough against that description. Try
              rephrasing, or browse{" "}
              <a href="/buy" className="font-semibold text-brand-primary underline">
                everything for sale
              </a>
              .
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            {/* Assistant reply — a short natural-language recommendation
                grounded only in the cards below it (src/lib/assistant.ts),
                with a lightweight follow-up turn underneath: the client
                can ask one more question about the same fixed set of
                properties without a new search running. Absent whenever
                Groq isn't configured or the call failed, in which case
                the page simply shows the plain results, no different
                from before this feature existed. */}
            {history.length > 0 && (
              <div className="mb-8 border border-brand-border bg-white p-6 shadow-[0_22px_44px_-28px_rgba(36,26,28,0.26)] md:p-7">
                <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-gold-deep">
                  <Sparkles size={12} /> Manzell Assistant
                </p>

                <div className="mt-2.5 flex flex-col gap-4">
                  {history.map((turn, index) => (
                    <div key={index}>
                      {index > 0 && (
                        <p className="mb-1.5 text-[13px] font-semibold text-brand-ink/55">
                          You asked: &ldquo;{turn.question}&rdquo;
                        </p>
                      )}
                      <p className="text-[15px] leading-relaxed text-brand-ink/85">
                        {renderAssistantReply(turn.reply, results)}
                      </p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleFollowUpSubmit}
                  className="mt-5 flex items-end gap-3 border-t border-brand-border pt-5"
                >
                  <label className="block flex-1 text-left">
                    <span className="sr-only">Ask a follow-up</span>
                    <input
                      type="text"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      placeholder="Ask a follow-up — e.g. does it have a garden?"
                      disabled={followUpStatus === "loading"}
                      className={fieldClasses}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={followUpStatus === "loading" || !followUpQuestion.trim()}
                    className="inline-flex shrink-0 items-center justify-center gap-2 border border-brand-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink transition-all duration-300 hover:border-brand-gold hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] hover:text-brand-plum hover:shadow-[0_0_18px_-2px_rgba(233,201,138,0.7)] disabled:opacity-60"
                  >
                    {followUpStatus === "loading" && <Loader2 className="animate-spin" size={14} />}
                    Ask
                  </button>
                </form>
                {followUpStatus === "error" && (
                  <p className="mt-2 text-[12.5px] text-status-reduced">
                    The assistant couldn&rsquo;t answer that just now &mdash; feel free to try again.
                  </p>
                )}
              </div>
            )}

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
              {results.length} {results.length === 1 ? "match" : "matches"} &mdash; ranked by meaning, not keywords
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ listing, score }) => (
                <div key={listing.id} className="relative">
                  <span className="absolute right-3 top-3 z-10 border border-brand-border bg-background/95 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.06em] text-brand-gold-deep">
                    {Math.round(score * 100)}% match
                  </span>
                  <PropertyCard listing={listing} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
