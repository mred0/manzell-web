import Link from "next/link";
import { getListings } from "@/lib/db/listings";
import { getEnquiries } from "@/lib/db/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminEmail } from "@/lib/admin-user";
import SetupNotice from "@/components/admin/SetupNotice";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import StatCard from "@/components/admin/StatCard";
import {
  formatHeadlineFigure,
  formatStatus,
  formatRelativeTime,
  statusDotClass,
} from "@/lib/format";
import { bedroomHistogram, weekdayHistogram, sparkHeights, percentOf } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const [listings, enquiries, adminEmail] = await Promise.all([
    getListings(),
    getEnquiries(),
    getAdminEmail(),
  ]);

  const forSale = listings.filter((l) => l.purpose === "sale");
  const toLet = listings.filter((l) => l.purpose === "let");
  const unread = enquiries.filter((e) => !e.handled);
  const distinctAreas = new Set(listings.map((l) => l.area)).size;

  const recentListings = [...listings]
    .sort((a, b) => (a.dateListed < b.dateListed ? 1 : a.dateListed > b.dateListed ? -1 : 0))
    .slice(0, 6);
  const recentEnquiries = [...enquiries]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, 5);

  const reportRows = listings.map((listing) => [
    listing.title,
    listing.area,
    formatStatus(listing.status),
    listing.purpose === "sale" ? "Sale" : "Let",
    formatHeadlineFigure(listing),
    String(listing.bedrooms),
    listing.featured ? "Yes" : "No",
    listing.dateListed,
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <p className="font-display text-xs font-semibold italic uppercase tracking-[0.15em] text-brand-gold-deep">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 font-display text-2xl italic text-brand-ink">
            {greeting()}
            {adminEmail ? `, ${adminEmail.split("@")[0]}` : ""}
          </h1>
        </div>
        <div className="flex gap-3">
          <ExportCsvButton
            headers={[
              "Title",
              "Area",
              "Status",
              "Purpose",
              "Price/Rent",
              "Bedrooms",
              "Featured",
              "Date listed",
            ]}
            rows={reportRows}
            filename={`manzell-admin-report-${new Date().toISOString().slice(0, 10)}.csv`}
            className="inline-flex items-center gap-2 border border-brand-ink px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background"
          />
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-2 bg-brand-gold-deep px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-ink"
          >
            + Add a listing
          </Link>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-6">
          <SetupNotice />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Listings"
          figure={listings.length}
          badge={`${distinctAreas} areas`}
          spark={sparkHeights(bedroomHistogram(listings))}
        />
        <StatCard
          label="For Sale"
          figure={forSale.length}
          badge={`${percentOf(forSale.length, listings.length)}% of total`}
          spark={sparkHeights(bedroomHistogram(forSale))}
        />
        <StatCard
          label="To Let"
          figure={toLet.length}
          badge={`${percentOf(toLet.length, listings.length)}% of total`}
          spark={sparkHeights(bedroomHistogram(toLet))}
        />
        <StatCard
          label="New Enquiries"
          figure={unread.length}
          badge={unread.length > 0 ? `${unread.length} unread` : "All caught up"}
          urgent={unread.length > 0}
          spark={sparkHeights(weekdayHistogram(enquiries.map((e) => e.createdAt)))}
        />
      </div>

      <div className="mt-6 grid min-w-0 items-start gap-5 lg:grid-cols-[1fr_300px]">
        {/* Recent listings */}
        <div className="min-w-0 border border-brand-border bg-white shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
          <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
            <h2 className="text-base font-bold text-brand-ink">Recent listings</h2>
            <Link
              href="/admin/listings"
              className="text-[11.5px] text-brand-ink/50 hover:text-brand-gold-deep"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/45">
                <tr>
                  <th className="px-4 pb-2.5 pt-4">Property</th>
                  <th className="px-4 pb-2.5 pt-4">Area</th>
                  <th className="px-4 pb-2.5 pt-4">Status</th>
                  <th className="px-4 pb-2.5 pt-4">Price</th>
                  <th className="px-4 pb-2.5 pt-4">Featured</th>
                  <th className="px-4 pb-2.5 pt-4" />
                </tr>
              </thead>
              <tbody>
                {recentListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-t border-brand-border transition-colors hover:bg-[rgba(169,118,47,0.045)]"
                  >
                    <td className="max-w-[220px] truncate px-4 py-3 font-semibold text-brand-ink">
                      {listing.title}
                    </td>
                    <td className="px-4 py-3 text-brand-ink/65">{listing.area}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 border border-brand-border bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-ink">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDotClass(listing.status)}`}
                          aria-hidden
                        />
                        {formatStatus(listing.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-display text-[13px] italic font-bold tabular-nums text-brand-gold-deep">
                      {formatHeadlineFigure(listing)}
                    </td>
                    <td className="px-4 py-3">{listing.featured ? "Yes" : ""}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="text-[11.5px] font-semibold uppercase tracking-wider text-brand-gold-deep hover:text-brand-plum"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentListings.length === 0 && (
              <p className="p-8 text-center text-sm text-brand-ink/60">No listings yet.</p>
            )}
          </div>
        </div>

        {/* Enquiries rail */}
        <div className="border border-brand-border bg-white p-5 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
          <h2 className="text-base font-bold text-brand-ink">Enquiries</h2>
          <p className="mt-1 text-[11.5px] text-brand-ink/50">Newest first</p>
          <div className="mt-3">
            {recentEnquiries.length === 0 ? (
              <p className="py-6 text-center text-sm text-brand-ink/50">No enquiries yet.</p>
            ) : (
              recentEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="border-t border-brand-border py-3.5 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-brand-ink">
                      {enquiry.name}
                    </span>
                    <span className="flex-none text-[10px] text-brand-ink/42">
                      {formatRelativeTime(enquiry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-brand-ink/62">
                    {enquiry.listingRef ?? "General enquiry"}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      enquiry.handled
                        ? "border-admin-ok text-admin-ok"
                        : "border-admin-urgent text-admin-urgent"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                    {enquiry.handled ? "Replied" : "New"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
