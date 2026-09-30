"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<"buy" | "rent">("buy");
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = query.trim() ? `?area=${encodeURIComponent(query.trim())}` : "";
    router.push(`/${purpose}${params}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center"
    >
      <div className="flex rounded-xl bg-brand-surface p-1 text-sm font-semibold">
        {(["buy", "rent"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPurpose(option)}
            className={`rounded-lg px-4 py-2 capitalize transition-colors ${
              purpose === option
                ? "bg-brand-primary text-white"
                : "text-brand-ink/60 hover:text-brand-ink"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-1 items-center gap-2 rounded-xl border border-brand-border px-3 py-2">
        <Search size={18} className="text-brand-ink/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Area, e.g. Belgravia, Chelsea, Mayfair…"
          className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-ink/40"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-brand-plum px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary"
      >
        Search
      </button>
    </form>
  );
}
