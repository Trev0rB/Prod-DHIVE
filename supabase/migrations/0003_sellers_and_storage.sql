-- Cycle 3: seller onboarding, listing integrity rules, and file storage.

-- ---------------------------------------------------------------------------
-- Seller onboarding
-- Clients can't write is_seller directly (column grants), so becoming a seller goes
-- through this narrow function, which only ever flips the caller's own row.
-- ---------------------------------------------------------------------------
alter table public.profiles add column seller_terms_accepted_at timestamptz;

create function public.become_seller()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  update public.profiles
     set is_seller = true,
         seller_terms_accepted_at = coalesce(seller_terms_accepted_at, now())
   where id = (select auth.uid());
end;
$$;

revoke execute on function public.become_seller() from public, anon;
grant execute on function public.become_seller() to authenticated;

-- ---------------------------------------------------------------------------
-- Listing integrity
-- ---------------------------------------------------------------------------
-- A listing's deliverable must live in its own seller's storage folder, so a seller
-- can't point their listing at someone else's file.
alter table public.products add constraint products_file_in_seller_folder
  check (file_path is null or file_path like seller_id::text || '/%');

-- Nothing goes live without a file to deliver.
alter table public.products add constraint products_published_has_file
  check (status <> 'published' or file_path is not null);

alter table public.products add constraint products_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80);

-- ---------------------------------------------------------------------------
-- Storage
--   listing-images: public cover images, readable by anyone via public URL.
--   deliverables:   private files, readable only by the seller and paying buyers.
-- Every object lives under "<user id>/..." and only that user can write there.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('listing-images', 'listing-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('deliverables', 'deliverables', false, 52428800, null)
on conflict (id) do nothing;

create policy "sellers upload own listing images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_seller)
  );
create policy "sellers manage own listing images" on storage.objects
  for update to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sellers delete own listing images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "sellers upload own deliverables" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'deliverables'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_seller)
  );
create policy "sellers delete own deliverables" on storage.objects
  for delete to authenticated
  using (bucket_id = 'deliverables' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Read access: the seller who uploaded it, or anyone with a paid order for a listing
-- that delivers this exact file. Downloads use short-lived signed URLs.
create policy "owners and buyers read deliverables" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'deliverables'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
          from public.orders o
          join public.products pr on pr.id = o.product_id
         where o.buyer_id = (select auth.uid())
           and o.status = 'paid'
           and pr.file_path = storage.objects.name
      )
    )
  );
