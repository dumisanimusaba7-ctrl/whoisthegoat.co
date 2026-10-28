-- ============================================================================
-- WHOISTHEGOATS.COM — nine more debates
--
-- Run after 20261008120000_voting.sql (Supabase → SQL Editor). Safe to run
-- more than once: existing debates and options are left as they are.
-- ============================================================================

insert into public.debates (slug, title, sport, status, opened_at)
values
  ('yamal-vs-mbappe', 'Yamal vs Mbappé', 'football', 'live', now()),
  ('lebron-vs-jordan', 'LeBron vs Jordan', 'basketball', 'live', now()),
  ('tyson-vs-ali', 'Tyson vs Ali', 'boxing', 'live', now()),
  ('hamilton-vs-verstappen', 'Hamilton vs Verstappen', 'formula-1', 'live', now()),
  ('khabib-vs-mcgregor', 'Khabib vs McGregor', 'mma', 'live', now()),
  ('neymar-vs-ronaldinho', 'Neymar vs Ronaldinho', 'football', 'live', now()),
  ('drake-vs-kendrick', 'Drake vs Kendrick', 'music', 'live', now()),
  ('dc-vs-marvel', 'DC vs Marvel', 'comics', 'live', now()),
  ('samsung-vs-apple', 'Samsung vs Apple', 'tech', 'live', now())
on conflict (slug) do nothing;

insert into public.debate_options (debate_id, slug, name, position)
select d.id, o.slug, o.name, o.position
from (values
  ('yamal-vs-mbappe', 'yamal', 'Lamine Yamal', 1),
  ('yamal-vs-mbappe', 'mbappe', 'Kylian Mbappé', 2),
  ('lebron-vs-jordan', 'lebron', 'LeBron James', 1),
  ('lebron-vs-jordan', 'jordan', 'Michael Jordan', 2),
  ('tyson-vs-ali', 'tyson', 'Mike Tyson', 1),
  ('tyson-vs-ali', 'ali', 'Muhammad Ali', 2),
  ('hamilton-vs-verstappen', 'hamilton', 'Lewis Hamilton', 1),
  ('hamilton-vs-verstappen', 'verstappen', 'Max Verstappen', 2),
  ('khabib-vs-mcgregor', 'khabib', 'Khabib Nurmagomedov', 1),
  ('khabib-vs-mcgregor', 'mcgregor', 'Conor McGregor', 2),
  ('neymar-vs-ronaldinho', 'neymar', 'Neymar Jr', 1),
  ('neymar-vs-ronaldinho', 'ronaldinho', 'Ronaldinho', 2),
  ('drake-vs-kendrick', 'drake', 'Drake', 1),
  ('drake-vs-kendrick', 'kendrick', 'Kendrick Lamar', 2),
  ('dc-vs-marvel', 'dc', 'DC', 1),
  ('dc-vs-marvel', 'marvel', 'Marvel', 2),
  ('samsung-vs-apple', 'samsung', 'Samsung', 1),
  ('samsung-vs-apple', 'apple', 'Apple', 2)
) as o (debate_slug, slug, name, position)
join public.debates d on d.slug = o.debate_slug
on conflict (debate_id, slug) do nothing;
