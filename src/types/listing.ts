/**
 * Core data model for a Manzell property listing.
 *
 * This shape is deliberately Postgres-shaped (flat scalars + a couple of
 * text[] style arrays) so it maps directly onto a future `listings` table
 * without translation — see src/lib/schema.sql for the matching DDL.
 */

export type ListingPurpose = "sale" | "let";

export type ListingStatus =
  | "for-sale"
  | "under-offer"
  | "sstc" // sold subject to contract
  | "to-let"
  | "let-agreed";

export type PropertyType =
  | "apartment"
  | "penthouse"
  | "maisonette"
  | "townhouse"
  | "detached-house"
  | "mews-house";

export type Tenure = "freehold" | "leasehold" | "share-of-freehold";

export type EpcRating = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface ListingImage {
  /** Path under /public — either a generated placeholder graphic
   * ("/listings/eaton-square-01.svg") or a real, free-to-use stock
   * photograph reused across listings ("/photos/interior-kitchen-01.jpg"). */
  src: string;
  /** Required accessible description. Whichever kind of image this is, the
   * alt text always makes clear it is illustrative — a stock photo or
   * generated graphic standing in for photography, never a real photo of
   * this specific property. */
  alt: string;
}

export interface Listing {
  /** Stable machine id, e.g. "man-0001" */
  id: string;
  /** URL slug, e.g. "eaton-square-knightsbridge-sw1" */
  slug: string;

  purpose: ListingPurpose;
  status: ListingStatus;
  propertyType: PropertyType;
  tenure: Tenure;

  title: string;
  /** Street name / building only — no house numbers, for the same privacy
   * reasons a live agency site partially obscures exact addresses. */
  addressLine: string;
  area: string;
  postcodeDistrict: string;

  /** Guide price in GBP for a sale listing. */
  price?: number;
  /** Rent in GBP per calendar month for a let listing. */
  rentPcm?: number;

  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sizeSqft: number;

  epcRating: EpcRating;
  councilTaxBand: string;
  /** Annual service charge in GBP, where applicable (flats/leasehold). */
  serviceChargeAnnual?: number;
  /** Years remaining on the lease, where applicable. */
  leaseYearsRemaining?: number;

  summary: string;
  description: string[];
  features: string[];

  images: ListingImage[];

  dateListed: string; // ISO date
  featured?: boolean;
}
