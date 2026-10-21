import type { StaticImageData } from "next/image";

import type { Runner } from "@/components/celebration/timeline";

export type Category = "football" | "basketball" | "boxing" | "mma" | "formula-1" | "music" | "comics" | "tech";

export type DebateOption = {
  /** Matches `debate_options.slug`. */
  slug: string;
  name: string;
  /** Shown above the short name on the vote board; left empty (or equal to
   * the short name) to show the short name alone. */
  firstName: string;
  /** Used in calls to action and headlines: "VOTE MESSI". */
  shortName: string;
  /** A person (an athlete, an artist) or a company. Drives structured data. */
  kind: "person" | "organization";
  /** Shown above the name on the vote board: a country, a city, a home. */
  tag: string;
  /** For people: nationality, for structured data. */
  nationality?: string;
  /** The number or mark the option is synonymous with: a shirt number, a
   * record, a car number (share cards, and the vote board when the debate
   * has no artwork). */
  mark: string;
  /** Accent colour. Used sparingly: bars, chips and the mark. */
  color: string;
  /** Readable text colour on top of `color`. */
  onColor: string;
  /** Canonical reference for structured data (schema.org `sameAs`). */
  wikipedia: string;
  caseFor: string[];
  /** What runs the result bar after a vote; omit for bars only. */
  runner?: Runner;
  /** Photo for the share card and link preview: a 1080×1350 (4:5) JPEG in
   * assets/cards/. Without one, the card shows the mark instead. */
  cardPhoto?: string;
};

export type TaleOfTheTapeRow = { label: string; values: [string, string] };

export type Debate = {
  slug: string;
  category: Category;
  title: string;
  question: string;
  /** Two-sided face-off. The data layer supports more options; the arena UI is built for two. */
  options: [DebateOption, DebateOption];
  /**
   * Optional background for the vote board, split down the middle to match
   * the two sides (first option on the left). Without it, the board shows
   * each option's mark instead.
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
