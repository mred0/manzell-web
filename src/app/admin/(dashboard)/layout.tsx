import AdminSidebar from "@/components/admin/AdminSidebar";
import { getListings } from "@/lib/db/listings";
import { getEnquiries } from "@/lib/db/enquiries";
import { getAdminEmail } from "@/lib/admin-user";

export const dynamic = "force-dynamic";

// src/proxy.ts already redirects anyone without a Supabase session to
// /admin/login before this ever renders, so no further check is needed
// here — this layout is purely the authenticated "Control Room" shell
// (picked off the Design Canvas over the lighter "Quiet Desk" alternative,
// see the project doc's "Admin redesign canvas" note). Was a light header
// bar (AdminNav) across the top; now a persistent dark sidebar down the
// left, reused by every /admin/(dashboard) page.
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [listings, enquiries, adminEmail] = await Promise.all([
    getListings(),
    getEnquiries(),
    getAdminEmail(),
  ]);
  const unreadCount = enquiries.filter((enquiry) => !enquiry.handled).length;

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar listingsCount={listings.length} unreadCount={unreadCount} adminEmail={adminEmail} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
