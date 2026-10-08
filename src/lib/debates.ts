/**
 * Debate registry.
 *
 * Presentation lives here; the database owns which debates and options exist
 * and whether a debate is accepting votes (see supabase/migrations). To launch
 * a new debate, add an entry below and insert the matching `debates` and
 * `debate_options` rows with the same slugs.
 */

import type { StaticImageData } from "next/image";

import type { Kit } from "@/components/celebration/figure";
import type { CelebrationKind } from "@/components/celebration/timeline";

import messiVsRonaldoArtwork from "@/assets/debates/messi-vs-ronaldo.jpg";

export type Sport = "football" | "basketball" | "tennis" | "boxing" | "formula-1";

export type DebateOption = {
  /** Matches `debate_options.slug`. */
  slug: string;
  name: string;
  firstName: string;
  /** Used in calls to action and headlines: "VOTE MESSI". */
  shortName: string;
  country: { code: string; name: string };
  /** The shirt number the player is synonymous with (share cards, and the
   * vote board when the debate has no artwork). */
  number: string;
  /** Accent colour. Used sparingly: bars, chips and the shirt number. */
  color: string;
  /** Readable text colour on top of `color`. */
  onColor: string;
  /** Canonical reference for structured data (schema.org `sameAs`). */
  wikipedia: string;
  caseFor: string[];
  /** The figure that runs the result bar after a vote; omit for bars only. */
  figure?: { kit: Kit; celebration: CelebrationKind };
  /** Photo for the share card and link preview: a 1080×1350 (4:5) JPEG in
   * assets/cards/. Without one, the card shows the shirt number instead. */
  cardPhoto?: string;
};

export type TaleOfTheTapeRow = { label: string; values: [string, string] };

export type Debate = {
  slug: string;
  sport: Sport;
  title: string;
  question: string;
  /** Two-sided face-off. The data layer supports more options; the arena UI is built for two. */
  options: [DebateOption, DebateOption];
  /**
   * Optional background for the vote board, split down the middle to match
   * the two sides (first option on the left). Without it, the board shows
   * each player's shirt number instead.
   */
  artwork?: {
    image: StaticImageData;
    /** CSS object-position, to keep faces in frame as the board crops. */
    position?: string;
    /** The same image as a path from the project root, for the link-preview image. */
    file?: string;
  };
  seo: { title: string; description: string; keywords: string[] };
  intro: string[];
  taleOfTheTape: TaleOfTheTapeRow[];
  /** When the editorial facts above were last checked. */
  factsAsOf: string;
};

export const DEBATES: Debate[] = [
  {
    slug: "messi-vs-ronaldo",
    sport: "football",
    title: "Messi vs Ronaldo",
    question: "Who is the GOAT?",
    options: [
      {
        slug: "messi",
        name: "Lionel Messi",
        firstName: "Lionel",
        shortName: "Messi",
        country: { code: "AR", name: "Argentina" },
        number: "10",
        color: "#75AADB",
        onColor: "#0A0C14",
        wikipedia: "https://en.wikipedia.org/wiki/Lionel_Messi",
        figure: {
          celebration: "knee-slide",
          kit: {
            skin: "#e2b08e",
            hair: "#3b2a20",
            beard: "#4b3527",
            shirt: "#f7f8fa",
            stripes: "#6cace4",
            trim: "#14161c",
            shorts: "#eef0f3",
            socks: "#f4f5f7",
            sockBand: "#6cace4",
            boots: "#e9edf2",
          },
        },
        cardPhoto: "messi.jpg",
        caseFor: [
          "Eight Ballon d’Or awards, the most in the history of the prize.",
          "World Cup winner in 2022, and the only player to win the tournament’s Golden Ball twice (2014, 2022).",
          "Barcelona’s all-time leading scorer, with four Champions League titles at the club.",
          "Two Copa América titles with Argentina, in 2021 and 2024.",
        ],
      },
      {
        slug: "ronaldo",
        name: "Cristiano Ronaldo",
        firstName: "Cristiano",
        shortName: "Ronaldo",
        country: { code: "PT", name: "Portugal" },
        number: "7",
        color: "#E8322A",
        onColor: "#FFFFFF",
        wikipedia: "https://en.wikipedia.org/wiki/Cristiano_Ronaldo",
        figure: {
          celebration: "siu",
          kit: {
            skin: "#c88c69",
            hair: "#17110e",
            shirt: "#d62b2b",
            trim: "#0f5a3a",
            shorts: "#0f6b40",
            shortsTrim: "#101114",
            socks: "#d62b2b",
            sockBand: "#0f5a3a",
            boots: "#d9dde3",
          },
        },
        cardPhoto: "ronaldo.jpg",
        caseFor: [
          "Five Ballon d’Or awards and five Champions League titles, won with Manchester United and Real Madrid.",
          "The all-time leading scorer in Champions League history.",
          "The all-time leading goalscorer in men’s international football.",
          "Captained Portugal to EURO 2016 and two Nations League titles, in 2019 and 2025.",
        ],
      },
    ],
    artwork: {
      image: messiVsRonaldoArtwork,
      position: "50% 22%",
      file: "src/assets/debates/messi-vs-ronaldo.jpg",
    },
    seo: {
      title: "Messi vs Ronaldo: Who Is the GOAT? Vote Now",
      description:
        "Messi or Ronaldo? Cast your vote in the world’s live GOAT poll and see the global result update in real time, country by country. No sign-up.",
      keywords: [
        "messi vs ronaldo",
        "who is the goat",
        "messi or ronaldo",
        "goat vote",
        "messi ronaldo poll",
        "greatest footballer of all time",
      ],
    },
    intro: [
      "For two decades they shared the same stage and split the same argument. Lionel Messi and Cristiano Ronaldo rewrote the record books at Barcelona and Real Madrid, traded Ballon d’Or awards and turned every Clásico into a referendum.",
      "Pundits have had their say. Statistics have had theirs. Now the question goes to everyone: one vote per person, counted live, country by country.",
    ],
    taleOfTheTape: [
      { label: "Ballon d’Or", values: ["8", "5"] },
      { label: "World Cup", values: ["1", "0"] },
      { label: "Champions League", values: ["4", "5"] },
      { label: "Continental titles", values: ["2", "1"] },
      { label: "International honours", values: ["World Cup ’22 · Copa América ’21, ’24", "EURO ’16 · Nations League ’19, ’25"] },
    ],
    factsAsOf: "October 2026",
  },
];

export const FEATURED_DEBATE_SLUG = "messi-vs-ronaldo";

/** Debates on the schedule. Listed on /debates; nothing is collected for them yet. */
export const UPCOMING_DEBATES: { title: string; sport: string }[] = [
  { title: "Haaland vs Mbappé", sport: "Football" },
  { title: "Pelé vs Maradona", sport: "Football" },
  { title: "Jordan vs LeBron", sport: "Basketball" },
  { title: "Federer vs Nadal vs Djokovic", sport: "Tennis" },
  { title: "Ali vs Tyson", sport: "Boxing" },
  { title: "Hamilton vs Schumacher", sport: "Formula 1" },
];

export const SPORT_LABELS: Record<Sport, string> = {
  football: "Football",
  basketball: "Basketball",
  tennis: "Tennis",
  boxing: "Boxing",
  "formula-1": "Formula 1",
};

export function getDebate(slug: string): Debate | undefined {
  return DEBATES.find((debate) => debate.slug === slug);
}

export function getFeaturedDebate(): Debate {
  const debate = getDebate(FEATURED_DEBATE_SLUG);
  if (!debate) throw new Error(`Featured debate "${FEATURED_DEBATE_SLUG}" is not configured`);
  return debate;
}

export function getOption(debate: Debate, slug: string): DebateOption | undefined {
  return debate.options.find((option) => option.slug === slug);
}
