"use client";

import { useEffect, useState } from "react";

import { getOption } from "@/lib/debates";
import { formatPercent } from "@/lib/format";
import { optionPercentages } from "@/lib/results";

import { useDebate } from "./debate-provider";

type Format = "story" | "post";

const FORMATS: { id: Format; label: string; hint: string; ratio: string }[] = [
  { id: "story", label: "Story", hint: "9:16, for Instagram, WhatsApp, TikTok and Snapchat stories", ratio: "aspect-[9/16]" },
  { id: "post", label: "Post", hint: "4:5, for feed posts and X", ratio: "aspect-[4/5]" },
];

type LoadedCard = { src: string; url: string; file: File } | { src: string; error: true };

/**
 * Personal share card. The image is generated server-side from live totals;
 * we fetch it once and reuse the same bytes for the preview, the download
 * and the native share sheet (which must open within the tap, so the file
 * has to be ready beforehand).
 */
export function SharePanel() {
  const { debate, siteUrl, results, vote } = useDebate();
  const option = vote.choice ? getOption(debate, vote.choice) : undefined;
  const [format, setFormat] = useState<Format>("story");
  const [card, setCard] = useState<LoadedCard | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const src = option ? `/api/card/${debate.slug}/${option.slug}/${format}` : null;
  const filename = option ? `whoisthegoat-${option.slug}-${format}.png` : "whoisthegoat.png";

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setCard({ src, url: objectUrl, file: new File([blob], filename, { type: "image/png" }) });
      })
      .catch(() => {
        if (!cancelled) setCard({ src, error: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, filename]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!option || !src) return null;

  const current = card && card.src === src ? card : null;
  const ready = current && "file" in current ? current : null;
  const failed = Boolean(current && "error" in current);

  const index = debate.options.findIndex((o) => o.slug === option.slug);
  const percent = results && results.total > 0 ? optionPercentages(results.options, debate.options.map((o) => o.slug))[index] : null;
  const shareUrl = `${siteUrl}/${debate.slug}/share/${option.slug}`;
  const shareText =
    percent !== null
      ? `I voted ${option.shortName}. ${formatPercent(percent)} of the world agrees. Who’s your GOAT?`
      : `I voted ${option.shortName}. Who’s your GOAT?`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setNotice("Link copied");
    } catch {
      setNotice("Couldn’t copy. Long-press the card to save it instead.");
    }
  }

  async function share() {
    try {
      if (ready && navigator.canShare?.({ files: [ready.file] })) {
        await navigator.share({ files: [ready.file], text: `${shareText} ${shareUrl}` });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: debate.question, text: shareText, url: shareUrl });
        return;
      }
      await copyLink();
    } catch (error) {
      if ((error as Error).name !== "AbortError") await copyLink();
    }
  }

  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const activeFormat = FORMATS.find((f) => f.id === format) ?? FORMATS[0];

  return (
    <section id="share" aria-labelledby="share-title" className="bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
        <div className="flex flex-col">
          <h2 id="share-title" className="type-title">
            Share your vote
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-ink/75">
            Your pick, and how much of the world agrees with you, on one card. Made for your story or the group chat.
          </p>

          <fieldset className="mt-8">
            <legend className="type-label text-mute">Card size</legend>
            <div className="mt-2 inline-flex border border-ink">
              {FORMATS.map((f) => (
                <label
                  key={f.id}
                  className={`flex h-11 cursor-pointer items-center px-5 text-sm font-semibold transition-colors duration-[var(--duration-micro)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${format === f.id ? "bg-ink text-white" : "text-ink hover:bg-paper-2"}`}
                >
                  <input
                    type="radio"
                    name="card-format"
                    value={f.id}
                    checked={format === f.id}
                    onChange={() => setFormat(f.id)}
                    className="sr-only"
                  />
                  {f.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-mute">{activeFormat.hint}</p>
          </fieldset>

          <div className="mt-8 grid gap-3 sm:max-w-md sm:grid-cols-2">
            <button type="button" onClick={share} className="btn btn-dark h-13">
              <ShareIcon />
              Share card
            </button>
            <a href={ready?.url ?? src} download={filename} className="btn btn-outline h-13 text-ink">
              <DownloadIcon />
              Download
            </a>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 text-sm font-semibold">
            <button type="button" onClick={copyLink} className="link inline-flex min-h-11 items-center">
              Copy link
            </button>
            <a href={xHref} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
              Post on X
            </a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
              WhatsApp
            </a>
            <span role="status" className="font-normal text-mute">
              {notice ? <span className="animate-enter inline-block">{notice}</span> : null}
            </span>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-[20rem] lg:max-w-none">
          <div className={`relative w-full overflow-hidden bg-ink ${activeFormat.ratio}`}>
            {ready ? (
              // eslint-disable-next-line @next/next/no-img-element -- generated PNG served as a blob URL
              <img
                key={ready.url}
                src={ready.url}
                alt={`Share card: I voted ${option.name}. ${percent !== null ? `${formatPercent(percent)} of the world agrees.` : ""}`}
                className="size-full object-cover [animation:fade-in_var(--duration-ui)_var(--ease-out)_both]"
              />
            ) : failed ? (
              <div className="grid size-full place-items-center p-6 text-center text-sm text-mute-dark">
                The card couldn’t be made just now. Try again in a moment.
              </div>
            ) : (
              <div className="skeleton-dark size-full" aria-label="Making your card" role="img" />
            )}
          </div>
          <figcaption className="mt-3 text-sm text-mute">Figures on the card refresh every minute.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 10V2M5 5l3-3 3 3M3 8v6h10V8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 2v8M5 7l3 3 3-3M3 14h10" />
    </svg>
  );
}
