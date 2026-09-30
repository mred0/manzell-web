import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminNav() {
  return (
    <header className="border-b border-brand-border bg-brand-plum text-white">
      <div className="container-page flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-display text-lg italic">
            Manzell <span className="not-italic font-bold">Admin</span>
          </Link>
          <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.1em] text-white/75">
            <Link href="/admin/listings" className="hover:text-brand-gold">
              Listings
            </Link>
            <Link href="/admin/enquiries" className="hover:text-brand-gold">
              Enquiries
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60 hover:text-white"
          >
            View site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-brand-gold px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-plum"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
