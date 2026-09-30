"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BedDouble, Ruler } from "lucide-react";
import { EXAMPLE_QUERIES } from "@/data/example-queries";
import { formatHeadlineFigure, formatPropertyType } from "@/lib/format";
import type { Listing } from "@/types/listing";

type Phase = "typing" | "searching" | "results" | "clearing";

interface LiveResult {
  listing: Listing;
  score: number;
}

const TYPE_MS = 32;
const HOLD_RESULTS_MS = 5200;
const PAUSE_MS = 500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Reads the OS-level reduced-motion preference as an external store (rather
// than useState+useEffect) so this stays a subscription, not a setState
// call fired from inside an effect body.
function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * The homepage hero's centrepiece: a live, self-running demonstration of
 * Manzell's semantic search — it actually calls /api/search (the same
 * local embedding model behind the /search page), so what plays out here
 * is real matching against real listings, not a scripted mockup.
 */
export default function LiveSearchHero() {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [results, setResults] = useState<LiveResult[]>([]);
  const [manualQuery, setManualQuery] = useState("");
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const skipTypingAnimation = reduceMotion;

    async function runLoop() {
      let i = 0;
      while (!cancelledRef.current) {
        const query = EXAMPLE_QUERIES[i % EXAMPLE_QUERIES.length];
        i += 1;

        setPhase("typing");
        if (skipTypingAnimation) {
          setTyped(query);
        } else {
          for (let c = 1; c <= query.length; c++) {
            if (cancelledRef.current) return;
            setTyped(query.slice(0, c));
            await sleep(TYPE_MS);
          }
        }
        if (cancelledRef.current) return;

        setPhase("searching");
        await sleep(skipTypingAnimation ? 150 : 450);
        if (cancelledRef.current) return;

        try {
          const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const data: { results?: LiveResult[] } = res.ok ? await res.json() : {};
          if (cancelledRef.current) return;
          setResults((data.results ?? []).slice(0, 3));
        } catch {
          if (cancelledRef.current) return;
          setResults([]);
        }

        setPhase("results");
        await sleep(HOLD_RESULTS_MS);
        if (cancelledRef.current) return;

        setPhase("clearing");
        await sleep(PAUSE_MS);
        if (cancelledRef.current) return;
        setTyped("");
      }
    }

    // Deliberately self-running: this effect drives a timed demo loop
    // (type a query → call the real search API → show results → repeat)
    // rather than reacting to a single external event.
    runLoop();
    return () => {
      cancelledRef.current = true;
    };
  }, [reduceMotion]);

  function goToFullSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleManualSubmit(event: React.FormEvent) {
    event.preventDefault();
    goToFullSearch(manualQuery);
  }

  return (
    <div className="w-full max-w-md border border-brand-ink/70 bg-background p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-brand-ink/45">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-brand-gold ${
              phase === "searching" ? "animate-pulse" : ""
            }`}
            aria-hidden
          />
          {phase === "searching" ? "Matching every listing…" : "Watching it work"}
        </span>
      </div>

      <div
        className="mt-3 flex min-h-[2.5rem] items-center border-b border-brand-border pb-2.5"
        aria-hidden
      >
        <span className="text-[0.95rem] text-brand-ink">
          {typed}
          <span
            className={`ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] bg-brand-gold ${
              phase === "results" || reduceMotion ? "opacity-0" : "animate-[blink_1s_steps(1)_infinite]"
            }`}
          />
        </span>
      </div>

      <div className="mt-4 min-h-[11.5rem]" role="status" aria-live="polite">
        {phase !== "results" && (
          <p className="pt-6 text-center text-sm text-brand-ink/40">
            {phase === "searching"
              ? "Comparing meaning, not just keywords…"
              : "Describing a home, the way a client actually would."}
          </p>
        )}

        {phase === "results" && results.length === 0 && (
          <p className="pt-6 text-center text-sm text-brand-ink/40">
            No strong match this time — try the search page for full results.
          </p>
        )}

        {phase === "results" && results.length > 0 && (
          <ul className="flex flex-col">
            {results.map(({ listing, score }, idx) => (
              <li
                key={listing.id}
                className={reduceMotion ? "" : "opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards]"}
                style={reduceMotion ? undefined : { animationDelay: `${idx * 90}ms` }}
              >
                <Link
                  href={`/property/${listing.slug}`}
                  className="flex items-center gap-3 border-b border-brand-border py-3 transition-colors hover:border-brand-gold"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">
                      {listing.area} · {formatPropertyType(listing.propertyType)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-brand-ink/55">
                      <span className="flex items-center gap-1">
                        <BedDouble size={12} /> {listing.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler size={12} /> {listing.sizeSqft.toLocaleString()} sqft
                      </span>
                      <span>{Math.round(score * 100)}% match</span>
                    </p>
                  </div>
                  <span className="price-figure shrink-0 text-base">
                    {formatHeadlineFigure(listing)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2 border-t border-brand-border pt-4">
        <label htmlFor="hero-live-search-input" className="sr-only">
          Describe the home you&rsquo;re picturing
        </label>
        <input
          id="hero-live-search-input"
          type="text"
          value={manualQuery}
          onChange={(e) => setManualQuery(e.target.value)}
          placeholder="Try your own description…"
          className="w-full flex-1 border border-brand-border px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-gold"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 border border-brand-ink px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-ink hover:text-background"
        >
          Search <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}
