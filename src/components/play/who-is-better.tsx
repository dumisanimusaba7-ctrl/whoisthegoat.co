"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useState } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { encodeOrder } from "@/lib/play/players";
import {
  buildPool,
  savedForLast,
  type Contender,
  type GameState,
  gameReducer,
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

type Screen = { kind: "start" } | { kind: "game"; id: number; game: GameState };

export function WhoIsBetter() {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });

  const start = useCallback(() => {
    const pool = buildPool();
    track("who_is_better_started", { players: pool.length });
    setScreen((previous) => ({ kind: "game", id: previous.kind === "game" ? previous.id + 1 : 1, game: startGame(pool) }));
  }, []);

  if (screen.kind === "start") return <StartScreen players={savedForLast(buildPool())} onStart={start} />;
  return <Game key={screen.id} initial={screen.game} onAgain={start} />;
}

/** The first screen: who is in the game, and a button. */
function StartScreen({ players, onStart }: { players: Contender[]; onStart: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center sm:py-16">
      <h1 className="type-headline text-[min(2.6rem,10vw)] sm:text-6xl">Who is better?</h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-mute-dark">
        {players.length} of the most debated players in football. Tap the better one. The other disappears and a new challenger steps in. Keep going until your ultimate player is left.
      </p>
      <ul className="mx-auto mt-8 grid max-w-sm grid-cols-5 gap-2" aria-label="The players">
        {players.map((player) => (
          <li key={player.slug} title={player.name} className="relative aspect-square overflow-hidden bg-ink-2">
            <Image src={player.photo} alt={player.name} fill sizes="64px" className="object-cover object-[50%_30%]" />
          </li>
        ))}
      </ul>
      <button type="button" onClick={onStart} className="btn btn-light mt-8 w-full sm:w-auto sm:px-12">
        Start
      </button>
    </div>
  );
}

function Game({ initial, onAgain }: { initial: GameState; onAgain: () => void }) {
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
    if (winner) track("who_is_better_finished", { winner: winner.slug, beaten: game.eliminated.length });
  }, [winner, game.eliminated.length]);

  if (winner) {
    return <ResultScreen winner={winner} beaten={game.eliminated} onAgain={onAgain} />;
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
          className="object-cover object-[50%_40%] transition-transform duration-[var(--duration-large)] ease-out group-enabled:group-hover:scale-[1.03]"
          
        />
      </span>
      <span className="mt-3 block min-h-14">
        {player.firstName ? <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-mute-dark">{player.firstName}</span> : null}
        <span className="type-display block text-[clamp(1.9rem,8.5vw,3.25rem)]">{player.name}</span>
      </span>
    </button>
  );
}

function ResultScreen({ winner, beaten, onAgain }: { winner: Contender; beaten: Contender[]; onAgain: () => void }) {
  const [shared, setShared] = useState<"idle" | "copied">("idle");
  // The order they knocked the others out, so the card (and the link preview) lists it.
  const code = encodeOrder(beaten.map((player) => player.slug), winner.slug);
  const cardUrl = `/api/play/card/${winner.slug}/post${code ? `?o=${code}` : ""}`;

  const share = useCallback(async () => {
    const url = `${window.location.origin}/play/who-is-better/pick/${winner.slug}${code ? `/${code}` : ""}`;
    const text = shareText(winner, beaten.length);
    track("who_is_better_shared", { winner: winner.slug });
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
  }, [winner, beaten.length, code]);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-8 text-center sm:pt-12">
      <p className="type-overline text-mute-dark">Your ultimate player</p>
      {/* The card people share, shown as it will look (rendered on the server). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a server-rendered share card, already sized */}
      <img src={cardUrl} width={1080} height={1350} alt={`${winner.name}: my ultimate player. I knocked out the other ${beaten.length}.`} className="play-arrive mx-auto mt-4 aspect-[4/5] w-full max-w-xs bg-ink-2" />
      <p className="mt-4 text-sm leading-relaxed text-mute-dark">Knocked out: {beaten.map((p) => p.name).join(" · ")}</p>

      <div className="mt-6 grid gap-3">
        <button type="button" onClick={share} className="btn btn-light">
          {shared === "copied" ? "Copied. Now send it" : "Share my player"}
        </button>
        <a href={cardUrl} download={`my-ultimate-player-${winner.slug}.jpg`} className="btn btn-outline">
          Save the card
        </a>
        {winner.debateSlug ? (
          <Link href={`/${winner.debateSlug}`} className="btn btn-outline">
            Vote: {winner.debateTitle}
          </Link>
        ) : null}
        <button type="button" onClick={onAgain} className="btn btn-outline">
          Play again in a new order
        </button>
      </div>
      <AdSlot placement="editorial" className="mt-6 !px-0" />
    </div>
  );
}
