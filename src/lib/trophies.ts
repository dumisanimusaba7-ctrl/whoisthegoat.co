/**
 * Trophy cabinets for each debate, grouped so the two players can be
 * compared like for like. Every total on the cabinet page is counted from
 * these lists, so a trophy added here updates everything.
 *
 * Checked against club, federation and competition records, October 2026.
 */

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
  | "statuette";

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

export type Cabinet = {
  asOf: string;
  /** Senior team trophies: these make up each player's total. */
  team: CabinetCategory[];
  /** Youth titles, listed but not counted in the total. */
  youth: CabinetCategory;
  individual: CabinetCategory[];
  records: [string[], string[]];
};

const MESSI_VS_RONALDO: Cabinet = {
  asOf: "October 2026",
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
  return [...cabinet.team, cabinet.youth, ...cabinet.individual].find((category) => category.id === id);
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

/** "2008–09" → "’09", "2022" → "’22". */
export function shortSeason(season: string): string {
  return `’${season.slice(-2)}`;
}
