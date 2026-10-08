-- ============================================================================
-- WHOISTHEGOAT.CO — delete every vote on Messi vs Ronaldo and start from zero.
--
-- For clearing test votes BEFORE launch. It deletes all votes on the debate,
-- real ones included, and can't be undone. Never run it once the site is
-- public.
--
-- Paste into Supabase → SQL Editor and run (confirm the "destructive
-- operation" prompt). The site shows zero within about a minute.
-- ============================================================================

-- Votes. The tally triggers take each one off the counters as it goes.
delete from public.votes
where debate_id = (select id from public.debates where slug = 'messi-vs-ronaldo');

-- Per-network vote limits, so testers aren't still throttled.
delete from public.vote_rate_limits
where debate_id = (select id from public.debates where slug = 'messi-vs-ronaldo');

-- Rebuild the counters from the (now empty) votes table so they're exactly zero.
select public.rebuild_debate_tallies('messi-vs-ronaldo');

-- Should read 0.
select (public.get_debate_results('messi-vs-ronaldo') ->> 'total')::bigint as votes_remaining;
