"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Listing, ListingPurpose, ListingStatus } from "@/types/listing";
import {
  formatHeadlineFigure,
  formatPropertyType,
  formatStatus,
  statusDotClass,
} from "@/lib/format";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: "all" | ListingStatus; label: string }> = [
  { value: "all", label: "All status" },
  { value: "for-sale", label: "For sale" },
  { value: "under-offer", label: "Under offer" },
  { value: "sstc", label: "SSTC" },
  { value: "to-let", label: "To let" },
  { value: "let-agreed", label: "Let agreed" },
];

const PURPOSE_OPTIONS: Array<{ value: "all" | ListingPurpose; label: string }> = [
  { value: "all", label: "All purpose" },
  { value: "sale", label: "Sale" },
  { value: "let", label: "Let" },
];

export default function ListingsTable({
  listings,
  deleteAction,
}: {
  listings: Listing[];
  deleteAction: (id: string) => void | Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ListingStatus>("all");
  const [purpose, setPurpose] = useState<"all" | ListingPurpose>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listings.filter((listing) => {
      if (status !== "all" && listing.status !== status) return false;
      if (purpose !== "all" && listing.purpose !== purpose) return false;
      if (needle) {
        const haystack =
          `${listing.title} ${listing.area} ${listing.addressLine} ${listing.postcodeDistrict}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [listings, q, status, purpose]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const csvRows = useMemo(
    () =>
      filtered.map((listing) => [
        listing.title,
        listing.area,
        listing.addressLine,
        listing.postcodeDistrict,
        formatStatus(listing.status),
        listing.purpose === "sale" ? "Sale" : "Let",
        formatPropertyType(listing.propertyType),
        formatHeadlineFigure(listing),
        String(listing.bedrooms),
        String(listing.bathrooms),
        listing.featured ? "Yes" : "No",
        listing.dateListed,
      ]),
    [filtered],
  );

  return (
    <div>
      {/* Filter bar — same bordered, divided-cell strip used on the public
          Buy/Rent pages (ListingsBrowser), so admin and marketing share one
          filter idiom instead of inventing a second one. */}
      <div className="mt-8 flex flex-wrap border border-brand-border bg-white shadow-[0_22px_44px_-28px_rgba(36,26,28,0.26)]">
        <div className="filter-cell min-w-[220px] flex-1 border-r border-brand-border px-[22px] py-[14px] transition-colors hover:bg-[rgba(169,118,47,0.05)] focus-within:bg-[rgba(169,118,47,0.05)]">
          <label className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Search
          </label>
          <input
            value={q}
            onChange={(e) => updateFilter(setQ)(e.target.value)}
            placeholder="Title, area, address, postcode&hellip;"
            className="w-full border-none bg-transparent font-sans text-[13.5px] font-medium text-brand-ink outline-none placeholder:text-brand-ink/35"
          />
        </div>
        <div className="filter-cell min-w-[170px] flex-1 border-r border-brand-border px-[22px] py-[14px] transition-colors hover:bg-[rgba(169,118,47,0.05)] focus-within:bg-[rgba(169,118,47,0.05)]">
          <label className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => updateFilter(setStatus)(e.target.value as "all" | ListingStatus)}
            className="field-select"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-cell min-w-[150px] flex-1 border-r border-brand-border px-[22px] py-[14px] transition-colors hover:bg-[rgba(169,118,47,0.05)] focus-within:bg-[rgba(169,118,47,0.05)]">
          <label className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
            Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => updateFilter(setPurpose)(e.target.value as "all" | ListingPurpose)}
            className="field-select"
          >
            {PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-none items-center justify-center gap-2 whitespace-nowrap px-[26px] py-[14px]">
          <span className="price-figure text-[16px]">{filtered.length}</span>
          <span className="text-[11.5px] text-brand-ink/55">
            {filtered.length === 1 ? "property" : "properties"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <ExportCsvButton
          headers={[
            "Title",
            "Area",
            "Address",
            "Postcode",
            "Status",
            "Purpose",
            "Type",
            "Price/Rent",
            "Bedrooms",
            "Bathrooms",
            "Featured",
            "Date listed",
          ]}
          rows={csvRows}
          filename={`manzell-listings-${new Date().toISOString().slice(0, 10)}.csv`}
        />
      </div>

      <div className="mt-4 overflow-x-auto border border-brand-border bg-white shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price / rent</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((listing) => (
              <tr key={listing.id} className="border-b border-brand-border last:border-0">
                <td className="px-4 py-3 font-medium text-brand-ink">{listing.title}</td>
                <td className="px-4 py-3 text-brand-ink/70">{listing.area}</td>
                <td className="px-4 py-3 text-brand-ink/70">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDotClass(listing.status)}`}
                      aria-hidden
                    />
                    {formatStatus(listing.status)}
                  </span>
                </td>
                <td className="price-figure px-4 py-3">{formatHeadlineFigure(listing)}</td>
                <td className="px-4 py-3">{listing.featured ? "Yes" : ""}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="text-xs font-semibold uppercase tracking-wider text-brand-gold-deep hover:text-brand-plum"
                    >
                      Edit
                    </Link>
                    <form action={deleteAction.bind(null, listing.id)}>
                      <ConfirmSubmitButton
                        confirmMessage={`Delete "${listing.title}"? This can't be undone.`}
                        className="text-xs font-semibold uppercase tracking-wider text-status-reduced hover:text-brand-plum"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-ink/60">
            {listings.length === 0
              ? "No listings yet — add the first one."
              : "No listings match that search."}
          </p>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-brand-ink/60">
          <p>
            Showing {rangeStart}&ndash;{rangeEnd} of {filtered.length}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="border border-brand-border px-4 py-2 uppercase tracking-wider text-brand-ink/70 transition-colors hover:border-brand-ink hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-brand-border disabled:hover:text-brand-ink/70"
            >
              Previous
            </button>
            <span className="uppercase tracking-wider">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount}
              className="border border-brand-border px-4 py-2 uppercase tracking-wider text-brand-ink/70 transition-colors hover:border-brand-ink hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-brand-border disabled:hover:text-brand-ink/70"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
