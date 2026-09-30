import { notFound } from "next/navigation";
import { getListingById } from "@/lib/db/listings";
import { updateListingAction } from "@/app/admin/actions";
import ListingForm from "@/components/admin/ListingForm";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const boundAction = updateListingAction.bind(null, listing.id);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
        Listings
      </p>
      <h1 className="mt-1 font-display text-2xl italic text-brand-ink">
        Edit &ldquo;{listing.title}&rdquo;
      </h1>
      <div className="mt-8">
        <ListingForm action={boundAction} initial={listing} />
      </div>
    </div>
  );
}
