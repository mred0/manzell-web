# Manzell — redesigned website (prototype)

A Next.js rebuild of manzell.com: same brand palette, new copy, a proper
property data model, an AI-assisted semantic search feature, and an admin
backend for managing listings and enquiries. Built for the CS69 MSc
artefact — covers the **Must-Have tier** (redesigned frontend, AI semantic
property search, listing pages, a working enquiry form) and the
**administrative CMS/CRM backend** from the Should-Have tier.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No API keys or environment variables are
required to run the site — the AI search feature runs entirely locally
(see below), and everything falls back to the static seed data in
`src/data/listings.ts` until a database is connected.

To connect the database and unlock `/admin` (listing management, an
enquiries inbox), see **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** —
roughly 15 minutes, entirely your own Supabase account (nothing here can
create that account for you).

To build for production:

```bash
npm run build
npm start
```

## Project structure

- `src/app/` — pages (App Router): home, `/buy`, `/rent`, `/property/[slug]`,
  `/search` (AI search), `/contact`, `/about`, an `/admin` section (see
  below), plus two public API routes (`/api/enquiries`, `/api/search`).
- `src/components/` — shared UI (header, footer, property card, listings
  browser with filters, enquiry form, live AI-search hero).
- `src/components/admin/` — admin-only UI (nav, the shared listing
  create/edit form, delete confirmation, the "Supabase not configured"
  notice).
- `src/types/listing.ts` — the `Listing` data model.
- `src/data/listings.ts` — combines two sources, neither copied from the
  live Manzell site: 8 hand-written seed listings, plus a much larger batch
  from `src/data/generated-listings.ts` (52 total). The generated batch is
  produced by `scripts/generate-listings.mjs`, which procedurally varies
  area, price, bed/bath count, property type and description wording across
  the same real Prime London neighbourhoods, so search, filters and the
  grid have enough volume to feel like a live platform rather than a
  handful of curated examples — re-run the script (then
  `npm run build:embeddings`) to regenerate it. This is also the fallback
  data source used everywhere the database reads from until Supabase is
  connected (see `src/lib/db/`, below). `src/data/listing-embeddings.json`
  holds the precomputed AI search vectors for the static fallback path.
- `src/lib/schema.sql` — the Postgres/Supabase DDL: `listings` and
  `enquiries` tables, `pgvector` for search embeddings, row-level security.
  Run once in the Supabase SQL Editor — see SUPABASE_SETUP.md.
- `src/lib/db/` — the data-access layer (`listings.ts`, `enquiries.ts`).
  Every function checks whether Supabase is configured and transparently
  falls back to the static data above when it isn't, so nothing breaks
  before or during the Supabase setup.
- `src/lib/supabase/` — Supabase client factories: a browser client (admin
  login only), a session-aware server client (respects row-level security),
  and a service-role admin client (bypasses it — used only by
  already-authenticated admin server actions).
- `src/middleware.ts` — gates everything under `/admin` behind a logged-in
  Supabase session.
- `src/lib/embeddings.ts` — the shared local-embedding helper (used by both
  `/api/search` and the admin's create/edit actions, so a listing added
  through `/admin` is searchable immediately, no rebuild required).
- `src/lib/format.ts` — currency/status/type label formatting helpers.
- `models/all-MiniLM-L6-v2/` — the local embedding model used by AI search
  (see below).

## Admin backend (`/admin`)

Covers the "administrative CMS/CRM backend" feature from the project
proposal. Gated behind Supabase Auth (email + password, no public
sign-up — accounts are created directly in the Supabase dashboard).

- `/admin` — an overview: listing counts by purpose, unhandled enquiry count.
- `/admin/listings` — every listing, with add/edit/delete.
- `/admin/enquiries` — everything submitted through the public contact
  form, newest-unhandled-first, with a mark-as-handled toggle.

Every public-facing page that shows listings (`/`, `/buy`, `/rent`,
`/property/[slug]`) is rendered fresh on each request rather than
statically built, so an edit made in `/admin` is live on the public site
immediately — see the "What 'real-time' means here" section of
SUPABASE_SETUP.md for what that does and doesn't cover.

Until Supabase is connected, `/admin/login` shows a plain "not configured
yet" message instead of a broken login form — see SUPABASE_SETUP.md to
switch it on.

## The homepage leads with the search, not a static headline

The distinctive thing about this rebuild is the semantic search, so the
homepage hero makes that the first interaction rather than a headline and
an inert search box: `src/components/LiveSearchHero.tsx` is a self-running
demo that types out one of a handful of example queries, calls the real
`/api/search` route (the same local embedding model described below, not a
scripted mockup), and shows the actual top matches with their live
similarity scores — with a real input underneath for a visitor's own
query. It respects `prefers-reduced-motion` (skips the typing animation and
fade-ins) and reads that preference via `useSyncExternalStore` rather than
an effect, to avoid the render-cascade a naive `useEffect` + `setState`
version would cause. `/search?q=...` (used when following "Search" out of
the hero) auto-runs that query on load.

## How the AI search actually works

This is genuine semantic search, not keyword matching: a small local
language model (`sentence-transformers/all-MiniLM-L6-v2`, an
industry-standard 384-dimension sentence embedding model) converts both
the listing text and your typed query into vectors, and results are ranked
by cosine similarity between them. That's why a query like *"somewhere
quiet with a garden and off-street parking"* can surface a listing whose
description never uses the word "quiet".

**Why it's fully local, with no API key:** the model runs in-process via
[`@xenova/transformers`](https://github.com/xenova/transformers.js)
(a JS port of Hugging Face Transformers), using the ONNX weights bundled
under `models/all-MiniLM-L6-v2/`. There is no call to OpenAI, Hugging Face,
or any other external service at request time — this keeps the feature
free to run, works with no internet connection at all once installed, and
avoids exposing any API key in a coursework repo.

- `scripts/build-embeddings.mjs` precomputes an embedding for every seed
  listing and writes `src/data/listing-embeddings.json`. Re-run it
  (`npm run build:embeddings`) whenever `src/data/listings.ts` changes.
- `src/lib/search.ts` embeds the user's live query with the same model and
  ranks listings by cosine similarity against those precomputed vectors.
- `src/app/api/search/route.ts` is the API route the `/search` page calls.

**Note on the model file's origin, for the report:** the standard way to
fetch this model is Hugging Face's hub, but that host was blocked by the
sandboxed cloud environment this project was built in. The exact same
ONNX weights (verified by SHA-256 checksum) were sourced instead from the
Spring AI project's open-source repository, which vendors this model for
the same reason (offline, dependency-free inference), then quantized to
int8 here to shrink it from ~90MB to ~23MB
(`onnxruntime.quantization.quantize_dynamic`). Worth mentioning in the
report as a real engineering decision, not hidden.

## Known limitations / honest next steps

- **Database is opt-in, not yet connected in this checkout.** The code for
  it is all here (`src/lib/schema.sql`, `src/lib/db/`, `/admin`), but it
  only activates once `SUPABASE_SETUP.md` has been followed and
  `.env.local` filled in — until then everything correctly falls back to
  the static seed data, which is also fine for a demo.
- **Admin auth is a single Supabase Auth account, not a full user/role
  system.** Fine for one admin; a real multi-user CMS would add roles and
  an audit log before going further.
- **Placeholder imagery.** Listing photos are generated abstract line-art
  graphics (`public/listings/*.svg`, made by
  `scripts/generate-placeholder-images.mjs` and, for the generated listing
  batch, `scripts/generate-listings.mjs`), not real photography — clearly
  labelled as illustrative, standing in until real listing photos are
  available.
- **The 44 generated listings are synthetic.** Real London street names in
  the right neighbourhoods, but the price, layout and wording around each
  one is templated and randomised (seeded, so it's reproducible), not a
  real instruction. Fine for demoing search/filters at realistic volume;
  would need replacing with actual stock before this went near production.
- **`npm audit` flags vulnerabilities** in `onnxruntime-web`'s and
  `sharp`'s transitive dependencies (pulled in by `@xenova/transformers`).
  They're in the local model-loading path, not exposed to arbitrary user
  input, but worth being upfront about — `npm audit` for details, and
  `npm audit fix --force` would downgrade `@xenova/transformers` to a much
  older version as the only current fix upstream.
- **No automated tests yet.** Manually verified: production build,
  typecheck, lint, and the `/api/search` and `/api/enquiries` routes with
  real requests.

## Scripts

| Command                    | What it does                                      |
| --------------------------- | -------------------------------------------------- |
| `npm run dev`               | Start the dev server (Turbopack)                   |
| `npm run build`             | Production build                                   |
| `npm start`                 | Run the production build                           |
| `npm run lint`              | ESLint                                             |
| `npm run build:embeddings`  | Recompute `listing-embeddings.json` from `listings.ts` (static-fallback path only) |
| `npm run db:seed`           | Push `listings.ts` into Supabase, computing embeddings on the way in (see SUPABASE_SETUP.md) |
| `node scripts/generate-listings.mjs` | Regenerate the 44 procedurally varied listings + their placeholder graphics |
