import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/Lamine_Yamal https://www.transfermarkt.com/lamine-yamal/erfolge/spieler/937958 https://en.wikipedia.org/wiki/Kylian_Mbapp%C3%A9 https://www.transfermarkt.com/kylian-mbappe/erfolge/spieler/342229 https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights https://en.wikipedia.org/wiki/2026_Ballon_d%27Or
export const YAMAL_VS_MBAPPE: Cabinet = {
  asOf: "October 2026",
  totalLabel: "team trophies",
  intro: "Every team trophy and major individual award, side by side.",
  teamTitle: "Team trophies",
  teamBlurb: "Senior honours with club and country. These make up the totals.",
  individualTitle: "Individual awards",
  individualBlurb: "The game’s biggest awards for a single player.",
  headline: [
    { label: "World Cup", kind: "world-cup", competition: "FIFA World Cup" },
    { label: "International trophies", kind: "continental", category: "international" },
    { label: "League titles", kind: "league", category: "league" },
    { label: "Kopa Trophy", kind: "trophy", category: "kopa" },
    { label: "World Cup Golden Boot", kind: "golden-shoe", category: "golden-boot" },
  ],
  footnote:
    "Totals count senior team trophies won with club and country; youth titles are listed separately. Neither player has won the Ballon d’Or: Mbappé was second and Yamal third in 2026. Seasons follow each competition’s own naming.",
  team: [
    {
      id: "league",
      title: "League titles",
      honours: [
        [{ competition: "La Liga", team: "Barcelona", kind: "league", seasons: ["2022–23", "2024–25", "2025–26"] }],
        [
          { competition: "Ligue 1", team: "Monaco", kind: "league", seasons: ["2016–17"] },
          {
            competition: "Ligue 1",
            team: "Paris Saint-Germain",
            kind: "league",
            seasons: ["2017–18", "2018–19", "2019–20", "2021–22", "2022–23", "2023–24"],
          },
        ],
      ],
    },
    {
      id: "domestic-cup",
      title: "Domestic cups",
      honours: [
        [{ competition: "Copa del Rey", team: "Barcelona", kind: "cup", seasons: ["2024–25"] }],
        [
          { competition: "Coupe de France", team: "Paris Saint-Germain", kind: "cup", seasons: ["2017–18", "2019–20", "2020–21", "2023–24"] },
          { competition: "Coupe de la Ligue", team: "Paris Saint-Germain", kind: "cup", seasons: ["2017–18", "2019–20"] },
        ],
      ],
    },
    {
      id: "super-cup",
      title: "Super cups",
      honours: [
        [{ competition: "Supercopa de España", team: "Barcelona", kind: "super-cup", seasons: ["2025", "2026"] }],
        [
          { competition: "Trophée des Champions", team: "Paris Saint-Germain", kind: "super-cup", seasons: ["2019", "2020", "2023"] },
          { competition: "UEFA Super Cup", team: "Real Madrid", kind: "super-cup", seasons: ["2024"] },
        ],
      ],
    },
    {
      id: "intercontinental-cup",
      title: "Intercontinental Cup",
      honours: [[], [{ competition: "FIFA Intercontinental Cup", team: "Real Madrid", kind: "club-world-cup", seasons: ["2024"] }]],
    },
    {
      id: "international",
      title: "International trophies",
      honours: [
        [
          { competition: "FIFA World Cup", team: "Spain", kind: "world-cup", seasons: ["2026"] },
          { competition: "UEFA European Championship", team: "Spain", kind: "continental", seasons: ["2024"] },
        ],
        [
          { competition: "FIFA World Cup", team: "France", kind: "world-cup", seasons: ["2018"] },
          { competition: "UEFA Nations League", team: "France", kind: "continental", seasons: ["2020–21"] },
        ],
      ],
    },
  ],
  youth: {
    id: "youth",
    label: "youth titles",
    title: "Youth titles",
    note: "Listed for completeness; not counted in the totals.",
    honours: [[], [{ competition: "UEFA European Under-19 Championship", team: "France U19", kind: "trophy", seasons: ["2016"] }]],
  },
  individual: [
    {
      id: "kopa",
      title: "Kopa Trophy",
      honours: [
        [{ competition: "Kopa Trophy", team: "", kind: "trophy", seasons: ["2024", "2025", "2026"] }],
        [{ competition: "Kopa Trophy", team: "", kind: "trophy", seasons: ["2018"] }],
      ],
    },
    {
      id: "golden-boy",
      title: "Golden Boy",
      honours: [
        [{ competition: "Golden Boy", team: "", kind: "trophy", seasons: ["2024"] }],
        [{ competition: "Golden Boy", team: "", kind: "trophy", seasons: ["2017"] }],
      ],
    },
    {
      id: "young-player",
      title: "Tournament Young Player award",
      honours: [
        [{ competition: "European Championship Young Player of the Tournament", team: "", kind: "trophy", seasons: ["2024"] }],
        [{ competition: "World Cup Best Young Player", team: "", kind: "trophy", seasons: ["2018"] }],
      ],
    },
    {
      id: "golden-boot",
      title: "World Cup Golden Boot",
      honours: [[], [{ competition: "World Cup Golden Boot", team: "", kind: "golden-shoe", seasons: ["2022", "2026"] }]],
    },
    {
      id: "golden-shoe",
      title: "European Golden Shoe",
      honours: [[], [{ competition: "European Golden Shoe", team: "", kind: "golden-shoe", seasons: ["2024–25"] }]],
    },
    {
      id: "league-player",
      title: "League Player of the Season",
      honours: [
        [{ competition: "La Liga Player of the Season", team: "", kind: "trophy", seasons: ["2025–26"] }],
        [{ competition: "Ligue 1 Player of the Year", team: "", kind: "trophy", seasons: ["2018–19", "2020–21", "2021–22", "2022–23", "2023–24"] }],
      ],
    },
    {
      id: "league-top-scorer",
      title: "League top scorer",
      honours: [
        [],
        [
          {
            competition: "Ligue 1 top scorer",
            team: "",
            kind: "trophy",
            seasons: ["2018–19", "2019–20", "2020–21", "2021–22", "2022–23", "2023–24"],
          },
          { competition: "Pichichi Trophy", team: "", kind: "trophy", seasons: ["2024–25", "2025–26"] },
        ],
      ],
    },
    {
      id: "champions-league-top-scorer",
      title: "Champions League top scorer",
      honours: [[], [{ competition: "Champions League top scorer", team: "", kind: "trophy", seasons: ["2023–24", "2025–26"] }]],
    },
  ],
  records: [
    [
      "Spain’s youngest player and scorer, at 16 years and 57 days.",
      "The youngest scorer in European Championship history, against France at Euro 2024.",
      "The youngest player to win the European Championship, at Euro 2024.",
      "The youngest player to have won both the World Cup and the European Championship, at 19.",
      "The first player to win the Kopa Trophy three times, in 2024, 2025 and 2026.",
    ],
    [
      "22 World Cup goals, the most in history.",
      "The first player to win the World Cup Golden Boot twice, in 2022 and 2026.",
      "Four goals in World Cup finals, the most ever.",
      "The second teenager, after Pelé, to score in a World Cup final, in 2018.",
      "France’s all-time top scorer, with 67 goals.",
      "Paris Saint-Germain’s all-time top scorer, with 256 goals.",
      "Ligue 1’s top scorer six times and its Player of the Year five times, both records.",
    ],
  ],
};
