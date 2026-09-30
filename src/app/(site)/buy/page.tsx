import type { Metadata } from "next";
import ListingsBrowser from "@/components/ListingsBrowser";
import { getListings } from "@/lib/db/listings";

export const metadata: Metadata = {
  title: "Property for Sale | Manzell",
  description: "Browse Manzell's current portfolio of prime London property for sale.",
};

// Fetched fresh on every request — see the comment on this export in
// src/app/page.tsx.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BuyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const area = typeof params.area === "string" ? params.area : undefined;
  const listings = await getListings();

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
          For sale
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-brand-ink md:text-4xl">
          Property for sale in prime London
        </h1>
      </div>
      <ListingsBrowser purpose="sale" listings={listings} initialArea={area} />
    </div>
  );
}
