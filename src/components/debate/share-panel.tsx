"use client";

import { useEffect, useState, type ReactNode } from "react";

import { getOption } from "@/lib/debates";
import { formatPercent } from "@/lib/format";
import { optionPercentages } from "@/lib/results";

import { useDebate } from "./debate-provider";

type Loaded = { src: string; url: string; file: File } | { src: string; error: true };

/** Fetches a generated card once and keeps the bytes, so sharing can happen within the tap. */
function useCardFile(src: string | null, filename: string) {
  const [card, setCard] = useState<Loaded | null>(null);
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
        setCard({ src, url: objectUrl, file: new File([blob], filename, { type: "image/jpeg" }) });
      })
      .catch(() => {
        if (!cancelled) setCard({ src, error: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, filename]);

  const current = card && card.src === src ? card : null;
  return {
    ready: current && "file" in current ? current : null,
    failed: Boolean(current && "error" in current),
  };
}

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

/**
 * Sharing, built to bring people back to the site: every option carries the
 * vote link, whose preview is the sharer's card. The cards themselves (4:5
 * for posts, 9:16 for stories) are generated server-side from live totals.
 */
export function SharePanel() {
  const { debate, siteUrl, results, vote } = useDebate();
  const option = vote.choice ? getOption(debate, vote.choice) : undefined;
  const [notice, setNotice] = useState<string | null>(null);

  const base = option ? `/api/card/${debate.slug}/${option.slug}` : null;
  const post = useCardFile(base && `${base}/post`, option ? `whoisthegoats-${option.slug}.jpg` : "whoisthegoats.jpg");
  const story = useCardFile(base && `${base}/story`, option ? `whoisthegoats-${option.slug}-story.jpg` : "whoisthegoats-story.jpg");

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!option || !base) return null;

  const index = debate.options.findIndex((o) => o.slug === option.slug);
  const percent =
    results && results.total > 0
      ? optionPercentages(
          results.options,
          debate.options.map((o) => o.slug),
        )[index]
      : null;
  const shareUrl = `${siteUrl}/${debate.slug}/share/${option.slug}`;
  const shareText =
    percent !== null
      ? `I voted ${option.shortName}. ${formatPercent(percent)} of the world agrees. Who’s your GOAT?`
      : `I voted ${option.shortName}. Who’s your GOAT?`;

  async function copyLink(message = "Link copied") {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice(message);
    } catch {
      setNotice("Couldn’t copy. Press and hold the link above to copy it.");
    }
  }

  // The link, not the image: chat apps and feeds show the card as its preview,
  // and every tap on it lands on the vote.
  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: debate.question, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    await copyLink();
  }

  // Websites can't open Instagram's story editor with a link already on it.
  // So the story card goes through the share sheet (pick Instagram, then Story)
  // with the link copied first, ready to paste into a Link sticker.
  async function shareToStory() {
    const copied = navigator.clipboard?.writeText(shareUrl).then(
      () => true,
      () => false,
    );
    if (story.ready && navigator.canShare?.({ files: [story.ready.file] })) {
      try {
        await navigator.share({ files: [story.ready.file] });
        setNotice((await copied) ? "Link copied: add a Link sticker in your story and paste it." : "Add a Link sticker and paste your link.");
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    download(story.ready?.url ?? `${base}/story`, story.ready?.file.name ?? "whoisthegoats-story.jpg");
    setNotice(
      (await copied)
        ? "Story card saved and link copied. Post it as a story on Instagram, then add a Link sticker and paste."
        : "Story card saved. Post it as a story, then add a Link sticker with your link.",
    );
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const apps = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: <WhatsAppIcon /> },
    { label: "X", href: `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`, icon: <XIcon /> },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <FacebookIcon /> },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, icon: <TelegramIcon /> },
    { label: "Snapchat", href: `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`, icon: <SnapchatIcon /> },
  ];

  return (
    <section id="share" aria-labelledby="share-title" className="bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        {/* The card first: it's what people see when the link is shared. */}
        <figure className="mx-auto w-full max-w-[18rem] lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
            {post.ready ? (
              // eslint-disable-next-line @next/next/no-img-element -- generated image served as a blob URL
              <img
                key={post.ready.url}
                src={post.ready.url}
                alt={`Share card: I voted ${option.name}. ${percent !== null ? `${formatPercent(percent)} of the world agrees.` : ""}`}
                className="size-full object-cover [animation:fade-in_var(--duration-ui)_var(--ease-out)_both]"
              />
            ) : post.failed ? (
              <div className="grid size-full place-items-center p-6 text-center text-sm text-mute-dark">
                The card couldn’t be made just now. Try again in a moment.
              </div>
            ) : (
              <div className="skeleton-dark size-full" aria-label="Making your card" role="img" />
            )}
          </div>
          <figcaption className="mt-3 text-center text-sm text-mute lg:text-left">
            Your link shows this card. Figures refresh every minute.
          </figcaption>
        </figure>

        <div className="flex flex-col">
          <h2 id="share-title" className="type-title">
            Share your vote
          </h2>
          <p className="mt-2 max-w-md leading-relaxed text-ink/75">
            Send your link: it shows your card and opens straight on the vote, so your friends can settle it too.
          </p>

          {/* The link itself, visible and copyable. */}
          <div className="mt-6 flex items-stretch border border-ink/20 bg-white sm:max-w-md">
            <input
              readOnly
              value={shareUrl.replace(/^https?:\/\//, "")}
              aria-label="Your share link"
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 grow bg-transparent px-3 text-sm text-ink outline-none"
            />
            <button type="button" onClick={() => copyLink()} className="btn btn-dark h-12 shrink-0 px-4 text-sm">
              Copy
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
            <button type="button" onClick={shareLink} className="btn btn-dark h-13 whitespace-nowrap px-3 text-[14px] sm:px-5 sm:text-[15px]">
              <ShareIcon />
              Share link
            </button>
            <button type="button" onClick={shareToStory} className="btn h-13 whitespace-nowrap px-3 text-[14px] text-white sm:px-5 sm:text-[15px]" style={{ background: "linear-gradient(45deg, #f9a23a, #e1306c 45%, #833ab4)" }}>
              <InstagramIcon />
              Instagram Story
            </button>
          </div>

          <ul className="mt-3 grid grid-cols-5 gap-2 sm:max-w-md" aria-label="Share to">
            {apps.map((app) => (
              <li key={app.label}>
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 flex-col items-center justify-center gap-1 border border-ink/15 text-[11px] font-semibold text-ink transition-colors duration-[var(--duration-micro)] hover:bg-ink/5"
                >
                  {app.icon}
                  {app.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 text-sm font-semibold">
            <DownloadLink href={post.ready?.url ?? `${base}/post`} filename={post.ready?.file.name ?? "whoisthegoats.jpg"}>
              Download card
            </DownloadLink>
            <DownloadLink href={story.ready?.url ?? `${base}/story`} filename={story.ready?.file.name ?? "whoisthegoats-story.jpg"}>
              Download story
            </DownloadLink>
          </div>
          <p role="status" className="mt-2 min-h-5 text-sm text-mute">
            {notice ? <span className="animate-enter inline-block">{notice}</span> : null}
          </p>
        </div>
      </div>
    </section>
  );
}

function DownloadLink({ href, filename, children }: { href: string; filename: string; children: ReactNode }) {
  return (
    <a href={href} download={filename} className="link inline-flex min-h-11 items-center gap-1.5">
      <DownloadIcon />
      {children}
    </a>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
      {children}
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <Icon>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </Icon>
  );
}

function XIcon() {
  return (
    <Icon>
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </Icon>
  );
}

function FacebookIcon() {
  return (
    <Icon>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </Icon>
  );
}

function TelegramIcon() {
  return (
    <Icon>
      <path d="M21.9 4.3 18.8 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.9 13 2.3 11.6c-1-.3-1-1 .2-1.5L20.5 3.2c.9-.3 1.6.2 1.4 1.1Z" />
    </Icon>
  );
}

function SnapchatIcon() {
  return (
    <Icon>
      <path d="M12.1 2c2.4 0 4.6 1.3 5.6 3.5.4.9.3 2.4.2 3.6v.5c.2.1.4.1.7 0 .3-.1.6-.2.9 0 .4.1.7.4.7.8 0 .5-.6.8-1.2 1l-.7.3c-.3.2-.4.4-.3.8a7.3 7.3 0 0 0 4 4.1c.3.1.5.4.4.7-.2.6-1.2 1-2.5 1.2l-.2.8c0 .2-.2.3-.5.3h-.6a3.7 3.7 0 0 0-2.3.6A4.5 4.5 0 0 1 12 22a4.5 4.5 0 0 1-3.2-1.1 3.7 3.7 0 0 0-2.3-.6h-.6c-.3 0-.4-.1-.5-.3l-.2-.8c-1.3-.2-2.3-.6-2.5-1.2-.1-.3.1-.6.4-.7a7.3 7.3 0 0 0 4-4.1c.1-.4 0-.6-.3-.8l-.7-.3c-.8-.3-1.2-.7-1.2-1 0-.5.5-.8.9-.8.2 0 .4 0 .6.1.3.1.5.1.7 0v-.5c-.1-1.2-.2-2.7.2-3.6A6.1 6.1 0 0 1 12.1 2Z" />
    </Icon>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="3.5" />
      <circle cx="8" cy="8" r="2.75" />
      <circle cx="11.6" cy="4.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
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
