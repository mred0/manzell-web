# Manzell Website

This is my MSc Computer Science project for Manzell. It is a redesigned property website with property listings, search, an enquiry form and an admin section for managing listings.

## Getting Started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

To create a production build:

```bash
npm run build
npm start
```

## Project Structure

- `src/app/` – Main pages and API routes
- `src/components/` – Reusable website components
- `src/components/admin/` – Admin pages and components
- `src/data/` – Property listing data
- `src/lib/` – Database, search and other helper functions
- `src/types/` – TypeScript types
- `scripts/` – Scripts for generating data and search embeddings
- `public/` – Images and other public files
- `models/` – Local model used for the property search

## Main Features

- Property listings with filters
- Property detail pages
- Semantic property search
- Enquiry/contact form
- Admin section for managing listings and enquiries
- Responsive design

## Database

The project can run using the included sample data. Supabase can also be connected for the database and admin features.

See `SUPABASE_SETUP.md` for the setup steps.

## Notes

The property data and images used in this project are for demonstration purposes and are not real property listings.