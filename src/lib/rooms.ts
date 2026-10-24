import type { Listing, ListingImage } from "@/types/listing";

export interface RoomEntry {
  label: string;
  text: string;
  image: ListingImage;
}


const ROOM_MATCHERS: Array<{ key: string; label: string; test: RegExp }> = [
  { key: "kitchen", label: "Kitchen", test: /kitchen/i },
  { key: "dining", label: "Dining Room", test: /dining room/i },
  { key: "livingroom", label: "Reception", test: /living room/i },
  { key: "bedroom", label: "Bedroom", test: /bedroom/i },
  { key: "bathroom", label: "Bathroom", test: /bathroom/i },
  { key: "study", label: "Study", test: /study/i },
  { key: "hallway", label: "Entrance Hallway", test: /entrance hallway|hallway/i },
];

function captionFor(key: string, listing: Listing): string {
  switch (key) {
    case "kitchen":
      return "An open kitchen forms part of the property's living space.";
    case "livingroom":
      return `One of ${listing.receptions} reception room${listing.receptions === 1 ? "" : "s"} in the property.`;
    case "dining":
      return "A dining space within the property's reception rooms.";
    case "bedroom":
      return `One of ${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}.`;
    case "bathroom":
      return `One of ${listing.bathrooms} bathroom${listing.bathrooms === 1 ? "" : "s"}.`;
    case "study":
      return "A study, suited to quiet work or a home office.";
    case "hallway":
      return "The entrance hallway to the property.";
    default:
      return "";
  }
}


export function getRoomBreakdown(listing: Listing): RoomEntry[] {
  const interiorImages = listing.images.slice(1);
  const seen = new Set<string>();
  const rooms: RoomEntry[] = [];

  for (const image of interiorImages) {
    const match = ROOM_MATCHERS.find((m) => m.test.test(image.alt));
    if (!match || seen.has(match.key)) continue;
    seen.add(match.key);
    rooms.push({ label: match.label, text: captionFor(match.key, listing), image });
  }

  return rooms;
}
