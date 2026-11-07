-- Cycle 4: orders, free claims, buyer access, seller payout status.

-- Orders record the breakdown: amount_cents (what the buyer paid) = price_cents
-- (what the seller receives) + fee_cents (Paystack's fee incl. VAT, paid by the buyer).
alter table public.orders
  add column price_cents int not null default 0 check (price_cents >= 0),
  add column fee_cents int not null default 0 check (fee_cents >= 0),
  add constraint orders_amount_breakdown check (amount_cents = price_cents + fee_cents);

-- One completed purchase per buyer per product.
create unique index orders_one_paid_per_buyer_product
  on public.orders (buyer_id, product_id) where status = 'paid';
create index orders_pending_reference_idx on public.orders (paystack_reference) where status = 'pending';

grant select (price_cents, fee_cents) on public.orders to authenticated;

-- Buyers keep seeing what they bought even if the seller later archives it.
create policy "buyers read purchased products" on public.products
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
       where o.product_id = products.id
         and o.buyer_id = (select auth.uid())
         and o.status = 'paid'
    )
  );

-- Seller payout status, safe to show publicly (the subaccount code itself stays hidden).
alter table public.profiles
  add column payouts_ready boolean generated always as (paystack_subaccount_code is not null) stored;
grant select (payouts_ready) on public.profiles to anon, authenticated;

-- Free listings: claimed directly, no payment involved.
create function public.claim_free_product(p_product_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_seller uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  select seller_id into v_seller
    from public.products
   where id = p_product_id and status = 'published' and price_cents = 0;
  if v_seller is null then
    raise exception 'not a free listing' using errcode = 'P0002';
  end if;

  insert into public.orders (buyer_id, product_id, seller_id, amount_cents, price_cents, fee_cents, status, paid_at)
  values ((select auth.uid()), p_product_id, v_seller, 0, 0, 0, 'paid', now())
  on conflict (buyer_id, product_id) where status = 'paid' do nothing;
end;
$$;

revoke execute on function public.claim_free_product(uuid) from public, anon;
grant execute on function public.claim_free_product(uuid) to authenticated;

-- The storage path of something the caller has bought (null otherwise), used to
-- create a short-lived signed download URL. Paths are never exposed otherwise.
create function public.purchased_file_path(p_product_id uuid)
returns text
language sql
stable
security definer set search_path = ''
as $$
  select pr.file_path
    from public.products pr
    join public.orders o on o.product_id = pr.id
   where pr.id = p_product_id
     and o.buyer_id = (select auth.uid())
     and o.status = 'paid'
   limit 1;
$$;

revoke execute on function public.purchased_file_path(uuid) from public, anon;
grant execute on function public.purchased_file_path(uuid) to authenticated;
