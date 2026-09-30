import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-plum text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, not a Next/Image candidate */}
          <img
            src="/brand/manzell-wordmark-white.png"
            alt="Manzell"
            className="h-7 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
            A London property agency working across prime and super-prime
            addresses, from first introduction through to completion.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li><Link href="/buy" className="hover:text-white">Property for sale</Link></li>
            <li><Link href="/rent" className="hover:text-white">Property to rent</Link></li>
            <li><Link href="/search" className="hover:text-white">AI-assisted search</Link></li>
            <li><Link href="/about" className="hover:text-white">About Manzell</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
            Get in touch
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li><Link href="/contact" className="hover:text-white">Enquiry form</Link></li>
            <li>hello@manzell.example</li>
            <li>+44 (0)20 7946 0000</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
            Areas we cover
          </p>
          <ul className="mt-4 space-y-1 text-sm text-white/85">
            <li>Belgravia · Mayfair · Knightsbridge</li>
            <li>Chelsea · Kensington · Notting Hill</li>
            <li>Marylebone</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Manzell. All rights reserved.</p>
          <p>Prototype build — for academic project purposes.</p>
        </div>
      </div>
    </footer>
  );
}
