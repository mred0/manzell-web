"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2, SearchX } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { EXAMPLE_QUERIES } from "@/data/example-queries";
import type { Listing } from "@/types/listing";

type Status = "idle" | "loading" | "done" | "error";
type SearchResultRow = { listing: Listing; score: number };

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
function renderAssistantReply(text: string, results: SearchResultRow[]): ReactNode[] {
  const listingById = new Map(results.map((r) => [r.listing.id, r.listing]));
  const segments = text.split(/(\[ID:[^\]]+\])/g);

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
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setStatus("loading");
    setErrorMessage(null);
    setAiReply(null);

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
      setAiReply(data.aiReply);
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

  // Auto-run once for a query arriving via ?q=... (e.g. someone followed
  // "Search" from the homepage's live demo, or a shared link). Guarded by
  // a ref so it fires exactly once per mount, not on every render.
  useEffect(() => {
    if (hasAutoRun.current) return;
    hasAutoRun.current = true;
    if (initialQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time fetch triggered by an incoming URL query param, not a render-derived setState.
      runSearch(initialQuery);
    }
  }, [initialQuery]);

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
                grounded only in the cards below it (src/lib/assistant.ts).
                Absent whenever Groq isn't configured or the call failed,
                in which case the page simply shows the plain results, no
                different from before this feature existed. */}
            {aiReply && (
              <div className="mb-8 border border-brand-border bg-white p-6 shadow-[0_22px_44px_-28px_rgba(36,26,28,0.26)] md:p-7">
                <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-gold-deep">
                  <Sparkles size={12} /> Manzell Assistant
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-brand-ink/85">
                  {renderAssistantReply(aiReply, results)}
                </p>
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
