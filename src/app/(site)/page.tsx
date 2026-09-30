import Link from "next/link";
import { ShieldCheck, Sparkles, KeyRound, ArrowRight } from "lucide-react";
import LiveSearchHero from "@/components/LiveSearchHero";
import PropertyCard from "@/components/PropertyCard";
import { getFeaturedListings } from "@/lib/db/listings";

// Listings now live in the database (once Supabase is configured — see
// SUPABASE_SETUP.md), so this page always fetches fresh rather than being
// statically generated at build time: an admin edit shows up on the very
// next page load, no rebuild/redeploy needed.
export const dynamic = "force-dynamic";

const values = [
  {
    icon: ShieldCheck,
    title: "Discreet, considered handling",
    body: "Many of our instructions are handled off-market, first — we treat every client's privacy and timeline as the priority it is.",
    accent: "primary",
  },
  {
    icon: Sparkles,
    title: "AI-assisted search",
    body: "Describe what you're looking for in your own words and our semantic search matches it against the full portfolio, not just keyword filters.",
    accent: "gold",
  },
  {
    icon: KeyRound,
    title: "One point of contact, start to finish",
    body: "From first viewing through to completion or move-in, a single Manzell adviser stays with you the whole way.",
    accent: "primary",
  },
] as const;

export default async function Home() {
  const featured = await getFeaturedListings();

  return (
    <>
      <section className="bg-background">
        <div className="container-page pt-14 md:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold-deep">
            Prime &amp; Super-Prime London — Est. Portfolio
          </p>
          <div className="mt-5 h-px w-full bg-brand-border" aria-hidden />

          <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="text-balance font-display text-5xl italic leading-[0.98] text-brand-ink md:text-6xl">
                Describe the home.
                <br />
                <span className="not-italic font-bold text-brand-plum">Watch it find it.</span>
              </h1>
              <p className="mt-7 max-w-md text-[15px] leading-relaxed text-brand-ink/70">
                Manzell represents distinctive homes across Belgravia, Mayfair,
                Knightsbridge, Chelsea and beyond — matched by what you
                actually mean, not just the words you type.
              </p>
              <div className="mt-8 flex flex-wrap gap-9 text-xs font-semibold uppercase tracking-[0.08em]">
                <Link href="/buy" className="border-b border-brand-gold pb-1 text-brand-ink hover:text-brand-gold-deep">
                  Everything for sale
                </Link>
                <Link href="/rent" className="border-b border-brand-gold pb-1 text-brand-ink hover:text-brand-gold-deep">
                  Everything to let
                </Link>
              </div>
            </div>

            <div className="border-l border-brand-border pl-10">
              <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
                AI Search — Live
              </p>
              <LiveSearchHero />
            </div>
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
        <div className="container-page mt-8 grid divide-y divide-brand-border border-y border-brand-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {featured.map((listing, i) => (
            <PropertyCard key={listing.id} listing={listing} lotNumber={i + 1} variant="lot" />
          ))}
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

          <div className="grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body, accent }) => (
              <div key={title} className="border border-brand-border bg-background p-7">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                    accent === "gold" ? "bg-brand-gold/15 text-brand-gold-deep" : "bg-brand-primary/10 text-brand-primary"
                  }`}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-brand-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                  {body}
                </p>
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
            href="/contact"
            className="inline-flex items-center gap-2 border border-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-plum"
          >
            Book a valuation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
