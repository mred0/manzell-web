import { createListingAction } from "@/app/admin/actions";
import ListingForm from "@/components/admin/ListingForm";

export default function NewListingPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
        Listings
      </p>
      <h1 className="mt-1 font-display text-2xl italic text-brand-ink">Add a listing</h1>
      <div className="mt-8">
        <ListingForm action={createListingAction} />
      </div>
    </div>
  );
}
