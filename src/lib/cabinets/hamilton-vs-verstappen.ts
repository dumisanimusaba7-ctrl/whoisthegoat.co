import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/Lewis_Hamilton https://en.wikipedia.org/wiki/Max_Verstappen https://en.wikipedia.org/wiki/2026_Formula_One_World_Championship https://en.wikipedia.org/wiki/2026_United_States_Grand_Prix https://en.wikipedia.org/wiki/Hawthorn_Memorial_Trophy https://en.wikipedia.org/wiki/FIA_Prize_Giving_Ceremony https://en.wikipedia.org/wiki/Autosport_Awards https://en.wikipedia.org/wiki/Dutch_Sportsman_of_the_year
export const HAMILTON_VS_VERSTAPPEN: Cabinet = {
  asOf: "October 2026",
  totalLabel: "world titles",
  intro: "Every world title and major award, side by side.",
  teamTitle: "World titles",
  teamBlurb:
    "Formula One World Drivers’ Championships. These make up the totals.",
  individualTitle: "Team titles and awards",
  individualBlurb: "Constructors’ titles won with their team, then the sport’s biggest awards for a single driver.",
  headline: [
    { label: "Drivers’ titles", kind: "cup", category: "drivers" },
    { label: "Constructors’ titles", kind: "cup", category: "constructors" },
    { label: "Laureus Sportsman of the Year", kind: "statuette", competition: "Laureus World Sportsman of the Year" },
    { label: "Autosport International Driver", kind: "trophy", competition: "Autosport International Racing Driver Award" },
    { label: "FIA Personality of the Year", kind: "trophy", competition: "FIA Personality of the Year" },
  ],
  footnote:
    "Totals count Formula One World Drivers’ Championships; constructors’ titles are won by the team and listed separately. The 2026 season is still in progress and is not counted. Race wins, poles and podiums are after the United States Grand Prix on 25 October 2026. Junior titles are listed separately.",
  team: [
    {
      id: "drivers",
      title: "Drivers’ Championships",
      honours: [
        [
          { competition: "Formula One World Drivers’ Championship", team: "McLaren", kind: "cup", seasons: ["2008"] },
          {
            competition: "Formula One World Drivers’ Championship",
            team: "Mercedes",
            kind: "cup",
            seasons: ["2014", "2015", "2017", "2018", "2019", "2020"],
          },
        ],
        [
          {
            competition: "Formula One World Drivers’ Championship",
            team: "Red Bull",
            kind: "cup",
            seasons: ["2021", "2022", "2023", "2024"],
          },
        ],
      ],
    },
  ],
  youth: {
    id: "youth",
    label: "junior titles",
    title: "Junior titles",
    note: "Karting and junior single-seater titles. Listed for completeness; not counted in the totals.",
    honours: [
      [
        { competition: "CIK-FIA Karting World Cup (Formula A)", team: "", kind: "trophy", seasons: ["2000"] },
        { competition: "CIK-FIA European Karting Championship (Formula A)", team: "", kind: "trophy", seasons: ["2000"] },
        { competition: "Formula Renault UK", team: "Manor Motorsport", kind: "trophy", seasons: ["2003"] },
        { competition: "Formula 3 Euro Series", team: "ASM", kind: "trophy", seasons: ["2005"] },
        { competition: "GP2 Series", team: "ART Grand Prix", kind: "trophy", seasons: ["2006"] },
      ],
      [
        { competition: "CIK-FIA Karting World Championship (KZ)", team: "", kind: "trophy", seasons: ["2013"] },
        { competition: "CIK-FIA European Karting Championship (KZ)", team: "", kind: "trophy", seasons: ["2013"] },
        { competition: "CIK-FIA European Karting Championship (KF)", team: "", kind: "trophy", seasons: ["2013"] },
        { competition: "Zandvoort Masters (Formula 3)", team: "Van Amersfoort Racing", kind: "trophy", seasons: ["2014"] },
      ],
    ],
  },
  individual: [
    {
      id: "constructors",
      title: "Constructors’ Championships (with team)",
      note: "Won by the team; each driver raced for the champion team that season.",
      honours: [
        [
          {
            competition: "Formula One World Constructors’ Championship",
            team: "Mercedes",
            kind: "cup",
            seasons: ["2014", "2015", "2016", "2017", "2018", "2019", "2020"],
          },
        ],
        [{ competition: "Formula One World Constructors’ Championship", team: "Red Bull", kind: "cup", seasons: ["2022", "2023"] }],
      ],
    },
    {
      id: "laureus",
      title: "Laureus World Sports Awards",
      honours: [
        [
          { competition: "Laureus World Breakthrough of the Year", team: "", kind: "statuette", seasons: ["2008"] },
          { competition: "Laureus World Sportsman of the Year", team: "", kind: "statuette", seasons: ["2020"] },
        ],
        [{ competition: "Laureus World Sportsman of the Year", team: "", kind: "statuette", seasons: ["2022"] }],
      ],
      note: "Hamilton shared the 2020 award with Lionel Messi.",
    },
    {
      id: "autosport",
      title: "Autosport International Racing Driver Award",
      honours: [
        [
          {
            competition: "Autosport International Racing Driver Award",
            team: "",
            kind: "trophy",
            seasons: ["2007", "2008", "2014", "2015", "2017", "2018", "2019", "2020"],
          },
        ],
        [
          {
            competition: "Autosport International Racing Driver Award",
            team: "",
            kind: "trophy",
            seasons: ["2021", "2022", "2023", "2024", "2025"],
          },
        ],
      ],
    },
    {
      id: "fia-personality",
      title: "FIA Personality of the Year",
      honours: [
        [{ competition: "FIA Personality of the Year", team: "", kind: "trophy", seasons: ["2014", "2018", "2020", "2021"] }],
        [{ competition: "FIA Personality of the Year", team: "", kind: "trophy", seasons: ["2015", "2016", "2017"] }],
      ],
    },
    {
      id: "bandini",
      title: "Lorenzo Bandini Trophy",
      honours: [
        [{ competition: "Lorenzo Bandini Trophy", team: "", kind: "trophy", seasons: ["2009"] }],
        [{ competition: "Lorenzo Bandini Trophy", team: "", kind: "trophy", seasons: ["2016"] }],
      ],
    },
    {
      id: "national",
      title: "National awards",
      honours: [
        [
          { competition: "BBC Sports Personality of the Year", team: "", kind: "trophy", seasons: ["2014", "2020"] },
          {
            competition: "Hawthorn Memorial Trophy",
            team: "",
            kind: "trophy",
            seasons: ["2007", "2008", "2012", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2023"],
          },
        ],
        [{ competition: "Dutch Sportsman of the Year", team: "", kind: "trophy", seasons: ["2016", "2021", "2022"] }],
      ],
    },
    {
      id: "state-honours",
      title: "State honours",
      honours: [
        [
          { competition: "MBE", team: "", kind: "medal", seasons: ["2009"] },
          { competition: "Knight Bachelor", team: "", kind: "medal", seasons: ["2021"] },
        ],
        [{ competition: "Officer of the Order of Orange-Nassau", team: "", kind: "medal", seasons: ["2022"] }],
      ],
    },
  ],
  records: [
    [
      "Seven world championships, level with Michael Schumacher for the most in Formula One history.",
      "106 Grand Prix wins, the most in Formula One history.",
      "104 pole positions, the most in Formula One history.",
      "208 podiums, the most in Formula One history.",
      "Nine British Grand Prix wins, the most by any driver at a single Grand Prix.",
      "Won the 2026 Barcelona-Catalunya Grand Prix for Ferrari aged 41, his first Grand Prix win for the team.",
      "Third in the 2026 drivers’ standings on 241 points after the United States Grand Prix.",
    ],
    [
      "The youngest Grand Prix winner in Formula One history, at the 2016 Spanish Grand Prix aged 18.",
      "The youngest driver to start a Grand Prix, at the 2015 Australian Grand Prix aged 17.",
      "19 wins in a season, the most ever, from 22 races in 2023.",
      "10 consecutive Grand Prix wins in 2023, a Formula One record.",
      "21 podiums in a season, the most ever, in 2023.",
      "73 Grand Prix wins, 50 pole positions and 137 podiums after the 2026 United States Grand Prix.",
      "Runner-up in 2025, two points behind champion Lando Norris.",
    ],
  ],
};
