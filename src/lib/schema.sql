

create extension if not exists "uuid-ossp";
create extension if not exists vector;

do $$ begin
  create type listing_purpose as enum ('sale', 'let');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum (
    'for-sale',
    'under-offer',
    'sstc',
    'to-let',
    'let-agreed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_type as enum (
    'apartment',
    'penthouse',
    'maisonette',
    'townhouse',
    'detached-house',
    'mews-house'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type tenure as enum ('freehold', 'leasehold', 'share-of-freehold');
exception when duplicate_object then null; end $$;

create table listings (
  id                     uuid primary key default uuid_generate_v4(),
  slug                   text not null unique,

  purpose                listing_purpose not null,
  status                 listing_status not null,
  property_type          property_type not null,
  tenure                 tenure not null,

  title                  text not null,
  address_line           text not null,
  area                   text not null,
  postcode_district      text not null,

  price                  integer,                -- GBP, sale listings
  rent_pcm               integer,                -- GBP per calendar month, let listings

  bedrooms               smallint not null,
  bathrooms              smallint not null,
  receptions             smallint not null,
  size_sqft              integer not null,

  epc_rating             text not null,
  council_tax_band       text not null,
  service_charge_annual  integer,
  lease_years_remaining  integer,

  summary                text not null,
  description            text[] not null default '{}',
  features               text[] not null default '{}',

  -- Array of { "src": "/listings/foo.svg", "alt": "..." } objects.
  images                 jsonb not null default '[]',

  date_listed            date not null default current_date,
  featured               boolean not null default false,

  -- 384-dim MiniLM embedding of title + summary + description + features,
  -- computed and stored whenever a listing is created/updated (see
  -- src/lib/embeddings.ts and the admin server actions that call it).
  search_embedding       vector(384),

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint price_or_rent_present check (
    (purpose = 'sale' and price is not null)
    or (purpose = 'let' and rent_pcm is not null)
  )
);

create index idx_listings_purpose_status on listings (purpose, status);
create index idx_listings_area on listings (area);

create table enquiries (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid references listings(id) on delete set null,
  listing_ref  text,          -- human-readable snapshot (title) at time of enquiry
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  handled      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_enquiries_handled_created on enquiries (handled, created_at desc);

-- Keep updated_at current on every listing edit.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_set_updated_at
  before update on listings
  for each row execute function set_updated_at();

-- Row-level security: public read on listings, public insert on enquiries,
-- nothing else — admin writes use the service-role key and bypass RLS
-- entirely from server-only code gated by a Supabase Auth session.
alter table listings enable row level security;
create policy "listings are publicly readable" on listings
  for select using (true);

alter table enquiries enable row level security;
create policy "anyone can submit an enquiry" on enquiries
  for insert with check (true);
