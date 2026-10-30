/**
 * Debate registry.
 *
 * Presentation lives here; the database owns which debates and options exist
 * and whether a debate is accepting votes (see supabase/migrations). To launch
 * a new debate, add an entry and insert the matching `debates` and
 * `debate_options` rows with the same slugs.
 */

import { DC_VS_MARVEL, DRAKE_VS_KENDRICK, NIKE_VS_ADIDAS, SAMSUNG_VS_APPLE } from "./culture";
import { MESSI_VS_RONALDO, NEYMAR_VS_RONALDINHO, PELE_VS_MARADONA, YAMAL_VS_MBAPPE } from "./football";
import { HAMILTON_VS_VERSTAPPEN, KHABIB_VS_MCGREGOR, LEBRON_VS_JORDAN, TYSON_VS_ALI } from "./sports";
import type { Category, Debate, DebateOption } from "./types";

export type { Category, Debate, DebateOption, TaleOfTheTapeRow } from "./types";

export const DEBATES: Debate[] = [
  MESSI_VS_RONALDO,
  PELE_VS_MARADONA,
  YAMAL_VS_MBAPPE,
  LEBRON_VS_JORDAN,
  TYSON_VS_ALI,
  HAMILTON_VS_VERSTAPPEN,
  KHABIB_VS_MCGREGOR,
  NEYMAR_VS_RONALDINHO,
  DRAKE_VS_KENDRICK,
  DC_VS_MARVEL,
  SAMSUNG_VS_APPLE,
  NIKE_VS_ADIDAS,
];

export const FEATURED_DEBATE_SLUG = "messi-vs-ronaldo";

/** Debates on the schedule. Listed on /debates; nothing is collected for them yet. */
export const UPCOMING_DEBATES: { title: string; category: string }[] = [
  { title: "Haaland vs Mbappé", category: "Football" },
  { title: "Pelé vs Maradona", category: "Football" },
  { title: "Federer vs Nadal vs Djokovic", category: "Tennis" },
  { title: "Hamilton vs Schumacher", category: "Formula 1" },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  football: "Football",
  basketball: "Basketball",
  boxing: "Boxing",
  mma: "MMA",
  "formula-1": "Formula 1",
  music: "Music",
  comics: "Comics",
  tech: "Tech",
  sportswear: "Sportswear",
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
