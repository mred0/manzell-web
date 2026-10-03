"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

// A deliberately plain, single-line search bar for the homepage's hero
// card — it submits straight into the real AI search page (same /search
// semantic matching as everywhere else on the site; see LiveSearchHero
// for the richer self-running demo version of the same feature, used
// previously in this slot).
export default function HomeHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor="home-hero-search" className="sr-only">
        Describe the home you&rsquo;re picturing
      </label>
      <input
        id="home-hero-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="e.g. a quiet two-bedroom flat with a garden, near good schools"
        className="w-full border-0 border-b-[1.5px] border-brand-border bg-transparent px-0.5 py-3.5 text-[15px] text-brand-ink outline-none transition-colors placeholder:text-brand-ink/40 focus:border-brand-gold-deep"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center justify-center gap-2 border border-brand-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-all duration-300 hover:border-brand-gold hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] hover:text-brand-plum hover:shadow-[0_0_18px_-2px_rgba(233,201,138,0.7)]"
      >
        Search <ArrowRight size={16} />
      </button>
    </form>
  );
}
