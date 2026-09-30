import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact | Manzell",
  description: "Get in touch with Manzell to book a valuation or enquire about a property.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const listing = typeof params.listing === "string" ? params.listing : undefined;
  const ref = typeof params.ref === "string" ? params.ref : undefined;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
          Get in touch
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-brand-ink md:text-4xl">
          Speak to a Manzell adviser
        </h1>
        <p className="mt-3 text-brand-ink/70">
          Whether you&rsquo;re enquiring about a specific property, booking a
          valuation, or just starting to explore the market, send us a note
          and we&rsquo;ll come back to you personally.
        </p>

        <div className="mt-8">
          <EnquiryForm initialListing={listing} initialRef={ref} />
        </div>
      </div>
    </div>
  );
}
