import "server-only";

import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

import { MARK_PATH, MARK_VIEWBOX } from "@/components/brand/logo-paths";
import type { Debate, DebateOption } from "@/lib/debates";
import { formatCount, formatPercent, pluralize } from "@/lib/format";
import { optionPercentages, votesFor, type DebateResults } from "@/lib/results";
import { SITE_DOMAIN } from "@/lib/site";

import { CARD_FONTS } from "./fonts";

export const CARD_FORMATS = {
  /** Instagram / WhatsApp / Snapchat Stories, TikTok */
  story: { width: 1080, height: 1920 },
  /** Feed posts on Instagram and X */
  post: { width: 1080, height: 1350 },
  /** Link previews */
  og: { width: 1200, height: 630 },
} as const;

export type CardFormat = keyof typeof CARD_FORMATS;

export function isCardFormat(value: string): value is CardFormat {
  return Object.hasOwn(CARD_FORMATS, value);
}

const INK = "#0A0C14";
const WHITE = "#FFFFFF";
const MUTED = "#8B90A0";
const RULE = "rgba(255,255,255,0.14)";

type Stats = {
  total: number;
  countries: number;
  percents: [number, number];
};

function statsFrom(debate: Debate, results: DebateResults | null): Stats | null {
  if (!results || results.total <= 0) return null;
  const [a, b] = debate.options;
  const [pa, pb] = optionPercentages(results.options, [a.slug, b.slug]);
  // Only percentages that come from real counts are shown.
  if (votesFor(results.options, a.slug) + votesFor(results.options, b.slug) <= 0) return null;
  return { total: results.total, countries: results.countries.count, percents: [pa, pb] };
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
    <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: labelSize * 0.6 }}>
      <div style={{ display: "flex", width: "100%", height, background: "rgba(255,255,255,0.08)" }}>
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

function totalsLine(stats: Stats): string {
  const votes = `${formatCount(stats.total)} ${pluralize(stats.total, "VOTE", "VOTES")}`;
  return stats.countries > 0
    ? `${votes} · ${formatCount(stats.countries)} ${pluralize(stats.countries, "COUNTRY", "COUNTRIES")}`
    : votes;
}

function Frame({ children, padding }: { children: ReactNode; padding: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: INK,
        color: WHITE,
        padding,
        position: "relative",
        fontFamily: "Text",
      }}
    >
      {children}
    </div>
  );
}

function GhostNumber({ value, size, right, top }: { value: string; size: number; right: number; top: number }) {
  return (
    <div
      style={{
        position: "absolute",
        right,
        top,
        display: "flex",
        fontFamily: "Display",
        fontSize: size,
        lineHeight: 1,
        color: "rgba(255,255,255,0.045)",
      }}
    >
      {value}
    </div>
  );
}

/** "I VOTED MESSI" card in the tall Story or Post format. */
function VoteCardTall({ debate, option, stats, format }: { debate: Debate; option: DebateOption; stats: Stats | null; format: "story" | "post" }) {
  const { width } = CARD_FORMATS[format];
  const story = format === "story";
  const pad = story ? 88 : 72;
  const inner = width - pad * 2;
  const index = debate.options.findIndex((o) => o.slug === option.slug);
  const percent = stats ? stats.percents[index] : null;
  const name = option.shortName.toUpperCase();

  return (
    <Frame padding={pad}>
      <GhostNumber value={option.number} size={story ? 1250 : 980} right={story ? -60 : -50} top={story ? 180 : 110} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: story ? 40 : 30, borderBottom: `2px solid ${RULE}` }}>
        <Brand size={story ? 64 : 54} />
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 22 : 20, letterSpacing: "0.12em", color: MUTED }}>
          {debate.title.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 150 : 70 }}>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 38 : 32, letterSpacing: "0.1em", color: MUTED }}>
          {debate.question.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 64 : 52, letterSpacing: "0.06em", color: option.color, marginTop: story ? 56 : 36 }}>
          I VOTED
        </div>
        <div style={{ display: "flex", fontFamily: "Display", fontSize: fitDisplay(name, inner, story ? 360 : 280), lineHeight: 0.86, marginTop: story ? 10 : 6 }}>
          {name}
        </div>
        <div style={{ display: "flex", fontFamily: "Text", fontWeight: 700, fontSize: story ? 34 : 30, letterSpacing: "0.06em", color: MUTED, marginTop: story ? 26 : 18 }}>
          {`${option.name.toUpperCase()} · ${option.country.name.toUpperCase()}`}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 130 : 56 }}>
        {stats && percent !== null ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Display", fontSize: story ? 250 : 180, lineHeight: 0.8, color: option.color }}>
              {formatPercent(percent)}
            </div>
            <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 46 : 38, letterSpacing: "0.05em", marginTop: story ? 30 : 22 }}>
              OF THE WORLD AGREES
            </div>
            <div style={{ display: "flex", marginTop: story ? 70 : 44 }}>
              <SplitBar debate={debate} stats={stats} height={story ? 22 : 18} labelSize={story ? 30 : 26} />
            </div>
            <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 28 : 24, letterSpacing: "0.1em", color: MUTED, marginTop: story ? 44 : 30 }}>
              {totalsLine(stats)}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 46 : 38, letterSpacing: "0.05em" }}>
            THE WORLD DECIDES.
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexGrow: 1 }} />

      <div style={{ display: "flex", flexDirection: "column", paddingTop: story ? 44 : 32, borderTop: `2px solid ${RULE}` }}>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 30 : 26, letterSpacing: "0.1em", color: MUTED }}>
          WHO’S YOUR GOAT?
        </div>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: story ? 48 : 40, letterSpacing: "0.04em", marginTop: 10 }}>
          {`VOTE AT ${SITE_DOMAIN.toUpperCase()}`}
        </div>
      </div>
    </Frame>
  );
}

/** "I VOTED MESSI" card in the landscape link-preview format. */
function VoteCardWide({ debate, option, stats }: { debate: Debate; option: DebateOption; stats: Stats | null }) {
  const index = debate.options.findIndex((o) => o.slug === option.slug);
  const percent = stats ? stats.percents[index] : null;
  const name = option.shortName.toUpperCase();
  return (
    <Frame padding={64}>
      <GhostNumber value={option.number} size={760} right={-30} top={-90} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Brand size={46} />
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 18, letterSpacing: "0.14em", color: MUTED }}>
          {debate.question.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", flexGrow: 1, alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 40, letterSpacing: "0.06em", color: option.color }}>I VOTED</div>
          <div style={{ display: "flex", fontFamily: "Display", fontSize: fitDisplay(name, 560, 230), lineHeight: 0.86, marginTop: 6 }}>{name}</div>
        </div>
        {stats && percent !== null ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontFamily: "Display", fontSize: 150, lineHeight: 0.85, color: option.color }}>{formatPercent(percent)}</div>
            <div style={{ display: "flex", fontFamily: "Wide", fontSize: 26, letterSpacing: "0.05em", marginTop: 14 }}>OF THE WORLD AGREES</div>
            <div style={{ display: "flex", fontFamily: "Wide", fontSize: 18, letterSpacing: "0.1em", color: MUTED, marginTop: 14 }}>{totalsLine(stats)}</div>
          </div>
        ) : null}
      </div>
    </Frame>
  );
}

/** Debate preview used when a debate link is shared. */
function DebateCard({ debate, stats }: { debate: Debate; stats: Stats | null }) {
  const [a, b] = debate.options;
  // Both names plus "VS" share one line across the 1,072px content width.
  const nameSize = fitDisplay(a.shortName + b.shortName, 1072 - 120, 150);
  return (
    <Frame padding={64}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Brand size={46} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 64 }}>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 30, letterSpacing: "0.1em", color: MUTED }}>
          {debate.question.toUpperCase()}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 14 }}>
          {[a, b].map((option, i) => (
            <div key={option.slug} style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
              {i === 1 ? (
                <div style={{ display: "flex", fontFamily: "Wide", fontSize: 34, color: MUTED, paddingBottom: 18 }}>VS</div>
              ) : null}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontFamily: "Display", fontSize: nameSize, lineHeight: 0.86 }}>{option.shortName.toUpperCase()}</div>
                <div style={{ display: "flex", height: 10, marginTop: 14, background: option.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexGrow: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 26, borderTop: `2px solid ${RULE}` }}>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 22, letterSpacing: "0.1em", color: stats ? WHITE : MUTED }}>
          {stats ? totalsLine(stats) : "THE WORLD DECIDES."}
        </div>
        <div style={{ display: "flex", fontFamily: "Wide", fontSize: 22, letterSpacing: "0.1em" }}>
          {`VOTE AT ${SITE_DOMAIN.toUpperCase()}`}
        </div>
      </div>
    </Frame>
  );
}

export function renderCard(options: {
  debate: Debate;
  /** The option the sharer voted for; omit for the debate preview. */
  option?: DebateOption;
  results: DebateResults | null;
  format: CardFormat;
  headers?: Record<string, string>;
}): ImageResponse {
  const { debate, option, results, format, headers } = options;
  const stats = statsFrom(debate, results);
  const size = CARD_FORMATS[format];

  let element: ReactNode;
  if (!option) element = <DebateCard debate={debate} stats={stats} />;
  else if (format === "og") element = <VoteCardWide debate={debate} option={option} stats={stats} />;
  else element = <VoteCardTall debate={debate} option={option} stats={stats} format={format} />;

  return new ImageResponse(element, { ...size, fonts: CARD_FONTS, headers });
}
