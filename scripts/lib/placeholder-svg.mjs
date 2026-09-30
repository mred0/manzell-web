// Shared brand-toned placeholder graphic generator — abstract line-art
// "elevation" sketches in the Manzell palette, used by both the original
// hand-written seed listings and the procedurally generated batch. These
// deliberately do NOT pretend to be photography; see the README for why.
export const PLUM = "#36013f";
export const PRIMARY = "#832a89";
export const ACCENT = "#514ea2";
export const SURFACE = "#f9f7fa";

/** Minimal line-art silhouettes keyed by a rough building "family". */
export const silhouettes = {
  terrace: (w, h) => `
    <rect x="${w * 0.18}" y="${h * 0.32}" width="${w * 0.64}" height="${h * 0.5}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <polygon points="${w * 0.15},${h * 0.32} ${w * 0.5},${h * 0.16} ${w * 0.85},${h * 0.32}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    ${[0.28, 0.4, 0.52, 0.64].map((x) => `<rect x="${w * x}" y="${h * 0.4}" width="${w * 0.06}" height="${h * 0.12}" fill="${SURFACE}" opacity="0.55"/>`).join("")}
    <rect x="${w * 0.46}" y="${h * 0.6}" width="${w * 0.08}" height="${h * 0.22}" fill="${SURFACE}" opacity="0.75"/>
  `,
  mansion: (w, h) => `
    <rect x="${w * 0.12}" y="${h * 0.28}" width="${w * 0.76}" height="${h * 0.54}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    ${[0, 1, 2].map(
      (row) =>
        [0.22, 0.36, 0.5, 0.64, 0.78].map(
          (x) => `<rect x="${w * x}" y="${h * (0.36 + row * 0.15)}" width="${w * 0.06}" height="${h * 0.09}" fill="${SURFACE}" opacity="0.5"/>`
        ).join("")
    ).join("")}
  `,
  mews: (w, h) => `
    <rect x="${w * 0.28}" y="${h * 0.4}" width="${w * 0.44}" height="${h * 0.42}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <polygon points="${w * 0.24},${h * 0.4} ${w * 0.5},${h * 0.24} ${w * 0.76},${h * 0.4}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <rect x="${w * 0.34}" y="${h * 0.6}" width="${w * 0.32}" height="${h * 0.16}" fill="${SURFACE}" opacity="0.6"/>
    <rect x="${w * 0.46}" y="${h * 0.46}" width="${w * 0.08}" height="${h * 0.1}" fill="${SURFACE}" opacity="0.5"/>
  `,
  penthouse: (w, h) => `
    <rect x="${w * 0.2}" y="${h * 0.5}" width="${w * 0.6}" height="${h * 0.34}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <rect x="${w * 0.3}" y="${h * 0.34}" width="${w * 0.4}" height="${h * 0.16}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <line x1="${w * 0.3}" y1="${h * 0.34}" x2="${w * 0.3}" y2="${h * 0.22}" stroke="${SURFACE}" stroke-width="2" opacity="0.6"/>
    <line x1="${w * 0.7}" y1="${h * 0.34}" x2="${w * 0.7}" y2="${h * 0.22}" stroke="${SURFACE}" stroke-width="2" opacity="0.6"/>
    ${[0.35, 0.45, 0.55, 0.65].map((x) => `<rect x="${w * x}" y="${h * 0.58}" width="${w * 0.04}" height="${h * 0.14}" fill="${SURFACE}" opacity="0.5"/>`).join("")}
  `,
  villa: (w, h) => `
    <rect x="${w * 0.1}" y="${h * 0.36}" width="${w * 0.5}" height="${h * 0.46}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <rect x="${w * 0.6}" y="${h * 0.46}" width="${w * 0.3}" height="${h * 0.36}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    <polygon points="${w * 0.08},${h * 0.36} ${w * 0.35},${h * 0.2} ${w * 0.62},${h * 0.36}" fill="none" stroke="${SURFACE}" stroke-width="2" opacity="0.85"/>
    ${[0.18, 0.3, 0.42].map((x) => `<rect x="${w * x}" y="${h * 0.5}" width="${w * 0.05}" height="${h * 0.1}" fill="${SURFACE}" opacity="0.5"/>`).join("")}
  `,
};

export function svgFor(family, label, seedIndex) {
  const w = 960;
  const h = 640;
  const angle = 20 + ((seedIndex * 37) % 40);
  const art = silhouettes[family](w, h);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g${seedIndex}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${PLUM}"/>
      <stop offset="100%" stop-color="${PRIMARY}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g${seedIndex})"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="${ACCENT}" opacity="0.06"/>
  ${art}
  <text x="${w * 0.06}" y="${h - 34}" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="${SURFACE}" opacity="0.92">${label}</text>
  <text x="${w * 0.06}" y="${h - 12}" font-family="Arial, sans-serif" font-size="13" letter-spacing="2" fill="${SURFACE}" opacity="0.6">MANZELL — ILLUSTRATIVE PLACEHOLDER</text>
</svg>`;
}
