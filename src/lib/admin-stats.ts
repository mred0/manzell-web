import type { Listing } from "@/types/listing";

/**
 * Genuine, non-time-sensitive data for the admin dashboard's stat-card
 * sparklines. The synthetic listing dataset's `dateListed` values are
 * fixed calendar dates spread across May-Sept 2026 (see
 * scripts/generate-listings.mjs), not relative to "today" — so a literal
 * "listings added this week" trend would read as zero forever once the
 * real clock moves past that window. Bucketing by bedroom count (for
 * listings) or by day of week (for enquiries) instead gives a real
 * distribution pulled from the data that stays meaningful regardless of
 * what today's date is, rather than a fabricated trend line.
 */

/** Buckets: 1, 2, 3, 4, 5, 6+ bedrooms. */
export function bedroomHistogram(listings: Listing[]): number[] {
  const buckets = [0, 0, 0, 0, 0, 0];
  for (const listing of listings) {
    const index = Math.min(Math.max(listing.bedrooms, 1), 6) - 1;
    buckets[index] += 1;
  }
  return buckets;
}

/** Buckets: Mon, Tue, Wed, Thu, Fri, Sat, Sun — by day of week the enquiry
 * was received, so it reads the same the day after as it does today. */
export function weekdayHistogram(isoDates: string[]): number[] {
  const buckets = new Array(7).fill(0) as number[];
  for (const iso of isoDates) {
    const day = new Date(iso).getDay(); // 0 = Sunday
    const index = (day + 6) % 7; // 0 = Monday
    buckets[index] += 1;
  }
  return buckets;
}

/** Scales a set of counts to 0-100 bar heights, with a visible floor so a
 * zero-count bucket still renders a sliver rather than vanishing. */
export function sparkHeights(counts: number[]): number[] {
  const max = Math.max(1, ...counts);
  return counts.map((count) => Math.max(6, Math.round((count / max) * 100)));
}

export function percentOf(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}
