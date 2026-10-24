# Search Evaluation

**Date:** 6 October 2026

## Aim

I tested the semantic search feature to see how well it finds properties compared with a basic keyword search. I used 150 sample property listings and tested 16 queries, including exact search terms and questions written in natural language.

## Method

Each query was checked against the property data to identify which listings were relevant. I compared both methods using Precision@5 and Mean Reciprocal Rank (MRR). These measures helped me check how many relevant properties appeared near the top of the results and how highly the first relevant result was ranked.

## Results

| Query type | Semantic Precision@5 | Keyword Precision@5 | Semantic MRR | Keyword MRR |
|---|---:|---:|---:|---:|
| Exact terms | 0.725 | 0.925 | 0.708 | 0.906 |
| Natural-language queries | 0.300 | 0.275 | 0.442 | 0.313 |

The keyword search performed better when users entered exact terms, such as property types or features. However, semantic search performed slightly better on the natural-language query set overall. This suggests that it can sometimes understand what a user means even when their wording does not match the listing text.

The results were not positive for every query. For example, semantic search failed to find relevant results for the query "concierge", while keyword search performed well. Some other natural-language queries also returned no relevant properties.

## Limitations

The evaluation used predefined rules based on the property data to decide which results were relevant. These rules made the testing repeatable, but they may not fully represent what a real buyer would consider relevant.

Only 16 queries were tested, so the results provide an indication of performance rather than a complete comparison. Some queries also matched a large number of listings, making them less useful for measuring ranking quality.

## Conclusion

The results show that keyword search is more reliable for exact terms, while semantic search offers a small improvement for the natural-language queries tested. However, semantic search still struggles with some short or specific searches. Further work could combine semantic ranking with keyword matching to improve results when users search