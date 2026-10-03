"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/buy", label: "Buy" },
  { href: "/rent", label: "Rent" },
  { href: "/search", label: "AI Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // The homepage hero is Manzell's own brand gradient (never a photo —
  // see page.tsx), so the header can sit fully transparent in white over
  // it with no clash. It settles to the normal solid cream header, plum
  // logo included, as soon as the visitor scrolls past the top of the
  // hero. Every other page keeps the solid header at all times.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-brand-border bg-background/95 backdrop-blur"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, not a Next/Image candidate */}
          <img
            src={transparent ? "/brand/manzell-wordmark-white.png" : "/brand/manzell-wordmark-plum.png"}
            alt="Manzell"
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                transparent
                  ? "text-white hover:text-brand-gold"
                  : "text-brand-ink/75 hover:text-brand-gold-deep"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact?valuation=1"
          className={`hidden px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:border-brand-gold-deep hover:bg-[linear-gradient(135deg,transparent_0%,rgba(169,118,47,0.35)_45%,rgba(169,118,47,0.95)_100%)] hover:text-white hover:shadow-[6px_6px_20px_-4px_rgba(169,118,47,0.65)] md:inline-block ${
            transparent ? "border border-white text-white" : "border border-brand-ink text-brand-ink"
          }`}
        >
          Book a valuation
        </Link>

        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-md p-2 md:hidden ${
            transparent ? "text-white" : "text-brand-plum"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-border bg-background md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-brand-ink/80 hover:bg-brand-surface"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact?valuation=1"
              className="mt-2 border border-brand-ink px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-brand-ink transition-all duration-300 hover:border-brand-gold-deep hover:bg-[linear-gradient(135deg,transparent_0%,rgba(169,118,47,0.35)_45%,rgba(169,118,47,0.95)_100%)] hover:text-white hover:shadow-[6px_6px_20px_-4px_rgba(169,118,47,0.65)]"
              onClick={() => setOpen(false)}
            >
              Book a valuation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
