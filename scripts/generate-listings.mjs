// Procedurally generates a larger batch of plausible, varied listings to
// sit alongside the 8 hand-written seed listings in src/data/listings.ts —
// same real Prime London areas, same Manzell tone, but enough volume and
// variation (area, price, bed/bath count, property type, wording) that
// search, filters and the grid feel like a live platform rather than a
// handful of curated examples. Nothing here is copied from any live
// listing anywhere; every street named below is a real London street, but
// the "listing" built around it — price, layout, description — is
// synthesised from templates and random ranges, seeded for reproducibility.
//
// This is entirely synthetic data by design: Hemang's project involves a
// real client (Manzell), and using their actual property/client data would
// need formal ethics approval (ER1) — scaling up this generator instead of
// sourcing or seeding any real listing data sidesteps that requirement
// completely, while still giving search/filters realistic volume to work
// against. 11 real Prime/super-prime London areas are covered (see AREAS
// below); every "listing" within them is fictional.
//
// Run with: node scripts/generate-listings.mjs
// Writes:   src/data/generated-listings.ts
//           public/listings/gen-*.svg  (unused fallback graphics, kept for
//             continuity with the hand-written listings' generator; the
//             `images` field on each listing now points to real,
//             free-to-use stock photography under public/photos instead —
//             see scripts/lib/listing-photos.mjs for the sourcing note.)
//
// After changing anything here, re-run this script, then
// `npm run build:embeddings` to refresh the AI search vectors for the new
// listings.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { svgFor } from "./lib/placeholder-svg.mjs";
import { photosForListing } from "./lib/listing-photos.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const imagesOutDir = path.join(projectRoot, "public", "listings");
const dataOutPath = path.join(projectRoot, "src", "data", "generated-listings.ts");

const TOTAL_TO_GENERATE = 142; // + 8 hand-written = 150 total listings

// ---------------------------------------------------------------------------
// Seeded RNG (mulberry32) so re-running this script without touching the
// pools below reproduces the exact same batch — deliberate data, not noise.
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(69420);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickWeighted = (pairs) => {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [value, w] of pairs) {
    if ((r -= w) <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
};
const int = (min, max) => Math.floor(min + rand() * (max - min + 1));
const round = (n, to) => Math.round(n / to) * to;
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ---------------------------------------------------------------------------
// Areas: real Prime/super-prime London neighbourhoods, each with its own
// street pool, postcode districts, price tier and a couple of lines of local
// colour used to flavour descriptions (parks, shops, landmarks a Manzell
// write-up would plausibly mention).
// ---------------------------------------------------------------------------
const AREAS = {
  Mayfair: {
    postcodes: ["W1"],
    tier: "ultra",
    streets: [
      "South Audley Street", "Culross Street", "Hill Street", "Charles Street", "Clarges Street",
      "Curzon Street", "North Audley Street", "Green Street", "Farm Street", "Reeves Mews",
      "Mount Row", "Balfour Place",
    ],
    types: ["apartment", "penthouse", "mews-house", "townhouse"],
    flavour: [
      "moments from Mount Street's galleries and Shepherd Market",
      "a short walk from Berkeley Square and the Connaught",
      "close to Curzon Street's cinema and Hyde Park's Mayfair corner",
    ],
  },
  Knightsbridge: {
    postcodes: ["SW1", "SW3"],
    tier: "ultra",
    streets: [
      "Rutland Gate", "Montpelier Square", "Trevor Square", "Cadogan Square", "Lowndes Square",
      "Pont Street", "Hans Place", "Brompton Square", "Walton Street", "Ennismore Gardens",
    ],
    types: ["apartment", "penthouse", "townhouse"],
    flavour: [
      "within easy reach of Harrods and Hyde Park's south side",
      "close to Harvey Nichols and the Brompton Road boutiques",
      "a few minutes from Hyde Park and the Knightsbridge tube",
    ],
  },
  Chelsea: {
    postcodes: ["SW3", "SW10"],
    tier: "prime",
    streets: [
      "Cheyne Row", "Tite Street", "Royal Avenue", "Cadogan Gardens", "The Vale",
      "Old Church Street", "Flood Street", "Paultons Square", "Glebe Place", "Oakley Street",
    ],
    types: ["townhouse", "apartment", "mews-house", "maisonette"],
    flavour: [
      "a short stroll from the King's Road and Chelsea Physic Garden",
      "close to the river and Albert Bridge",
      "moments from Duke of York Square and the Saatchi Gallery",
    ],
  },
  Kensington: {
    postcodes: ["W8"],
    tier: "prime",
    streets: [
      "Kensington Court", "Stanwick Road", "Campden Hill Road", "Victoria Road", "Ilchester Place",
      "Upper Phillimore Gardens", "Thackeray Street", "Phillimore Gardens", "Argyll Road",
    ],
    types: ["maisonette", "apartment", "townhouse"],
    flavour: [
      "between Holland Park and Kensington High Street",
      "a short walk from the Design Museum and Holland Park's tennis courts",
      "close to Kensington Palace Gardens",
    ],
  },
  "Notting Hill": {
    postcodes: ["W11"],
    tier: "prime",
    streets: [
      "Elgin Crescent", "Lansdowne Road", "Kensington Park Road", "Pembridge Square",
      "Ladbroke Grove", "Stanley Gardens", "Chepstow Place", "Lansdowne Crescent", "Colville Terrace",
    ],
    types: ["detached-house", "townhouse", "apartment"],
    flavour: [
      "within walking distance of Portobello Market and Westbourne Grove",
      "close to the communal gardens Notting Hill's crescents are built around",
      "a few minutes from Holland Park and the Electric Cinema",
    ],
  },
  Marylebone: {
    postcodes: ["W1"],
    tier: "prime",
    streets: [
      "Weymouth Street", "Devonshire Place", "Manchester Square", "Wimpole Street",
      "Upper Wimpole Street", "Portland Place", "Dorset Street", "Harley Street", "Bickenhall Street",
    ],
    types: ["apartment", "penthouse", "maisonette"],
    flavour: [
      "two minutes from Marylebone High Street's shops and cafés",
      "close to Regent's Park and the Wallace Collection",
      "a short walk from Marylebone Village",
    ],
  },
  "South Kensington": {
    postcodes: ["SW7"],
    tier: "prime",
    streets: [
      "Onslow Square", "Stanhope Gardens", "Cranley Gardens", "Thurloe Square", "Evelyn Gardens", "The Boltons",
      "Sumner Place", "Bolton Gardens",
    ],
    types: ["apartment", "maisonette", "townhouse"],
    flavour: [
      "close to the museums along Exhibition Road",
      "a short walk from Brompton Cross and the Natural History Museum",
      "moments from South Kensington's garden squares",
    ],
  },
  "Holland Park": {
    postcodes: ["W11", "W14"],
    tier: "prime",
    streets: [
      "Holland Park Avenue", "Addison Road", "Royal Crescent", "Holland Villas Road",
    ],
    types: ["detached-house", "apartment", "townhouse"],
    flavour: [
      "directly opposite Holland Park itself",
      "close to the Design Museum and Holland Park's kyoto garden",
      "a short walk from Holland Park Avenue's restaurants",
    ],
  },
  "St John's Wood": {
    postcodes: ["NW8"],
    tier: "prime",
    streets: [
      "Avenue Road", "Hamilton Terrace", "Acacia Road", "Cavendish Avenue",
      "Circus Road", "Loudoun Road", "Marlborough Place",
    ],
    types: ["detached-house", "apartment", "townhouse"],
    flavour: [
      "moments from Lord's Cricket Ground and Regent's Park",
      "close to St John's Wood High Street's boutiques and cafés",
      "a short walk from Primrose Hill and the Regent's Canal towpath",
    ],
  },
  "Little Venice": {
    postcodes: ["W9"],
    tier: "prime",
    streets: [
      "Blomfield Road", "Warwick Avenue", "Clifton Villas", "Randolph Avenue",
      "Maida Avenue", "Formosa Street",
    ],
    types: ["apartment", "maisonette", "townhouse"],
    flavour: [
      "overlooking the canal basin Little Venice is named for",
      "a short walk from Warwick Avenue's cafés and the towpath",
      "close to Paddington Basin and the Regent's Canal",
    ],
  },
  Fitzrovia: {
    postcodes: ["W1"],
    tier: "prime",
    streets: [
      "Charlotte Street", "Fitzroy Square", "Cleveland Street", "Percy Street",
      "Foley Street", "Newman Street",
    ],
    types: ["apartment", "maisonette", "penthouse"],
    flavour: [
      "moments from Charlotte Street's restaurants",
      "a short walk from Soho and the British Museum",
      "close to Fitzroy Square's garden and the BT Tower",
    ],
  },
};

const TIER_PRICE_PER_SQFT = { ultra: [2400, 3400], prime: [1700, 2500] };
const TIER_RENT_PER_SQFT_PA = { ultra: [65, 95], prime: [45, 70] };

const TYPE_ADJECTIVES = {
  apartment: ["a lateral", "a remodelled", "an immaculately presented", "a light-filled", "a quietly grand", "a recently refurbished", "an exceptionally quiet", "a rarely available"],
  penthouse: ["a top-floor", "a newly reconfigured", "a wraparound-terraced", "a discreetly renovated", "a dual-aspect", "a full-floor"],
  maisonette: ["a garden", "a raised ground-floor", "a two-storey", "a beautifully proportioned", "a rarely available", "a sunny"],
  townhouse: ["a stucco-fronted", "a handsomely proportioned", "a freshly restored", "a five-storey", "an immaculately kept", "a quietly grand"],
  "detached-house": ["a rare detached", "a substantial", "a fully detached", "an exceptionally private", "a beautifully maintained", "a rarely available"],
  "mews-house": ["a cobbled", "a garaged", "a compact, well-lit", "a self-contained", "a recently updated"],
};

const TYPE_NOUN = {
  apartment: "apartment", penthouse: "penthouse", maisonette: "maisonette",
  townhouse: "townhouse", "detached-house": "house", "mews-house": "mews house",
};

const LAYOUT_SENTENCES = {
  apartment: [
    (s) => `A broad reception room runs the width of the building, with a separate dining kitchen and ${s.bedrooms} well-proportioned bedroom${s.bedrooms === 1 ? "" : "s"}.`,
    (s) => `The principal reception opens onto a dining kitchen finished in a considered, understated palette, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} arranged away from the entertaining space.`,
    (s) => `Rooms keep the building's original proportions and ceiling height, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} and a kitchen updated within recent years.`,
    (s) => `An open-plan kitchen and reception take up the front of the flat, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} arranged quietly to the rear.`,
  ],
  penthouse: [
    (s) => `The top-floor layout opens the kitchen into the main reception room, with a wraparound terrace and ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} each with fitted storage.`,
    (s) => `Lift access serves the full floor, where ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} and an open-plan reception both take in the terrace and the rooftops beyond.`,
    (s) => `The reception spans the width of the top floor, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} opening onto private terrace space of its own.`,
  ],
  maisonette: [
    (s) => `The raised ground floor holds the principal reception rooms, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} and a family bathroom on the floor below.`,
    (s) => `Two floors give a genuine sense of a house rather than a flat, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} and a garden-facing kitchen at lower ground level.`,
    (s) => `A private front door leads straight into the reception, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} arranged over the floor above.`,
  ],
  townhouse: [
    (s) => `The principal reception rooms sit on the raised ground and first floors, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} arranged across the upper storeys.`,
    (s) => `A run of interconnecting reception rooms opens onto the garden at the rear, with ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} above.`,
    (s) => `The house rises across its full height with reception rooms on the lower floors and ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} above, each with its own character.`,
  ],
  "detached-house": [
    (s) => `Formal reception rooms occupy the ground floor, with a family kitchen extending into the garden and ${s.bedrooms} bedrooms across the upper floors.`,
    (s) => `The house stands alone on its plot, with reception rooms front and back and ${s.bedrooms} bedrooms arranged across a mix of family and guest configurations.`,
    (s) => `Set back from the road, the house offers reception rooms across the ground floor and ${s.bedrooms} bedrooms above, each with good natural light.`,
  ],
  "mews-house": [
    (s) => `Living space sits above an integral garage, with a kitchen and dining room on the first floor and ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} above.`,
    (s) => `The scale is intimate rather than grand — a kitchen and reception on the first floor, ${s.bedrooms} bedroom${s.bedrooms === 1 ? "" : "s"} on the floors above.`,
  ],
};

const FEATURE_POOL = {
  apartment: ["Porterage", "Lift access", "Recently renovated kitchen", "High ceilings", "Period cornicing retained", "Engineered oak flooring", "Air conditioning", "Secure underground parking", "Video entry system"],
  penthouse: ["Private roof terrace", "Lift access", "Wraparound terrace", "Recently reconfigured layout", "Panoramic outlook", "Air conditioning", "Concierge", "Home automation system"],
  maisonette: ["Private garden", "Two reception rooms", "Original shutters and fireplaces", "Own front door", "Underfloor heating", "Bespoke fitted joinery"],
  townhouse: ["Private rear garden", "Off-street parking permit eligible", "Original staircase retained", "Garden square access", "Underfloor heating", "Home cinema room", "Wine cellar"],
  "detached-house": ["Off-street parking", "Integral garage", "Private garden", "Lower ground leisure floor", "Underfloor heating", "Swimming pool", "Landscaped grounds"],
  "mews-house": ["Integral garage", "Roof terrace", "Cobbled mews setting", "Own front door", "Skylights throughout"],
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}


function generateListing(index, usedSlugs, areaName) {
  const area = AREAS[areaName];
  const street = pick(area.streets);
  const propertyType = pick(area.types);
  const postcode = pick(area.postcodes);
  const purpose = pickWeighted([["sale", 0.65], ["let", 0.35]]);

  const status =
    purpose === "sale"
      ? pickWeighted([["for-sale", 0.7], ["under-offer", 0.12], ["sstc", 0.18]])
      : pickWeighted([["to-let", 0.75], ["let-agreed", 0.25]]);

  const isFlat = propertyType === "apartment" || propertyType === "penthouse" || propertyType === "maisonette";

  const bedrooms = pickWeighted([[1, 0.08], [2, 0.24], [3, 0.3], [4, 0.22], [5, 0.12], [6, 0.04]]);
  const bathrooms = Math.max(1, bedrooms - int(0, 1));
  const receptions = bedrooms <= 2 ? 1 : int(1, isFlat ? 2 : 3);

  const baseSize = isFlat ? 550 : 800;
  const perBedroom = isFlat ? 320 : 420;
  const sizeSqft = round(baseSize + bedrooms * perBedroom + receptions * 140 + int(-150, 250), 10);

  const [minPpsf, maxPpsf] = TIER_PRICE_PER_SQFT[area.tier];
  const pricePerSqft = int(minPpsf, maxPpsf);
  const [minRpsf, maxRpsf] = TIER_RENT_PER_SQFT_PA[area.tier];
  const rentPerSqftPa = int(minRpsf, maxRpsf);

  const price = purpose === "sale" ? round(sizeSqft * pricePerSqft, 5000) : undefined;
  const rentPcm = purpose === "let" ? round((sizeSqft * rentPerSqftPa) / 12, 50) : undefined;

  const tenure = isFlat
    ? pickWeighted([["leasehold", 0.6], ["share-of-freehold", 0.4]])
    : pickWeighted([["freehold", 0.55], ["leasehold", 0.45]]);

  const epcRating = pickWeighted([["B", 0.15], ["C", 0.35], ["D", 0.35], ["E", 0.15]]);
  const councilTaxBand = pickWeighted([["F", 0.15], ["G", 0.45], ["H", 0.4]]);

  const needsLeaseFields = tenure !== "freehold";
  const leaseYearsRemaining = needsLeaseFields
    ? tenure === "share-of-freehold"
      ? int(900, 999)
      : int(55, 145)
    : undefined;
  const serviceChargeAnnual = isFlat || tenure !== "freehold" ? round((sizeSqft * (rand() * 3 + 4)), 100) : undefined;

  const adjective = pick(TYPE_ADJECTIVES[propertyType]);
  const noun = TYPE_NOUN[propertyType];
  const flavour = pick(area.flavour);

  let title = `${adjective.charAt(0).toUpperCase()}${adjective.slice(1)} ${noun} on ${street}, ${areaName}`;
  let slug = slugify(`${street}-${areaName}-${postcode}`);
  let attempt = 0;
  while (usedSlugs.has(slug)) {
    attempt += 1;
    slug = slugify(`${street}-${areaName}-${postcode}-${attempt}`);
  }
  usedSlugs.add(slug);

  const summary = `${adjective.charAt(0).toUpperCase()}${adjective.slice(1)} ${noun} in ${areaName}, ${flavour}.`;

  const layoutSentence = pick(LAYOUT_SENTENCES[propertyType])({ bedrooms });
  const openingSentence = `${adjective.charAt(0).toUpperCase()}${adjective.slice(1)} ${noun} on ${street}, set ${flavour}.`;
  const closingSentence = purpose === "let"
    ? `Available ${pick(["immediately", "from next month", "on a company or private let", "for a minimum twelve-month term"])}, ${pick(["furnished or unfurnished", "unfurnished", "furnished to a high standard", "part-furnished"])}.`
    : `${pick(["A considered", "An honest", "A straightforward", "A rare"])} instruction, offered to the market with ${pick(["vacant possession", "no onward chain", "an early exchange preferred", "flexible completion"])}.`;

  const description = [openingSentence, layoutSentence, closingSentence];

  const featurePool = FEATURE_POOL[propertyType];
  const features = shuffle(featurePool).slice(0, Math.min(4, featurePool.length));
  if (tenure === "share-of-freehold") {
    features.push("Share of freehold");
  } else if (needsLeaseFields) {
    features.push(`${leaseYearsRemaining}-year lease`);
  }

  const family =
    propertyType === "penthouse" ? "penthouse" :
    propertyType === "mews-house" ? "mews" :
    propertyType === "detached-house" ? "villa" :
    propertyType === "townhouse" ? "terrace" : "mansion";

  const imageSlug = `gen-${slug}`;
  const imageLabel = `${street} · ${areaName}`;

  // Spread listing dates across roughly the last four months.
  const day = int(1, 28);
  const month = pick([5, 6, 7, 8, 9]);
  const dateListed = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const listing = {
    id: `man-${String(9 + index).padStart(4, "0")}`,
    slug,
    purpose,
    status,
    propertyType,
    tenure,
    title,
    addressLine: street,
    area: areaName,
    postcodeDistrict: postcode,
    ...(price != null ? { price } : {}),
    ...(rentPcm != null ? { rentPcm } : {}),
    bedrooms,
    bathrooms,
    receptions,
    sizeSqft,
    epcRating,
    councilTaxBand,
    ...(serviceChargeAnnual ? { serviceChargeAnnual } : {}),
    ...(leaseYearsRemaining ? { leaseYearsRemaining } : {}),
    summary,
    description,
    features,
    images: photosForListing(propertyType, index),
    dateListed,
    featured: false,
    _family: family,
    _imageSlug: imageSlug,
    _imageLabel: imageLabel,
  };

  return listing;
}

function main() {
  const usedSlugs = new Set();
  const listings = [];

  // Assign areas from a balanced, shuffled sequence (rather than an i.i.d.
  // random pick per listing) so every Prime London area covered gets a
  // reasonable showing — filtering /buy or /rent by area shouldn't turn up
  // one lonely result for half the areas on the site.
  const areaNames = Object.keys(AREAS);
  const areaSequence = shuffle(
    Array.from({ length: TOTAL_TO_GENERATE }, (_, i) => areaNames[i % areaNames.length])
  );

  for (let i = 0; i < TOTAL_TO_GENERATE; i++) {
    listings.push(generateListing(i, usedSlugs, areaSequence[i]));
  }

  // Feature a handful of the generated listings too, so "Current instructions"
  // on the homepage isn't drawn entirely from the original 8.
  const featuredIndices = shuffle(listings.map((_, i) => i)).slice(0, 3);
  featuredIndices.forEach((i) => (listings[i].featured = true));

  // Write matching placeholder SVGs.
  listings.forEach((listing, i) => {
    const svg = svgFor(listing._family, listing._imageLabel, i + 100); // offset seed so gradients differ from the hand-written set
    writeFileSync(path.join(imagesOutDir, `${listing._imageSlug}.svg`), svg, "utf8");
  });

  // Strip generator-only fields before serialising to TS.
  const clean = listings.map((listing) => {
    const rest = { ...listing };
    delete rest._family;
    delete rest._imageSlug;
    delete rest._imageLabel;
    return rest;
  });

  const header = `// AUTO-GENERATED by scripts/generate-listings.mjs — do not hand-edit.
//
// A larger, procedurally varied batch of listings that sits alongside the
// 8 hand-written seed listings in src/data/listings.ts. Every street named
// below is a real London street in the relevant Prime London neighbourhood;
// the listing built around it (price, layout, wording) is synthesised from
// templates and seeded random ranges, not copied from any live listing.
// Photos are real, free-to-use stock photography reused across listings by
// property type / room (see scripts/lib/listing-photos.mjs) — never a photo
// of a specific real property. Re-run \`node scripts/generate-listings.mjs\`
// to regenerate this file, then \`npm run build:embeddings\`.
import type { Listing } from "@/types/listing";

export const generatedListings: Listing[] = ${JSON.stringify(clean, null, 2)};
`;

  writeFileSync(dataOutPath, header, "utf8");
  console.log(`Wrote ${clean.length} generated listings to ${dataOutPath}`);
  console.log(`Wrote ${clean.length} matching placeholder graphics to ${imagesOutDir}`);
}

main();
