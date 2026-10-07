// Maps listings to real, free-to-use stock photography under /public/photos
// instead of the abstract placeholder graphics in /public/listings.
//
// Ethics note: this project (Manzell) involves a real client, so using
// Manzell's actual property photography would need the same ER1 ethics
// approval that using their real client/listing data would — see the note
// at the top of generate-listings.mjs. These photos are sourced from
// Pexels (free for commercial use, no attribution required) and are
// reused across many listings by property type / room, exactly like the
// synthetic text data is reused across templates. They are never presented
// as photographs of a specific real property — the alt text below always
// says so explicitly.
//
// 39 photos total: 12 exteriors (2 per property type) + 27 interiors
// across 6 room categories, reused across the ~150 listings.

const EXTERIOR = {
  apartment: ["exterior-apartment-01.jpg", "exterior-apartment-02.jpg"],
  penthouse: ["exterior-penthouse-01.jpg", "exterior-penthouse-02.jpg"],
  maisonette: ["exterior-maisonette-01.jpg", "exterior-maisonette-02.jpg"],
  townhouse: ["exterior-townhouse-01.jpg", "exterior-townhouse-02.jpg"],
  "detached-house": ["exterior-detached-house-01.jpg", "exterior-detached-house-02.jpg"],
  "mews-house": ["exterior-mews-house-01.jpg", "exterior-mews-house-02.jpg"],
};

const INTERIOR = {
  livingroom: [1, 2, 3, 4, 5].map((n) => `interior-livingroom-0${n}.jpg`),
  kitchen: [1, 2, 3, 4, 5].map((n) => `interior-kitchen-0${n}.jpg`),
  bedroom: [1, 2, 3, 4].map((n) => `interior-bedroom-0${n}.jpg`),
  bathroom: [1, 2, 3, 4].map((n) => `interior-bathroom-0${n}.jpg`),
  dining: [1, 2, 3, 4].map((n) => `interior-dining-0${n}.jpg`),
  study: [1, 2, 3].map((n) => `interior-study-0${n}.jpg`),
  hallway: [1, 2].map((n) => `interior-hallway-0${n}.jpg`),
};

const ROOM_LABEL = {
  livingroom: "living room",
  kitchen: "kitchen",
  bedroom: "bedroom",
  bathroom: "bathroom",
  dining: "dining room",
  study: "study",
  hallway: "entrance hallway",
};

const TYPE_LABEL = {
  apartment: "apartment",
  penthouse: "penthouse",
  maisonette: "maisonette",
  townhouse: "townhouse",
  "detached-house": "detached house",
  "mews-house": "mews house",
};

const STUDY_ELIGIBLE = new Set(["townhouse", "detached-house", "penthouse", "mews-house"]);

// "a"/"an" article agreement — simple vowel-initial-letter check, enough
// for the fixed, known label sets above (apartment, entrance hallway are
// the only vowel-initial labels currently in TYPE_LABEL/ROOM_LABEL).
const articleFor = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");

const exteriorAlt = (propertyType) => {
  const label = TYPE_LABEL[propertyType];
  return `Stock photograph illustrating ${articleFor(label)} ${label} exterior of this style — not a photograph of this specific property.`;
};

const interiorAlt = (room) => {
  const label = ROOM_LABEL[room];
  return `Stock photograph illustrating ${articleFor(label)} ${label} of this style — not a photograph of this specific property.`;
};

const photo = (file, alt) => ({ src: `/photos/${file}`, alt });

/**
 * Deterministically builds a small photo gallery for a generated listing,
 * mixing an exterior shot for the property type with a handful of interior
 * room shots, rotated across each room category's pool by listing index so
 * neighbouring listings don't all show the exact same photos.
 */
export function photosForListing(propertyType, index) {
  const images = [];

  const exteriorPool = EXTERIOR[propertyType] ?? EXTERIOR.apartment;
  images.push(photo(exteriorPool[index % exteriorPool.length], exteriorAlt(propertyType)));

  images.push(photo(INTERIOR.livingroom[index % INTERIOR.livingroom.length], interiorAlt("livingroom")));
  images.push(photo(INTERIOR.kitchen[(index + 1) % INTERIOR.kitchen.length], interiorAlt("kitchen")));
  images.push(photo(INTERIOR.bedroom[index % INTERIOR.bedroom.length], interiorAlt("bedroom")));
  images.push(photo(INTERIOR.bathroom[(index + 2) % INTERIOR.bathroom.length], interiorAlt("bathroom")));

  if (index % 3 === 0) {
    images.push(photo(INTERIOR.dining[index % INTERIOR.dining.length], interiorAlt("dining")));
  }
  if (STUDY_ELIGIBLE.has(propertyType) && index % 4 === 0) {
    images.push(photo(INTERIOR.study[index % INTERIOR.study.length], interiorAlt("study")));
  }
  if (index % 5 === 0) {
    images.push(photo(INTERIOR.hallway[index % INTERIOR.hallway.length], interiorAlt("hallway")));
  }

  return images;
}
