-- DHIVE v1 schema: profiles, categories, products, orders.
-- Zero-fee model: sellers keep 100% of the sale price. Payments run through Paystack
-- (seller payouts via Paystack subaccounts), wired up in a later cycle.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  is_seller boolean not null default false,
  -- Paystack subaccount used to route 100% of a sale to the seller.
  paystack_subaccount_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a profile row automatically when someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  slug text primary key,
  name text not null,
  icon text not null default '📦',
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- Products (digital listings)
-- ---------------------------------------------------------------------------
create type public.product_status as enum ('draft', 'published', 'archived');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 120),
  summary text not null default '' check (char_length(summary) <= 200),
  description text not null default '',
  category_slug text not null references public.categories (slug),
  -- Prices are stored in cents (kobo-style minor units, as Paystack expects).
  price_cents int not null check (price_cents >= 0),
  -- v1 is rand-only: Paystack South Africa settles in ZAR.
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  icon text not null default '🤖',
  image_url text,
  integrations text[] not null default '{}',
  -- Storage path of the deliverable in the private 'deliverables' bucket.
  file_path text,
  status public.product_status not null default 'draft',
  -- Paid placement, one of DHIVE's revenue streams.
  featured_until timestamptz,
  -- Full-text search over the listing copy.
  search tsvector generated always as (
    to_tsvector('english', title || ' ' || summary || ' ' || description)
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_published_idx on public.products (status, created_at desc);
create index products_category_idx on public.products (category_slug) where status = 'published';
create index products_seller_idx on public.products (seller_id);
create index products_search_idx on public.products using gin (search);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id),
  product_id uuid not null references public.products (id),
  seller_id uuid not null references public.profiles (id),
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'ZAR',
  status public.order_status not null default 'pending',
  paystack_reference text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index orders_seller_idx on public.orders (seller_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at bookkeeping
-- ---------------------------------------------------------------------------
create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Profiles: public display info is readable; users edit only their own row.
-- (Paystack subaccount codes are not secret, but are never selected by public queries.)
create policy "profiles are readable" on public.profiles
  for select using (true);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Categories: read-only to clients.
create policy "categories are readable" on public.categories
  for select using (true);

-- Products: anyone sees published listings; sellers see and manage their own.
create policy "published products are readable" on public.products
  for select using (status = 'published' or auth.uid() = seller_id);
create policy "sellers create own products" on public.products
  for insert with check (
    auth.uid() = seller_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_seller)
  );
create policy "sellers update own products" on public.products
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "sellers delete own drafts" on public.products
  for delete using (auth.uid() = seller_id and status = 'draft');

-- Orders: buyers and sellers read their own. Writes happen server-side with the
-- service role (checkout + Paystack webhook), so there are no client write policies.
create policy "buyers read own orders" on public.orders
  for select using (auth.uid() = buyer_id);
create policy "sellers read their sales" on public.orders
  for select using (auth.uid() = seller_id);
