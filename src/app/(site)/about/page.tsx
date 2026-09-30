import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Manzell",
  description: "Manzell is a London property agency working across prime and super-prime addresses.",
};

const commitments = [
  {
    title: "Considered, not volume-driven",
    body: "We take on a limited number of instructions at a time, so every property gets a properly worked marketing plan rather than a listing dropped into a portal queue.",
  },
  {
    title: "Straight answers on price",
    body: "Guide prices reflect what we genuinely believe the market will bear, based on recent comparable transactions — not an inflated figure chosen to win the instruction.",
  },
  {
    title: "Technology in service of people",
    body: "Our AI-assisted search exists to save you time narrowing a large portfolio to what's actually relevant — every shortlist is followed up by a person, not a chatbot.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
          About Manzell
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-brand-ink md:text-4xl">
          A London agency built around prime and super-prime addresses
        </h1>
        <p className="mt-4 leading-relaxed text-brand-ink/75">
          Manzell works with buyers, tenants, sellers and landlords across
          Belgravia, Mayfair, Knightsbridge, Chelsea, Kensington and beyond,
          across the rest of prime and super-prime London. We aim to make
          each side of a transaction —
          finding a home, or finding the right buyer or tenant for one —
          feel personally handled rather than processed.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {commitments.map((item) => (
          <div key={item.title} className="border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-bold text-brand-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start gap-4 border border-brand-border bg-brand-surface p-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md text-brand-ink/80">
          Want to talk through a sale, letting, or search brief directly?
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 border border-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep transition-colors hover:bg-brand-gold hover:text-brand-plum"
        >
          Get in touch <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
