import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import type { CSSProperties, ReactNode } from "react";
import sharp from "sharp";

import { MARK_PATH, MARK_VIEWBOX } from "@/components/brand/logo-paths";
import type { Debate, DebateOption } from "@/lib/debates";
import { formatPercent } from "@/lib/format";
import { optionPercentages, votesFor, type DebateResults } from "@/lib/results";
import { SITE_DOMAIN } from "@/lib/site";

import { CARD_FONTS } from "./fonts";

export const CARD_FORMATS = {
  /** The share card: 4:5, for feed posts, stories and chats. */
  post: { width: 1080, height: 1350 },
  /** Wide link previews, for X (which crops anything taller to 2:1). */
  og: { width: 1200, height: 630 },
  /** Square link previews, shown big like an Instagram post (WhatsApp, iMessage, Telegram…). */
  square: { width: 1080, height: 1080 },
} as const;

export type CardFormat = keyof typeof CARD_FORMATS;

export function isCardFormat(value: string): value is CardFormat {
  return Object.hasOwn(CARD_FORMATS, value);
}

const INK = "#0A0C14";
const WHITE = "#FFFFFF";
const MUTED = "#A3A8B6";
const RULE = "rgba(255,255,255,0.18)";

/** Percentages only: the cards never show vote counts. */
type Stats = { percents: [number, number] };

function statsFrom(debate: Debate, results: DebateResults | null): Stats | null {
  if (!results || results.total <= 0) return null;
  const [a, b] = debate.options;
  // Only percentages that come from real counts are shown.
  if (votesFor(results.options, a.slug) + votesFor(results.options, b.slug) <= 0) return null;
  return { percents: optionPercentages(results.options, [a.slug, b.slug]) as [number, number] };
}

// Photos are embedded as data URLs, read once per server instance. The files
// are shipped with the image routes by `outputFileTracingIncludes` in
// next.config.ts, so the bundler needn't trace this path.
const images = new Map<string, Promise<string | null>>();

function loadImage(path: string): Promise<string | null> {
  let image = images.get(path);
  if (!image) {
    image = readFile(join(/* turbopackIgnore: true */ process.cwd(), path))
      .then((data) => `data:image/jpeg;base64,${data.toString("base64")}`)
      .catch((error) => {
        console.error(`[card] couldn't read ${path}:`, error);
        images.delete(path);
        return null;
      });
    images.set(path, image);
  }
  return image;
}

/** Largest font size (px) at which an uppercase name fits the given width. */
function fitDisplay(text: string, width: number, max: number): number {
  // Archivo Condensed Black averages ~0.52em per uppercase glyph.
  return Math.min(max, Math.floor(width / (Math.max(text.length, 1) * 0.54)));
}

function Mark({ size, color = WHITE }: { size: number; color?: string }) {
  const [, , w, h] = MARK_VIEWBOX.split(" ").map(Number);
  return (
    <svg viewBox={MARK_VIEWBOX} width={size * (w / h)} height={size}>
      <path d={MARK_PATH} fill={color} />
    </svg>
  );
}

function Brand({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.45 }}>
      <Mark size={size} />
      <div style={{ fontFamily: "Wide", fontSize: size * 0.46, letterSpacing: "0.08em", color: WHITE }}>
        {SITE_DOMAIN.toUpperCase()}
      </div>
    </div>
  );
}

function SplitBar({ debate, stats, height, labelSize }: { debate: Debate; stats: Stats; height: number; labelSize: number }) {
  const [a, b] = debate.options;
  const [pa, pb] = stats.percents;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: labelSize * 0.5 }}>
      <div style={{ display: "flex", width: "100%", height, background: "rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", width: `${pa}%`, height: "100%", background: a.color }} />
        <div style={{ display: "flex", width: `${pb}%`, height: "100%", background: b.color }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Text", fontWeight: 700, fontSize: labelSize, color: WHITE, letterSpacing: "0.04em" }}>
        <div style={{ display: "flex" }}>{`${a.shortName.toUpperCase()} ${formatPercent(pa)}`}</div>
        <div style={{ display: "flex" }}>{`${b.shortName.toUpperCase()} ${formatPercent(pb)}`}</div>
      </div>
    </div>
  );
}

function Canvas({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: INK, color: WHITE, fontFamily: "Text", overflow: "hidden" }}>
      {children}
    </div>
  );
}

/** A full-size layer: photo, scrim or the content on top. */
function Layer({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, ...style }}>{children}</div>;
}

/** Stand-in for a missing photo: the shirt number, large and faint. */
function GhostNumber({ value, size }: { value: string; size: number }) {
  // Sized for two characters; longer marks ("GNX") shrink to fit.
  const fontSize = (size * 2) / Math.max(2, value.length);
  return (
    <Layer style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", fontFamily: "Display", fontSize, lineHeight: 1, color: "rgba(255,255,255,0.06)" }}>{value}</div>
    </Layer>
  );
}

/** "I VOTED RONALDO" share card over the player's photo: 4:5, or square for link previews. */
function VoteCard({
  debate,
  option,
  stats,
  photo,
  square = false,
}: {
  debate: Debate;
  option: DebateOption;
  stats: Stats | null;
  photo: string | null;
  square?: boolean;
}) {
  const { width, height } = square ? CARD_FORMATS.square : CARD_FORMATS.post;
  const post = CARD_FORMATS.post;
  const pad = 64;
  const index = debate.options.findIndex((o) => o.slug === option.slug);
  const percent = stats ? stats.percents[index] : null;
  const name = option.shortName.toUpperCase();

  return (
    <Canvas>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not the DOM
        // The photo is 4:5 with the face a third of the way down; the square keeps the face
        // in the same clear band by trimming a little off the top and the rest off the bottom.
        <img src={photo} width={post.width} height={post.height} alt="" style={{ position: "absolute", top: square ? -90 : 0, left: 0 }} />
      ) : (
        <GhostNumber value={option.mark} size={square ? 800 : 980} />
      )}
      {/* Scrims: brand legible at the top, figures at the bottom; the player stays clear in between. */}
      <Layer
        style={{
          backgroundImage: square
            ? "linear-gradient(to bottom, rgba(10,12,20,0.82) 0%, rgba(10,12,20,0) 18%, rgba(10,12,20,0) 40%, rgba(10,12,20,0.88) 66%, rgba(10,12,20,0.97) 100%)"
            : "linear-gradient(to bottom, rgba(10,12,20,0.82) 0%, rgba(10,12,20,0) 20%, rgba(10,12,20,0) 46%, rgba(10,12,20,0.86) 70%, rgba(10,12,20,0.97) 100%)",
        }}
      />
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 12, background: option.color }} />

      <Layer style={{ flexDirection: "column", padding: `${pad + 12}px ${pad}px ${pad}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={52} />
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 20, letterSpacing: "0.12em", color: WHITE }}>
            {debate.title.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexGrow: 1 }} />

        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 44, letterSpacing: "0.05em" }}>
          <div style={{ display: "flex", color: option.color }}>I VOTED</div>
          <div style={{ display: "flex", marginLeft: 18 }}>{name}</div>
        </div>

        {stats && percent !== null ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-end", marginTop: 14 }}>
              <div style={{ display: "flex", fontFamily: "Display", fontSize: square ? 168 : 220, lineHeight: 0.8, color: option.color }}>
                {formatPercent(percent)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", fontFamily: "Wide", fontSize: 34, lineHeight: 1.1, letterSpacing: "0.04em", marginLeft: 28, paddingBottom: 6 }}>
                <div style={{ display: "flex" }}>OF THE WORLD</div>
                <div style={{ display: "flex" }}>AGREES</div>
              </div>
            </div>
            <div style={{ display: "flex", marginTop: square ? 28 : 40 }}>
              <SplitBar debate={debate} stats={stats} height={16} labelSize={26} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontFamily: "Display", fontSize: fitDisplay("THE WORLD DECIDES", width - pad * 2, 140), lineHeight: 0.9, marginTop: 16 }}>
            THE WORLD DECIDES
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: square ? 28 : 40, paddingTop: square ? 22 : 28, borderTop: `2px solid ${RULE}`, fontFamily: "Wide", fontSize: 24, letterSpacing: "0.1em" }}>
          <div style={{ display: "flex", color: MUTED }}>WHO’S YOUR GOAT?</div>
          <div style={{ display: "flex" }}>{`VOTE AT ${SITE_DOMAIN.toUpperCase()}`}</div>
        </div>
      </Layer>
    </Canvas>
  );
}

/** The same card as a landscape link preview: figures on the left, photo on the right. */
function VoteCardWide({ debate, option, stats, photo }: { debate: Debate; option: DebateOption; stats: Stats | null; photo: string | null }) {
  const { width, height } = CARD_FORMATS.og;
  // The photo keeps its 4:5 shape at full height.
  const photoWidth = Math.round((height * 4) / 5);
  const textWidth = width - photoWidth;
  const pad = 56;
  const index = debate.options.findIndex((o) => o.slug === option.slug);
  const percent = stats ? stats.percents[index] : null;
  const name = option.shortName.toUpperCase();

  return (
    <Canvas>
      <div style={{ display: "flex", position: "absolute", top: 0, right: 0, width: photoWidth, height }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not the DOM
          <img src={photo} width={photoWidth} height={height} alt="" />
        ) : (
          <GhostNumber value={option.mark} size={560} />
        )}
        {/* Blend the photo's left edge into the panel. */}
        <Layer style={{ backgroundImage: "linear-gradient(to right, rgba(10,12,20,1) 0%, rgba(10,12,20,0) 22%)" }} />
      </div>
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 10, background: option.color }} />

      <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 0, left: 0, bottom: 0, width: textWidth, padding: `${pad + 6}px ${pad}px ${pad - 8}px` }}>
        <Brand size={40} />
        <div style={{ display: "flex", flexGrow: 1 }} />
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 30, letterSpacing: "0.06em", color: option.color }}>I VOTED</div>
        <div style={{ display: "flex", fontFamily: "Display", fontSize: fitDisplay(name, textWidth - pad * 2, 150), lineHeight: 0.86, marginTop: 6 }}>{name}</div>
        {stats && percent !== null ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontFamily: "Display", fontSize: 104, lineHeight: 0.8, color: option.color }}>{formatPercent(percent)}</div>
              <div style={{ display: "flex", fontFamily: "Wide", fontSize: 22, letterSpacing: "0.04em", marginLeft: 20, paddingBottom: 4 }}>OF THE WORLD AGREES</div>
            </div>
            <div style={{ display: "flex", marginTop: 26 }}>
              <SplitBar debate={debate} stats={stats} height={10} labelSize={18} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 26, letterSpacing: "0.05em", marginTop: 22 }}>THE WORLD DECIDES.</div>
        )}
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 20, letterSpacing: "0.1em", color: MUTED, marginTop: 28 }}>
          {`VOTE AT ${SITE_DOMAIN.toUpperCase()}`}
        </div>
      </div>
    </Canvas>
  );
}

/** Link preview for a debate: the face-off artwork with the live split. */
function DebateCard({ debate, stats, artwork }: { debate: Debate; stats: Stats | null; artwork: string | null }) {
  const { width } = CARD_FORMATS.og;
  const [a, b] = debate.options;
  const pad = 56;
  // Both names plus "VS" share one line when there are no figures to show.
  const nameSize = fitDisplay(a.shortName + b.shortName, width - pad * 2 - 120, 130);
  return (
    <Canvas>
      {artwork ? (
        // The artwork is 2400×1323: scaled to the card's width it's 662px tall, so it's cropped slightly at the top.
        // eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not the DOM
        <img src={artwork} width={width} height={662} alt="" style={{ position: "absolute", left: 0, top: -8 }} />
      ) : null}
      <Layer style={{ backgroundImage: "linear-gradient(to bottom, rgba(10,12,20,0.7) 0%, rgba(10,12,20,0) 26%, rgba(10,12,20,0) 40%, rgba(10,12,20,0.9) 74%, rgba(10,12,20,0.97) 100%)" }} />
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: width / 2, height: 10, background: a.color }} />
      <div style={{ display: "flex", position: "absolute", top: 0, right: 0, width: width / 2, height: 10, background: b.color }} />

      <Layer style={{ flexDirection: "column", padding: `${pad}px ${pad}px ${pad - 8}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={42} />
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 20, letterSpacing: "0.12em" }}>{debate.question.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", flexGrow: 1 }} />
        {stats ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              {[a, b].map((option, i) => (
                <div key={option.slug} style={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : "flex-end" }}>
                  <div style={{ display: "flex", fontFamily: "Wide", fontSize: 24, letterSpacing: "0.06em" }}>{option.shortName.toUpperCase()}</div>
                  <div style={{ display: "flex", fontFamily: "Display", fontSize: 120, lineHeight: 0.82, marginTop: 8, color: option.color }}>{formatPercent(stats.percents[i])}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", width: "100%", height: 12, marginTop: 22, background: "rgba(255,255,255,0.12)" }}>
              <div style={{ display: "flex", width: `${stats.percents[0]}%`, height: "100%", background: a.color }} />
              <div style={{ display: "flex", width: `${stats.percents[1]}%`, height: "100%", background: b.color }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
            <div style={{ display: "flex", fontFamily: "Display", fontSize: nameSize, lineHeight: 0.86 }}>{a.shortName.toUpperCase()}</div>
            <div style={{ display: "flex", fontFamily: "Wide", fontSize: 30, color: MUTED, paddingBottom: 14 }}>VS</div>
            <div style={{ display: "flex", fontFamily: "Display", fontSize: nameSize, lineHeight: 0.86 }}>{b.shortName.toUpperCase()}</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, fontFamily: "Wide", fontSize: 20, letterSpacing: "0.1em" }}>
          <div style={{ display: "flex", color: MUTED }}>THE WORLD DECIDES.</div>
          <div style={{ display: "flex" }}>{`VOTE AT ${SITE_DOMAIN.toUpperCase()}`}</div>
        </div>
      </Layer>
    </Canvas>
  );
}

/** Square link preview for a debate: each side's photo, face centred, with the live split. */
function DebateSquare({ debate, stats, sides }: { debate: Debate; stats: Stats | null; sides: [string | null, string | null] }) {
  const { width, height } = CARD_FORMATS.square;
  const [a, b] = debate.options;
  const pad = 56;
  const half = width / 2;
  // Each side photo is 1200×1323; at the card's height it's ~980 wide, cropped to half the card around the face.
  const sideWidth = Math.round((1200 * height) / 1323);
  const nameSize = fitDisplay(a.shortName.length > b.shortName.length ? a.shortName : b.shortName, half - pad - 20, 110);
  return (
    <Canvas>
      {[a, b].map((option, i) => {
        const focusX = Number.parseFloat(debate.artwork?.focus[i] ?? "50") / 100;
        return (
          <div key={option.slug} style={{ display: "flex", position: "absolute", top: 0, left: i * half, width: half, height, overflow: "hidden", background: INK }}>
            {sides[i] ? (
              // eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not the DOM
              <img src={sides[i]!} width={sideWidth} height={height} alt="" style={{ position: "absolute", top: 0, left: -Math.round((sideWidth - half) * focusX) }} />
            ) : (
              <GhostNumber value={option.mark} size={520} />
            )}
          </div>
        );
      })}
      <div style={{ display: "flex", position: "absolute", top: 0, left: half - 1, width: 2, height, background: "rgba(10,12,20,0.9)" }} />
      <Layer style={{ backgroundImage: "linear-gradient(to bottom, rgba(10,12,20,0.75) 0%, rgba(10,12,20,0) 18%, rgba(10,12,20,0) 44%, rgba(10,12,20,0.9) 70%, rgba(10,12,20,0.97) 100%)" }} />
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: half, height: 12, background: a.color }} />
      <div style={{ display: "flex", position: "absolute", top: 0, right: 0, width: half, height: 12, background: b.color }} />
      {/* The VS badge, on the seam just under the faces. */}
      <div style={{ display: "flex", position: "absolute", top: 520, left: half - 44, width: 88, height: 88, alignItems: "center", justifyContent: "center", background: INK, fontFamily: "Wide", fontSize: 28, letterSpacing: "0.06em" }}>
        VS
      </div>

      <Layer style={{ flexDirection: "column", padding: `${pad + 8}px ${pad}px ${pad - 4}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={46} />
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 20, letterSpacing: "0.12em" }}>{debate.question.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", flexGrow: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {[a, b].map((option, i) => (
            <div key={option.slug} style={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : "flex-end" }}>
              <div style={{ display: "flex", fontFamily: "Display", fontSize: nameSize, lineHeight: 0.86 }}>{option.shortName.toUpperCase()}</div>
              {stats ? (
                <div style={{ display: "flex", fontFamily: "Display", fontSize: 132, lineHeight: 0.82, marginTop: 14, color: option.color }}>{formatPercent(stats.percents[i])}</div>
              ) : null}
            </div>
          ))}
        </div>
        {stats ? (
          <div style={{ display: "flex", width: "100%", height: 14, marginTop: 26, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ display: "flex", width: `${stats.percents[0]}%`, height: "100%", background: a.color }} />
            <div style={{ display: "flex", width: `${stats.percents[1]}%`, height: "100%", background: b.color }} />
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, paddingTop: 24, borderTop: `2px solid ${RULE}`, fontFamily: "Wide", fontSize: 22, letterSpacing: "0.1em" }}>
          <div style={{ display: "flex", color: MUTED }}>THE WORLD DECIDES.</div>
          <div style={{ display: "flex" }}>{`VOTE AT ${SITE_DOMAIN.toUpperCase()}`}</div>
        </div>
      </Layer>
    </Canvas>
  );
}

export async function renderCard(options: {
  debate: Debate;
  /** The option the sharer voted for; omit for the debate preview. */
  option?: DebateOption;
  results: DebateResults | null;
  format: CardFormat;
  headers?: Record<string, string>;
}): Promise<Response> {
  const { debate, option, results, format, headers } = options;
  const stats = statsFrom(debate, results);

  let element: ReactNode;
  if (!option) {
    const file = debate.artwork?.file;
    if (format === "og") {
      element = <DebateCard debate={debate} stats={stats} artwork={file ? await loadImage(file) : null} />;
    } else {
      // The per-side photos sit next to the side-by-side file: <slug>-1.jpg and <slug>-2.jpg.
      const sides = file
        ? ((await Promise.all([1, 2].map((n) => loadImage(file.replace(/\.jpg$/, `-${n}.jpg`))))) as [string | null, string | null])
        : ([null, null] as [string | null, string | null]);
      element = <DebateSquare debate={debate} stats={stats} sides={sides} />;
    }
  } else {
    const photo = option.cardPhoto ? await loadImage(`assets/cards/${option.cardPhoto}`) : null;
    element =
      format === "og" ? (
        <VoteCardWide debate={debate} option={option} stats={stats} photo={photo} />
      ) : (
        <VoteCard debate={debate} option={option} stats={stats} photo={photo} square={format === "square"} />
      );
  }

  const png = await new ImageResponse(element, { ...CARD_FORMATS[format], fonts: CARD_FONTS }).arrayBuffer();
  // Photo cards as PNG run to 1–2.5 MB. Link previews stay a few hundred KB as
  // JPEG, small enough for chat apps to show; the 4:5 card people save and
  // post is kept close to the original. Full-resolution colour (4:4:4) keeps
  // the lettering and coloured edges crisp.
  // Square previews stay under ~300 KB, which chat apps show without trouble.
  const quality = format === "post" ? 94 : format === "square" ? 86 : 88;
  const jpeg = await sharp(Buffer.from(png))
    .jpeg({ quality, chromaSubsampling: "4:4:4", mozjpeg: true, progressive: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg", ...headers } });
}
