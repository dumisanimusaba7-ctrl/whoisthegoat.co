-- ============================================================================
-- WHOISTHEGOATS.COM — game high scores
--
-- Run in Supabase → SQL Editor after 20261008120000_voting.sql.
--
-- One row per player per game: only a player's BEST score is kept. A new score
-- replaces the row only if it is higher, so playing again never adds rows or
-- lowers anyone's mark. The player is the same hashed cookie id the votes use
-- (no raw id is stored); the name is whatever they typed, 2–16 characters.
-- Like every other table here, nothing is readable by the browser: the Next.js
-- server reads and writes with the service role.
--
-- To remove a name you don't want on the board:
--   delete from public.game_scores where name = 'that name';
-- ============================================================================

create table if not exists public.game_scores (
  game         text not null
               check (game ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(game) <= 40),
  player_hash  bytea not null check (octet_length(player_hash) = 16),
  name         text not null check (char_length(name) between 2 and 16),
  score        integer not null check (score between 0 and 1000),
  achieved_at  timestamptz not null default now(),
  primary key (game, player_hash)
);

comment on table public.game_scores is 'Each player''s best score in each game. One row per player per game.';

-- The board reads highest score first, earliest to get there first.
create index if not exists game_scores_board_idx on public.game_scores (game, score desc, achieved_at asc);

-- Records a score if it beats the player's best. Returns
--   {status: 'new_best', score, rank} | {status: 'not_higher', score, rank} | {status: 'invalid'}
create or replace function public.submit_game_score(
  p_game         text,
  p_player_hash  text,
  p_name         text,
  p_score        integer
)
returns jsonb
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_player  bytea;
  v_row     public.game_scores%rowtype;
  v_rank    integer;
  v_status  text := 'new_best';
begin
  if p_game is null or p_game !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_game) > 40
     or p_player_hash is null or p_player_hash !~ '^[0-9a-f]{32}$'
     or p_name is null or char_length(p_name) not between 2 and 16
     or p_score is null or p_score not between 0 and 1000 then
    return jsonb_build_object('status', 'invalid');
  end if;

  v_player := decode(p_player_hash, 'hex');

  insert into public.game_scores as gs (game, player_hash, name, score)
  values (p_game, v_player, p_name, p_score)
  on conflict (game, player_hash) do update
    set name = excluded.name, score = excluded.score, achieved_at = now()
    where excluded.score > gs.score
  returning * into v_row;

  if not found then
    v_status := 'not_higher';
    select * into v_row from public.game_scores where game = p_game and player_hash = v_player;
  end if;

  select count(*) + 1 into v_rank
  from public.game_scores
  where game = p_game
    and (score > v_row.score or (score = v_row.score and achieved_at < v_row.achieved_at));

  return jsonb_build_object('status', v_status, 'score', v_row.score, 'rank', v_rank);
end;
$$;

-- The top of a game's board, best first: [{name, score}, …].
create or replace function public.top_game_scores(p_game text, p_limit integer default 20)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('name', t.name, 'score', t.score) order by t.score desc, t.achieved_at asc), '[]'::jsonb)
  from (
    select name, score, achieved_at
    from public.game_scores
    where game = p_game
    order by score desc, achieved_at asc
    limit least(greatest(coalesce(p_limit, 20), 1), 100)
  ) t;
$$;

-- ----------------------------------------------------------------------------
-- Access control: only the server (service_role) may touch any of this.
-- ----------------------------------------------------------------------------

alter table public.game_scores enable row level security;

revoke all on function public.submit_game_score(text, text, text, integer) from public;
revoke all on function public.top_game_scores(text, integer) from public;

do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on public.game_scores from %I', r);
      execute format('revoke all on function public.submit_game_score(text, text, text, integer) from %I', r);
      execute format('revoke all on function public.top_game_scores(text, integer) from %I', r);
    end if;
  end loop;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant select, insert, update, delete on public.game_scores to service_role;
    grant execute on function public.submit_game_score(text, text, text, integer) to service_role;
    grant execute on function public.top_game_scores(text, integer) to service_role;
  end if;
end;
$$;
