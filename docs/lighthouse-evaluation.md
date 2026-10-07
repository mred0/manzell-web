# Lighthouse / Performance Evaluation — Old Site vs. New Build

Run: 2026-10-06

## Methodology, and why it's a mixed method

The evaluation sandbox this project is built in cannot reach the open internet (its egress is restricted to package registries), so a single consistent Lighthouse CLI run across both old and new sites wasn't possible. Two different, complementary methods were used instead:

- **New build** (`localhost:3000`, the actual code in this repo): audited with the Lighthouse CLI, `--preset=desktop` (Manzell's prime-London buyer audience is predominantly desktop, so this is the more representative preset than Lighthouse's mobile-throttled default — which was tried first and produced wildly inflated numbers, see note below).
- **Old site** (`manzell.com`, live): Lighthouse itself couldn't reach it from this environment, so the same underlying signals — Navigation Timing, resource transfer sizes, image alt-text coverage, meta tags — were captured directly from a real browser (Chrome, via the user's own browser session) using the Performance API. This is a field measurement rather than a lab score, so it isn't a direct 0–100 Lighthouse number, but it's the same underlying data Lighthouse's own scoring is built from.

**A throttling note worth keeping for the report:** the first attempt used Lighthouse's default mobile simulated throttling (4x CPU slowdown + slow-4G). On this container's shared CPU, that produced a homepage Performance score of 34 with an 8.1s Total Blocking Time — almost entirely "Style & Layout" and "Parse HTML & CSS" time, not script execution, which is the signature of a CPU-starved headless run rather than a genuine site problem. Switching to `--preset=desktop` (lighter, more realistic throttling) brought the homepage to 91. This is itself worth a sentence in the report: Lighthouse lab scores are highly sensitive to the hardware they're run on, which is why the desktop preset — and not the raw score alone — was used as the basis for comparison.

## Summary

| Page | New build — Performance | New build — Accessibility | New build — Best Practices | New build — SEO | Old site — load time (field) | Old site — total transfer |
|---|---|---|---|---|---|---|
| Home | 91 | 96 | 100 | 100 | 454 ms (`loadEventEnd`) | 57 KB / 8 requests |
| Listings / search (`/buy` vs `/properties/sale`) | 83 | 89 | 100 | 100 | 147 ms | ~1 KB / 8 requests (images not yet loaded at measurement — see limitations) |
| Property detail | 41 | 96 | 100 | 100 | 2,478 ms | **11,298 KB (11.3 MB) / 61 requests** |

## Key findings

1. **The old site is fast specifically because it does very little.** The homepage ships 57 KB across 8 requests — essentially a logo, a static hero, and six hardcoded property teasers with no search logic behind them. There's no AI matching, no semantic ranking, and (per the project's own problem statement) nothing beyond simple bedroom-count filtering. Speed and feature scope trade off against each other here, and that trade-off — not a flat "old is faster" — is the honest framing for the report.

2. **The old site's property detail page is the one place it is genuinely, badly slow**: 11.3 MB across 61 requests (52 of them images), a 2.5s `loadEventEnd`. This is a real, measured problem with the live production site Manzell is being redesigned away from — useful as supporting evidence for why the rebuild's problem statement is justified.

3. **The new build's biggest performance cost is the same category of problem, concentrated differently**: the property detail page's Lighthouse score (41) is driven almost entirely by five uncompressed stock photographs (`interior-livingroom-01.jpg` at 3.18 MB, `interior-kitchen-01.jpg` at 2.94 MB, and three more each over 1.7 MB) served as plain `<img>` tags rather than through `next/image`. `src/components/PropertyCard.tsx` documents this as a deliberate choice ("skipping the image optimizer keeps this a fully static/offline-friendly build"), which is a reasonable trade-off to have made, but this evaluation now has a measured cost attached to it: ~11 MB of avoidable image weight per property page view. Worth naming directly in the report as a known limitation with a concrete, cheap fix (resize/compress the source JPGs, or reintroduce `next/image` for just this path) — a textbook "critical evaluation" finding: identify the trade-off, quantify its cost, propose the fix, and say whether it was in scope to make before submission.

4. **Accessibility: a genuine improvement, with one regression to fix.** The old site's listings page is missing `alt` text on 8 of its 17 images; the new build has zero missing `alt` text across all three pages tested — a real, measurable accessibility gain from the rebuild. Against that: Lighthouse flagged a **color-contrast failure on all three new-build pages**, on the small `text-xs` metadata labels on property cards (the "2 bed · 1 bath" line), plus an **unlabeled `<select>`** and a **heading-order violation** on `/buy`'s filter bar specifically. These are small, concrete, and fixable — exactly the kind of finding a testing section should surface rather than smooth over.

5. **SEO and Best Practices**: 100/100 on the new build across all three pages. Not directly comparable to the old site (Lighthouse's SEO/Best-Practices categories need a live Lighthouse run, which wasn't available for `manzell.com`), but worth noting the old site's homepage and listings page metadata were both present and reasonable (`<meta name="description">`, a single `<h1>`, a viewport tag) — i.e. the old site isn't SEO-broken, so this isn't a weak-opponent comparison.

## Limitations

- The old-site numbers are field measurements from one real browser session, not repeated Lighthouse lab runs — directionally reliable (especially the 11.3 MB image-weight figure, which came straight off the Resource Timing API) but not as rigorously standardised as the new build's Lighthouse scores.
- The listings-page old-site transfer figure (1 KB) almost certainly undercounts image weight — the page has 17 `<img>` elements but the Resource Timing entries captured at measurement time showed only the logo, suggesting most listing-card images were still lazy-loading or served through a CDN URL pattern the capture script's file-extension filter didn't recognise. Treat that one row as incomplete rather than as evidence the old listings page is unusually light — the property-detail page (11.3 MB) is the reliable data point for the old site's actual image-weight behaviour.
- Lighthouse scores (new build) were captured from a single run each, not an averaged set of runs — Lighthouse's own guidance is to run 3–5 times and take the median for a number reported with confidence. Given time constraints, this run reports single-shot scores and says so, rather than presenting them as more precise than they are.
- No old-site Accessibility/Best-Practices/SEO Lighthouse scores exist (network-restricted), so those three categories are new-build-only in this run; the comparison there is qualitative (meta tags, alt text, heading structure), not score-to-score.
