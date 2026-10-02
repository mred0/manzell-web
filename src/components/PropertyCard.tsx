import Link from "next/link";
import { BedDouble, Bath, Sofa, Ruler } from "lucide-react";
import type { Listing } from "@/types/listing";
import { formatHeadlineFigure, formatPropertyType, formatStatus } from "@/lib/format";

const statusDot: Record<string, string> = {
  "for-sale": "bg-status-sale",
  "to-let": "bg-brand-accent",
  "under-offer": "bg-status-sstc",
  sstc: "bg-status-sstc",
  "let-agreed": "bg-status-let",
};

export default function PropertyCard({
  listing,
  lotNumber,
  variant = "grid",
}: {
  listing: Listing;
  /** Sequential lot number (1, 2, 3…) — only used for a small curated strip
   * (e.g. the homepage's three featured instructions); omitted elsewhere so
   * a full 50+ item grid doesn't carry a run of oddly-large "lot" numbers. */
  lotNumber?: number;
  /** "lot" = edge-to-edge panel for a divided strip (its own borders come
   * from the parent's divide-x/divide-y); "grid" = a standalone bordered
   * card for use inside a gapped grid. */
  variant?: "grid" | "lot";
}) {
  const cover = listing.images[0];
  const isGrid = variant === "grid";

  return (
    <Link
      href={`/property/${listing.slug}`}
      className={`group relative flex flex-col overflow-hidden bg-background ${
        isGrid
          ? "listing-card border border-brand-border p-5"
          : "p-7 transition-colors hover:border-brand-gold hover:bg-brand-surface/40 md:p-8"
      }`}
    >
      {isGrid && <div className="listing-card-shine" aria-hidden />}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-surface-2">
        {cover && (
          // Plain <img>, not next/image: listing images are a mix of locally
          // generated SVGs and static stock photos, and skipping the image
          // optimizer keeps this a fully static/offline-friendly build.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.src}
            alt={cover.alt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-brand-border bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-ink">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[listing.status] ?? "bg-brand-plum"}`} aria-hidden />
          {formatStatus(listing.status)}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col gap-3 pt-4">
        <div>
          <p className="lot-label">
            {lotNumber ? `Lot ${String(lotNumber).padStart(2, "0")} — ${listing.area}` : `${listing.area} · ${formatPropertyType(listing.propertyType)}`}
          </p>
          <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-brand-ink">
            {listing.title}
          </h3>
        </div>

        <p className="line-clamp-2 text-sm text-brand-ink/70">{listing.summary}</p>

        <div className="mt-auto flex items-center justify-between border-t border-brand-border pt-3">
          <span className="price-figure text-xl">
            {formatHeadlineFigure(listing)}
          </span>
          <div className="flex items-center gap-3 text-brand-ink/60">
            <span className="flex items-center gap-1 text-xs">
              <BedDouble size={15} /> {listing.bedrooms}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Bath size={15} /> {listing.bathrooms}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Sofa size={15} /> {listing.receptions}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Ruler size={15} /> {listing.sizeSqft.toLocaleString()} sqft
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
