"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useState } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import {
  buildPool,
  type Contender,
  type GameState,
  gameReducer,
  getMode,
  type Mode,
  MODES,
  roundNumber,
  shareText,
  type Side,
  startGame,
  winnerOf,
} from "@/lib/play/who-is-better";

/** How long the player who wasn't picked takes to fade away, and how long the next one takes to arrive. */
const VANISH_MS = 1500;
const ARRIVE_MS = 900;
const REDUCED_MS = 150;

function reduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Screen = { kind: "start" } | { kind: "game"; id: number; mode: Mode; game: GameState };

export function WhoIsBetter() {
  const [modeId, setModeId] = useState<Mode["id"]>("football");
  const [screen, setScreen] = useState<Screen>({ kind: "start" });

  const start = useCallback((mode: Mode) => {
    const pool = buildPool(mode.categories);
    track("who_is_better_started", { mode: mode.id, players: pool.length });
    setScreen((previous) => ({ kind: "game", id: previous.kind === "game" ? previous.id + 1 : 1, mode, game: startGame(pool) }));
  }, []);

  if (screen.kind === "start") {
    return <StartScreen modeId={modeId} onMode={setModeId} onStart={() => start(getMode(modeId))} />;
  }
  return <Game key={screen.id} mode={screen.mode} initial={screen.game} onAgain={() => start(screen.mode)} onChangeMode={() => setScreen({ kind: "start" })} />;
}

function StartScreen({ modeId, onMode, onStart }: { modeId: Mode["id"]; onMode: (id: Mode["id"]) => void; onStart: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center sm:py-16">
      <h1 className="type-headline text-[min(2.6rem,10vw)] sm:text-6xl">Who is better?</h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-mute-dark">Tap the better player. The other one disappears. Keep going until only your ultimate player is left.</p>
      <p className="type-overline mt-8 text-mute-dark">Who is in the game</p>
      <div role="radiogroup" aria-label="Who is in the game" className="mt-4 grid grid-cols-2 gap-3">
        {MODES.map((mode) => {
          const count = buildPool(mode.categories).length;
          const active = mode.id === modeId;
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onMode(mode.id)}
              className={`min-h-24 border-2 px-3 py-4 text-left transition-colors duration-[var(--duration-micro)] ${active ? "border-white bg-white text-ink" : "border-white/25 text-white hover:border-white/60"}`}
            >
              <span className="block text-lg font-bold">{mode.label}</span>
              <span className={`mt-1 block text-sm ${active ? "text-mute" : "text-mute-dark"}`}>
                {count} players. {mode.blurb}.
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onStart} className="btn btn-light mt-6 w-full sm:w-auto sm:px-12">
        Start
      </button>
    </div>
  );
}

function Game({ mode, initial, onAgain, onChangeMode }: { mode: Mode; initial: GameState; onAgain: () => void; onChangeMode: () => void }) {
  const [game, dispatch] = useReducer(gameReducer, initial);

  // The unpicked player fades for a moment, then the next one arrives and the game waits for a tap again.
  useEffect(() => {
    if (game.phase === "resolving") {
      const timer = window.setTimeout(() => dispatch({ type: "resolve" }), reduced() ? REDUCED_MS : VANISH_MS);
      return () => window.clearTimeout(timer);
    }
    if (game.phase === "entering") {
      const timer = window.setTimeout(() => dispatch({ type: "ready" }), reduced() ? REDUCED_MS : ARRIVE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [game.phase]);

  const winner = winnerOf(game);
  useEffect(() => {
    if (winner) track("who_is_better_finished", { mode: mode.id, winner: winner.slug, beaten: game.eliminated.length });
  }, [winner, mode.id, game.eliminated.length]);

  if (winner) {
    return <ResultScreen mode={mode} winner={winner} beaten={game.eliminated} onAgain={onAgain} onChangeMode={onChangeMode} />;
  }

  const round = roundNumber(game);
  const loser = game.picked ? game[game.picked === "left" ? "right" : "left"] : null;
  const keeper = game.picked ? game[game.picked] : null;
  const announcement = game.phase === "resolving" && keeper && loser ? `${keeper.name} stays. ${loser.name} is out.` : game.phase === "entering" ? `Next up: ${game[game.picked ?? "right"].name}.` : "";

  return (
    <div className="mx-auto max-w-3xl px-3 pb-10 pt-5 sm:px-6 sm:pt-10">
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-overline text-white">
          Round {round} of {game.total}
        </p>
        <p className="type-label tabular text-mute-dark">{game.queue.length} still waiting</p>
      </div>
      <div className="mt-2 h-1 bg-white/15" role="progressbar" aria-label="Rounds played" aria-valuemin={0} aria-valuemax={game.total} aria-valuenow={game.eliminated.length}>
        <div className="h-full bg-white transition-[width] duration-[var(--duration-large)] ease-out" style={{ width: `${(game.eliminated.length / game.total) * 100}%` }} />
      </div>

      <h2 className="sr-only">Who is better?</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5">
        {(["left", "right"] as const).map((side) => (
          <Tile
            key={`${side}-${game[side].slug}`}
            player={game[side]}
            side={side}
            state={game.picked === null ? (game.phase === "entering" ? "arriving" : "idle") : game.picked === side ? "kept" : "vanishing"}
            disabled={game.phase !== "choosing"}
            onPick={() => dispatch({ type: "pick", side })}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-mute-dark">Tap the better player. The other one disappears.</p>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

type TileState = "idle" | "kept" | "vanishing" | "arriving";

function Tile({ player, side, state, disabled, onPick }: { player: Contender; side: Side; state: TileState; disabled: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      aria-label={`${player.firstName ? `${player.firstName} ` : ""}${player.name}`}
      data-side={side}
      className={`play-tile group block text-left ${state === "vanishing" ? "play-vanish" : ""} ${state === "arriving" ? "play-arrive" : ""}`}
      style={{ "--tile": player.color } as React.CSSProperties}
    >
      <span className={`relative block aspect-[4/5] overflow-hidden bg-ink-2 ${state === "kept" ? "play-kept" : ""}`}>
        <Image
          src={player.photo}
          alt=""
          fill
          sizes="(min-width: 768px) 380px, 46vw"
          quality={95}
          placeholder="blur"
          priority
          className="object-cover transition-transform duration-[var(--duration-large)] ease-out group-enabled:group-hover:scale-[1.03]"
          style={{ objectPosition: player.focus }}
        />
      </span>
      <span className="mt-3 block min-h-14">
        {player.firstName ? <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-mute-dark">{player.firstName}</span> : null}
        <span className="type-display block text-[clamp(1.9rem,8.5vw,3.25rem)]">{player.name}</span>
      </span>
    </button>
  );
}

function ResultScreen({ mode, winner, beaten, onAgain, onChangeMode }: { mode: Mode; winner: Contender; beaten: Contender[]; onAgain: () => void; onChangeMode: () => void }) {
  const [shared, setShared] = useState<"idle" | "copied">("idle");

  const share = useCallback(async () => {
    const url = `${window.location.origin}/play/who-is-better`;
    const text = shareText(winner, beaten.length, mode.label);
    track("who_is_better_shared", { mode: mode.id, winner: winner.slug });
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared("copied");
      window.setTimeout(() => setShared("idle"), 2500);
    } catch {
      // Closing the share sheet is not an error.
    }
  }, [winner, beaten.length, mode]);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-10 text-center sm:pt-14">
      <p className="type-overline text-mute-dark">Your ultimate pick</p>
      <div className="play-arrive mx-auto mt-4 max-w-xs" style={{ "--tile": winner.color } as React.CSSProperties}>
        <div className="play-kept relative aspect-[4/5] overflow-hidden bg-ink-2">
          <Image src={winner.photo} alt="" fill sizes="320px" quality={95} placeholder="blur" priority className="object-cover" style={{ objectPosition: winner.focus }} />
        </div>
        <h2 className="type-display mt-4 text-6xl">{winner.name}</h2>
      </div>
      <p className="mt-4 text-lg text-white/85">
        You knocked out {beaten.length} {mode.id === "football" ? "footballers" : "athletes"} to get here.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-mute-dark">{beaten.map((p) => p.name).join(" · ")}</p>

      <div className="mt-6 grid gap-3">
        <button type="button" onClick={share} className="btn btn-light">
          {shared === "copied" ? "Copied. Now send it" : "Share my pick"}
        </button>
        <Link href={`/${winner.debateSlug}`} className="btn btn-outline">
          Vote: {winner.debateTitle}
        </Link>
        <button type="button" onClick={onAgain} className="btn btn-outline">
          Play again with a new order
        </button>
        <button type="button" onClick={onChangeMode} className="link text-sm">
          Change who is in the game
        </button>
      </div>
      <AdSlot placement="editorial" className="mt-6 !px-0" />
    </div>
  );
}
