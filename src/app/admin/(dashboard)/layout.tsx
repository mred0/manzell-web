import AdminNav from "@/components/admin/AdminNav";

// src/middleware.ts already redirects anyone without a Supabase session to
// /admin/login before this ever renders, so no further check is needed
// here — this layout is purely the authenticated shell.
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container-page py-10">{children}</main>
    </div>
  );
}
