# Manzell Website — Test Case Table

**Date:** 6 October 2026

## Aim

I tested the main features of the Manzell website during development. The tests covered search, the AI assistant, property data, admin features, accessibility and the production build. No real participants were involved.

## Test Results

| ID | Feature | Result | Status |
|---|---|---|---|
| TC-01 | Semantic search | Natural-language searches returned property results. Overall performance was slightly better than keyword search for paraphrased queries. | Pass |
| TC-02 | Search for "concierge" | No relevant properties appeared in the top results. | Fail — open |
| TC-03 | AI assistant answers | 14 of 15 requests received a grounded reply, with no incorrect property citations found. | Pass with limitation |
| TC-04 | AI assistant response length | Some replies were empty. Increasing the output-token limit fixed the issue during re-testing. | Fixed |
| TC-05 | Assistant follow-up formatting | Some replies used incorrect links or formatting. Prompt changes and fallback handling improved the output. | Fixed |
| TC-06 | Conversation persistence | Search and chat history were lost when changing pages. Session storage was added and re-tested. | Fixed |
| TC-07 | Unique listing slugs | Duplicate slugs were found and corrected. All 150 listings were then checked for uniqueness. | Fixed |
| TC-08 | Database seeding | Initial database seeding failed. The issues were corrected and all 150 listings were uploaded successfully. | Fixed |
| TC-09 | Property statistics | The correct information appeared for different property types. | Pass |
| TC-10 | Property image gallery | Image navigation, closing and zoom controls worked during testing. | Pass |
| TC-11 | Area information | Removed area names no longer appeared in the tested pages or filters. | Pass |
| TC-12 | Valuation links | The valuation buttons initially had an incorrect destination. The links were corrected and re-tested. | Fixed |
| TC-13 | Admin readiness checklist | The listing readiness count updated correctly as fields were completed. | Pass |
| TC-14 | Admin image management | Adding, removing and reordering images worked correctly. | Pass |
| TC-15 | Admin search and filters | Search, filters, pagination and CSV export worked as expected. | Pass |
| TC-16 | Admin numeric validation | Invalid numeric values are not properly checked on the server. | Fail — open |
| TC-17 | Error and 404 pages | A branded error page is missing for invalid property URLs. | Fail — open |
| TC-18 | Mobile layout | A horizontal overflow issue was found in the admin dashboard and fixed. The tested pages then fitted a 390px screen. | Fixed |
| TC-19 | Contact details consistency | Phone number and opening hours were consistent across the main pages checked. | Pass |
| TC-20 | Property contact details | The property agent card uses different contact details from the rest of the website. | Fail — open |
| TC-21 | Colour contrast | Small property information text failed the contrast checks on the three tested pages. | Fail — open |
| TC-22 | Image alternative text | All images checked on the new website had alternative text. | Pass |
| TC-23 | Admin authentication | The authentication gate blocked unauthorised access during testing. | Pass |
| TC-24 | API key security | The Supabase service-role key and Groq API key were kept in server-side code. | Pass |
| TC-25 | Production build | Linting, TypeScript checks and the production build completed successfully during verification. | Pass |

## Summary

I tested 25 cases covering the main website features and technical requirements. Thirteen passed without requiring a recorded fix, seven issues were found and fixed during development, and five issues remained open at the time of evaluation.

The main remaining issues are the weak search results for some terms, missing numeric validation, the unbranded 404 page, inconsistent property contact details and colour contrast. These should be considered when assessing the final website.

The tests were carried out during development and the final evaluation. No real users participated, so the results show how the website performed in the tested scenarios rather than proving how all users would experience it.
