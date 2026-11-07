-- Storage policies run as the caller, who can't read products.file_path (by design).
-- This definer function answers "may the caller download this object?" without
-- exposing any file paths.
create function public.can_download(object_name text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1
      from public.orders o
      join public.products pr on pr.id = o.product_id
     where o.buyer_id = (select auth.uid())
       and o.status = 'paid'
       and pr.file_path = object_name
  );
$$;

revoke execute on function public.can_download(text) from public, anon;
grant execute on function public.can_download(text) to authenticated;

drop policy "owners and buyers read deliverables" on storage.objects;
create policy "owners and buyers read deliverables" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'deliverables'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.can_download(name)
    )
  );
