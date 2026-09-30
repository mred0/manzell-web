"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2, SearchX } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { EXAMPLE_QUERIES } from "@/data/example-queries";
import type { Listing } from "@/types/listing";

type Status = "idle" | "loading" | "done" | "error";

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

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const hasAutoRun = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Array<{ listing: Listing; score: number }>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Search failed. Please try again.");
      }

      const data: { results: Array<{ listing: Listing; score: number }> } = await res.json();
      setResults(data.results);
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
        <p className="inline-flex items-center gap-1.5 border border-brand-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-gold-deep">
          <Sparkles size={14} /> AI-assisted search
        </p>
        <h1 className="mt-3 font-display text-3xl italic text-brand-ink md:text-4xl">
          Describe the home you&rsquo;re picturing
        </h1>
        <p className="mt-3 text-brand-ink/70">
          This searches by meaning, not just matching words — a local
          language model compares your description against every listing&rsquo;s
          full write-up, so &ldquo;somewhere quiet with a garden&rdquo; can surface a
          property that never uses the word &ldquo;quiet&rdquo; at all.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-2xl gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. a bright flat near good restaurants, not too far from the park"
          className="flex-1 border border-brand-border px-4 py-3 text-sm outline-none focus:border-brand-gold"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 border border-brand-ink px-6 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-ink hover:text-background disabled:opacity-60"
        >
          {status === "loading" && <Loader2 className="animate-spin" size={16} />}
          Search
        </button>
      </form>

      <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQuery(example);
              runSearch(example);
            }}
            className="border border-brand-border px-3 py-1.5 text-xs text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold-deep"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-12">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ listing, score }) => (
              <div key={listing.id} className="relative">
                <span className="absolute right-3 top-3 z-10 border border-brand-border bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-gold-deep">
                  {Math.round(score * 100)}% match
                </span>
                <PropertyCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
