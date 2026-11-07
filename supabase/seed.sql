-- Categories carried over from the original DHIVE prototype.
insert into public.categories (slug, name, icon, sort_order) values
  ('ai-automation', 'AI & Automation', '🤖', 1),
  ('templates', 'Templates', '📄', 2),
  ('courses', 'Online Courses', '🎓', 3),
  ('ebooks', 'Ebooks', '📚', 4),
  ('plugins', 'Plugins', '🧩', 5),
  ('subscriptions', 'Subscriptions', '🔁', 6),
  ('free-tools', 'Free Tools', '🎁', 7)
on conflict (slug) do update set name = excluded.name, icon = excluded.icon, sort_order = excluded.sort_order;
