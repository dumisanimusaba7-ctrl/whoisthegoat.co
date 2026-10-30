/**
 * Trophy cabinets for each debate, grouped so the two players can be
 * compared like for like. Every total on the cabinet page is counted from
 * these lists, so a trophy added here updates everything.
 *
 * Checked against club, federation and competition records, October 2026.
 */

import { DRAKE_VS_KENDRICK } from "./cabinets/drake-vs-kendrick";
import { HAMILTON_VS_VERSTAPPEN } from "./cabinets/hamilton-vs-verstappen";
import { KHABIB_VS_MCGREGOR } from "./cabinets/khabib-vs-mcgregor";
import { LEBRON_VS_JORDAN } from "./cabinets/lebron-vs-jordan";
import { NEYMAR_VS_RONALDINHO } from "./cabinets/neymar-vs-ronaldinho";
import { PELE_VS_MARADONA } from "./cabinets/pele-vs-maradona";
import { TYSON_VS_ALI } from "./cabinets/tyson-vs-ali";
import { YAMAL_VS_MBAPPE } from "./cabinets/yamal-vs-mbappe";

/** Which trophy silhouette to draw. */
export type TrophyKind =
  | "champions-league"
  | "world-cup"
  | "league"
  | "cup"
  | "super-cup"
  | "club-world-cup"
  | "continental"
  | "shield"
  | "trophy"
  | "medal"
  | "ballon-dor"
  | "golden-shoe"
  | "statuette"
  /** Boxing and MMA world-title belts. */
  | "belt"
  /** The Grammy's gramophone. */
  | "gramophone"
  /** A ball on a tall trophy, like the NBA's Larry O'Brien. */
  | "basketball";

export type Honour = {
  competition: string;
  team: string;
  kind: TrophyKind;
  /** Seasons ("2008–09") or years ("2022"), oldest first. */
  seasons: string[];
};

export type CabinetCategory = {
  id: string;
  title: string;
  note?: string;
  /** Each option's honours, in the debate's option order. */
  honours: [Honour[], Honour[]];
};

/** A row in the cabinet's opening table: one category, or one competition across categories. */
export type HeadlineRow = { label: string; kind: TrophyKind } & ({ category: string } | { competition: string });

export type Cabinet = {
  asOf: string;
  /** Under the big totals, e.g. "team trophies" or "world titles". */
  totalLabel: string;
  /** One line under the title. */
  intro: string;
  /** The counted section, e.g. "Team trophies", and a line about it. */
  teamTitle: string;
  teamBlurb: string;
  individualTitle: string;
  individualBlurb: string;
  /** The opening table: the honours this debate turns on. */
  headline: HeadlineRow[];
  /** These make up each side's total. */
  team: CabinetCategory[];
  /** Youth or amateur titles: listed, not counted in the total. */
  youth?: CabinetCategory & { label: string };
  individual: CabinetCategory[];
  records: [string[], string[]];
  /** Small print under the records. */
  footnote: string;
};

const MESSI_VS_RONALDO: Cabinet = {
  asOf: "October 2026",
  totalLabel: "team trophies",
  intro: "Every team trophy and major individual award, side by side.",
  teamTitle: "Team trophies",
  teamBlurb: "Senior honours with club and country. These make up the totals.",
  individualTitle: "Individual awards",
  individualBlurb: "The game’s biggest awards for a single player.",
  headline: [
    { label: "Ballon d’Or", kind: "ballon-dor", category: "ballon-dor" },
    { label: "Champions League", kind: "champions-league", category: "champions-league" },
    { label: "World Cup", kind: "world-cup", competition: "FIFA World Cup" },
    { label: "League titles", kind: "league", category: "league" },
    { label: "International trophies", kind: "continental", category: "international" },
  ],
  footnote:
    "Totals count senior team trophies won with club and country; youth titles are listed separately. Seasons follow each competition’s own naming.",
  team: [
    {
      id: "champions-league",
      title: "Champions League",
      honours: [
        [{ competition: "UEFA Champions League", team: "Barcelona", kind: "champions-league", seasons: ["2005–06", "2008–09", "2010–11", "2014–15"] }],
        [
          { competition: "UEFA Champions League", team: "Manchester United", kind: "champions-league", seasons: ["2007–08"] },
          { competition: "UEFA Champions League", team: "Real Madrid", kind: "champions-league", seasons: ["2013–14", "2015–16", "2016–17", "2017–18"] },
        ],
      ],
    },
    {
      id: "league",
      title: "League titles",
      honours: [
        [
          {
            competition: "La Liga",
            team: "Barcelona",
            kind: "league",
            seasons: ["2004–05", "2005–06", "2008–09", "2009–10", "2010–11", "2012–13", "2014–15", "2015–16", "2017–18", "2018–19"],
          },
          { competition: "Ligue 1", team: "Paris Saint-Germain", kind: "league", seasons: ["2021–22", "2022–23"] },
          { competition: "MLS Cup", team: "Inter Miami", kind: "league", seasons: ["2025"] },
        ],
        [
          { competition: "Premier League", team: "Manchester United", kind: "league", seasons: ["2006–07", "2007–08", "2008–09"] },
          { competition: "La Liga", team: "Real Madrid", kind: "league", seasons: ["2011–12", "2016–17"] },
          { competition: "Serie A", team: "Juventus", kind: "league", seasons: ["2018–19", "2019–20"] },
          { competition: "Saudi Pro League", team: "Al Nassr", kind: "league", seasons: ["2025–26"] },
        ],
      ],
    },
    {
      id: "domestic-cup",
      title: "Domestic cups",
      honours: [
        [
          {
            competition: "Copa del Rey",
            team: "Barcelona",
            kind: "cup",
            seasons: ["2008–09", "2011–12", "2014–15", "2015–16", "2016–17", "2017–18", "2020–21"],
          },
        ],
        [
          { competition: "FA Cup", team: "Manchester United", kind: "cup", seasons: ["2003–04"] },
          { competition: "League Cup", team: "Manchester United", kind: "cup", seasons: ["2005–06", "2008–09"] },
          { competition: "Copa del Rey", team: "Real Madrid", kind: "cup", seasons: ["2010–11", "2013–14"] },
          { competition: "Coppa Italia", team: "Juventus", kind: "cup", seasons: ["2020–21"] },
        ],
      ],
    },
    {
      id: "super-cup",
      title: "Super cups",
      honours: [
        [
          {
            competition: "Supercopa de España",
            team: "Barcelona",
            kind: "super-cup",
            seasons: ["2005", "2006", "2009", "2010", "2011", "2013", "2016", "2018"],
          },
          { competition: "UEFA Super Cup", team: "Barcelona", kind: "super-cup", seasons: ["2009", "2011", "2015"] },
          { competition: "Trophée des Champions", team: "Paris Saint-Germain", kind: "super-cup", seasons: ["2022"] },
        ],
        [
          { competition: "Supertaça", team: "Sporting CP", kind: "super-cup", seasons: ["2002"] },
          { competition: "Community Shield", team: "Manchester United", kind: "super-cup", seasons: ["2007"] },
          { competition: "Supercopa de España", team: "Real Madrid", kind: "super-cup", seasons: ["2012", "2017"] },
          { competition: "UEFA Super Cup", team: "Real Madrid", kind: "super-cup", seasons: ["2014", "2017"] },
          { competition: "Supercoppa Italiana", team: "Juventus", kind: "super-cup", seasons: ["2018", "2020"] },
        ],
      ],
    },
    {
      id: "club-world-cup",
      title: "Club World Cup",
      honours: [
        [{ competition: "FIFA Club World Cup", team: "Barcelona", kind: "club-world-cup", seasons: ["2009", "2011", "2015"] }],
        [
          { competition: "FIFA Club World Cup", team: "Manchester United", kind: "club-world-cup", seasons: ["2008"] },
          { competition: "FIFA Club World Cup", team: "Real Madrid", kind: "club-world-cup", seasons: ["2014", "2016", "2017"] },
        ],
      ],
    },
    {
      id: "other-club",
      title: "Other club trophies",
      honours: [
        [
          { competition: "Leagues Cup", team: "Inter Miami", kind: "trophy", seasons: ["2023"] },
          { competition: "Supporters’ Shield", team: "Inter Miami", kind: "shield", seasons: ["2024"] },
          { competition: "Campeones Cup", team: "Inter Miami", kind: "trophy", seasons: ["2026"] },
        ],
        [{ competition: "Arab Club Champions Cup", team: "Al Nassr", kind: "trophy", seasons: ["2023"] }],
      ],
    },
    {
      id: "international",
      title: "International trophies",
      honours: [
        [
          { competition: "FIFA World Cup", team: "Argentina", kind: "world-cup", seasons: ["2022"] },
          { competition: "Copa América", team: "Argentina", kind: "continental", seasons: ["2021", "2024"] },
          { competition: "Finalissima", team: "Argentina", kind: "continental", seasons: ["2022"] },
        ],
        [
          { competition: "UEFA European Championship", team: "Portugal", kind: "continental", seasons: ["2016"] },
          { competition: "UEFA Nations League", team: "Portugal", kind: "continental", seasons: ["2018–19", "2024–25"] },
        ],
      ],
    },
  ],
  youth: {
    id: "youth",
    label: "youth titles",
    title: "Youth titles",
    note: "Listed for completeness; not counted in the totals.",
    honours: [
      [
        { competition: "FIFA U-20 World Cup", team: "Argentina U20", kind: "trophy", seasons: ["2005"] },
        { competition: "Olympic gold medal", team: "Argentina U23", kind: "medal", seasons: ["2008"] },
      ],
      [],
    ],
  },
  individual: [
    {
      id: "ballon-dor",
      title: "Ballon d’Or",
      honours: [
        [{ competition: "Ballon d’Or", team: "", kind: "ballon-dor", seasons: ["2009", "2010", "2011", "2012", "2015", "2019", "2021", "2023"] }],
        [{ competition: "Ballon d’Or", team: "", kind: "ballon-dor", seasons: ["2008", "2013", "2014", "2016", "2017"] }],
      ],
    },
    {
      id: "the-best",
      title: "The Best FIFA Men’s Player",
      honours: [
        [{ competition: "The Best FIFA Men’s Player", team: "", kind: "statuette", seasons: ["2019", "2022", "2023"] }],
        [{ competition: "The Best FIFA Men’s Player", team: "", kind: "statuette", seasons: ["2016", "2017"] }],
      ],
    },
    {
      id: "golden-shoe",
      title: "European Golden Shoe",
      honours: [
        [
          {
            competition: "European Golden Shoe",
            team: "",
            kind: "golden-shoe",
            seasons: ["2009–10", "2011–12", "2012–13", "2016–17", "2017–18", "2018–19"],
          },
        ],
        [{ competition: "European Golden Shoe", team: "", kind: "golden-shoe", seasons: ["2007–08", "2010–11", "2013–14", "2014–15"] }],
      ],
    },
    {
      id: "golden-ball",
      title: "World Cup Golden Ball",
      honours: [[{ competition: "World Cup Golden Ball", team: "", kind: "ballon-dor", seasons: ["2014", "2022"] }], []],
    },
  ],
  records: [
    [
      "The most decorated footballer in history: 48 trophies, including two at youth level.",
      "Eight Ballon d’Or awards, the most ever.",
      "Six European Golden Shoes and eight Pichichi trophies, both records.",
      "91 goals in 2012, the most in a calendar year.",
      "672 goals for Barcelona, the most for a single club.",
      "The only player to win the World Cup Golden Ball twice.",
      "The most appearances in World Cup history.",
    ],
    [
      "The Champions League’s all-time top scorer, with 140 goals.",
      "17 goals in the 2013–14 Champions League, the most in a single season.",
      "146 goals for Portugal, the most in men’s international football.",
      "234 caps for Portugal, the most in men’s international football.",
      "14 goals at the European Championship, the most in its history.",
      "The first man to score at six World Cups, from 2006 to 2026.",
    ],
  ],
};

const CABINETS: Record<string, Cabinet> = {
  "messi-vs-ronaldo": MESSI_VS_RONALDO,
  "pele-vs-maradona": PELE_VS_MARADONA,
  "yamal-vs-mbappe": YAMAL_VS_MBAPPE,
  "neymar-vs-ronaldinho": NEYMAR_VS_RONALDINHO,
  "lebron-vs-jordan": LEBRON_VS_JORDAN,
  "tyson-vs-ali": TYSON_VS_ALI,
  "khabib-vs-mcgregor": KHABIB_VS_MCGREGOR,
  "hamilton-vs-verstappen": HAMILTON_VS_VERSTAPPEN,
  "drake-vs-kendrick": DRAKE_VS_KENDRICK,
};

export function getCabinet(debateSlug: string): Cabinet | undefined {
  return CABINETS[debateSlug];
}

export function hasCabinet(debateSlug: string): boolean {
  return Object.hasOwn(CABINETS, debateSlug);
}

/** How many times this side won the honours in a category. */
export function countHonours(honours: Honour[]): number {
  return honours.reduce((sum, honour) => sum + honour.seasons.length, 0);
}

/** Senior team trophies for each side. */
export function teamTotals(cabinet: Cabinet): [number, number] {
  const total = (side: 0 | 1) => cabinet.team.reduce((sum, category) => sum + countHonours(category.honours[side]), 0);
  return [total(0), total(1)];
}

export function categoryCounts(category: CabinetCategory): [number, number] {
  return [countHonours(category.honours[0]), countHonours(category.honours[1])];
}

export function findCategory(cabinet: Cabinet, id: string): CabinetCategory | undefined {
  return [...cabinet.team, ...(cabinet.youth ? [cabinet.youth] : []), ...cabinet.individual].find((category) => category.id === id);
}

/** How many times each side won one competition, across every category. */
export function competitionCounts(cabinet: Cabinet, competition: string): [number, number] {
  const count = (side: 0 | 1) =>
    [...cabinet.team, ...cabinet.individual].reduce(
      (sum, category) => sum + countHonours(category.honours[side].filter((honour) => honour.competition === competition)),
      0,
    );
  return [count(0), count(1)];
}

/** Counts for one row of the opening table. */
export function headlineCounts(cabinet: Cabinet, row: HeadlineRow): [number, number] {
  if ("competition" in row) return competitionCounts(cabinet, row.competition);
  const category = findCategory(cabinet, row.category);
  return category ? categoryCounts(category) : [0, 0];
}

/** "2008–09" → "’09", "2022" → "’22". */
export function shortSeason(season: string): string {
  return `’${season.slice(-2)}`;
}
