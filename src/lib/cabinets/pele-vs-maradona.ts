import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/Pel%C3%A9 https://www.transfermarkt.com/pele/erfolge/spieler/17121 https://www.santos.sp.gov.br/static/files_www/files/portal_files/numeros_do_rei.pdf https://www.guinnessworldrecords.com/world-records/most-career-goals-(football) https://m.globoesporte.globo.com/futebol/noticia/2010/12/cbf-equipara-taca-brasil-e-robertao-brasileiro-santos-e-palmeiras-viram-octas.html https://www.rsssf.org/miscellaneous/sampoy73.html https://en.wikipedia.org/wiki/Diego_Maradona https://www.transfermarkt.com/diego-maradona/erfolge/spieler/8024 https://en.wikipedia.org/wiki/List_of_Argentine_Primera_Divisi%C3%B3n_top_scorers https://www.francefootball.fr/news/Combien-de-ballon-s-d-or-france-football-aurait-pu-remporter-diego-maradona/1187918
export const PELE_VS_MARADONA: Cabinet = {
  asOf: "October 2026",
  totalLabel: "team trophies",
  intro: "Every team trophy and major individual award, side by side.",
  teamTitle: "Team trophies",
  teamBlurb: "Senior honours with club and country. These make up the totals.",
  individualTitle: "Individual awards",
  individualBlurb: "The game’s biggest awards for a single player.",
  headline: [
    { label: "World Cup", kind: "world-cup", competition: "FIFA World Cup" },
    { label: "Continental club titles", kind: "continental", category: "continental-club" },
    { label: "Intercontinental Cup", kind: "club-world-cup", category: "intercontinental" },
    { label: "League titles", kind: "league", category: "league" },
    { label: "Player of the Century", kind: "statuette", category: "player-of-the-century" },
  ],
  footnote:
    "Totals count senior team trophies won with club and country, including Brazilian state championships and the Torneio Rio–São Paulo; youth titles are listed separately. Pelé’s six Brazilian titles are the 1961–65 Taça Brasil and the 1968 Torneio Roberto Gomes Pedrosa, recognised as national championships by the CBF in 2010. Friendly and invitational trophies are not included. Seasons follow each competition’s own naming.",
  team: [
    {
      id: "continental-club",
      title: "Continental club titles",
      honours: [
        [{ competition: "Copa Libertadores", team: "Santos", kind: "continental", seasons: ["1962", "1963"] }],
        [{ competition: "UEFA Cup", team: "Napoli", kind: "continental", seasons: ["1988–89"] }],
      ],
    },
    {
      id: "intercontinental",
      title: "Intercontinental Cup",
      note: "The club world championship of its day, between the champions of South America and Europe.",
      honours: [[{ competition: "Intercontinental Cup", team: "Santos", kind: "club-world-cup", seasons: ["1962", "1963"] }], []],
    },
    {
      id: "league",
      title: "League titles",
      honours: [
        [
          {
            competition: "Campeonato Brasileiro",
            team: "Santos",
            kind: "league",
            seasons: ["1961", "1962", "1963", "1964", "1965", "1968"],
          },
          { competition: "NASL Soccer Bowl", team: "New York Cosmos", kind: "league", seasons: ["1977"] },
        ],
        [
          { competition: "Argentine Primera División (Metropolitano)", team: "Boca Juniors", kind: "league", seasons: ["1981"] },
          { competition: "Serie A", team: "Napoli", kind: "league", seasons: ["1986–87", "1989–90"] },
        ],
      ],
    },
    {
      id: "domestic-cup",
      title: "Domestic cups",
      honours: [
        [],
        [
          { competition: "Copa del Rey", team: "Barcelona", kind: "cup", seasons: ["1982–83"] },
          { competition: "Copa de la Liga", team: "Barcelona", kind: "cup", seasons: ["1983"] },
          { competition: "Coppa Italia", team: "Napoli", kind: "cup", seasons: ["1986–87"] },
        ],
      ],
    },
    {
      id: "super-cup",
      title: "Super cups",
      honours: [[], [{ competition: "Supercoppa Italiana", team: "Napoli", kind: "super-cup", seasons: ["1990"] }]],
    },
    {
      id: "other-club",
      title: "Other club trophies",
      note: "Santos shared the 1964 Torneio Rio–São Paulo with Botafogo.",
      honours: [
        [
          {
            competition: "Campeonato Paulista",
            team: "Santos",
            kind: "trophy",
            seasons: ["1958", "1960", "1961", "1962", "1964", "1965", "1967", "1968", "1969", "1973"],
          },
          { competition: "Torneio Rio–São Paulo", team: "Santos", kind: "trophy", seasons: ["1959", "1963", "1964"] },
        ],
        [],
      ],
    },
    {
      id: "international",
      title: "International trophies",
      note: "The Artemio Franchi Trophy, between the champions of South America and Europe, was the forerunner of today’s Finalissima.",
      honours: [
        [{ competition: "FIFA World Cup", team: "Brazil", kind: "world-cup", seasons: ["1958", "1962", "1970"] }],
        [
          { competition: "FIFA World Cup", team: "Argentina", kind: "world-cup", seasons: ["1986"] },
          { competition: "Artemio Franchi Trophy", team: "Argentina", kind: "continental", seasons: ["1993"] },
        ],
      ],
    },
  ],
  youth: {
    id: "youth",
    label: "youth titles",
    title: "Youth titles",
    note: "Listed for completeness; not counted in the totals.",
    honours: [[], [{ competition: "FIFA World Youth Championship", team: "Argentina U20", kind: "trophy", seasons: ["1979"] }]],
  },
  individual: [
    {
      id: "player-of-the-century",
      title: "FIFA Player of the Century",
      note: "Shared: a FIFA committee chose Pelé, and an online vote chose Maradona.",
      honours: [
        [{ competition: "FIFA Player of the Century", team: "", kind: "statuette", seasons: ["2000"] }],
        [{ competition: "FIFA Player of the Century", team: "", kind: "statuette", seasons: ["2000"] }],
      ],
    },
    {
      id: "honorary-ballon-dor",
      title: "Honorary Ballon d’Or",
      note: "Neither could win the Ballon d’Or itself, which was open only to European players until 1995. Both received honorary awards instead.",
      honours: [
        [{ competition: "FIFA Ballon d’Or Prix d’Honneur", team: "", kind: "ballon-dor", seasons: ["2013"] }],
        [{ competition: "Honorary Ballon d’Or", team: "", kind: "ballon-dor", seasons: ["1995"] }],
      ],
    },
    {
      id: "golden-ball",
      title: "Tournament Golden Ball",
      note: "The World Cup Golden Ball was introduced in 1982, after Pelé’s last World Cup.",
      honours: [
        [],
        [
          { competition: "FIFA World Youth Championship Golden Ball", team: "", kind: "ballon-dor", seasons: ["1979"] },
          { competition: "World Cup Golden Ball", team: "", kind: "ballon-dor", seasons: ["1986"] },
        ],
      ],
    },
    {
      id: "south-american-player",
      title: "South American Footballer of the Year",
      note: "First awarded in 1971, near the end of Pelé’s career.",
      honours: [
        [{ competition: "South American Footballer of the Year", team: "", kind: "trophy", seasons: ["1973"] }],
        [
          {
            competition: "South American Footballer of the Year",
            team: "",
            kind: "trophy",
            seasons: ["1979", "1980", "1986", "1989", "1990", "1992"],
          },
        ],
      ],
    },
    {
      id: "top-scorer",
      title: "Top scorer awards",
      note: "The Metropolitano and Nacional were the two Argentine Primera División championships of each season. Maradona shared the 1978 and 1979 Metropolitano awards.",
      honours: [
        [
          { competition: "South American Championship top scorer", team: "", kind: "golden-shoe", seasons: ["1959"] },
          { competition: "Intercontinental Cup top scorer", team: "", kind: "golden-shoe", seasons: ["1962", "1963"] },
          { competition: "Copa Libertadores top scorer", team: "", kind: "golden-shoe", seasons: ["1965"] },
          {
            competition: "Campeonato Paulista top scorer",
            team: "",
            kind: "golden-shoe",
            seasons: ["1957", "1958", "1959", "1960", "1961", "1962", "1963", "1964", "1965", "1969", "1973"],
          },
        ],
        [
          { competition: "Metropolitano top scorer", team: "", kind: "golden-shoe", seasons: ["1978", "1979", "1980"] },
          { competition: "Nacional top scorer", team: "", kind: "golden-shoe", seasons: ["1979", "1980"] },
          { competition: "Serie A top scorer", team: "", kind: "golden-shoe", seasons: ["1987–88"] },
          { competition: "Coppa Italia top scorer", team: "", kind: "golden-shoe", seasons: ["1987–88"] },
        ],
      ],
    },
    {
      id: "league-player",
      title: "League Player of the Season",
      honours: [[{ competition: "NASL Most Valuable Player", team: "", kind: "trophy", seasons: ["1976"] }], []],
    },
  ],
  records: [
    [
      "The only player to win the World Cup three times: 1958, 1962 and 1970.",
      "The youngest World Cup winner and the youngest scorer in a World Cup final, at 17 in 1958.",
      "1,279 goals in 1,363 games, friendlies included: the Guinness World Record for career goals.",
      "643 goals for Santos in official matches, the club’s record.",
      "Seven goals in the Intercontinental Cup, the most in its history, including its only hat-trick.",
      "Top scorer in the Campeonato Paulista 11 times, including 58 goals in 1958, a record for one season.",
      "77 goals in 92 games for Brazil, second only to Neymar.",
    ],
    [
      "Joint FIFA Player of the Century with Pelé, in 2000.",
      "Scored the Goal of the Century against England at the 1986 World Cup, voted by FIFA.com users in 2002.",
      "Twice broke the world transfer record: to Barcelona in 1982 and to Napoli in 1984.",
      "Led Napoli to their first two Serie A titles, in 1986–87 and 1989–90.",
      "Napoli’s all-time top scorer, with 115 goals, until Marek Hamšík overtook him in 2017.",
      "Top scorer in five Argentine Primera División tournaments with Argentinos Juniors, from 1978 to 1980.",
      "21 matches at four World Cups, from 1982 to 1994, with two finals.",
    ],
  ],
};
