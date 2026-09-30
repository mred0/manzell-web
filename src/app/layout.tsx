import type { Metadata } from "next";

// Self-hosted font files (via @fontsource) rather than next/font/google's
// build-time fetch from fonts.googleapis.com — this bundles the woff2 files
// directly into the app, so there is no runtime or build-time dependency on
// Google's font CDN at all (works the same in any network environment).
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
// Bodoni Moda: a high-contrast didone serif — the editorial-catalogue
// identity Hemang picked from three mocked-up directions (an auction-house/
// "Lot" numbered catalogue look, cream ground, italic headline, gold price
// figures) rather than the dark architectural or bold-poster alternatives.
import "@fontsource/bodoni-moda/400.css";
import "@fontsource/bodoni-moda/500.css";
import "@fontsource/bodoni-moda/600.css";
import "@fontsource/bodoni-moda/700.css";
import "@fontsource/bodoni-moda/900.css";
import "@fontsource/bodoni-moda/500-italic.css";
import "@fontsource/bodoni-moda/700-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manzell | Luxury Property in London",
  description:
    "Manzell is a London real estate agency specialising in premium and luxury property sales and lettings.",
};

// Deliberately just the document shell — the public site's header/footer
// live in src/app/(site)/layout.tsx, a sibling of src/app/admin/, so the
// admin backend doesn't inherit Manzell's public marketing chrome.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
