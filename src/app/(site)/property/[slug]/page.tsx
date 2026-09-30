import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Sofa, Ruler, MapPin, ArrowLeft } from "lucide-react";
import { getListingBySlug } from "@/lib/db/listings";
import {
  formatHeadlineFigure,
  formatPrice,
  formatPropertyType,
  formatStatus,
} from "@/lib/format";
import { getRoomBreakdown } from "@/lib/rooms";
import PropertyGallery from "@/components/PropertyGallery";

type Params = Promise<{ slug: string }>;

// Listings live in the database now, so property pages are rendered fresh
// per request rather than pre-built for a fixed list of slugs at build
// time — a listing added through /admin gets a working page immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  return {
    title: `${listing.title} | Manzell`,
    description: listing.summary,
  };
}

export default async function PropertyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  // Key stats highlight bar — every field a serious buyer/tenant checks
  // before enquiring, in one scannable row. Fields that don't apply to this
  // listing (no service charge on a freehold house, no lease on a
  // freehold) are simply omitted rather than shown blank.
  const stats: Array<[string, string]> = [];
  if (listing.purpose === "sale" && listing.price != null) {
    stats.push([
      "Price per Sqft",
      `${formatPrice(Math.round(listing.price / listing.sizeSqft))}`,
    ]);
  }
  stats.push(["Tenure", listing.tenure.replace(/-/g, " ")]);
  if (listing.leaseYearsRemaining) {
    stats.push(["Lease Remaining", `${listing.leaseYearsRemaining} years`]);
  }
  if (listing.serviceChargeAnnual) {
    stats.push(["Service Charge", `${formatPrice(listing.serviceChargeAnnual)} / yr`]);
  }
  stats.push(["EPC Rating", listing.epcRating]);
  stats.push(["Council Tax", listing.councilTaxBand]);

  const rooms = getRoomBreakdown(listing);

  return (
    <div className="container-page py-10 md:py-14">
      <Link
        href={listing.purpose === "sale" ? "/buy" : "/rent"}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-ink/70 hover:text-brand-gold-deep"
      >
        <ArrowLeft size={16} /> Back to {listing.purpose === "sale" ? "properties for sale" : "properties to let"}
      </Link>

      {/* Hero gallery — full width, not squeezed beside the sidebar */}
      <PropertyGallery images={listing.images} />

      {/* Key stats highlight bar — also full width */}
      <div className="mt-8 grid grid-cols-2 divide-y divide-brand-border border border-brand-border bg-white shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)] sm:grid-cols-3 sm:divide-y-0 sm:divide-x md:grid-cols-6">
        {stats.map(([label, value]) => (
          <div key={label} className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink/55">
              {label}
            </p>
            <p className="price-figure mt-1 text-lg capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Title + two column body — the sidebar only starts here, beside the
          description, not beside the photos */}
      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
            <MapPin size={14} /> {listing.addressLine}, {listing.area} {listing.postcodeDistrict}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-ink md:text-4xl">
            {listing.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-brand-ink/70">
            <span className="flex items-center gap-1.5 text-sm">
              <BedDouble size={18} /> {listing.bedrooms} bedrooms
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Bath size={18} /> {listing.bathrooms} bathrooms
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Sofa size={18} /> {listing.receptions} receptions
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Ruler size={18} /> {listing.sizeSqft.toLocaleString()} sqft
            </span>
          </div>

          <div className="mt-8 space-y-4 text-brand-ink/80">
            {listing.description.map((paragraph, i) => (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {rooms.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-bold text-brand-ink">
                Room by Room
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {rooms.map((room) => (
                  <div
                    key={room.label}
                    className="border border-brand-border bg-white shadow-[0_20px_40px_-26px_rgba(36,26,28,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:shadow-[0_30px_55px_-22px_rgba(36,26,28,0.4)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.image.src}
                      alt={room.image.alt}
                      className="h-[180px] w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="font-display text-base font-bold text-brand-ink">
                        {room.label}
                      </p>
                      <p className="mt-1 text-sm text-brand-ink/70">{room.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-lg font-bold text-brand-ink">
              Key features
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.features.map((feature) => (
                <span
                  key={feature}
                  className="border border-brand-border bg-white px-3.5 py-1.5 text-xs font-medium text-brand-ink/80"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
          <div className="border border-brand-border bg-white p-6 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
            <span className="inline-block border border-brand-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">
              {formatStatus(listing.status)}
            </span>
            <p className="price-figure mt-3 text-3xl">
              {formatHeadlineFigure(listing)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-brand-ink/55">
              {formatPropertyType(listing.propertyType)}
            </p>

            <Link
              href={`/contact?listing=${encodeURIComponent(listing.title)}&ref=${listing.id}`}
              className="mt-6 block border border-brand-gold px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep transition-colors hover:bg-brand-gold hover:text-brand-plum"
            >
              Enquire about this property
            </Link>
          </div>

          <div className="border border-brand-border bg-white p-6 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-brand-gold-deep font-display text-sm italic text-brand-gold-deep">
                MP
              </span>
              <div>
                <p className="font-display text-base font-bold text-brand-ink">
                  Manzell Prime Desk
                </p>
                <p className="text-xs text-brand-ink/55">{listing.area} Desk</p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 border-t border-brand-border pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/55">Phone</dt>
                <dd className="font-medium text-brand-ink">020 7946 0958</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/55">Email</dt>
                <dd className="font-medium text-brand-ink">prime@manzell.co.uk</dd>
              </div>
            </dl>
            <Link
              href={`/contact?listing=${encodeURIComponent(listing.title)}&ref=${listing.id}&request=floorplan`}
              className="mt-5 block border border-brand-border px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:border-brand-gold-deep hover:text-brand-gold-deep"
            >
              Request the Floorplan
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
