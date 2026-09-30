"use client";

import Link from "next/link";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, not a Next/Image candidate */}
          <img
            src="/brand/manzell-wordmark-plum.png"
            alt="Manzell"
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink/75 transition-colors hover:text-brand-gold-deep"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="hidden border border-brand-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background md:inline-block"
        >
          Book a valuation
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-brand-plum md:hidden"
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
              href="/contact"
              className="mt-2 border border-brand-ink px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-brand-ink"
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
