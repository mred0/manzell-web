"use client";

import { useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { formatPrice, formatRentPcm } from "@/lib/format";
import type { Listing, ListingPurpose } from "@/types/listing";

const AREA_OPTIONS = [
  "All areas",
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

  const purposeListings = useMemo(
    () => listings.filter((l) => l.purpose === purpose),
    [listings, purpose],
  );

  const areaCount = useMemo(
    () => new Set(purposeListings.map((l) => l.area)).size,
    [purposeListings],
  );

  const averageFigure = useMemo(() => {
    const figures = purposeListings
      .map((l) => l.price ?? l.rentPcm)
      .filter((n): n is number => typeof n === "number");
    if (figures.length === 0) return "—";
    const avg = Math.round(figures.reduce((sum, n) => sum + n, 0) / figures.length);
    return purpose === "sale" ? formatPrice(avg) : formatRentPcm(avg);
  }, [purposeListings, purpose]);

  const filtered = useMemo(() => {
    let result = purposeListings;

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
  }, [purposeListings, area, minBeds, sort]);

  return (
    <div>
      {/* Stat strip — same divided-cell family as the property page's key
          stats bar, giving a quick read of the live book before filtering. */}
      <div className="mb-6 flex flex-wrap border border-brand-border bg-white shadow-[0_22px_44px_-28px_rgba(36,26,28,0.26)]">
        <div className="min-w-[140px] flex-1 border-r border-brand-border px-5 py-4 text-center">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Live Instructions
          </div>
          <div className="price-figure mt-1.5 text-[19px]">{purposeListings.length}</div>
        </div>
        <div className="min-w-[140px] flex-1 border-r border-brand-border px-5 py-4 text-center">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            {purpose === "sale" ? "Average Price" : "Average Rent"}
          </div>
          <div className="price-figure mt-1.5 text-[19px]">{averageFigure}</div>
        </div>
        <div className="min-w-[140px] flex-1 border-r border-brand-border px-5 py-4 text-center">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Areas Covered
          </div>
          <div className="price-figure mt-1.5 text-[19px]">{areaCount}</div>
        </div>
        <div className="min-w-[140px] flex-1 px-5 py-4 text-center">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Updated
          </div>
          <div className="price-figure mt-1.5 text-[19px]">Daily</div>
        </div>
      </div>

      {/* Filter bar — same bordered, divided-cell strip as the stat strip
          above, so it reads as part of the system rather than a bare form
          row; the live result count is folded into its own cell rather
          than floating below as a separate paragraph. */}
      <div className="mb-8 flex flex-wrap border border-brand-border bg-white shadow-[0_22px_44px_-28px_rgba(36,26,28,0.26)]">
        <div className="filter-cell min-w-[170px] flex-1 border-r border-brand-border px-[22px] py-[14px] transition-colors hover:bg-[rgba(169,118,47,0.05)] focus-within:bg-[rgba(169,118,47,0.05)]">
          <label className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Area
          </label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="field-select"
          >
            {AREA_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-cell min-w-[170px] flex-1 border-r border-brand-border px-[22px] py-[14px] transition-colors hover:bg-[rgba(169,118,47,0.05)] focus-within:bg-[rgba(169,118,47,0.05)]">
          <label className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Bedrooms
          </label>
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            className="field-select"
          >
            {BED_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-cell min-w-[170px] flex-1 border-r border-brand-border px-[22px] py-[14px] transition-colors hover:bg-[rgba(169,118,47,0.05)] focus-within:bg-[rgba(169,118,47,0.05)]">
          <label className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Sort
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="field-select"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        <div className="flex flex-none items-center justify-center gap-[7px] whitespace-nowrap px-[26px] py-[14px]">
          <span className="price-figure text-[16px]">{filtered.length}</span>
          <span className="text-[11.5px] text-brand-ink/55">
            {filtered.length === 1 ? "property" : "properties"}
          </span>
        </div>
      </div>

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
