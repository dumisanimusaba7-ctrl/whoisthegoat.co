-- ============================================================================
-- WHOISTHEGOAT.CO — delete every vote on every debate and start from zero.
--
-- For clearing test votes BEFORE launch. It deletes all votes, real ones
-- included, and can't be undone. Never run it once the site is public.
--
-- To clear one debate only, replace each `select id from public.debates`
-- below with `select id from public.debates where slug = 'messi-vs-ronaldo'`
-- (or the debate you want).
--
-- Paste into Supabase → SQL Editor and run (confirm the "destructive
-- operation" prompt). The site shows zero within about a minute.
-- ============================================================================

-- Votes. The tally triggers take each one off the counters as it goes.
delete from public.votes
where debate_id in (select id from public.debates);

-- Per-network vote limits, so testers aren't still throttled.
delete from public.vote_rate_limits
where debate_id in (select id from public.debates);

-- Rebuild the counters from the (now empty) votes table so they're exactly zero.
select slug, public.rebuild_debate_tallies(slug)
from public.debates
where id in (select id from public.debates);

-- Every row should read 0.
select slug, (public.get_debate_results(slug) ->> 'total')::bigint as votes_remaining
from public.debates
order by slug;
