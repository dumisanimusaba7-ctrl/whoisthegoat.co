-- ============================================================================
-- WHOISTHEGOAT.CO — is the database ready for voting?
--
-- Paste into Supabase → SQL Editor and run. It changes nothing: the helper
-- below is temporary and disappears when the query finishes.
-- Every row should say "ok". A "fix" row says what's missing; "optional"
-- rows don't stop voting.
-- ============================================================================

-- Runs a query and returns its single value. Lets the checks below look
-- inside tables and functions that may not exist yet.
create or replace function pg_temp.value_of(query text)
returns text
language plpgsql
as $$
declare
  result text;
begin
  execute query into result;
  return result;
end;
$$;

with
required_tables (name) as (
  values ('debates'), ('debate_options'), ('votes'),
         ('option_tallies'), ('country_tallies'), ('vote_rate_limits')
),
required_functions (signature) as (
  values ('public.cast_vote(text,text,text,text,text,integer,integer)'),
         ('public.get_debate_results(text,integer,integer)'),
         ('public.debate_option_totals(integer)'),
         ('public.prune_vote_rate_limits()'),
         ('public.scrub_vote_network_hashes(interval)'),
         ('public.rebuild_debate_tallies(text)')
),
state as (
  select
    (select string_agg(name, ', ') from required_tables
      where to_regclass('public.' || name) is null) as missing_tables,
    (select string_agg(replace(split_part(signature, '(', 1), 'public.', ''), ', ')
       from required_functions
      where to_regprocedure(signature) is null) as missing_functions,
    (select string_agg(c.relname, ', ')
       from required_tables t
       join pg_class c on c.oid = to_regclass('public.' || t.name)
      where not c.relrowsecurity) as tables_without_rls,
    exists (select 1 from pg_roles where rolname = 'service_role') as has_service_role,
    exists (select 1 from pg_roles where rolname = 'anon') as has_anon,
    to_regprocedure('public.cast_vote(text,text,text,text,text,integer,integer)') as cast_vote_fn,
    to_regprocedure('public.get_debate_results(text,integer,integer)') as results_fn,
    to_regclass('public.debates') as debates_tbl,
    to_regclass('public.debate_options') as options_tbl,
    to_regclass('cron.job') as cron_tbl
),
-- Only look inside an object once it's known to exist.
data as (
  select
    s.*,
    case when s.debates_tbl is not null then
      pg_temp.value_of($q$select status from public.debates where slug = 'messi-vs-ronaldo'$q$)
    end as debate_status,
    case when s.debates_tbl is not null and s.options_tbl is not null then
      pg_temp.value_of($q$select string_agg(o.slug, ', ' order by o.position)
                            from public.debate_options o
                            join public.debates d on d.id = o.debate_id
                           where d.slug = 'messi-vs-ronaldo'$q$)
    end as debate_options,
    case when s.results_fn is not null and s.missing_tables is null then
      pg_temp.value_of($q$select public.get_debate_results('messi-vs-ronaldo') ->> 'total'$q$)
    end as total_votes,
    case when s.cron_tbl is not null then
      pg_temp.value_of($q$select count(*) from cron.job where jobname like 'wigoat-%'$q$)::int
    end as cron_jobs
  from state s
),
checks (step, item, status, detail) as (
  select 1, 'Tables',
         case when missing_tables is null then 'ok' else 'fix' end,
         coalesce('Missing: ' || missing_tables || '. Run the setup script.', 'All 6 tables exist.')
    from data
  union all
  select 2, 'Functions',
         case when missing_functions is null then 'ok' else 'fix' end,
         coalesce('Missing: ' || missing_functions || '. Run the setup script.', 'All 6 functions exist.')
    from data
  union all
  select 3, 'Row level security',
         case when missing_tables is null and tables_without_rls is null then 'ok' else 'fix' end,
         case
           when tables_without_rls is not null then 'Off on: ' || tables_without_rls || '. Re-run the "alter table … enable row level security" lines.'
           when missing_tables is not null then 'Can’t check until the tables exist.'
           else 'On for every table.'
         end
    from data
  union all
  select 4, 'Server key can vote',
         case
           when not has_service_role then 'fix'
           when cast_vote_fn is null or results_fn is null then 'fix'
           when has_function_privilege('service_role', cast_vote_fn, 'execute')
            and has_function_privilege('service_role', results_fn, 'execute') then 'ok'
           else 'fix'
         end,
         case
           when not has_service_role then 'No service_role in this database. Is this the Supabase project the site uses?'
           when cast_vote_fn is null or results_fn is null then 'Vote functions are missing. Run the setup script.'
           when has_function_privilege('service_role', cast_vote_fn, 'execute')
            and has_function_privilege('service_role', results_fn, 'execute')
             then 'service_role can cast votes and read results. Use the secret key (sb_secret_…) or the legacy service_role key in SUPABASE_SECRET_KEY.'
           else 'service_role is not allowed to run the vote functions. Re-run the grants at the end of the setup script.'
         end
    from data
  union all
  select 5, 'Public key locked out',
         case
           when cast_vote_fn is null then 'fix'
           when not has_anon then 'ok'
           when has_function_privilege('anon', cast_vote_fn, 'execute') then 'fix'
           else 'ok'
         end,
         case
           when cast_vote_fn is null then 'Can’t check until the vote functions exist.'
           when not has_anon then 'No public (anon) role in this database.'
           when has_function_privilege('anon', cast_vote_fn, 'execute')
             then 'The public (anon) key can call cast_vote directly. Re-run the revokes at the end of the setup script.'
           else 'The public (anon) key can’t vote or read votes directly.'
         end
    from data
  union all
  select 6, 'Messi vs Ronaldo debate',
         case when debate_status = 'live' then 'ok' else 'fix' end,
         case
           when debates_tbl is null then 'debates table is missing. Run the setup script.'
           when debate_status is null then 'Not found. Run the "Launch debate" inserts at the end of the setup script.'
           when debate_status <> 'live' then 'Status is "' || debate_status || '". Set it to live: update public.debates set status = ''live'' where slug = ''messi-vs-ronaldo'';'
           else 'Open for voting.'
         end
    from data
  union all
  select 7, 'Debate options',
         case when debate_options = 'messi, ronaldo' then 'ok' else 'fix' end,
         case
           when debate_options = 'messi, ronaldo' then 'messi, ronaldo'
           else 'Expected "messi, ronaldo", found "' || coalesce(debate_options, 'nothing') || '".'
         end
    from data
  union all
  select 8, 'Results',
         case when total_votes is not null then 'ok' else 'fix' end,
         case
           when total_votes is not null then total_votes || ' votes counted so far.'
           else 'Couldn’t read results. Fix the rows above first.'
         end
    from data
  union all
  select 9, 'Scheduled clean-up',
         case when coalesce(cron_jobs, 0) >= 2 then 'ok' else 'optional' end,
         case
           when coalesce(cron_jobs, 0) >= 2 then 'Rate-limit and privacy clean-up jobs are scheduled.'
           when cron_tbl is null then 'pg_cron isn’t enabled. Voting works; enable it under Database → Extensions to clear old network hashes.'
           else 'Clean-up jobs aren’t scheduled. Voting works; re-run the "Scheduled maintenance" block of the setup script.'
         end
    from data
)
select step, item, status, detail
from checks
order by step;
