"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { Board, readBest, SubmitScore, touchStreak, useBest, useStreakLine, writeBest } from "@/components/play/high-scores";
import { QUIZ_GAME } from "@/lib/play/scores";
import { type Asked, buildRound, type Figure, FIGURES, pointsFor, quizRank, quizShareLine, ROUND_SIZE, TIME_LIMIT_SECONDS } from "@/lib/play/quiz";

const SEEN_KEY = "goat-seen";

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
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Private windows can refuse storage. The quiz works without it.
  }
}

/** A player's best round on this device. */
const figureKey = (slug: string) => `goat-best-${slug}`;

function readFigureBest(slug: string): number {
  try {
    const value = Number(localStorage.getItem(figureKey(slug)));
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeFigureBest(slug: string, points: number) {
  try {
    if (points > readFigureBest(slug)) localStorage.setItem(figureKey(slug), String(points));
  } catch {
    // Fine.
  }
}

function useFigureBest(slug: string): number {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener("storage", listener);
      return () => window.removeEventListener("storage", listener);
    },
    () => readFigureBest(slug),
    () => 0,
  );
}

type Screen = { kind: "pick" } | { kind: "round"; id: number; figure: Figure; round: Asked[] };

export function KnowYourGoats() {
  const [screen, setScreen] = useState<Screen>({ kind: "pick" });

  const start = useCallback((figure: Figure) => {
    const seen = readSeen();
    const round = buildRound(figure.slug, Math.random, seen);
    writeSeen(new Set([...seen, ...round.map((asked) => asked.question.id)]));
    track("goat_quiz_started", { figure: figure.slug });
    setScreen((previous) => ({ kind: "round", id: previous.kind === "round" ? previous.id + 1 : 1, figure, round }));
  }, []);

  if (screen.kind === "pick") return <PickScreen onPick={start} />;
  return <Round key={screen.id} figure={screen.figure} round={screen.round} onAgain={() => start(screen.figure)} onPickAnother={() => setScreen({ kind: "pick" })} />;
}

function FigureTile({ figure, onPick }: { figure: Figure; onPick: (figure: Figure) => void }) {
  const best = useFigureBest(figure.slug);
  return (
    <li>
      <button type="button" onClick={() => onPick(figure)} className="group relative block aspect-[4/5] w-full overflow-hidden bg-ink-2 text-left">
        <Image src={figure.photo} alt="" fill sizes="(min-width: 640px) 270px, 46vw" className="object-cover object-[50%_30%] transition-transform duration-[var(--duration-large)] group-hover:scale-[1.03]" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent px-3 pb-3 pt-10">
          <span className="block text-xs font-semibold tracking-wide uppercase" style={{ color: figure.color }}>
            {figure.sport}
          </span>
          <span className="type-headline block text-xl leading-tight sm:text-2xl">{figure.name}</span>
          <span className="tabular block text-xs text-mute-dark">{best > 0 ? `Your best: ${best.toLocaleString("en")}` : "Not played yet"}</span>
        </span>
        <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: figure.color }} />
      </button>
    </li>
  );
}

function PickScreen({ onPick }: { onPick: (figure: Figure) => void }) {
  const best = useBest(QUIZ_GAME);
  const streakLine = useStreakLine();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-16">
      <h1 className="type-headline text-[min(2.6rem,10vw)] sm:text-6xl">Know your GOATs</h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-mute-dark">
        Pick a player. {ROUND_SIZE} questions, {TIME_LIMIT_SECONDS} seconds each, in a different order every time. Harder questions and quicker answers score more.
      </p>
      {best > 0 ? (
        <p className="tabular mt-5 font-semibold">Your high score: {best.toLocaleString("en")} points</p>
      ) : null}
      {streakLine ? <p className="mt-1 text-sm text-warning">{streakLine}</p> : null}
      <h2 className="type-overline mt-8 text-mute-dark">Who do you know best?</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {FIGURES.map((figure) => (
          <FigureTile key={figure.slug} figure={figure} onPick={onPick} />
        ))}
      </ul>
      <Board game={QUIZ_GAME} limit={10} />
    </div>
  );
}

type Result = { right: boolean; points: number };

function Round({ figure, round, onAgain, onPickAnother }: { figure: Figure; round: Asked[]; onAgain: () => void; onPickAnother: () => void }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  // Their high score going in, to tell whether this round beats it.
  const [bestBefore] = useState(() => readBest(QUIZ_GAME));
  const [figureBest] = useState(() => readFigureBest(figure.slug));

  const total = round.length;
  const points = results.reduce((sum, r) => sum + r.points, 0);
  const done = index >= total;

  useEffect(() => {
    if (!done) return;
    track("goat_quiz_finished", { figure: figure.slug, points });
    writeBest(QUIZ_GAME, points);
    writeFigureBest(figure.slug, points);
    touchStreak();
  }, [done, figure.slug, points]);

  if (done) {
    return <Finished figure={figure} points={points} right={results.filter((r) => r.right).length} total={total} bestBefore={bestBefore} figureBest={figureBest} onAgain={onAgain} onPickAnother={onPickAnother} />;
  }

  return (
    <QuestionView
      key={index}
      asked={round[index]}
      figure={figure}
      index={index}
      total={total}
      points={points}
      best={Math.max(bestBefore, points)}
      onAnswered={(result) => setResults((list) => [...list, result])}
      onNext={() => setIndex((i) => i + 1)}
    />
  );
}

const LEVEL_LABEL = { 1: "Easy", 2: "Medium", 3: "Hard" } as const;

function QuestionView({ asked, figure, index, total, points, best, onAnswered, onNext }: { asked: Asked; figure: Figure; index: number; total: number; points: number; best: number; onAnswered: (result: Result) => void; onNext: () => void }) {
  const { question, options } = asked;
  const [picked, setPicked] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [earned, setEarned] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const answered = picked !== null || timedOut;

  // The clock starts when the question appears and stops when it is answered.
  useEffect(() => {
    startedAt.current = performance.now();
    const timer = window.setInterval(() => {
      const ms = performance.now() - startedAt.current;
      if (ms >= TIME_LIMIT_SECONDS * 1000) {
        window.clearInterval(timer);
        setElapsed(TIME_LIMIT_SECONDS * 1000);
        setTimedOut((was) => was || true);
      } else {
        setElapsed(ms);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  // A timeout counts as a wrong answer, once.
  const reported = useRef(false);
  useEffect(() => {
    if (timedOut && picked === null && !reported.current) {
      reported.current = true;
      onAnswered({ right: false, points: 0 });
    }
  }, [timedOut, picked, onAnswered]);

  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  const answer = (option: string, now: number) => {
    if (answered) return;
    const ms = now - startedAt.current;
    const right = option === question.answer;
    const gained = right ? pointsFor(question.level, ms) : 0;
    reported.current = true;
    setPicked(option);
    setEarned(gained);
    setElapsed(ms);
    onAnswered({ right, points: gained });
  };

  const left = Math.max(0, 1 - elapsed / (TIME_LIMIT_SECONDS * 1000));
  const lastQuestion = index + 1 === total;

  return (
    <div className="mx-auto max-w-xl px-3 pb-10 pt-5 sm:px-6 sm:pt-10">
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-overline text-white">
          {index + 1} of {total} · {LEVEL_LABEL[question.level]}
        </p>
        <p className="type-label tabular text-mute-dark">
          {points.toLocaleString("en")} pts
          {best > 0 ? ` · Best ${best.toLocaleString("en")}` : ""}
        </p>
      </div>
      <div className="mt-2 h-1.5 bg-white/15" role="progressbar" aria-label="Time left" aria-valuemin={0} aria-valuemax={TIME_LIMIT_SECONDS} aria-valuenow={Math.ceil(left * TIME_LIMIT_SECONDS)}>
        <div className="h-full" style={{ width: `${left * 100}%`, background: left > 0.33 ? figure.color : "var(--color-error)", transition: "width 100ms linear" }} />
      </div>

      <h2 className="type-headline mt-5 min-h-[5.5rem] text-2xl leading-tight sm:text-3xl">{question.question}</h2>

      <div className="mt-4 grid gap-2" role="group" aria-label="Pick the answer">
        {options.map((option) => {
          const isAnswer = option === question.answer;
          const state = !answered ? "idle" : isAnswer ? "right" : option === picked ? "wrong" : "dim";
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => answer(option, performance.now())}
              className={
                "min-h-14 border-2 px-4 py-3 text-left text-base font-semibold leading-tight transition-colors duration-[var(--duration-micro)] " +
                (state === "idle" ? "border-white/30 text-white hover:border-white" : "") +
                (state === "right" ? "border-white bg-white text-ink" : "") +
                (state === "wrong" ? "border-error text-error line-through" : "") +
                (state === "dim" ? "border-white/10 text-mute-dark" : "")
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-24 text-center" role="status" aria-live="polite">
        {answered ? (
          <>
            <p className="type-headline text-2xl">{picked === question.answer ? `+${earned} points` : timedOut && picked === null ? "Time's up" : "Not quite"}</p>
            <p className="mt-1 text-sm leading-relaxed text-mute-dark">{question.fact}</p>
          </>
        ) : null}
      </div>
      <button ref={nextRef} type="button" onClick={onNext} disabled={!answered} className="btn btn-light mt-2 w-full disabled:opacity-0">
        {lastQuestion ? "See my score" : "Next"}
      </button>
    </div>
  );
}

function Finished({ figure, points, right, total, bestBefore, figureBest, onAgain, onPickAnother }: { figure: Figure; points: number; right: number; total: number; bestBefore: number; figureBest: number; onAgain: () => void; onPickAnother: () => void }) {
  const [shared, setShared] = useState<"idle" | "copied">("idle");
  const [posted, setPosted] = useState<string | null>(null);
  const [boardKey, setBoardKey] = useState(0);
  const isNewBest = points > bestBefore;
  const rank = quizRank(points);
  const toBeat = Math.max(bestBefore, figureBest) - points;

  const share = useCallback(async () => {
    const url = `${window.location.origin}/play/know-your-goats`;
    const text = quizShareLine(points, figure);
    track("goat_quiz_shared", { figure: figure.slug, points });
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
  }, [points, figure]);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-10 text-center sm:pt-16">
      <p className="type-overline" style={{ color: figure.color }}>
        {figure.name}
      </p>
      <h1 className="type-headline mt-2 text-5xl text-warning sm:text-6xl">{rank}</h1>
      <p className="type-display tabular mt-2 text-8xl">{points.toLocaleString("en")}</p>
      <p className="tabular text-mute-dark">
        points · {right} of {total} right
      </p>
      <p className="tabular mt-3 font-semibold">{isNewBest ? "New high score!" : `Your high score: ${bestBefore.toLocaleString("en")} points`}</p>
      {!isNewBest && toBeat > 0 ? <p className="mt-1 text-sm text-mute-dark">{toBeat.toLocaleString("en")} points short. One more go?</p> : null}
      {isNewBest && points > 0 ? (
        <SubmitScore
          game={QUIZ_GAME}
          score={points}
          onSent={(name) => {
            setPosted(name);
            setBoardKey((key) => key + 1);
          }}
        />
      ) : null}
      <Board game={QUIZ_GAME} refresh={boardKey} highlight={posted ?? undefined} />
      <div className="mt-6 grid gap-3">
        <button type="button" onClick={onAgain} className="btn btn-light">
          Play {figure.name} again
        </button>
        <button type="button" onClick={share} className="btn btn-outline">
          {shared === "copied" ? "Copied. Now send it" : "Challenge a friend"}
        </button>
        <button type="button" onClick={onPickAnother} className="btn btn-outline">
          Pick another GOAT
        </button>
        <Link href={`/${figure.debateSlug}`} className="btn btn-outline">
          Vote: {figure.debateTitle}
        </Link>
      </div>
      <AdSlot placement="editorial" className="mt-6 !px-0" />
    </div>
  );
}
