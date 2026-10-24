# Lighthouse and Performance Evaluation

**Date:** 6 October 2026

## Aim and Method

I evaluated the performance of the new Manzell website and compared it with the original website. The new build was tested using Lighthouse on desktop settings. As the testing environment could not access the live website directly through Lighthouse, the original website was measured separately using browser performance data.

The scores are based on one Lighthouse run per page, so further testing would be needed to confirm the results.

## Results

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 91 | 96 | 100 | 100 |
| Listings | 83 | 89 | 100 | 100 |
| Property detail | 41 | 96 | 100 | 100 |

The original website's measured load times were 454 ms for the homepage, 147 ms for the listings page and 2,478 ms for the property detail page. The property detail page transferred approximately 11.3 MB across 61 requests.

These figures come from different testing methods, so they should not be treated as a direct Lighthouse score comparison.

## Main Findings

The original homepage loaded quickly because it contained fewer features and less content. However, its property detail page transferred a large amount of data, mainly because of images.

The new website provides more functionality, including semantic search and improved property browsing. Its homepage scored 91 for performance, while the listings page scored 83. The property detail page scored 41, mainly because several large images were not compressed.

Accessibility also improved in some areas. The original listings page had missing alternative text on eight of its 17 images, while all images checked on the new pages had alternative text. However, Lighthouse identified colour contrast issues on the new website, along with an unlabeled filter dropdown and a heading-order issue on the listings page.

The new build scored 100 for both Best Practices and SEO on all three pages tested. These scores were not directly compared with the original website.

## Limitations

The original website was measured in a real browser, while the new website was tested using Lighthouse. The results therefore have some limitations. Only one Lighthouse run was completed for each page, and the original listings-page transfer figure was incomplete because some images had not loaded when measurements were taken.

## Recommended Improvements

- Compress the large property images or use image optimisation.
- Improve the colour contrast of small text.
- Add a proper label to the filter dropdown.
- Correct the heading order on the listings page.
- Repeat Lighthouse tests to check whether the scores remain consistent.

## Conclusion

The new website improves functionality and provides a more complete property-search experience. However, the property detail page needs performance improvements because of large images. Accessibility issues also remain. These results helped identify areas that could be improved further after the main project features were developed.
