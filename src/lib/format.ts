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
