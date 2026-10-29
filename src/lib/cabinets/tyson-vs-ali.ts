import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/Mike_Tyson https://en.wikipedia.org/wiki/Boxing_career_of_Muhammad_Ali https://en.wikipedia.org/wiki/List_of_The_Ring_world_champions https://en.wikipedia.org/wiki/List_of_WBA_world_champions https://en.wikipedia.org/wiki/List_of_WBC_world_champions https://en.wikipedia.org/wiki/The_Ring_magazine_Fighter_of_the_Year https://en.wikipedia.org/wiki/Sugar_Ray_Robinson_Award https://boxrec.com/wiki/index.php/Boxing_Writers_Association_of_America_Fighter_of_the_Year https://en.wikipedia.org/wiki/BBC_Sports_Personality_World_Sport_Star_of_the_Year https://alicenter.org/meet-ali/awards/
export const TYSON_VS_ALI: Cabinet = {
  asOf: "October 2026",
  totalLabel: "world title wins",
  intro: "Every world heavyweight title and major award, side by side.",
  teamTitle: "World titles",
  teamBlurb: "Each world title won or regained, belt by belt. These make up the totals.",
  individualTitle: "Awards and honours",
  individualBlurb: "Boxing’s fighter-of-the-year awards, halls of fame and wider honours.",
  headline: [
    { label: "The Ring / lineal title", kind: "belt", category: "ring" },
    { label: "WBC title", kind: "belt", category: "wbc" },
    { label: "WBA title", kind: "belt", category: "wba" },
    { label: "IBF title", kind: "belt", category: "ibf" },
    { label: "Ring Fighter of the Year", kind: "trophy", category: "ring-foty" },
  ],
  footnote:
    "Totals count each world heavyweight title won or regained, belt by belt, so a fight that carried several belts counts once for each; defences are not counted. Amateur titles are listed separately.",
  team: [
    {
      id: "ring",
      title: "The Ring / lineal title",
      honours: [
        [{ competition: "The Ring heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1988"] }],
        [{ competition: "The Ring heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1964", "1974", "1978"] }],
      ],
    },
    {
      id: "wbc",
      title: "WBC",
      honours: [
        [{ competition: "WBC heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1986", "1996"] }],
        [{ competition: "WBC heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1964", "1974"] }],
      ],
    },
    {
      id: "wba",
      title: "WBA",
      honours: [
        [{ competition: "WBA heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1987", "1996"] }],
        [{ competition: "WBA heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1964", "1967", "1974", "1978"] }],
      ],
    },
    {
      id: "ibf",
      title: "IBF",
      honours: [
        [{ competition: "IBF heavyweight title", team: "Heavyweight", kind: "belt", seasons: ["1987"] }],
        [],
      ],
    },
  ],
  youth: {
    id: "amateur",
    label: "amateur titles",
    title: "Amateur titles",
    note: "Listed for completeness; not counted in the totals.",
    honours: [
      [
        { competition: "National Junior Olympics", team: "Heavyweight", kind: "medal", seasons: ["1981", "1982"] },
        { competition: "National Golden Gloves", team: "Heavyweight", kind: "trophy", seasons: ["1984"] },
      ],
      [
        { competition: "Olympic gold medal", team: "United States (light heavyweight)", kind: "medal", seasons: ["1960"] },
        { competition: "AAU national championship", team: "Light heavyweight", kind: "trophy", seasons: ["1959", "1960"] },
        { competition: "Chicago Golden Gloves", team: "Light heavyweight", kind: "trophy", seasons: ["1959", "1960"] },
      ],
    ],
  },
  individual: [
    {
      id: "ring-foty",
      title: "The Ring Fighter of the Year",
      honours: [
        [{ competition: "The Ring Fighter of the Year", team: "", kind: "trophy", seasons: ["1986", "1988"] }],
        [{ competition: "The Ring Fighter of the Year", team: "", kind: "trophy", seasons: ["1963", "1966", "1972", "1974", "1975", "1978"] }],
      ],
    },
    {
      id: "bwaa",
      title: "BWAA Fighter of the Year",
      note: "Ali shared the 1975 award with Joe Frazier.",
      honours: [
        [{ competition: "BWAA Fighter of the Year", team: "", kind: "trophy", seasons: ["1986", "1988"] }],
        [{ competition: "BWAA Fighter of the Year", team: "", kind: "trophy", seasons: ["1965", "1974", "1975"] }],
      ],
    },
    {
      id: "bbc",
      title: "BBC Overseas Sports Personality of the Year",
      honours: [
        [{ competition: "BBC Overseas Sports Personality of the Year", team: "", kind: "trophy", seasons: ["1989"] }],
        [{ competition: "BBC Overseas Sports Personality of the Year", team: "", kind: "trophy", seasons: ["1973", "1974", "1978"] }],
      ],
    },
    {
      id: "hall-of-fame",
      title: "International Boxing Hall of Fame",
      honours: [
        [{ competition: "International Boxing Hall of Fame", team: "", kind: "trophy", seasons: ["2011"] }],
        [{ competition: "International Boxing Hall of Fame", team: "", kind: "trophy", seasons: ["1990"] }],
      ],
    },
    {
      id: "other-honours",
      title: "Other honours",
      honours: [
        [],
        [
          { competition: "Sports Illustrated Sportsman of the Year", team: "", kind: "trophy", seasons: ["1974"] },
          { competition: "Sports Illustrated Sportsman of the Century", team: "", kind: "trophy", seasons: ["1999"] },
          { competition: "BBC Sports Personality of the Century", team: "", kind: "trophy", seasons: ["1999"] },
          { competition: "Presidential Medal of Freedom", team: "", kind: "medal", seasons: ["2005"] },
        ],
      ],
    },
  ],
  records: [
    [
      "The youngest heavyweight champion in history, at 20 years and 4 months, in 1986.",
      "The first heavyweight to hold the WBA, WBC and IBF titles at the same time, from 1987.",
      "Undisputed heavyweight champion from 1 August 1987 to 11 February 1990.",
      "Nine successful WBC title defences in his first reign, from 1986 to 1990.",
      "Knocked out Michael Spinks in 91 seconds in 1988 to become lineal champion.",
      "A professional record of 50–7 with two no contests, and 44 wins by knockout.",
    ],
    [
      "The first man to win the lineal heavyweight title three times, in 1964, 1974 and 1978.",
      "Six Ring Fighter of the Year awards, the most ever.",
      "19 successful defences of The Ring heavyweight title: nine in his first reign and ten in his second.",
      "Olympic light-heavyweight gold in Rome in 1960, as Cassius Clay.",
      "A professional record of 56–5, with 37 wins by knockout.",
      "Named Sportsman of the Century by Sports Illustrated in 1999.",
    ],
  ],
};
