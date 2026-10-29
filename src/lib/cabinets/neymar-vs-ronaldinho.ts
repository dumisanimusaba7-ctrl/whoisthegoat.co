import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/Neymar https://www.transfermarkt.com/neymar/erfolge/spieler/68290 https://en.wikipedia.org/wiki/Ronaldinho https://www.transfermarkt.com/ronaldinho/erfolge/spieler/3373
export const NEYMAR_VS_RONALDINHO: Cabinet = {
  asOf: "October 2026",
  totalLabel: "team trophies",
  intro: "Every team trophy and major individual award, side by side.",
  teamTitle: "Team trophies",
  teamBlurb: "Senior honours with club and country. These make up the totals.",
  individualTitle: "Individual awards",
  individualBlurb: "The game’s biggest awards for a single player.",
  headline: [
    { label: "Ballon d’Or", kind: "ballon-dor", category: "ballon-dor" },
    { label: "World Cup", kind: "world-cup", competition: "FIFA World Cup" },
    { label: "Champions League", kind: "champions-league", category: "champions-league" },
    { label: "Copa Libertadores", kind: "continental", category: "libertadores" },
    { label: "League titles", kind: "league", category: "league" },
  ],
  footnote:
    "Totals count senior team trophies won with club and country, including Brazilian state championships; youth and Olympic titles are listed separately. Seasons follow each competition’s own naming.",
  team: [
    {
      id: "champions-league",
      title: "Champions League",
      honours: [
        [{ competition: "UEFA Champions League", team: "Barcelona", kind: "champions-league", seasons: ["2014–15"] }],
        [{ competition: "UEFA Champions League", team: "Barcelona", kind: "champions-league", seasons: ["2005–06"] }],
      ],
    },
    {
      id: "libertadores",
      title: "Copa Libertadores",
      honours: [
        [{ competition: "Copa Libertadores", team: "Santos", kind: "continental", seasons: ["2011"] }],
        [{ competition: "Copa Libertadores", team: "Atlético Mineiro", kind: "continental", seasons: ["2013"] }],
      ],
    },
    {
      id: "league",
      title: "League titles",
      honours: [
        [
          { competition: "La Liga", team: "Barcelona", kind: "league", seasons: ["2014–15", "2015–16"] },
          {
            competition: "Ligue 1",
            team: "Paris Saint-Germain",
            kind: "league",
            seasons: ["2017–18", "2018–19", "2019–20", "2021–22", "2022–23"],
          },
          { competition: "Saudi Pro League", team: "Al Hilal", kind: "league", seasons: ["2023–24"] },
        ],
        [
          { competition: "La Liga", team: "Barcelona", kind: "league", seasons: ["2004–05", "2005–06"] },
          { competition: "Serie A", team: "AC Milan", kind: "league", seasons: ["2010–11"] },
        ],
      ],
    },
    {
      id: "domestic-cup",
      title: "Domestic cups",
      honours: [
        [
          { competition: "Copa do Brasil", team: "Santos", kind: "cup", seasons: ["2010"] },
          { competition: "Copa del Rey", team: "Barcelona", kind: "cup", seasons: ["2014–15", "2015–16", "2016–17"] },
          { competition: "Coupe de France", team: "Paris Saint-Germain", kind: "cup", seasons: ["2017–18", "2019–20", "2020–21"] },
          { competition: "Coupe de la Ligue", team: "Paris Saint-Germain", kind: "cup", seasons: ["2017–18", "2019–20"] },
        ],
        [],
      ],
    },
    {
      id: "super-cup",
      title: "Super cups",
      honours: [
        [
          { competition: "Recopa Sudamericana", team: "Santos", kind: "super-cup", seasons: ["2012"] },
          { competition: "Supercopa de España", team: "Barcelona", kind: "super-cup", seasons: ["2013"] },
          { competition: "Trophée des Champions", team: "Paris Saint-Germain", kind: "super-cup", seasons: ["2018", "2020", "2022"] },
        ],
        [
          { competition: "Supercopa de España", team: "Barcelona", kind: "super-cup", seasons: ["2005", "2006"] },
          { competition: "Recopa Sudamericana", team: "Atlético Mineiro", kind: "super-cup", seasons: ["2014"] },
        ],
      ],
    },
    {
      id: "club-world-cup",
      title: "Club World Cup",
      honours: [[{ competition: "FIFA Club World Cup", team: "Barcelona", kind: "club-world-cup", seasons: ["2015"] }], []],
    },
    {
      id: "other-club",
      title: "Other club trophies",
      honours: [
        [{ competition: "Campeonato Paulista", team: "Santos", kind: "trophy", seasons: ["2010", "2011", "2012"] }],
        [
          { competition: "Campeonato Gaúcho", team: "Grêmio", kind: "trophy", seasons: ["1999"] },
          { competition: "UEFA Intertoto Cup", team: "Paris Saint-Germain", kind: "trophy", seasons: ["2001"] },
          { competition: "Campeonato Carioca", team: "Flamengo", kind: "trophy", seasons: ["2011"] },
          { competition: "Campeonato Mineiro", team: "Atlético Mineiro", kind: "trophy", seasons: ["2013"] },
        ],
      ],
    },
    {
      id: "international",
      title: "International trophies",
      honours: [
        [{ competition: "FIFA Confederations Cup", team: "Brazil", kind: "continental", seasons: ["2013"] }],
        [
          { competition: "Copa América", team: "Brazil", kind: "continental", seasons: ["1999"] },
          { competition: "FIFA World Cup", team: "Brazil", kind: "world-cup", seasons: ["2002"] },
          { competition: "FIFA Confederations Cup", team: "Brazil", kind: "continental", seasons: ["2005"] },
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
        { competition: "South American U-20 Championship", team: "Brazil U20", kind: "trophy", seasons: ["2011"] },
        { competition: "Olympic gold medal", team: "Brazil U23", kind: "medal", seasons: ["2016"] },
      ],
      [
        { competition: "South American U-17 Championship", team: "Brazil U17", kind: "trophy", seasons: ["1997"] },
        { competition: "FIFA U-17 World Championship", team: "Brazil U17", kind: "trophy", seasons: ["1997"] },
        { competition: "CONMEBOL Pre-Olympic Tournament", team: "Brazil U23", kind: "trophy", seasons: ["2000"] },
      ],
    ],
  },
  individual: [
    {
      id: "ballon-dor",
      title: "Ballon d’Or",
      honours: [[], [{ competition: "Ballon d’Or", team: "", kind: "ballon-dor", seasons: ["2005"] }]],
    },
    {
      id: "world-player",
      title: "FIFA World Player of the Year",
      honours: [[], [{ competition: "FIFA World Player of the Year", team: "", kind: "statuette", seasons: ["2004", "2005"] }]],
    },
    {
      id: "uefa-player",
      title: "UEFA Club Footballer of the Year",
      honours: [[], [{ competition: "UEFA Club Footballer of the Year", team: "", kind: "trophy", seasons: ["2005–06"] }]],
    },
    {
      id: "south-american-player",
      title: "South American Footballer of the Year",
      honours: [
        [{ competition: "South American Footballer of the Year", team: "", kind: "trophy", seasons: ["2011", "2012"] }],
        [{ competition: "South American Footballer of the Year", team: "", kind: "trophy", seasons: ["2013"] }],
      ],
    },
    {
      id: "tournament-golden-ball",
      title: "Tournament Golden Ball",
      note: "Neymar shared the 2021 Copa América award with Lionel Messi.",
      honours: [
        [
          { competition: "Confederations Cup Golden Ball", team: "", kind: "ballon-dor", seasons: ["2013"] },
          { competition: "Copa América Golden Ball", team: "", kind: "ballon-dor", seasons: ["2021"] },
        ],
        [{ competition: "Confederations Cup Golden Ball", team: "", kind: "ballon-dor", seasons: ["1999"] }],
      ],
    },
    {
      id: "puskas",
      title: "FIFA Puskás Award",
      honours: [[{ competition: "FIFA Puskás Award", team: "", kind: "trophy", seasons: ["2011"] }], []],
    },
    {
      id: "league-player",
      title: "League Player of the Season",
      honours: [[{ competition: "Ligue 1 Player of the Year", team: "", kind: "trophy", seasons: ["2017–18"] }], []],
    },
  ],
  records: [
    [
      "Brazil’s all-time top scorer, with 80 goals in 130 appearances.",
      "Brazil’s all-time top assist provider, with 59.",
      "The second Brazilian, after Pelé, to score at four World Cups, from 2014 to 2026.",
      "The most expensive transfer ever: €222 million, from Barcelona to Paris Saint-Germain in 2017.",
      "The first player to score 20 Champions League goals for two different clubs.",
      "Joint top scorer in the 2014–15 Champions League, with 10 goals.",
    ],
    [
      "The only player to have won the World Cup, the Copa América, the Confederations Cup, the Champions League, the Copa Libertadores and the Ballon d’Or.",
      "FIFA World Player of the Year twice, in 2004 and 2005.",
      "Golden Ball and Golden Shoe at the 1999 Confederations Cup, with six goals.",
      "Serie A’s top assist provider in 2009–10, with 15.",
      "33 goals in 97 appearances for Brazil.",
      "Came out of retirement in 2026, at 46, to sign for Italian Serie C club Ravenna.",
    ],
  ],
};
