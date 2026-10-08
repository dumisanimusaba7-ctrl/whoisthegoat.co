-- Assertion tests for the voting schema. Runs in a transaction and rolls back,
-- so it is safe to run against any database the migrations were applied to:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/voting_test.sql
--
begin;

set local role service_role;

do $$
declare
  r jsonb;
  results jsonb;
  voter_a constant text := repeat('a', 32);
  voter_b constant text := repeat('b', 32);
  net_1 constant text := repeat('1', 32);
  net_2 constant text := repeat('2', 32);
  i integer;
begin
  -- First vote is accepted and counted.
  r := public.cast_vote('messi-vs-ronaldo', 'messi', voter_a, net_1, 'ar');
  assert r ->> 'status' = 'ok', format('first vote: %s', r);
  assert r ->> 'choice' = 'messi', format('choice: %s', r);
  assert r ->> 'country' = 'AR', format('country normalised: %s', r);
  assert (r ->> 'total')::int = 1, format('total: %s', r);

  -- Same voter cannot vote again, not even for the other option.
  r := public.cast_vote('messi-vs-ronaldo', 'ronaldo', voter_a, net_1, 'AR');
  assert r ->> 'status' = 'already_voted', format('repeat vote: %s', r);
  assert r ->> 'choice' = 'messi', format('repeat vote keeps original choice: %s', r);
  assert (r ->> 'total')::int = 1, format('repeat vote not counted: %s', r);

  -- Another voter on the same network is fine.
  r := public.cast_vote('messi-vs-ronaldo', 'ronaldo', voter_b, net_1, 'PT');
  assert r ->> 'status' = 'ok', format('second voter: %s', r);
  assert (r -> 'options' -> 1 ->> 'votes')::int = 1, format('ronaldo tally: %s', r);

  -- Unknown or placeholder countries are stored as null.
  r := public.cast_vote('messi-vs-ronaldo', 'messi', repeat('c', 32), net_2, 'XX');
  assert r ->> 'status' = 'ok' and r -> 'country' = 'null'::jsonb, format('XX country: %s', r);

  -- Validation.
  assert public.cast_vote('nope', 'messi', repeat('d', 32)) ->> 'status' = 'unknown_debate';
  assert public.cast_vote('messi-vs-ronaldo', 'pele', repeat('d', 32)) ->> 'status' = 'unknown_option';
  begin
    perform public.cast_vote('messi-vs-ronaldo', 'messi', 'not-a-hash');
    assert false, 'invalid voter hash accepted';
  exception when invalid_parameter_value then null;
  end;

  -- Per-minute network limit (limit 3 here; net_2 has already used 1).
  for i in 1..2 loop
    r := public.cast_vote('messi-vs-ronaldo', 'ronaldo', lpad(i::text, 32, 'e'), net_2, 'BR', 3, 100);
    assert r ->> 'status' = 'ok', format('within limit %s: %s', i, r);
  end loop;
  r := public.cast_vote('messi-vs-ronaldo', 'ronaldo', lpad('9', 32, 'e'), net_2, 'BR', 3, 100);
  assert r ->> 'status' = 'rate_limited', format('over limit: %s', r);
  -- A returning voter on a throttled network still gets their answer.
  r := public.cast_vote('messi-vs-ronaldo', 'messi', lpad('1', 32, 'e'), net_2, 'BR', 3, 100);
  assert r ->> 'status' = 'already_voted' and r ->> 'choice' = 'ronaldo', format('returning voter: %s', r);

  -- Results: totals and per-country breakdown, with the privacy threshold.
  results := public.get_debate_results('messi-vs-ronaldo', 1);
  assert (results ->> 'total')::int = 5, format('results total: %s', results);
  assert (results -> 'countries' ->> 'count')::int = 3, format('country count: %s', results);
  assert results -> 'countries' -> 'rows' -> 0 ->> 'code' = 'BR', format('top country: %s', results);
  assert (results -> 'countries' -> 'rows' -> 0 -> 'votes' ->> 'ronaldo')::int = 2, format('BR split: %s', results);

  results := public.get_debate_results('messi-vs-ronaldo', 10);
  assert (results -> 'countries' ->> 'count')::int = 3, 'threshold keeps the count';
  assert jsonb_array_length(results -> 'countries' -> 'rows') = 0, 'threshold hides small countries';
  assert public.get_debate_results('nope') is null, 'unknown debate returns null';

  -- Votes are immutable...
  begin
    update public.votes set option_id = option_id where false; -- no-op is fine
    update public.votes set country_code = 'FR' where voter_hash = decode(voter_a, 'hex');
    assert false, 'vote country changed';
  exception when insufficient_privilege then null;
  end;
  -- ...except that the network hash may be cleared.
  update public.votes set network_hash = null where voter_hash = decode(voter_a, 'hex');

  -- Deleting a vote (manipulation clean-up) keeps the counters exact.
  delete from public.votes where voter_hash = decode(voter_b, 'hex');
  results := public.get_debate_results('messi-vs-ronaldo', 1);
  assert (results ->> 'total')::int = 4, format('after delete: %s', results);
  assert (results -> 'options' -> 1 ->> 'votes')::int = 2, format('ronaldo after delete: %s', results);

  -- Rebuilding the counters from scratch gives the same answer.
  perform public.rebuild_debate_tallies('messi-vs-ronaldo');
  assert public.get_debate_results('messi-vs-ronaldo', 1) - 'generatedAt' = results - 'generatedAt',
    'rebuild matches incremental tallies';

  -- Closed debates stop accepting votes.
  update public.debates set status = 'closed' where slug = 'messi-vs-ronaldo';
  assert public.cast_vote('messi-vs-ronaldo', 'messi', repeat('f', 32)) ->> 'status' = 'closed';

  raise notice 'voting tests passed';
end;
$$;

-- The public API roles must not be able to read or write anything.
reset role;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    assert not has_table_privilege('anon', 'public.votes', 'select'), 'anon can read votes';
    assert not has_table_privilege('anon', 'public.votes', 'insert'), 'anon can insert votes';
    assert not has_table_privilege('authenticated', 'public.option_tallies', 'select'), 'authenticated can read tallies';
    assert not has_function_privilege('anon', 'public.cast_vote(text, text, text, text, text, integer, integer)', 'execute'),
      'anon can cast votes directly';
    assert not has_function_privilege('anon', 'public.get_debate_results(text, integer, integer)', 'execute'),
      'anon can read results directly';
    raise notice 'access control tests passed';
  end if;
end;
$$;

rollback;
