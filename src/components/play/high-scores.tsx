"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { cleanName, countryName, formatScore, inCountry, GAMES, GUESS_GAME, NAME_MAX, parseBoard, type GameSlug, type ScoreResponse, type ScoreRow } from "@/lib/play/scores";

const NAME_KEY = "guess-name";

/** Where each game's high score lives on this device. Who is that? keeps its original key. */
const bestKey = (game: GameSlug) => (game === GUESS_GAME ? "guess-best" : `best-${game}`);

/** This player's best score in a game on this device, or 0. */
export function readBest(game: GameSlug): number {
  try {
    const value = Number(localStorage.getItem(bestKey(game)));
    return Number.isInteger(value) && value > 0 && value <= GAMES[game].max ? value : 0;
  } catch {
    return 0;
  }
}

export function writeBest(game: GameSlug, score: number) {
  try {
    if (score > readBest(game)) localStorage.setItem(bestKey(game), String(score));
  } catch {
    // Private windows can refuse storage. The game works without it.
  }
}

const subscribeToStorage = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};

/** This device's high score, read after hydration so the server's page and the browser's agree. */
export function useBest(game: GameSlug): number {
  return useSyncExternalStore(
    subscribeToStorage,
    () => readBest(game),
    () => 0,
  );
}

function readName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Not saving a name is fine.
  }
}

// ---------------------------------------------------------------------------
// Daily streak: the number of days in a row this device has finished a game.
// ---------------------------------------------------------------------------

const STREAK_KEY = "play-streak";

function today(): string {
  return new Date().toLocaleDateString("en-CA"); // 2026-11-12, in the player's own time zone
}

function dayBefore(day: string): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString("en-CA");
}

type Streak = { last: string; count: number };

function readStreak(): Streak | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STREAK_KEY) ?? "null");
    if (parsed && typeof parsed === "object" && typeof (parsed as Streak).last === "string" && Number.isInteger((parsed as Streak).count)) return parsed as Streak;
  } catch {
    // Treated as no streak.
  }
  return null;
}

/** Records that a game was finished today, and returns the streak: today's if kept going, or a fresh 1. */
export function touchStreak(): number {
  const now = today();
  const streak = readStreak();
  if (streak?.last === now) return streak.count;
  const count = streak?.last === dayBefore(now) ? streak.count + 1 : 1;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ last: now, count }));
  } catch {
    // Not saving the streak is fine.
  }
  return count;
}

/** What the start screen says about the streak: how long it is, and whether today still needs playing. Empty when there is none. */
export function useStreakLine(): string {
  return useSyncExternalStore(
    subscribeToStorage,
    () => {
      const streak = readStreak();
      if (!streak) return "";
      const now = today();
      if (streak.last === now) return `${streak.count}-day streak. Come back tomorrow to keep it.`;
      if (streak.last === dayBefore(now)) return `${streak.count}-day streak. Play today to keep it.`;
      return "";
    },
    () => "",
  );
}

// ---------------------------------------------------------------------------
// The board
// ---------------------------------------------------------------------------

/** The visitor's country, asked for once per tab. Null when the network can't say. */
function useCountry(): string | null {
  const [country, setCountry] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const cached = sessionStorage.getItem("play-country");
      if (cached) {
        queueMicrotask(() => !cancelled && setCountry(cached));
        return () => {
          cancelled = true;
        };
      }
    } catch {
      // Ask the network instead.
    }
    fetch("/api/play/country")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { country?: unknown } | null) => {
        if (cancelled || typeof data?.country !== "string") return;
        setCountry(data.country);
        try {
          sessionStorage.setItem("play-country", data.country);
        } catch {
          // Fine.
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return country;
}

/** The top players, best first: the world, or the visitor's own country. `refresh` changes when a new score has just been sent. */
export function Board({ game, refresh = 0, limit = 10, highlight }: { game: GameSlug; refresh?: number; limit?: number; highlight?: string }) {
  const country = useCountry();
  const [scope, setScope] = useState<"world" | "country">("world");
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const path = scope === "country" && country ? `/api/play/scores/${game}/${country}` : `/api/play/scores/${game}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { scores?: unknown }) => {
        setRows(parseBoard(data.scores));
        setFailed(false);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
      });
    return () => controller.abort();
  }, [path, refresh]);

  if (failed) return null;
  return (
    <section aria-labelledby={`board-${game}`} className="mt-8 text-left">
      <h2 id={`board-${game}`} className="type-overline text-center text-mute-dark">
        Top players
      </h2>
      {country ? (
        <div className="mt-3 flex justify-center gap-2" role="group" aria-label="Which board">
          {(["world", "country"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={scope === option}
              onClick={() => {
                setRows(null);
                setScope(option);
              }}
              className={"min-h-9 border px-3 text-sm font-semibold " + (scope === option ? "border-white bg-white text-ink" : "border-white/30 text-white")}
            >
              {option === "world" ? "World" : countryName(country)}
            </button>
          ))}
        </div>
      ) : null}
      {rows === null ? (
        <p className="mt-3 text-center text-sm text-mute-dark">Loading the board…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-center text-sm text-mute-dark">No scores yet. Be the first on the board.</p>
      ) : (
        <ol className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {rows.slice(0, limit).map((row, index) => (
            <li key={`${index}-${row.name}`} className={"flex items-baseline gap-3 py-2 " + (highlight && row.name === highlight ? "text-warning" : "")}>
              <span className="tabular w-6 text-right text-sm text-mute-dark">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{row.name}</span>
              <span className="tabular font-semibold">{formatScore(game, row.score)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

type Sending = "idle" | "sending" | "sent" | "error";

/**
 * Shown after a new personal best: put your name on the board. Only a best is ever sent, and the server keeps
 * only a player's highest, so this can't lower anyone's mark. Afterwards it says where they rank, in the world
 * and in their country.
 */
export function SubmitScore({ game, score, run, onSent }: { game: GameSlug; score: number; run?: string | null; onSent: (name: string) => void }) {
  const saved = useSyncExternalStore(subscribeToStorage, readName, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const name = typed ?? saved;
  const [state, setState] = useState<Sending>("idle");
  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState<{ rank: number; country: string | null; countryRank: number | null } | null>(null);

  const send = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const cleaned = cleanName(name);
      if (!cleaned) {
        setState("error");
        setMessage(`Use 2 to ${NAME_MAX} letters or numbers. Keep it clean.`);
        return;
      }
      setState("sending");
      try {
        const response = await fetch("/api/play/score", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ game, score, run, name: cleaned }),
        });
        const result = (await response.json()) as ScoreResponse;
        if (response.ok && (result.status === "new_best" || result.status === "not_higher")) {
          writeName(cleaned);
          setPlacing({ rank: result.rank, country: result.country, countryRank: result.countryRank });
          setState("sent");
          track("play_score_posted", { game, score });
          onSent(cleaned);
        } else {
          setState("error");
          setMessage("message" in result ? result.message : "Couldn’t send your score. Try again.");
        }
      } catch {
        setState("error");
        setMessage("Couldn’t reach the leaderboard. Try again.");
      }
    },
    [name, game, score, run, onSent],
  );

  if (state === "sent" && placing) {
    return (
      <div className="mt-4 font-semibold text-warning">
        <p>You rank #{placing.rank} in the world.</p>
        {placing.country && placing.countryRank ? <p>You rank #{placing.countryRank} {inCountry(placing.country)}.</p> : null}
      </div>
    );
  }
  return (
    <form onSubmit={send} className="mt-4 text-left">
      <label htmlFor="player-name" className="block text-center text-sm text-mute-dark">
        Put your name on the leaderboard:
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="player-name"
          value={name}
          onChange={(event) => setTyped(event.target.value)}
          maxLength={NAME_MAX}
          autoComplete="nickname"
          placeholder="Your name"
          className="min-h-12 min-w-0 flex-1 border-2 border-white/30 bg-transparent px-3 text-base text-white placeholder:text-mute-dark focus:border-white focus:outline-none"
        />
        <button type="submit" disabled={state === "sending"} className="btn btn-light !w-auto px-5">
          {state === "sending" ? "Sending…" : "Post"}
        </button>
      </div>
      {state === "error" ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {message}
        </p>
      ) : null}
    </form>
  );
}
