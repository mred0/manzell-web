"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

interface AdminSidebarProps {
  listingsCount: number;
  unreadCount: number;
  adminEmail: string | null;
}

function NavItem({
  href,
  active,
  trailing,
  trailingUrgent,
  children,
}: {
  href: string;
  active: boolean;
  trailing?: string;
  trailingUrgent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-l-2 px-[22px] py-[11px] text-[12.5px] font-semibold tracking-[0.02em] transition-colors ${
        active
          ? "border-brand-gold bg-white/[0.06] text-white"
          : "border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className="h-1.5 w-1.5 flex-none rounded-[1px] bg-current" aria-hidden />
      <span>{children}</span>
      {trailing && (
        <span
          className={`ml-auto text-[10.5px] ${
            trailingUrgent
              ? "rounded-full bg-admin-urgent px-1.5 py-0.5 text-[9.5px] font-bold text-white"
              : "font-medium text-white/40"
          }`}
        >
          {trailing}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  trailing,
  trailingUrgent,
  children,
}: {
  href: string;
  active: boolean;
  trailing?: string;
  trailingUrgent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-none items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.04em] transition-colors ${
        active ? "border-brand-gold text-white" : "border-transparent text-white/55"
      }`}
    >
      {children}
      {trailing && (
        <span
          className={
            trailingUrgent
              ? "rounded-full bg-admin-urgent px-1.5 py-0.5 text-[9px] font-bold text-white"
              : "text-white/40"
          }
        >
          {trailing}
        </span>
      )}
    </Link>
  );
}

/**
 * The "Control Room" admin shell — a dark plum ops-console sidebar in
 * place of the old light top nav bar (AdminNav), picked off the Design
 * Canvas (https://claude.ai/artifact/B3Ad8GzsuZVdhiDL5LSdTG, "Admin
 * Backend" page) over the lighter "Quiet Desk" alternative. A client
 * component so it can highlight the active section via usePathname —
 * everything it's handed (counts, email) comes from the server-component
 * layout that renders it.
 *
 * Renders two different layouts for the same nav state rather than
 * squeezing one markup tree across breakpoints: a fixed-width vertical
 * sidebar at lg and up (hidden below it), and a horizontal scrollable top
 * bar below lg (hidden at lg and up) — a 232px fixed column would eat most
 * of a phone screen otherwise.
 */
export default function AdminSidebar({ listingsCount, unreadCount, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin";
  const isListings = pathname?.startsWith("/admin/listings") ?? false;
  const isEnquiries = pathname?.startsWith("/admin/enquiries") ?? false;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden bg-brand-plum text-white lg:flex lg:w-[232px] lg:flex-none lg:flex-col">
        <div className="border-b border-white/10 px-[22px] pb-[22px] pt-[26px]">
          <div className="font-display text-[19px] italic">Manzell</div>
          <div className="mt-[3px] text-[9.5px] font-bold uppercase tracking-[0.14em] text-brand-gold">
            Control Room
          </div>
        </div>

        <nav className="flex-1 py-[18px]">
          <p className="px-[22px] pb-2 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/35">
            Overview
          </p>
          <NavItem href="/admin" active={isDashboard}>
            Dashboard
          </NavItem>

          <p className="px-[22px] pb-2 pt-4 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/35">
            Inventory
          </p>
          <NavItem href="/admin/listings" active={isListings} trailing={String(listingsCount)}>
            Listings
          </NavItem>
          <NavItem
            href="/admin/enquiries"
            active={isEnquiries}
            trailing={unreadCount > 0 ? String(unreadCount) : undefined}
            trailingUrgent={unreadCount > 0}
          >
            Enquiries
          </NavItem>

          <p className="px-[22px] pb-2 pt-4 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/35">
            System
          </p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 border-l-2 border-transparent px-[22px] py-[11px] text-[12.5px] font-semibold tracking-[0.02em] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <span className="h-1.5 w-1.5 flex-none rounded-[1px] bg-current" aria-hidden />
            View live site
          </Link>
        </nav>

        <div className="flex items-center justify-between border-t border-white/10 px-[22px] py-[18px]">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {adminEmail ? adminEmail.split("@")[0] : "Admin"}
            </p>
            <p className="text-[10.5px] text-white/45">Administrator</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex-none border border-brand-gold px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-plum"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile/tablet top bar */}
      <div className="flex w-full flex-col bg-brand-plum text-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="font-display text-base italic">Manzell</div>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-brand-gold">
              Control Room
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex-none border border-brand-gold px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-brand-gold"
            >
              Log out
            </button>
          </form>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-3 pb-1 pt-1">
          <MobileNavLink href="/admin" active={isDashboard}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink href="/admin/listings" active={isListings} trailing={String(listingsCount)}>
            Listings
          </MobileNavLink>
          <MobileNavLink
            href="/admin/enquiries"
            active={isEnquiries}
            trailing={unreadCount > 0 ? String(unreadCount) : undefined}
            trailingUrgent={unreadCount > 0}
          >
            Enquiries
          </MobileNavLink>
          <MobileNavLink href="/" active={false}>
            View site
          </MobileNavLink>
        </nav>
      </div>
    </>
  );
}
