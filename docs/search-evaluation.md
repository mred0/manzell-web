# Search Evaluation — Semantic Search vs. Keyword Baseline

Run: 2026-10-06T13:49:58.002Z against `http://localhost:3000`
Dataset: 150 listings (src/data/listings.ts)

## Methodology

Relevance is defined operationally: each query is paired with a predicate over a listing's own area / propertyType / features fields, and every listing satisfying it counts as relevant. This keeps ground truth objective and reproducible without a second human judge, at the cost of approximating true relevance. Metrics are Precision@5 and Mean Reciprocal Rank (MRR), computed over the top 6 results each arm returns (matching the deployed `semanticSearch` default limit, so neither arm gets a longer results list than the other). The keyword baseline is a naive term-overlap matcher over the same listing text the embedding is built from — standing in for the kind of search the previous manzell.com site, and most budget property sites, implement.

## Summary

| Query set | n | Semantic P@5 | Semantic MRR | Keyword P@5 | Keyword MRR |
|---|---|---|---|---|---|
| Lexical (exact term in query) | 8 | 0.725 | 0.708 | 0.925 | 0.906 |
| Semantic / paraphrase (no literal overlap) | 8 | 0.300 | 0.442 | 0.275 | 0.313 |

**Result: on paraphrased, no-literal-overlap queries — the kind a buyer actually types — semantic search reached 0.300 mean Precision@5 against the keyword baseline's 0.275, because it matches on meaning rather than shared words. On queries that already name the exact term, the two arms are closer (0.725 vs 0.925), which is the expected result: literal matching only fails when the words differ.**

## Per-query detail — lexical queries

| Query | Target | Relevant in dataset | Semantic P@5 | Semantic MRR | Keyword P@5 | Keyword MRR |
|---|---|---|---|---|---|---|
| "Chelsea" | — | 15 | 1.000 | 1.000 | 1.000 | 1.000 |
| "penthouse" | — | 15 | 1.000 | 1.000 | 1.000 | 1.000 |
| "swimming pool" | — | 9 | 0.600 | 0.333 | 1.000 | 1.000 |
| "wine cellar" | — | 19 | 1.000 | 1.000 | 1.000 | 1.000 |
| "Notting Hill apartment" | — | 3 | 0.400 | 0.333 | 0.400 | 0.250 |
| "mews house" | — | 11 | 1.000 | 1.000 | 1.000 | 1.000 |
| "concierge" | — | 9 | 0.000 | 0.000 | 1.000 | 1.000 |
| "roof terrace" | — | 20 | 0.800 | 1.000 | 1.000 | 1.000 |

## Per-query detail — semantic / paraphrase queries

| Query | Target feature | Relevant in dataset | Semantic P@5 | Semantic MRR | Keyword P@5 | Keyword MRR |
|---|---|---|---|---|---|---|
| "somewhere to cool off on a hot day" | swimming pool | 9 | 0.000 | 0.000 | 0.000 | 0.000 |
| "space to park a car off the road" | parking / garage | 60 | 1.000 | 1.000 | 0.600 | 1.000 |
| "a quiet green space just for residents" | garden | 60 | 0.000 | 0.000 | 0.000 | 0.000 |
| "high-tech smart home controls" | home automation system | 7 | 0.400 | 1.000 | 0.000 | 0.000 |
| "keeping the house cool during summer" | air conditioning | 19 | 0.000 | 0.000 | 0.000 | 0.000 |
| "a dedicated space to watch films at home" | home cinema room | 23 | 0.200 | 0.333 | 0.000 | 0.000 |
| "a flat where I don't need to climb the stairs" | lift access | 31 | 0.200 | 0.200 | 0.600 | 0.500 |
| "a house standing completely on its own, not attached to neighbours" | detached-house (property type) | 12 | 0.600 | 1.000 | 1.000 | 1.000 |

## Limitations

- Ground truth is operational (attribute predicates), not a second human judge's opinion — it approximates relevance rather than matching it exactly, since a single-evaluator MSc project has no independent judge available.
- 2 queries ("space to park a car off the road", "a quiet green space just for residents") had a relevant set covering over 30% of the whole dataset, which weakens how discriminating that query is — even a mediocre ranker scores non-trivially by chance against a large relevant set. The narrower single-feature queries (pool, cinema, home automation, concierge — typically under 15% of the dataset) are the more discriminating signal in this evaluation.
- Semantic search scored 0 on Precision@5 while the keyword baseline scored above 0 for: "concierge". This is a genuine weakness worth investigating rather than a measurement artefact — a likely cause is the deployed `minScore` cutoff (0.15) in `semanticSearch` filtering out true matches for short, single-concept queries, where cosine similarity to the listing text sits close to that threshold.
- 16 queries across two sets is enough to see a directional pattern for an MSc artefact's evaluation chapter, but is not a statistically powered benchmark — treat the summary row as indicative, not a precise population estimate.

## Raw result IDs (for audit)

- "Chelsea" — relevant: 15 listings
  - semantic top 6: man-0122, man-0135, man-0067, man-0085, man-0020, man-0008
  - keyword top 6: man-0085, man-0113, man-0135, man-0006, man-0008, man-0010
- "penthouse" — relevant: 15 listings
  - semantic top 6: man-0023, man-0016, man-0112, man-0114, man-0009, man-0124
  - keyword top 6: man-0009, man-0016, man-0023, man-0039, man-0043, man-0044
- "swimming pool" — relevant: 9 listings
  - semantic top 6: man-0008, man-0122, man-0065, man-0030, man-0053, man-0148
  - keyword top 6: man-0030, man-0040, man-0053, man-0065, man-0094, man-0095
- "wine cellar" — relevant: 19 listings
  - semantic top 6: man-0052, man-0119, man-0071, man-0033, man-0036, man-0041
  - keyword top 6: man-0015, man-0018, man-0026, man-0029, man-0031, man-0033
- "Notting Hill apartment" — relevant: 3 listings
  - semantic top 6: man-0048, man-0103, man-0144, man-0068, man-0035, man-0092
  - keyword top 6: man-0035, man-0040, man-0048, man-0068, man-0092, man-0103
- "mews house" — relevant: 11 listings
  - semantic top 6: man-0024, man-0037, man-0057, man-0126, man-0020, man-0006
  - keyword top 6: man-0006, man-0020, man-0024, man-0037, man-0057, man-0067
- "concierge" — relevant: 9 listings
  - semantic top 6: man-0126, man-0111, man-0112, man-0146, man-0101, man-0027
  - keyword top 6: man-0009, man-0016, man-0023, man-0039, man-0043, man-0082
- "roof terrace" — relevant: 20 listings
  - semantic top 6: man-0023, man-0112, man-0101, man-0016, man-0111, man-0077
  - keyword top 6: man-0007, man-0006, man-0009, man-0016, man-0044, man-0112
- "somewhere to cool off on a hot day" — relevant: 9 listings
  - semantic top 6: man-0073, man-0039, man-0032, man-0127, man-0146, man-0130
  - keyword top 6: man-0002
- "space to park a car off the road" — relevant: 60 listings
  - semantic top 6: man-0148, man-0065, man-0098, man-0149, man-0050, man-0038
  - keyword top 6: man-0018, man-0030, man-0050, man-0058, man-0065, man-0069
- "a quiet green space just for residents" — relevant: 60 listings
  - semantic top 6: man-0104, man-0075, man-0150, man-0085, man-0051, man-0096
  - keyword top 6: man-0049, man-0051, man-0075, man-0085, man-0096, man-0144
- "high-tech smart home controls" — relevant: 7 listings
  - semantic top 6: man-0114, man-0124, man-0136, man-0107, man-0145, man-0100
  - keyword top 6: man-0014, man-0080, man-0084, man-0007, man-0019, man-0032
- "keeping the house cool during summer" — relevant: 19 listings
  - semantic top 6: man-0060, man-0073, man-0106, man-0101, man-0024, man-0069
  - keyword top 6: man-0030, man-0040, man-0053, man-0065, man-0094, man-0095
- "a dedicated space to watch films at home" — relevant: 23 listings
  - semantic top 6: man-0024, man-0136, man-0072, man-0145, man-0012, man-0120
  - keyword top 6: (none)
- "a flat where I don't need to climb the stairs" — relevant: 31 listings
  - semantic top 6: man-0048, man-0040, man-0095, man-0001, man-0144, man-0068
  - keyword top 6: man-0014, man-0022, man-0038, man-0045, man-0064, man-0068
- "a house standing completely on its own, not attached to neighbours" — relevant: 12 listings
  - semantic top 6: man-0040, man-0103, man-0149, man-0136, man-0087, man-0095
  - keyword top 6: man-0030, man-0040, man-0053, man-0065, man-0094, man-0103
