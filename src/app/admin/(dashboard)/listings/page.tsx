import Link from "next/link";
import { getListings } from "@/lib/db/listings";
import { deleteListingAction } from "@/app/admin/actions";
import { formatHeadlineFigure } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

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

      <div className="mt-8 overflow-x-auto border border-brand-border bg-white">
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
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-brand-border last:border-0">
                <td className="px-4 py-3 font-medium text-brand-ink">{listing.title}</td>
                <td className="px-4 py-3 text-brand-ink/70">{listing.area}</td>
                <td className="px-4 py-3 text-brand-ink/70">{listing.status}</td>
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
                    <form action={deleteListingAction.bind(null, listing.id)}>
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
        {listings.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-ink/60">
            No listings yet — add the first one.
          </p>
        )}
      </div>
    </div>
  );
}
