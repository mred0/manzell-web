# Connecting Supabase (database + admin login)

Everything in this repo works today without any of this — listings come
from `src/data/listings.ts` and the enquiry form just logs submissions.
This guide switches the site over to a real Postgres database, with an
`/admin` section to manage listings and read enquiries, backed by
[Supabase](https://supabase.com).

None of these steps can be done for you from inside Claude — creating an
account and typing a real password are things only you should do. This
should take about 15 minutes.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in / create an account.
2. Create a new project. Pick any name (e.g. `manzell-web`) and region
   (London / eu-west-2 if offered, for latency — not essential).
3. Save the database password it generates somewhere — you won't need it
   for this setup, but Supabase will ask if you ever connect a raw
   Postgres client directly.
4. Wait for the project to finish provisioning (a minute or two).

## 2. Run the schema

1. In your new project, open the **SQL Editor** (left sidebar).
2. Open `src/lib/schema.sql` from this repo, copy its entire contents,
   paste into a new query, and run it.
3. You should see "Success. No rows returned." If it errors, most likely
   cause is running it twice against a project that already has data —
   the comment at the top of that file explains what's and isn't safe to
   re-run.

This creates the `listings` and `enquiries` tables, enables the `pgvector`
extension (for AI search), and sets up row-level security so the public
site can read listings and submit enquiries, but nothing else.

## 3. Get your API keys

In **Project Settings → API**, you'll need three values:

- **Project URL**
- **anon / public** key
- **service_role** key — keep this one secret, never share it or put it
  anywhere public; it bypasses every access restriction on the database.

## 4. Add them to `.env.local`

In the `manzell-web` folder on your Mac:

```bash
cp env.local.example .env.local
```

Then open `.env.local` and paste in the three values from step 3.
`.env.local` is already gitignored, so this never gets committed. (The
example file is named `env.local.example`, without the leading dot — tools
that sync this folder tend to treat a literal `.env*` name as sensitive
and refuse to touch it, even for a template with no real secrets in it.)

## 5. Create your admin login

There's no public sign-up page for `/admin` on purpose. Create your own
account directly in Supabase:

1. **Authentication → Users** (left sidebar) → **Add user**.
2. Enter the email and password you want to log in with.
3. Tick **Auto Confirm User** (so you don't need to click an email link).

That's the account you'll use at `manzell-web.com/admin/login` (or
`localhost:3000/admin/login` locally).

## 6. Load the existing listings into the database

```bash
npm install
npm run db:seed
```

This pushes the 52 example listings (the same ones already in
`src/data/listings.ts`) into Supabase, computing each one's AI-search
embedding on the way in. Re-run it any time after editing that file — it
updates existing rows by slug rather than duplicating them.

## 7. Run it

```bash
npm run dev
```

- The homepage, `/buy`, `/rent` and property pages now read from Supabase
  instead of the static file — check by editing a listing in `/admin` and
  refreshing the public page.
- Log in at `/admin/login` with the account from step 5.
- `/admin/listings` — add, edit, delete listings.
- `/admin/enquiries` — everything submitted through the contact form.

## What "real-time" means here

Every listing/enquiry page in this app is rendered fresh on each request
(`export const dynamic = "force-dynamic"`), not cached or statically
built — so an edit made in `/admin` shows up on the very next page load,
with no rebuild or redeploy. That's a different (and much simpler) thing
than literal live-push updates (two browser tabs updating without a
refresh) — nothing here does that, and for a property listings site it's
not worth the extra complexity.

## If something's not configured yet

Every page that touches the database checks whether Supabase is set up
first. If you skip this guide entirely, the public site keeps working off
the static seed data exactly as before, and `/admin` shows a plain
"Supabase isn't connected yet" message instead of crashing.
