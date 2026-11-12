"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { QUESTIONS_PER_GAME } from "@/lib/play/guess";
import { cleanName, NAME_MAX, parseBoard, type ScoreResponse, type ScoreRow } from "@/lib/play/scores";

const BEST_KEY = "guess-best";
const NAME_KEY = "guess-name";

/** This player's best score on this device, or 0. */
export function readBest(): number {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isInteger(value) && value > 0 && value <= QUESTIONS_PER_GAME ? value : 0;
  } catch {
    return 0;
  }
}

export function writeBest(score: number) {
  try {
    if (score > readBest()) localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private windows can refuse storage. The game works without it.
  }
}

const subscribeToStorage = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};

/** This device's high score, read after hydration so the server's page and the browser's agree. */
export function useBest(): number {
  return useSyncExternalStore(subscribeToStorage, readBest, () => 0);
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

/** The top players, best first. `refresh` changes when a new score has just been sent, to read the board again. */
export function Board({ refresh = 0, limit = 10, highlight }: { refresh?: number; limit?: number; highlight?: string }) {
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/play/scores", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { scores?: unknown }) => {
        setRows(parseBoard(data.scores));
        setFailed(false);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
      });
    return () => controller.abort();
  }, [refresh]);

  if (failed) return null;
  return (
    <section aria-labelledby="board-title" className="mt-8 text-left">
      <h2 id="board-title" className="type-overline text-center text-mute-dark">
        Top players
      </h2>
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
              <span className="tabular font-semibold">
                {row.score}
                <span className="text-mute-dark">/{QUESTIONS_PER_GAME}</span>
              </span>
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
 * only a player's highest, so this can't lower anyone's mark.
 */
export function SubmitScore({ score, run, onSent }: { score: number; run: string | null; onSent: (name: string) => void }) {
  const saved = useSyncExternalStore(subscribeToStorage, readName, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const name = typed ?? saved;
  const setName = setTyped;
  const [state, setState] = useState<Sending>("idle");
  const [message, setMessage] = useState("");
  const [rank, setRank] = useState<number | null>(null);

  const send = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const cleaned = cleanName(name);
      if (!cleaned) {
        setState("error");
        setMessage(`Use 2 to ${NAME_MAX} letters or numbers. Keep it clean.`);
        return;
      }
      if (!run) return;
      setState("sending");
      try {
        const response = await fetch("/api/play/score", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ score, run, name: cleaned }),
        });
        const result = (await response.json()) as ScoreResponse;
        if (response.ok && (result.status === "new_best" || result.status === "not_higher")) {
          writeName(cleaned);
          setRank(result.rank);
          setState("sent");
          track("guess_score_posted", { score });
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
    [name, run, score, onSent],
  );

  if (state === "sent") {
    return <p className="mt-4 font-semibold text-warning">{rank ? `You are number ${rank} on the leaderboard.` : "You are on the leaderboard."}</p>;
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
          onChange={(event) => setName(event.target.value)}
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
