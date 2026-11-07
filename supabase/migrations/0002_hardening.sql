-- Fixes from the Supabase security + performance advisors after 0001.

-- Trigger functions must not be callable through /rest/v1/rpc.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- The app talks to Postgres over REST only. Removing pg_graphql stops the schema
-- (including orders) from being discoverable to anonymous visitors.
drop extension if exists pg_graphql;

-- Anonymous visitors never have orders.
revoke select on public.orders from anon;

-- Evaluate auth.uid() once per statement instead of once per row, and scope
-- write policies to signed-in users.
drop policy "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy "published products are readable" on public.products;
create policy "published products are readable" on public.products
  for select using (status = 'published' or (select auth.uid()) = seller_id);

drop policy "sellers create own products" on public.products;
create policy "sellers create own products" on public.products
  for insert to authenticated
  with check (
    (select auth.uid()) = seller_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_seller)
  );

drop policy "sellers update own products" on public.products;
create policy "sellers update own products" on public.products
  for update to authenticated
  using ((select auth.uid()) = seller_id) with check ((select auth.uid()) = seller_id);

drop policy "sellers delete own drafts" on public.products;
create policy "sellers delete own drafts" on public.products
  for delete to authenticated
  using ((select auth.uid()) = seller_id and status = 'draft');

-- One policy instead of two overlapping permissive ones.
drop policy "buyers read own orders" on public.orders;
drop policy "sellers read their sales" on public.orders;
create policy "parties read their orders" on public.orders
  for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));

create index if not exists orders_product_idx on public.orders (product_id);
