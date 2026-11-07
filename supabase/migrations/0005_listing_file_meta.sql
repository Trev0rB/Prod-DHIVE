-- Display-safe metadata about a listing's deliverable. file_path stays hidden from
-- clients; the name and size are fine to show (buyers see what they'll get).
alter table public.products
  add column file_name text check (char_length(file_name) <= 200),
  add column file_size bigint check (file_size >= 0);

alter table public.products add constraint products_file_meta_consistent
  check ((file_path is null) = (file_name is null));

grant select (file_name, file_size) on public.products to anon, authenticated;
grant insert (file_name, file_size), update (file_name, file_size) on public.products to authenticated;
