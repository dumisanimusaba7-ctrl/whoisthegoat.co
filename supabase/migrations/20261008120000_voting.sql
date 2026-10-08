-- ============================================================================
-- WHOISTHEGOAT.CO — anonymous voting
--
-- Design notes
--   * The browser never talks to the database. Every read and write goes
--     through the Next.js server using the service role, so all tables are
--     locked down with RLS and no policies.
--   * One vote per voter per debate is enforced by the primary key on `votes`.
--     `voter_hash` is an HMAC of a random cookie id; `network_hash` is an HMAC
--     of the caller's IP (or /64 for IPv6). Raw identifiers are never stored.
--   * Counting is done with sharded counter rows maintained by triggers, so
--     reading live totals never scans the votes table and a viral burst of
--     votes doesn't serialise on one hot row.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table public.debates (
  id          integer generated always as identity primary key,
  slug        text not null unique
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  title       text not null,
  sport       text not null,
  status      text not null default 'draft'
              check (status in ('draft', 'live', 'closed')),
  created_at  timestamptz not null default now(),
  opened_at   timestamptz,
  closed_at   timestamptz
);

comment on table public.debates is 'A question the world votes on, e.g. messi-vs-ronaldo.';

create table public.debate_options (
  id         integer generated always as identity primary key,
  debate_id  integer not null references public.debates (id) on delete cascade,
  slug       text not null
             check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 40),
  name       text not null,
  position   smallint not null,
  unique (debate_id, slug),
  unique (debate_id, position),
  -- Lets votes reference (debate_id, option_id) so an option can only ever be
  -- counted towards its own debate.
  unique (debate_id, id)
);

create table public.votes (
  debate_id     integer not null,
  voter_hash    bytea not null check (octet_length(voter_hash) = 16),
  option_id     integer not null,
  network_hash  bytea check (octet_length(network_hash) = 16),
  country_code  text check (country_code ~ '^[A-Z]{2}$'),
  created_at    timestamptz not null default now(),
  primary key (debate_id, voter_hash),
  foreign key (debate_id, option_id)
    references public.debate_options (debate_id, id) on delete cascade
);

comment on column public.votes.voter_hash is
  'HMAC-SHA256(secret, cookie voter id), truncated to 128 bits.';
comment on column public.votes.network_hash is
  'HMAC-SHA256(secret, IP or IPv6 /64), truncated to 128 bits. Cleared after the retention window.';
comment on column public.votes.country_code is
  'ISO 3166-1 alpha-2 country derived from the edge network at vote time. Null when unknown.';

create index votes_option_id_idx on public.votes (option_id);
create index votes_network_hash_retention_idx on public.votes (created_at)
  where network_hash is not null;

-- Global totals per option, split across shards to avoid hot-row contention.
-- Individual shards may go negative after deletes; only the sum is meaningful.
create table public.option_tallies (
  option_id  integer not null references public.debate_options (id) on delete cascade,
  shard      smallint not null check (shard between 0 and 15),
  votes      bigint not null default 0,
  primary key (option_id, shard)
);

create table public.country_tallies (
  option_id     integer not null references public.debate_options (id) on delete cascade,
  country_code  text not null check (country_code ~ '^[A-Z]{2}$'),
  shard         smallint not null check (shard between 0 and 15),
  votes         bigint not null default 0,
  primary key (option_id, country_code, shard)
);

-- Fixed-window counters used to throttle votes per network per debate.
create table public.vote_rate_limits (
  network_hash  bytea not null,
  debate_id     integer not null references public.debates (id) on delete cascade,
  window_kind   text not null check (window_kind in ('minute', 'day')),
  window_start  timestamptz not null,
  hits          integer not null default 0,
  primary key (network_hash, debate_id, window_kind, window_start)
);

create index vote_rate_limits_window_start_idx on public.vote_rate_limits (window_start);

-- ----------------------------------------------------------------------------
-- Tally triggers: every insert/delete on votes is reflected in the counters.
-- ----------------------------------------------------------------------------

create function public.votes_apply_tally()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_shard smallint := floor(random() * 16)::smallint;
begin
  if tg_op = 'INSERT' then
    insert into public.option_tallies as t (option_id, shard, votes)
    values (new.option_id, v_shard, 1)
    on conflict (option_id, shard) do update set votes = t.votes + 1;

    if new.country_code is not null then
      insert into public.country_tallies as t (option_id, country_code, shard, votes)
      values (new.option_id, new.country_code, v_shard, 1)
      on conflict (option_id, country_code, shard) do update set votes = t.votes + 1;
    end if;
    return new;
  end if;

  -- DELETE (e.g. removing votes identified as manipulation)
  insert into public.option_tallies as t (option_id, shard, votes)
  values (old.option_id, v_shard, -1)
  on conflict (option_id, shard) do update set votes = t.votes - 1;

  if old.country_code is not null then
    insert into public.country_tallies as t (option_id, country_code, shard, votes)
    values (old.option_id, old.country_code, v_shard, -1)
    on conflict (option_id, country_code, shard) do update set votes = t.votes - 1;
  end if;
  return old;
end;
$$;

create trigger votes_tally_after_insert
  after insert on public.votes
  for each row execute function public.votes_apply_tally();

create trigger votes_tally_after_delete
  after delete on public.votes
  for each row execute function public.votes_apply_tally();

-- Votes are immutable. Only the network hash may be cleared (retention).
create function public.votes_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.debate_id is distinct from old.debate_id
     or new.voter_hash is distinct from old.voter_hash
     or new.option_id is distinct from old.option_id
     or new.country_code is distinct from old.country_code
     or new.created_at is distinct from old.created_at
     or (new.network_hash is not null and new.network_hash is distinct from old.network_hash)
  then
    raise exception 'votes are immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger votes_guard_update
  before update on public.votes
  for each row execute function public.votes_guard_update();

-- ----------------------------------------------------------------------------
-- Read helpers
-- ----------------------------------------------------------------------------

-- Per-option totals for one debate, in display order.
create function public.debate_option_totals(p_debate_id integer)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object('option', o.slug, 'votes', greatest(coalesce(t.votes, 0), 0))
      order by o.position
    ),
    '[]'::jsonb
  )
  from public.debate_options o
  left join lateral (
    select sum(ot.votes)::bigint as votes
    from public.option_tallies ot
    where ot.option_id = o.id
  ) t on true
  where o.debate_id = p_debate_id;
$$;

-- Full live results for a debate: totals plus the per-country breakdown.
-- Countries with fewer than p_min_country_votes votes are counted in
-- `countries.count` but their split is not exposed.
create function public.get_debate_results(
  p_debate_slug        text,
  p_min_country_votes  integer default 10,
  p_country_limit      integer default 250
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_debate   public.debates%rowtype;
  v_options  jsonb;
  v_total    bigint;
  v_count    integer;
  v_rows     jsonb;
begin
  select * into v_debate from public.debates where slug = p_debate_slug;
  if not found then
    return null;
  end if;

  v_options := public.debate_option_totals(v_debate.id);
  select coalesce(sum((e ->> 'votes')::bigint), 0) into v_total
  from jsonb_array_elements(v_options) e;

  with per_country as (
    select ct.country_code, o.slug as option_slug, sum(ct.votes)::bigint as votes
    from public.country_tallies ct
    join public.debate_options o on o.id = ct.option_id
    where o.debate_id = v_debate.id
    group by ct.country_code, o.slug
  ),
  countries as (
    select country_code,
           sum(greatest(votes, 0))::bigint as total,
           jsonb_object_agg(option_slug, greatest(votes, 0)) as votes
    from per_country
    group by country_code
  )
  select
    (select count(*) from countries where total > 0),
    coalesce(
      (select jsonb_agg(
                jsonb_build_object('code', c.country_code, 'total', c.total, 'votes', c.votes)
                order by c.total desc, c.country_code)
       from (
         select * from countries
         where total >= greatest(p_min_country_votes, 1)
         order by total desc, country_code
         limit greatest(p_country_limit, 0)
       ) c),
      '[]'::jsonb)
  into v_count, v_rows;

  return jsonb_build_object(
    'debate', v_debate.slug,
    'status', v_debate.status,
    'total', v_total,
    'options', v_options,
    'countries', jsonb_build_object('count', v_count, 'rows', v_rows),
    'generatedAt', now()
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- Casting a vote
-- ----------------------------------------------------------------------------

-- Returns one of:
--   {status: 'ok' | 'already_voted', choice, country, total, options}
--   {status: 'rate_limited' | 'closed' | 'unknown_debate' | 'unknown_option'}
create function public.cast_vote(
  p_debate_slug       text,
  p_option_slug       text,
  p_voter_hash        text,
  p_network_hash      text default null,
  p_country_code      text default null,
  p_limit_per_minute  integer default 10,
  p_limit_per_day     integer default 200
)
returns jsonb
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_debate        public.debates%rowtype;
  v_option_id     integer;
  v_voter         bytea;
  v_network       bytea;
  v_country       text;
  v_inserted      boolean;
  v_choice        text;
  v_vote_country  text;
  v_minute_hits   integer;
  v_day_hits      integer;
  v_options       jsonb;
begin
  if p_voter_hash is null or p_voter_hash !~ '^[0-9a-f]{32}$' then
    raise exception 'invalid voter hash' using errcode = '22023';
  end if;
  if p_network_hash is not null and p_network_hash !~ '^[0-9a-f]{32}$' then
    raise exception 'invalid network hash' using errcode = '22023';
  end if;

  v_voter := decode(p_voter_hash, 'hex');
  v_network := decode(p_network_hash, 'hex');
  v_country := case
    when upper(p_country_code) ~ '^[A-Z]{2}$' and upper(p_country_code) not in ('XX', 'T1', 'ZZ')
      then upper(p_country_code)
  end;

  select * into v_debate from public.debates where slug = p_debate_slug;
  if not found then
    return jsonb_build_object('status', 'unknown_debate');
  end if;
  if v_debate.status <> 'live' then
    return jsonb_build_object('status', 'closed');
  end if;

  select id into v_option_id
  from public.debate_options
  where debate_id = v_debate.id and slug = p_option_slug;
  if not found then
    return jsonb_build_object('status', 'unknown_option');
  end if;

  -- A returning voter gets their original choice back without spending
  -- their network's rate-limit budget.
  select o.slug, v.country_code into v_choice, v_vote_country
  from public.votes v
  join public.debate_options o on o.id = v.option_id
  where v.debate_id = v_debate.id and v.voter_hash = v_voter;

  if v_choice is null then
    if v_network is not null then
      insert into public.vote_rate_limits as rl (network_hash, debate_id, window_kind, window_start, hits)
      values (v_network, v_debate.id, 'minute', date_trunc('minute', now()), 1)
      on conflict (network_hash, debate_id, window_kind, window_start)
      do update set hits = rl.hits + 1
      returning hits into v_minute_hits;

      insert into public.vote_rate_limits as rl (network_hash, debate_id, window_kind, window_start, hits)
      values (v_network, v_debate.id, 'day', date_trunc('day', now()), 1)
      on conflict (network_hash, debate_id, window_kind, window_start)
      do update set hits = rl.hits + 1
      returning hits into v_day_hits;

      -- Returning (rather than raising) keeps the counters incremented, so
      -- rejected attempts still count against the network.
      if v_minute_hits > p_limit_per_minute or v_day_hits > p_limit_per_day then
        return jsonb_build_object('status', 'rate_limited');
      end if;
    end if;

    insert into public.votes (debate_id, voter_hash, option_id, network_hash, country_code)
    values (v_debate.id, v_voter, v_option_id, v_network, v_country)
    on conflict (debate_id, voter_hash) do nothing
    returning true into v_inserted;

    if v_inserted then
      v_choice := p_option_slug;
      v_vote_country := v_country;
    else
      -- Lost a race with a concurrent request from the same voter.
      select o.slug, v.country_code into v_choice, v_vote_country
      from public.votes v
      join public.debate_options o on o.id = v.option_id
      where v.debate_id = v_debate.id and v.voter_hash = v_voter;
    end if;
  end if;

  v_options := public.debate_option_totals(v_debate.id);

  return jsonb_build_object(
    'status', case when v_inserted then 'ok' else 'already_voted' end,
    'choice', v_choice,
    'country', v_vote_country,
    'total', (select coalesce(sum((e ->> 'votes')::bigint), 0) from jsonb_array_elements(v_options) e),
    'options', v_options
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- Maintenance
-- ----------------------------------------------------------------------------

-- Rate-limit windows are only useful for a day.
create function public.prune_vote_rate_limits()
returns integer
language sql
volatile
set search_path = ''
as $$
  with deleted as (
    delete from public.vote_rate_limits
    where window_start < now() - interval '2 days'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- Network hashes are kept only long enough to investigate manipulation.
create function public.scrub_vote_network_hashes(p_retention interval default interval '30 days')
returns integer
language sql
volatile
set search_path = ''
as $$
  with scrubbed as (
    update public.votes
    set network_hash = null
    where network_hash is not null
      and created_at < now() - p_retention
    returning 1
  )
  select count(*)::integer from scrubbed;
$$;

-- Recomputes a debate's counters from the votes table. Only needed if the
-- counters are ever edited by hand; triggers keep them in sync otherwise.
create function public.rebuild_debate_tallies(p_debate_slug text)
returns void
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_debate_id integer;
begin
  select id into v_debate_id from public.debates where slug = p_debate_slug;
  if not found then
    raise exception 'unknown debate %', p_debate_slug using errcode = '22023';
  end if;

  lock table public.votes in share mode;

  delete from public.option_tallies
  where option_id in (select id from public.debate_options where debate_id = v_debate_id);
  delete from public.country_tallies
  where option_id in (select id from public.debate_options where debate_id = v_debate_id);

  insert into public.option_tallies (option_id, shard, votes)
  select option_id, 0, count(*) from public.votes
  where debate_id = v_debate_id group by option_id;

  insert into public.country_tallies (option_id, country_code, shard, votes)
  select option_id, country_code, 0, count(*) from public.votes
  where debate_id = v_debate_id and country_code is not null
  group by option_id, country_code;
end;
$$;

-- ----------------------------------------------------------------------------
-- Access control: only the server (service_role) may touch any of this.
-- ----------------------------------------------------------------------------

alter table public.debates enable row level security;
alter table public.debate_options enable row level security;
alter table public.votes enable row level security;
alter table public.option_tallies enable row level security;
alter table public.country_tallies enable row level security;
alter table public.vote_rate_limits enable row level security;

do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format(
        'revoke all on public.debates, public.debate_options, public.votes, '
        'public.option_tallies, public.country_tallies, public.vote_rate_limits from %I', r);
    end if;
  end loop;
end;
$$;

revoke all on function public.votes_apply_tally() from public;
revoke all on function public.votes_guard_update() from public;
revoke all on function public.debate_option_totals(integer) from public;
revoke all on function public.get_debate_results(text, integer, integer) from public;
revoke all on function public.cast_vote(text, text, text, text, text, integer, integer) from public;
revoke all on function public.prune_vote_rate_limits() from public;
revoke all on function public.scrub_vote_network_hashes(interval) from public;
revoke all on function public.rebuild_debate_tallies(text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function public.debate_option_totals(integer) from anon, authenticated;
    revoke all on function public.get_debate_results(text, integer, integer) from anon, authenticated;
    revoke all on function public.cast_vote(text, text, text, text, text, integer, integer) from anon, authenticated;
    revoke all on function public.prune_vote_rate_limits() from anon, authenticated;
    revoke all on function public.scrub_vote_network_hashes(interval) from anon, authenticated;
    revoke all on function public.rebuild_debate_tallies(text) from anon, authenticated;
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant select, insert, update, delete on
      public.debates, public.debate_options, public.votes,
      public.option_tallies, public.country_tallies, public.vote_rate_limits
      to service_role;
    grant execute on function public.get_debate_results(text, integer, integer) to service_role;
    grant execute on function public.cast_vote(text, text, text, text, text, integer, integer) to service_role;
    grant execute on function public.debate_option_totals(integer) to service_role;
    grant execute on function public.prune_vote_rate_limits() to service_role;
    grant execute on function public.scrub_vote_network_hashes(interval) to service_role;
    grant execute on function public.rebuild_debate_tallies(text) to service_role;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- Scheduled maintenance (Supabase ships pg_cron; skipped where unavailable).
-- ----------------------------------------------------------------------------

do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('wigoat-prune-rate-limits', '17 * * * *',
    'select public.prune_vote_rate_limits()');
  perform cron.schedule('wigoat-scrub-network-hashes', '43 3 * * *',
    'select public.scrub_vote_network_hashes()');
exception when others then
  raise notice 'pg_cron not available (%). Schedule public.prune_vote_rate_limits() hourly and public.scrub_vote_network_hashes() daily.', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------------------
-- Launch debate
-- ----------------------------------------------------------------------------

insert into public.debates (slug, title, sport, status, opened_at)
values ('messi-vs-ronaldo', 'Messi vs Ronaldo', 'football', 'live', now());

insert into public.debate_options (debate_id, slug, name, position)
select d.id, o.slug, o.name, o.position
from public.debates d
cross join (values
  ('messi', 'Lionel Messi', 1),
  ('ronaldo', 'Cristiano Ronaldo', 2)
) as o (slug, name, position)
where d.slug = 'messi-vs-ronaldo';
