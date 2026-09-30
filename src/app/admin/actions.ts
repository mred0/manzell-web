"use server";

import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  createListing,
  updateListing,
  deleteListing,
  type ListingInput,
} from "@/lib/db/listings";
import { setEnquiryHandled } from "@/lib/db/enquiries";
import type { Listing } from "@/types/listing";

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Reads the shared listing fields out of a submitted <ListingForm>. */
function listingInputFromFormData(formData: FormData): ListingInput {
  const str = (name: string) => (formData.get(name) as string | null)?.trim() ?? "";
  const optionalNumber = (name: string): number | undefined => {
    const raw = str(name);
    return raw === "" ? undefined : Number(raw);
  };
  const lines = (name: string): string[] =>
    str(name)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const images: Listing["images"] = lines("images").map((line) => {
    const [src, alt] = line.split("|").map((part) => part.trim());
    return { src, alt: alt || `Illustrative graphic for ${str("title")}` };
  });

  return {
    slug: str("slug"),
    purpose: str("purpose") as Listing["purpose"],
    status: str("status") as Listing["status"],
    propertyType: str("propertyType") as Listing["propertyType"],
    tenure: str("tenure") as Listing["tenure"],
    title: str("title"),
    addressLine: str("addressLine"),
    area: str("area"),
    postcodeDistrict: str("postcodeDistrict"),
    price: optionalNumber("price"),
    rentPcm: optionalNumber("rentPcm"),
    bedrooms: Number(str("bedrooms") || 0),
    bathrooms: Number(str("bathrooms") || 0),
    receptions: Number(str("receptions") || 0),
    sizeSqft: Number(str("sizeSqft") || 0),
    epcRating: str("epcRating") as Listing["epcRating"],
    councilTaxBand: str("councilTaxBand"),
    serviceChargeAnnual: optionalNumber("serviceChargeAnnual"),
    leaseYearsRemaining: optionalNumber("leaseYearsRemaining"),
    summary: str("summary"),
    description: lines("description"),
    features: lines("features"),
    images: images.length > 0 ? images : [{ src: "/listings/placeholder-01.svg", alt: str("title") }],
    dateListed: str("dateListed") || new Date().toISOString().slice(0, 10),
    featured: formData.get("featured") === "on",
  };
}

export async function createListingAction(formData: FormData) {
  const input = listingInputFromFormData(formData);
  await createListing(input);
  redirect("/admin/listings");
}

export async function updateListingAction(id: string, formData: FormData) {
  const input = listingInputFromFormData(formData);
  await updateListing(id, input);
  redirect("/admin/listings");
}

export async function deleteListingAction(id: string) {
  await deleteListing(id);
  redirect("/admin/listings");
}

export async function setEnquiryHandledAction(id: string, handled: boolean) {
  await setEnquiryHandled(id, handled);
  redirect("/admin/enquiries");
}
