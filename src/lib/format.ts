const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** Formats a sale guide price, e.g. "£8,250,000". */
export function formatPrice(price: number): string {
  return gbp.format(price);
}

/** Formats a monthly rent, e.g. "£13,500 pcm". */
export function formatRentPcm(rentPcm: number): string {
  return `${gbp.format(rentPcm)} pcm`;
}

/** Formats either side of a listing depending on its purpose. */
export function formatHeadlineFigure(listing: {
  purpose: "sale" | "let";
  price?: number;
  rentPcm?: number;
}): string {
  if (listing.purpose === "sale" && listing.price != null) {
    return formatPrice(listing.price);
  }
  if (listing.purpose === "let" && listing.rentPcm != null) {
    return formatRentPcm(listing.rentPcm);
  }
  return "Price on application";
}

const statusLabels: Record<string, string> = {
  "for-sale": "For Sale",
  "under-offer": "Under Offer",
  sstc: "SSTC",
  "to-let": "To Let",
  "let-agreed": "Let Agreed",
};

export function formatStatus(status: string): string {
  return statusLabels[status] ?? status;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartment",
  penthouse: "Penthouse",
  maisonette: "Maisonette",
  townhouse: "Townhouse",
  "detached-house": "Detached House",
  "mews-house": "Mews House",
};

export function formatPropertyType(type: string): string {
  return propertyTypeLabels[type] ?? type;
}

/** Tailwind bg-* class for a listing's status dot — shared by the public
 * PropertyCard and the admin listings table so the same status always
 * reads as the same colour everywhere in the app. */
const statusDotClasses: Record<string, string> = {
  "for-sale": "bg-status-sale",
  "to-let": "bg-brand-accent",
  "under-offer": "bg-status-sstc",
  sstc: "bg-status-sstc",
  "let-agreed": "bg-status-let",
};

export function statusDotClass(status: string): string {
  return statusDotClasses[status] ?? "bg-brand-ink/30";
}

/** "12m ago" / "3h ago" / "5d ago", falling back to a plain date once an
 * item is more than a week old — used for the admin dashboard's enquiries
 * rail, where "just now" precision matters but a month-old entry doesn't
 * need second-by-second counting. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;

  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
