-- ============================================================================
-- WHOISTHEGOATS.COM — update: every debate on the site, including Nike vs Adidas
--
-- Run in Supabase → SQL Editor after 20261008120000_voting.sql. It adds any
-- debate or option that's missing and leaves everything else as it is (votes,
-- and any debate you've closed), so it's safe to run more than once, and
-- whether or not you ran 20261021120000_more_debates.sql.
-- ============================================================================

insert into public.debates (slug, title, sport, status, opened_at)
values
  ('messi-vs-ronaldo', 'Messi vs Ronaldo', 'football', 'live', now()),
  ('yamal-vs-mbappe', 'Yamal vs Mbappé', 'football', 'live', now()),
  ('lebron-vs-jordan', 'LeBron vs Jordan', 'basketball', 'live', now()),
  ('tyson-vs-ali', 'Tyson vs Ali', 'boxing', 'live', now()),
  ('hamilton-vs-verstappen', 'Hamilton vs Verstappen', 'formula-1', 'live', now()),
  ('khabib-vs-mcgregor', 'Khabib vs McGregor', 'mma', 'live', now()),
  ('neymar-vs-ronaldinho', 'Neymar vs Ronaldinho', 'football', 'live', now()),
  ('drake-vs-kendrick', 'Drake vs Kendrick', 'music', 'live', now()),
  ('dc-vs-marvel', 'DC vs Marvel', 'comics', 'live', now()),
  ('samsung-vs-apple', 'Samsung vs Apple', 'tech', 'live', now()),
  ('nike-vs-adidas', 'Nike vs Adidas', 'sportswear', 'live', now())
on conflict (slug) do nothing;

insert into public.debate_options (debate_id, slug, name, position)
select d.id, o.slug, o.name, o.position
from (values
  ('messi-vs-ronaldo', 'messi', 'Lionel Messi', 1),
  ('messi-vs-ronaldo', 'ronaldo', 'Cristiano Ronaldo', 2),
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
  ('samsung-vs-apple', 'apple', 'Apple', 2),
  ('nike-vs-adidas', 'nike', 'Nike', 1),
  ('nike-vs-adidas', 'adidas', 'Adidas', 2)
) as o (debate_slug, slug, name, position)
join public.debates d on d.slug = o.debate_slug
on conflict (debate_id, slug) do nothing;

-- What's in the database now: every row should be live with both options.
select d.slug, d.status, string_agg(o.slug, ', ' order by o.position) as options
from public.debates d
left join public.debate_options o on o.debate_id = d.id
group by d.slug, d.status
order by d.slug;
