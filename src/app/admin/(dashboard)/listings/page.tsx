import Link from "next/link";
import { getListings } from "@/lib/db/listings";
import { deleteListingAction } from "@/app/admin/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";
import ListingsTable from "@/components/admin/ListingsTable";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const listings = await getListings();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
            Listings
          </p>
          <h1 className="mt-1 font-display text-2xl italic text-brand-ink">
            {listings.length} {listings.length === 1 ? "property" : "properties"}
          </h1>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 border border-brand-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background"
        >
          Add a listing
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-6">
          <SetupNotice />
        </div>
      )}

      <ListingsTable listings={listings} deleteAction={deleteListingAction} />
    </div>
  );
}
