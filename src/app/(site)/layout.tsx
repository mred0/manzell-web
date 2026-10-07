import Header from "@/components/Header";
import Footer from "@/components/Footer";

// The public marketing/listings site gets the header and footer; /admin
// (a sibling route outside this group) deliberately doesn't — it has its
// own Control Room sidebar shell instead, see
// src/app/admin/(dashboard)/layout.tsx.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
