import type { Metadata } from "next";
import ListingsBrowser from "@/components/ListingsBrowser";
import { getListings } from "@/lib/db/listings";

export const metadata: Metadata = {
  title: "Property to Rent | Manzell",
  description: "Browse Manzell's current portfolio of prime London property to let.",
};

// Fetched fresh on every request — see the comment on this export in
// src/app/page.tsx.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RentPage({
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
          To let
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-brand-ink md:text-4xl">
          Property to rent in prime London
        </h1>
      </div>
      <ListingsBrowser purpose="let" listings={listings} initialArea={area} />
    </div>
  );
}
