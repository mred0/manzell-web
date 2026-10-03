import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact | Manzell",
  description: "Get in touch with Manzell to book a valuation or enquire about a property.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Premium split layout, matching the About/Property editorial system: the
// story + direct desk details + the real office photo sit on the left,
// the enquiry form is a standalone card on the right — rather than a single
// centred column with the form directly under the intro copy.
const DESK_ITEMS = [
  { icon: "MP", label: "Call the desk", value: "020 3337 8554" },
  { icon: "@", label: "Email directly", value: "contact@manzell.com" },
  { icon: "●", label: "Visit the office", value: "London, W2 4UJ, United Kingdom" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const listing = typeof params.listing === "string" ? params.listing : undefined;
  const ref = typeof params.ref === "string" ? params.ref : undefined;
  const valuation = params.valuation === "1";

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
        {/* Left: intro, direct desk details, office photo */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
            {valuation ? "Book a valuation" : "Get in touch"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-ink md:text-4xl">
            {valuation ? "Find out what your property is worth" : "Speak to a Manzell adviser"}
          </h1>
          <p className="mt-3 max-w-md text-brand-ink/70">
            {valuation
              ? "Tell us a little about the property and a Manzell adviser will arrange a considered, no-obligation valuation — in person or over a call, whichever suits you."
              : "Whether you’re enquiring about a specific property, booking a valuation, or just starting to explore the market, send us a note and we’ll come back to you personally — usually within one working day."}
          </p>

          <div className="mt-9 border-y border-brand-border">
            {DESK_ITEMS.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 py-4 transition-colors duration-200 hover:bg-brand-gold/5 ${
                  i === DESK_ITEMS.length - 1 ? "" : "border-b border-brand-border"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-brand-gold-deep font-display text-sm italic text-brand-gold-deep">
                  {item.icon}
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold text-brand-ink">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-8 shadow-[0_24px_46px_-22px_rgba(36,26,28,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo, not a Next/Image candidate */}
            <img
              src="/brand/manzell-storefront.jpg"
              alt="The Manzell office on Westbourne Grove"
              className="h-[220px] w-full object-cover object-[center_18%]"
            />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-brand-ink/50">
            Westbourne Grove, London &middot; Mon&ndash;Fri 9am&ndash;6pm &middot; Sat 10am&ndash;4pm
          </p>
        </div>

        {/* Right: the enquiry form */}
        <div>
          <EnquiryForm initialListing={listing} initialRef={ref} initialValuation={valuation} />
        </div>
      </div>
    </div>
  );
}
