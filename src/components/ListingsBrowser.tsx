"use client";

import { useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import type { Listing, ListingPurpose } from "@/types/listing";

const AREA_OPTIONS = [
  "All areas",
  "Belgravia",
  "Mayfair",
  "Knightsbridge",
  "Chelsea",
  "Kensington",
  "Notting Hill",
  "Marylebone",
  "South Kensington",
  "Holland Park",
  "St John's Wood",
  "Little Venice",
  "Fitzrovia",
];

const BED_OPTIONS = [
  { label: "Any beds", value: 0 },
  { label: "2+ beds", value: 2 },
  { label: "3+ beds", value: 3 },
  { label: "4+ beds", value: 4 },
  { label: "5+ beds", value: 5 },
];

export default function ListingsBrowser({
  purpose,
  listings,
  initialArea,
}: {
  purpose: ListingPurpose;
  listings: Listing[];
  initialArea?: string;
}) {
  const normalizedInitialArea =
    initialArea &&
    AREA_OPTIONS.find((a) => a.toLowerCase() === initialArea.toLowerCase());

  const [area, setArea] = useState(normalizedInitialArea ?? "All areas");
  const [minBeds, setMinBeds] = useState(0);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const filtered = useMemo(() => {
    let result = listings.filter((l) => l.purpose === purpose);

    if (area !== "All areas") {
      result = result.filter((l) => l.area === area);
    }
    if (minBeds > 0) {
      result = result.filter((l) => l.bedrooms >= minBeds);
    }

    const figure = (l: Listing) => l.price ?? l.rentPcm ?? 0;

    result = [...result].sort((a, b) => {
      if (sort === "price-asc") return figure(a) - figure(b);
      if (sort === "price-desc") return figure(b) - figure(a);
      return new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime();
    });

    return result;
  }, [listings, purpose, area, minBeds, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3 border border-brand-border bg-white p-4">
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink"
        >
          {AREA_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={minBeds}
          onChange={(e) => setMinBeds(Number(e.target.value))}
          className="border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink"
        >
          {BED_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-brand-ink/60">
        {filtered.length} {filtered.length === 1 ? "property" : "properties"}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-brand-border p-12 text-center text-brand-ink/60">
          No properties match those filters right now — try widening your search,
          or use{" "}
          <a href="/search" className="font-semibold text-brand-primary underline">
            AI search
          </a>{" "}
          to describe what you&rsquo;re after.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
