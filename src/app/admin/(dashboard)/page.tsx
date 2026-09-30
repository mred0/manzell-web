import Link from "next/link";
import { getListings } from "@/lib/db/listings";
import { getEnquiries } from "@/lib/db/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [listings, enquiries] = await Promise.all([getListings(), getEnquiries()]);
  const unhandled = enquiries.filter((e) => !e.handled).length;
  const forSale = listings.filter((l) => l.purpose === "sale").length;
  const toLet = listings.filter((l) => l.purpose === "let").length;

  const stats = [
    { label: "Total listings", value: listings.length, href: "/admin/listings" },
    { label: "For sale", value: forSale, href: "/admin/listings" },
    { label: "To let", value: toLet, href: "/admin/listings" },
    { label: "New enquiries", value: unhandled, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
        Dashboard
      </p>
      <h1 className="mt-1 font-display text-2xl italic text-brand-ink">Overview</h1>

      {!isSupabaseConfigured && <div className="mt-6"><SetupNotice /></div>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-brand-border bg-white p-6 transition-colors hover:border-brand-gold"
          >
            <p className="price-figure text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-ink/60">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 border border-brand-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background"
        >
          Add a listing
        </Link>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-2 border border-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep transition-colors hover:bg-brand-gold hover:text-brand-plum"
        >
          Review enquiries
        </Link>
      </div>
    </div>
  );
}
