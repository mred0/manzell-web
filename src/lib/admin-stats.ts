import type { Listing } from "@/types/listing";



export function bedroomHistogram(listings: Listing[]): number[] {
  const buckets = [0, 0, 0, 0, 0, 0];
  for (const listing of listings) {
    const index = Math.min(Math.max(listing.bedrooms, 1), 6) - 1;
    buckets[index] += 1;
  }
  return buckets;
}


export function weekdayHistogram(isoDates: string[]): number[] {
  const buckets = new Array(7).fill(0) as number[];
  for (const iso of isoDates) {
    const day = new Date(iso).getDay(); // 0 = Sunday
    const index = (day + 6) % 7; // 0 = Monday
    buckets[index] += 1;
  }
  return buckets;
}


export function sparkHeights(counts: number[]): number[] {
  const max = Math.max(1, ...counts);
  return counts.map((count) => Math.max(6, Math.round((count / max) * 100)));
}

export function percentOf(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}
