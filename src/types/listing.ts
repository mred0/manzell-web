
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
  
  src: string;
  
  alt: string;
}

export interface Listing {

  id: string;

  slug: string;

  purpose: ListingPurpose;
  status: ListingStatus;
  propertyType: PropertyType;
  tenure: Tenure;

  title: string;

  addressLine: string;
  area: string;
  postcodeDistrict: string;


  price?: number;

  rentPcm?: number;

  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sizeSqft: number;

  epcRating: EpcRating;
  councilTaxBand: string;

  serviceChargeAnnual?: number;

  leaseYearsRemaining?: number;

  summary: string;
  description: string[];
  features: string[];

  images: ListingImage[];

  dateListed: string; // ISO date
  featured?: boolean;
}
