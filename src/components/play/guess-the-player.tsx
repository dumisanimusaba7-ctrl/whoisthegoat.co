"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { buildQuestions, encodeRun, QUESTIONS_PER_GAME, ratingFor, rankFor, shareLine, SILHOUETTES, type Played, type Question, type Silhouette } from "@/lib/play/guess";

/** Silhouettes this browser has already been asked, so a rematch leads with new ones. */
const SEEN_KEY = "guess-seen";

function readSeen(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>) {
  try {
    // Once everything has been seen, start the cycle again.
    const all = seen.size >= SILHOUETTES.length ? new Set<string>() : seen;
    localStorage.setItem(SEEN_KEY, JSON.stringify([...all]));
  } catch {
    // Private windows can refuse storage. The game works without it.
  }
}

type Screen = { kind: "start" } | { kind: "game"; id: number; questions: Question[] };

export function GuessThePlayer() {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });

  const start = useCallback(() => {
    const questions = buildQuestions(Math.random, SILHOUETTES, readSeen());
    track("guess_started", { rounds: questions.length, bank: SILHOUETTES.length });
    writeSeen(new Set([...readSeen(), ...questions.map((q) => q.silhouette.id)]));
    setScreen((previous) => ({ kind: "game", id: previous.kind === "game" ? previous.id + 1 : 1, questions }));
  }, []);

  if (screen.kind === "start") return <StartScreen onStart={start} />;
  return <Game key={screen.id} questions={screen.questions} onAgain={start} />;
}

/** The outline, drawn by masking a block of colour with the transparent PNG. It fades out at the bottom edge. */
function Outline({ silhouette, revealed }: { silhouette: Silhouette; revealed: boolean }) {
  const url = `url(${silhouette.image.src})`;
  const style: CSSProperties = {
    backgroundColor: revealed ? silhouette.color : "var(--color-ink)",
    maskImage: `${url}, linear-gradient(#000 86%, transparent)`,
    WebkitMaskImage: `${url}, linear-gradient(#000 86%, transparent)`,
    maskSize: "contain, 100% 100%",
    WebkitMaskSize: "contain, 100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center bottom, 0 0",
    WebkitMaskPosition: "center bottom, 0 0",
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
    transition: "background-color 700ms ease",
  };
  return (
    <div role="img" aria-label={revealed ? `${silhouette.player}: ${silhouette.celebration}` : "A footballer's celebration as a black silhouette"} className="relative h-full w-full" style={style}>
      {silhouette.hands ? (
        // Light lines for hands in front of the body, drawn in the same box as the outline so they line up.
        // eslint-disable-next-line @next/next/no-img-element -- a small decorative line drawing
        <img src={silhouette.hands.src} alt="" className="absolute inset-0 h-full w-full object-contain object-bottom" />
      ) : null}
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center sm:py-16">
      <h1 className="type-headline text-[min(2.6rem,10vw)] sm:text-6xl">Who is that?</h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-mute-dark">
        {QUESTIONS_PER_GAME} famous celebrations, cut down to a black outline. Name the player from the pose alone. The wrong answers look like the right one, so the pose has to do the work.
      </p>
      <div className="mx-auto mt-8 grid max-w-sm grid-cols-5 gap-2" aria-hidden="true">
        {SILHOUETTES.slice(0, 5).map((s) => (
          <div key={s.id} className="aspect-[3/4] bg-paper p-1">
            <Outline silhouette={s} revealed={false} />
          </div>
        ))}
      </div>
      <button type="button" onClick={onStart} className="btn btn-light mt-8 w-full sm:w-auto sm:px-12">
        Start
      </button>
    </div>
  );
}

function Game({ questions, onAgain }: { questions: Question[]; onAgain: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [played, setPlayed] = useState<Played[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);

  const total = questions.length;
  const done = index >= total;
  const question = questions[Math.min(index, total - 1)];
  const correct = picked !== null && picked === question.silhouette.player;

  useEffect(() => {
    if (picked !== null) nextRef.current?.focus({ preventScroll: true });
      nextRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [picked]);

  useEffect(() => {
    if (done) track("guess_finished", { score, total });
  }, [done, score, total]);

  const answer = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    setPlayed((list) => [...list, { id: question.silhouette.id, right: name === question.silhouette.player }]);
    if (name === question.silhouette.player) {
      setScore((s) => s + 1);
      setStreak((s) => {
        setBestStreak((b) => Math.max(b, s + 1));
        return s + 1;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  if (done) return <Result score={score} total={total} bestStreak={bestStreak} played={played} onAgain={onAgain} />;

  return (
    <div className="mx-auto max-w-xl px-3 pb-10 pt-5 sm:px-6 sm:pt-10">
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-overline text-white">
          {index + 1} of {total}
        </p>
        <p className="type-label tabular text-mute-dark">
          Score {score}
          {streak >= 2 ? ` · ${streak} in a row` : ""}
        </p>
      </div>
      <div className="mt-2 h-1 bg-white/15" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index}>
        <div className="h-full bg-white transition-[width] duration-[var(--duration-large)] ease-out" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <h2 className="sr-only">Who is that?</h2>
      <div className="mt-4 h-[min(36vh,320px)] bg-paper px-4 pt-4">
        <Outline key={question.silhouette.id} silhouette={question.silhouette} revealed={picked !== null} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3" role="group" aria-label="Pick the player">
        {question.options.map((name) => {
          const isAnswer = name === question.silhouette.player;
          const state = picked === null ? "idle" : isAnswer ? "right" : name === picked ? "wrong" : "dim";
          return (
            <button
              key={name}
              type="button"
              disabled={picked !== null}
              onClick={() => answer(name)}
              className={
                "min-h-14 border-2 px-3 py-3 text-base font-semibold leading-tight transition-colors duration-[var(--duration-micro)] " +
                (state === "idle" ? "border-white/30 text-white hover:border-white" : "") +
                (state === "right" ? "border-white bg-white text-ink" : "") +
                (state === "wrong" ? "border-error text-error line-through" : "") +
                (state === "dim" ? "border-white/10 text-mute-dark" : "")
              }
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-32" role="status" aria-live="polite">
        {picked !== null ? (
          <div className="text-center">
            <p className="type-headline text-2xl">{correct ? "Yes!" : `It's ${question.silhouette.player}`}</p>
            <p className="mt-1 font-semibold">{question.silhouette.celebration}</p>
            <p className="mt-1 text-sm leading-relaxed text-mute-dark">{question.silhouette.fact}</p>
            <a href={question.silhouette.source.url} target="_blank" rel="noopener noreferrer" className="link mt-2 inline-block text-sm">
              See the original photo ({question.silhouette.source.name})
            </a>
          </div>
        ) : null}
      </div>
      <button ref={nextRef} type="button" onClick={next} disabled={picked === null} className="btn btn-light mt-2 w-full disabled:opacity-0">
        {index + 1 === total ? "See my score" : "Next"}
      </button>
    </div>
  );
}

function Result({ score, total, bestStreak, played, onAgain }: { score: number; total: number; bestStreak: number; played: Played[]; onAgain: () => void }) {
  const [shared, setShared] = useState<"idle" | "copied">("idle");
  const rank = rankFor(score, total);
  // The card lists the 20 outlines played, the ones guessed right in colour.
  const code = encodeRun(played);
  const cardUrl = `/api/play/shadow/${score}/post${code ? `?r=${code}` : ""}`;

  const share = useCallback(async () => {
    const url = `${window.location.origin}/play/guess-the-player/score/${score}`;
    const text = shareLine(score, total);
    track("guess_shared", { score });
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
  }, [score, total]);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-8 text-center sm:pt-12">
      <p className="type-overline text-mute-dark">Your rank</p>
      {/* The card people share, shown as it will look (rendered on the server). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a server-rendered share card, already sized */}
      <img src={cardUrl} width={1080} height={1350} alt={`${rank}: ${score} out of ${total} celebrations named.`} className="play-arrive mx-auto mt-4 aspect-[4/5] w-full max-w-xs bg-ink-2" />
      <p className="mt-4 leading-relaxed">{ratingFor(score, total)}</p>
      {bestStreak >= 2 ? <p className="mt-1 text-sm text-mute-dark">Best run: {bestStreak} in a row</p> : null}
      <div className="mt-6 grid gap-3">
        <button type="button" onClick={share} className="btn btn-light">
          {shared === "copied" ? "Copied. Now send it" : "Challenge a friend"}
        </button>
        <a href={cardUrl} download={`shadow-master-${score}-of-${total}.jpg`} className="btn btn-outline">
          Save the card
        </a>
        <button type="button" onClick={onAgain} className="btn btn-outline">
          Rematch with new silhouettes
        </button>
      </div>
      <AdSlot placement="editorial" className="mt-6 !px-0" />
    </div>
  );
}
