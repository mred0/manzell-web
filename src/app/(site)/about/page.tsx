import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Manzell",
  description: "Manzell is a London property agency working across prime and super-prime addresses.",
};

// One-screen proposal: on a normal laptop viewport (roughly 1440x900 and up)
// every section below sits inside a fixed-height row so the whole story
// reads without scrolling past the sticky header. Row heights are set
// explicitly (not flex-grow ratios) so text never gets silently clipped —
// below the md breakpoint there's too much content to hold on one screen,
// so it stacks and scrolls normally there.
const PILLARS = [
  { mono: "LE", title: "Local Expertise", body: "Deep, neighbourhood-level knowledge behind every valuation." },
  { mono: "TS", title: "Tailored Service", body: "A strategy built around your situation, not a standard playbook." },
  { mono: "MI", title: "Market Intelligence", body: "Ongoing investment in research and market analytics." },
  { mono: "PN", title: "Professional Network", body: "Trusted relationships with solicitors, surveyors and advisers." },
];

const VALUES = [
  { name: "Integrity", body: "Straightforward advice, even when it isn't what a client wants to hear." },
  { name: "Excellence", body: "A high bar on every instruction, regardless of size." },
  { name: "Innovation", body: "Technology used to save clients time, not to replace judgement." },
  { name: "Community", body: "Active in the neighbourhoods we work in, not just transacting in them." },
];

export default function AboutPage() {
  return (
    <div className="md:h-[calc(100vh-5rem)]">
      <div className="container-page flex flex-col gap-4 py-6 md:h-full md:justify-center md:gap-4 md:py-4">

        {/* Hero (the real Manzell shopfront) + Our Story */}
        <div className="grid gap-4 md:h-[250px] md:grid-cols-[1.55fr_1fr]">
          <div className="relative h-[220px] overflow-hidden shadow-[0_24px_46px_-22px_rgba(36,26,28,0.32)] md:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo, not a Next/Image candidate */}
            <img
              src="/brand/manzell-storefront.jpg"
              alt="The Manzell office on Westbourne Grove"
              className="h-full w-full object-cover object-[center_18%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,14,16,0.88)_0%,rgba(20,14,16,0.62)_34%,rgba(20,14,16,0.15)_66%,rgba(20,14,16,0.02)_85%)]" />
            <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "#e9c98a" }}>
                About Manzell &middot; Since 2010
              </p>
              <h1 className="mt-2 font-display text-xl font-bold leading-tight text-white md:text-2xl">
                Your trusted partner in London property
              </h1>
              <p className="mt-2 text-sm leading-snug text-white/80">
                A boutique agency built around prime and super-prime Central London property.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center border border-brand-border bg-white p-5 shadow-[0_20px_40px_-24px_rgba(36,26,28,0.26)] transition-all duration-300 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">Our Story</p>
            <h2 className="mt-1.5 font-display text-lg font-bold leading-snug text-brand-ink">
              From one Mayfair office to a name clients refer
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/75">
              Founded in 2010, Manzell has grown into a respected independent agency without
              losing the transparency it started with &mdash; most new instructions still arrive
              by referral.
            </p>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div>
          <div className="flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
              What Sets Us Apart
            </p>
            <h2 className="font-display text-base font-bold text-brand-ink">
              Four things every client gets
            </h2>
          </div>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2 md:h-[128px] lg:grid-cols-4">
            {PILLARS.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden border border-brand-border bg-white p-3.5 shadow-[0_16px_30px_-22px_rgba(36,26,28,0.28)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] hover:shadow-[0_0_18px_-2px_rgba(233,201,138,0.7),0_22px_40px_-20px_rgba(36,26,28,0.4)]"
              >
                <div className="flex h-7 w-7 items-center justify-center border border-brand-gold-deep font-display text-xs italic text-brand-gold-deep">
                  {item.mono}
                </div>
                <h3 className="mt-2 font-display text-sm font-bold text-brand-ink">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-ink/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div>
          <div className="flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
              Our Values
            </p>
            <h2 className="font-display text-base font-bold text-brand-ink">
              What we hold ourselves to
            </h2>
          </div>
          <div className="mt-2.5 flex flex-col border border-brand-border bg-white shadow-[0_18px_34px_-24px_rgba(36,26,28,0.26)] sm:flex-row md:h-[76px]">
            {VALUES.map((v, i) => (
              <div
                key={v.name}
                className={`flex-1 border-brand-border p-3 transition-all duration-300 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] ${i === VALUES.length - 1 ? "" : "border-b sm:border-b-0 sm:border-r"}`}
              >
                <div className="font-display text-sm italic text-brand-gold-deep">{v.name}</div>
                <p className="mt-0.5 text-xs leading-snug text-brand-ink/70">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact band */}
        <div className="flex flex-col items-start justify-between gap-3 border border-brand-border bg-brand-plum p-4 text-white sm:flex-row sm:items-center md:h-[76px]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <p className="max-w-xs font-display text-sm italic leading-snug">
              Want to talk through a sale, letting, or search brief directly?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-brand-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-plum"
            >
              Get in touch <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/15 pt-2 text-xs text-white/85 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/55">Westbourne Grove, London W2 4UJ</span>
            <span>contact@manzell.com</span>
            <span>020 3337 8554</span>
            <span className="text-white/55">Mon&ndash;Fri 9&ndash;6 &middot; Sat 10&ndash;4</span>
          </div>
        </div>

      </div>
    </div>
  );
}
