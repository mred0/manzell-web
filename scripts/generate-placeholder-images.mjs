// Generates simple, elegant brand-toned placeholder graphics for each
// hand-written seed listing. These deliberately do NOT pretend to be
// photography — they are abstract line-art "elevation" sketches in the
// Manzell palette, clearly illustrative, standing in until real listing
// photography is available. (The larger, procedurally generated batch of
// listings gets its matching images from generate-listings.mjs, which
// shares the same silhouette drawing code — see scripts/lib/placeholder-svg.mjs.)
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { svgFor } from "./lib/placeholder-svg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "listings");

const jobs = [
  ["eaton-place-01", "terrace", "Eaton Place · Belgravia"],
  ["eaton-place-02", "terrace", "Eaton Place · Belgravia — Interior"],
  ["mount-street-01", "mansion", "Mount Street · Mayfair"],
  ["mount-street-02", "mansion", "Mount Street · Mayfair — Interior"],
  ["wilton-crescent-01", "mansion", "Wilton Crescent · Knightsbridge"],
  ["phillimore-gardens-01", "terrace", "Phillimore Gardens · Kensington"],
  ["chepstow-villas-01", "villa", "Chepstow Villas · Notting Hill"],
  ["chepstow-villas-02", "villa", "Chepstow Villas · Notting Hill — Interior"],
  ["chester-row-mews-01", "mews", "Chester Row · Belgravia"],
  ["harley-street-01", "penthouse", "Harley Street · Marylebone"],
  ["cheyne-walk-01", "mansion", "Cheyne Walk · Chelsea"],
];

jobs.forEach(([name, family, label], i) => {
  const svg = svgFor(family, label, i);
  writeFileSync(path.join(outDir, `${name}.svg`), svg, "utf8");
});

console.log(`Generated ${jobs.length} placeholder listing graphics in ${outDir}`);
