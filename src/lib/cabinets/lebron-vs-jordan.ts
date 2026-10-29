import type { Cabinet } from "@/lib/trophies";

// Sources: https://www.basketball-reference.com/players/j/jamesle01.html
// https://www.basketball-reference.com/players/j/jordami01.html
// https://about.fiba.basketball/en/fiba-hall-of-fame/hall-of-famers/michael-jordan
// https://en.wikipedia.org/wiki/Basketball_at_the_1983_Pan_American_Games
// https://www.olympedia.org/athletes/6342
// https://www2.ljworld.com/news/2007/sep/03/united_states_grabs_gold/
// https://www.cbssports.com/olympics/news/lebron-james-named-2024-olympics-mvp-stephen-curry-joins-usa-teammate-on-all-star-five-team-in-paris
// https://www.nbcnews.com/sports/basketball/lebron-james-becomes-first-score-50000-combined-points-nba-regular-sea-rcna194836
// https://www.nba.com/news/lebron-james-on-76ers-decision
// https://www.fox9.com/news/lebron-james-signs-philadelphia-76ers
export const LEBRON_VS_JORDAN: Cabinet = {
  asOf: "October 2026",
  totalLabel: "championships",
  intro: "Every championship and major individual award, side by side.",
  teamTitle: "Championships",
  teamBlurb: "NBA titles, the NBA Cup and senior gold medals with the United States. These make up the totals.",
  individualTitle: "Individual awards",
  individualBlurb: "The NBA’s biggest awards for a single player, plus Olympic honours.",
  headline: [
    { label: "NBA titles", kind: "basketball", category: "nba" },
    { label: "Finals MVP", kind: "trophy", category: "finals-mvp" },
    { label: "MVP", kind: "statuette", category: "mvp" },
    { label: "Scoring titles", kind: "trophy", category: "scoring" },
    { label: "Olympic gold", kind: "medal", competition: "Olympic gold medal" },
  ],
  footnote:
    "Totals count NBA titles, the NBA Cup and senior gold medals with the United States; Jordan’s college title is listed separately. The 1983 Pan American and 1984 Olympic teams were made up of college players but were the senior United States sides. LeBron’s 2004 Olympic and 2006 World Championship bronze medals are not counted. NBA seasons are written as the season, e.g. 1990–91.",
  team: [
    {
      id: "nba",
      title: "NBA championships",
      honours: [
        [
          { competition: "NBA championship", team: "Miami Heat", kind: "basketball", seasons: ["2011–12", "2012–13"] },
          { competition: "NBA championship", team: "Cleveland Cavaliers", kind: "basketball", seasons: ["2015–16"] },
          { competition: "NBA championship", team: "Los Angeles Lakers", kind: "basketball", seasons: ["2019–20"] },
        ],
        [
          {
            competition: "NBA championship",
            team: "Chicago Bulls",
            kind: "basketball",
            seasons: ["1990–91", "1991–92", "1992–93", "1995–96", "1996–97", "1997–98"],
          },
        ],
      ],
    },
    {
      id: "nba-cup",
      title: "NBA Cup",
      note: "First held in 2023, as the In-Season Tournament.",
      honours: [[{ competition: "NBA Cup", team: "Los Angeles Lakers", kind: "trophy", seasons: ["2023"] }], []],
    },
    {
      id: "international",
      title: "International titles",
      honours: [
        [
          { competition: "Olympic gold medal", team: "United States", kind: "medal", seasons: ["2008", "2012", "2024"] },
          { competition: "FIBA Americas Championship", team: "United States", kind: "continental", seasons: ["2007"] },
        ],
        [
          { competition: "Olympic gold medal", team: "United States", kind: "medal", seasons: ["1984", "1992"] },
          { competition: "Pan American Games gold medal", team: "United States", kind: "medal", seasons: ["1983"] },
          { competition: "Tournament of the Americas", team: "United States", kind: "continental", seasons: ["1992"] },
        ],
      ],
    },
  ],
  youth: {
    id: "college",
    label: "college titles",
    title: "College titles",
    note: "Listed for completeness; not counted in the totals. LeBron went straight from high school to the NBA.",
    honours: [[], [{ competition: "NCAA championship", team: "North Carolina", kind: "trophy", seasons: ["1981–82"] }]],
  },
  individual: [
    {
      id: "mvp",
      title: "NBA Most Valuable Player",
      honours: [
        [{ competition: "NBA Most Valuable Player", team: "", kind: "statuette", seasons: ["2008–09", "2009–10", "2011–12", "2012–13"] }],
        [{ competition: "NBA Most Valuable Player", team: "", kind: "statuette", seasons: ["1987–88", "1990–91", "1991–92", "1995–96", "1997–98"] }],
      ],
    },
    {
      id: "finals-mvp",
      title: "NBA Finals MVP",
      honours: [
        [{ competition: "NBA Finals MVP", team: "", kind: "trophy", seasons: ["2011–12", "2012–13", "2015–16", "2019–20"] }],
        [
          {
            competition: "NBA Finals MVP",
            team: "",
            kind: "trophy",
            seasons: ["1990–91", "1991–92", "1992–93", "1995–96", "1996–97", "1997–98"],
          },
        ],
      ],
    },
    {
      id: "scoring",
      title: "Scoring titles",
      honours: [
        [{ competition: "NBA scoring title", team: "", kind: "trophy", seasons: ["2007–08"] }],
        [
          {
            competition: "NBA scoring title",
            team: "",
            kind: "trophy",
            seasons: ["1986–87", "1987–88", "1988–89", "1989–90", "1990–91", "1991–92", "1992–93", "1995–96", "1996–97", "1997–98"],
          },
        ],
      ],
    },
    {
      id: "dpoy",
      title: "Defensive Player of the Year",
      honours: [[], [{ competition: "NBA Defensive Player of the Year", team: "", kind: "trophy", seasons: ["1987–88"] }]],
    },
    {
      id: "roy",
      title: "Rookie of the Year",
      honours: [
        [{ competition: "NBA Rookie of the Year", team: "", kind: "trophy", seasons: ["2003–04"] }],
        [{ competition: "NBA Rookie of the Year", team: "", kind: "trophy", seasons: ["1984–85"] }],
      ],
    },
    {
      id: "all-star-mvp",
      title: "All-Star Game MVP",
      honours: [
        [{ competition: "NBA All-Star Game MVP", team: "", kind: "trophy", seasons: ["2006", "2008", "2018"] }],
        [{ competition: "NBA All-Star Game MVP", team: "", kind: "trophy", seasons: ["1988", "1996", "1998"] }],
      ],
    },
    {
      id: "nba-cup-mvp",
      title: "NBA Cup MVP",
      honours: [[{ competition: "NBA Cup MVP", team: "", kind: "trophy", seasons: ["2023"] }], []],
    },
    {
      id: "olympic-mvp",
      title: "Olympic tournament MVP",
      note: "FIBA did not name an Olympic MVP in 1984 or 1992.",
      honours: [[{ competition: "Olympic basketball tournament MVP", team: "", kind: "trophy", seasons: ["2024"] }], []],
    },
    {
      id: "slam-dunk",
      title: "Slam Dunk Contest",
      honours: [[], [{ competition: "NBA Slam Dunk Contest", team: "", kind: "trophy", seasons: ["1987", "1988"] }]],
    },
  ],
  records: [
    [
      "The NBA’s all-time leading scorer: 43,440 regular-season points to the end of 2025–26.",
      "The first player to reach 40,000 regular-season points, on 2 March 2024, and 50,000 including the play-offs, on 4 March 2025.",
      "The most play-off points in NBA history.",
      "22 All-Star selections, the most ever.",
      "21 All-NBA selections and 13 on the First Team, both records.",
      "The only player with 30,000 points, 10,000 rebounds and 10,000 assists.",
      "A record 24th NBA season in 2026–27, with the Philadelphia 76ers.",
    ],
    [
      "30.1 points per game in the regular season, the highest career average in NBA history.",
      "33.4 points per game in the play-offs, also the highest career average.",
      "Ten scoring titles, the most ever.",
      "Six Finals MVP awards, the most ever.",
      "63 points against Boston in 1986, the most in a play-off game.",
      "41.0 points per game in the 1993 Finals, the highest in a Finals series.",
    ],
  ],
};
