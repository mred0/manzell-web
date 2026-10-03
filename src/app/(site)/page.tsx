import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HomeHeroSearch from "@/components/HomeHeroSearch";
import PropertyCard from "@/components/PropertyCard";
import { getFeaturedListings } from "@/lib/db/listings";

// Listings now live in the database (once Supabase is configured — see
// SUPABASE_SETUP.md), so this page always fetches fresh rather than being
// statically generated at build time: an admin edit shows up on the very
// next page load, no rebuild/redeploy needed.
export const dynamic = "force-dynamic";

const values = [
  {
    title: "Discreet, considered handling",
    body: "Many of our instructions are handled off-market, first — we treat every client's privacy and timeline as the priority it is.",
  },
  {
    title: "AI-assisted search",
    body: "Describe what you're looking for in your own words and our semantic search matches it against the full portfolio, not just keyword filters.",
  },
  {
    title: "One point of contact, start to finish",
    body: "From first viewing through to completion or move-in, a single Manzell adviser stays with you the whole way.",
  },
] as const;

// Four of the areas Manzell covers, used for the photographic index below
// the featured instructions — a deliberately uneven ("bento") grid rather
// than a uniform tile wall, so one area reads as the lead.
const areas = [
  { name: "Chelsea", photo: "/photos/exterior-mews-house-01.jpg", area: "Chelsea" },
  { name: "Notting Hill", photo: "/photos/exterior-mews-house-02.jpg", area: "Notting Hill" },
  { name: "Knightsbridge", photo: "/photos/exterior-apartment-01.jpg", area: "Knightsbridge" },
  { name: "Mayfair", photo: "/photos/exterior-townhouse-01.jpg", area: "Mayfair" },
] as const;

export default async function Home() {
  const featured = await getFeaturedListings();

  return (
    <>
      {/* The hero IS the brand graphic — no photo at all. Manzell's own
          purple gradient fills the full width, with the skyline mark
          anchored along the bottom edge. Pulls up under the sticky header
          (which goes fully transparent/white on this page only while at
          the top of the hero, see Header.tsx) via the negative top margin
          below. */}
      <section className="relative -mt-20 h-[560px] w-full overflow-hidden bg-[linear-gradient(135deg,#b84aa0_0%,#6a1f78_45%,#36013f_100%)] sm:h-[620px] lg:h-[680px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand graphic band, not a Next/Image candidate */}
        <img
          src="/brand/manzell-skyline-band.png"
          alt=""
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-28 w-full object-cover opacity-90 sm:h-36 lg:h-44"
        />
        <div className="relative flex h-full flex-col items-center justify-center pb-24 text-center sm:pb-32 lg:pb-36">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            City of Westminster &middot; London
          </p>
          <h1 className="mt-5 text-balance font-display text-3xl italic leading-[1.85] text-white sm:text-5xl md:text-6xl">
            Describe the home.
            <br />
            <span className="not-italic font-bold text-brand-gold">We&rsquo;ll find the address.</span>
          </h1>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
            London &middot; Dubai &middot; Istanbul
          </p>
        </div>
      </section>

      {/* Search card overlapping the hero photo's bottom edge. */}
      <section className="container-page relative z-10 -mt-16 sm:-mt-20">
        <div className="border border-brand-border bg-background p-6 shadow-[0_30px_60px_-20px_rgba(36,26,28,0.35)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
            AI Search
          </p>
          <div className="mt-3">
            <HomeHeroSearch />
          </div>
        </div>
      </section>

      <section className="mt-16 bg-background pb-16 md:mt-20 md:pb-20">
        <div className="container-page flex items-baseline justify-between border-t border-brand-border pt-8">
          <h2 className="font-display text-2xl italic text-brand-ink md:text-3xl">
            Current instructions
          </h2>
          <Link
            href="/buy"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep hover:text-brand-plum"
          >
            View all properties <ArrowRight size={14} />
          </Link>
        </div>
        <div className="container-page mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing, i) => (
            <PropertyCard key={listing.id} listing={listing} lotNumber={i + 1} />
          ))}
        </div>
      </section>

      {/* Pull-quote band. */}
      <section className="bg-brand-plum py-16 text-white md:py-20">
        <div className="container-page max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Our Approach
          </p>
          <p className="mt-6 text-balance font-display text-2xl italic leading-snug md:text-3xl">
            &ldquo;We don&rsquo;t show clients a city. We find the handful of
            homes that are actually right for them, and we stay with them
            until the keys are in hand.&rdquo;
          </p>
        </div>
      </section>

      {/* Areas we cover — an uneven photographic index rather than a
          uniform grid of tiles. */}
      <section className="bg-background py-16 md:py-24">
        <div className="container-page">
          <div className="mb-10 flex items-baseline justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
                Where We Operate
              </p>
              <h2 className="mt-2 font-display text-2xl italic text-brand-ink md:text-3xl">
                Areas we cover
              </h2>
            </div>
            <Link
              href="/buy"
              className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep hover:text-brand-plum sm:inline-flex"
            >
              +8 more areas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-[192px_192px] md:gap-4">
            {areas.map((area, i) => (
              <Link
                key={area.name}
                href={`/buy?area=${encodeURIComponent(area.area)}`}
                className={`group relative overflow-hidden border border-brand-border ${
                  i === 0
                    ? "col-span-2 h-64 md:col-span-2 md:row-span-2 md:h-full"
                    : i === 1
                      ? "col-span-2 h-48 md:col-span-2 md:row-span-1 md:h-full"
                      : "col-span-1 h-48 md:col-span-1 md:row-span-1 md:h-full"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static area photos in a decorative mosaic */}
                <img
                  src={area.photo}
                  alt={area.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-brand-ink/75 via-brand-ink/5 to-transparent"
                  aria-hidden
                />
                <p className="absolute bottom-4 left-4 font-display text-lg italic text-white md:text-xl">
                  {area.name}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href="/buy"
            className="mt-6 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep hover:text-brand-plum sm:hidden"
          >
            +8 more areas <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="bg-brand-surface py-16 md:py-24">
        <div className="container-page">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
              Why Manzell
            </p>
            <h2 className="mt-2 font-display text-2xl italic text-brand-ink md:text-3xl">
              Built around the way our clients actually move
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            {values.map(({ title, body }) => (
              <div key={title} className="border-t-2 border-brand-gold pt-5">
                <h3 className="font-display text-lg font-bold text-brand-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <div className="flex flex-col items-start gap-6 bg-brand-plum p-10 text-white md:flex-row md:items-center md:justify-between md:p-14">
          <div>
            <h2 className="font-display text-2xl italic md:text-3xl">
              Thinking of selling or letting?
            </h2>
            <p className="mt-2 max-w-md text-white/80">
              Get a considered, honest valuation from a Manzell adviser —
              no obligation, no generic algorithm.
            </p>
          </div>
          <Link
            href="/contact?valuation=1"
            className="inline-flex items-center gap-2 border border-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold transition-all duration-300 hover:border-brand-gold-deep hover:bg-[linear-gradient(135deg,transparent_0%,rgba(169,118,47,0.35)_45%,rgba(169,118,47,0.95)_100%)] hover:text-white hover:shadow-[6px_6px_20px_-4px_rgba(169,118,47,0.65)]"
          >
            Book a valuation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
