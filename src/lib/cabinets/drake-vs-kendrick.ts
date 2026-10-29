import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/List_of_awards_and_nominations_received_by_Kendrick_Lamar https://en.wikipedia.org/wiki/List_of_awards_and_nominations_received_by_Drake https://en.wikipedia.org/wiki/68th_Annual_Grammy_Awards https://www.pulitzer.org/winners/kendrick-lamar https://www.televisionacademy.com/bios/kendrick-lamar https://www.guinnessworldrecords.com/world-records/775504-most-billboard-music-awards-won-male https://www.billboard.com/lists/drake-janice-stfu-hot-100-number-one-second-week/ https://www.xxlmag.com/drake-janice-stfu-debuts-no-1-billboard-hot-100-breaks-michael-jackson-record/ https://www.complex.com/music/a/alex-ocho/drake-iceman-maid-honour-habibti-first-week-sales https://abcnews.com/news/story/bad-bunny-halftime-show-viewership-announced-details-130023135
export const DRAKE_VS_KENDRICK: Cabinet = {
  asOf: "October 2026",
  totalLabel: "Grammy Awards",
  intro: "Every Grammy and major award, side by side.",
  teamTitle: "Grammy Awards",
  teamBlurb: "Every Grammy won, by category and ceremony year. These make up the totals.",
  individualTitle: "Other major awards",
  individualBlurb: "The biggest honours outside the Grammys.",
  headline: [
    { label: "Record & Song of the Year", kind: "gramophone", category: "general" },
    { label: "Best Rap Album", kind: "gramophone", competition: "Best Rap Album" },
    { label: "Rap Grammys", kind: "gramophone", category: "rap" },
    { label: "Pulitzer Prize", kind: "medal", competition: "Pulitzer Prize for Music" },
    { label: "Billboard Music Awards", kind: "trophy", category: "billboard" },
  ],
  footnote:
    "Totals count Grammy Awards won, by ceremony year, up to the 68th Grammys on 1 February 2026. Best Rap/Sung Collaboration was renamed Best Rap/Sung Performance in 2017. Chart records are from Billboard.",
  team: [
    {
      id: "general",
      title: "General field",
      note: "Record of the Year and Song of the Year, two of the Grammys’ “Big Four”.",
      honours: [
        [],
        [
          { competition: "Record of the Year", team: "", kind: "gramophone", seasons: ["2025", "2026"] },
          { competition: "Song of the Year", team: "", kind: "gramophone", seasons: ["2025"] },
        ],
      ],
    },
    {
      id: "rap",
      title: "Rap categories",
      honours: [
        [
          { competition: "Best Rap Album", team: "", kind: "gramophone", seasons: ["2013"] },
          { competition: "Best Rap Song", team: "", kind: "gramophone", seasons: ["2017", "2019"] },
          { competition: "Best Rap/Sung Performance", team: "", kind: "gramophone", seasons: ["2017"] },
          { competition: "Best Melodic Rap Performance", team: "", kind: "gramophone", seasons: ["2023"] },
        ],
        [
          { competition: "Best Rap Album", team: "", kind: "gramophone", seasons: ["2016", "2018", "2023", "2026"] },
          {
            competition: "Best Rap Performance",
            team: "",
            kind: "gramophone",
            seasons: ["2015", "2016", "2018", "2019", "2022", "2023", "2025", "2026"],
          },
          { competition: "Best Rap Song", team: "", kind: "gramophone", seasons: ["2015", "2016", "2018", "2023", "2025", "2026"] },
          { competition: "Best Rap/Sung Collaboration", team: "", kind: "gramophone", seasons: ["2016"] },
          { competition: "Best Rap/Sung Performance", team: "", kind: "gramophone", seasons: ["2018"] },
          { competition: "Best Melodic Rap Performance", team: "", kind: "gramophone", seasons: ["2026"] },
        ],
      ],
    },
    {
      id: "other-grammys",
      title: "Other Grammys",
      honours: [[], [{ competition: "Best Music Video", team: "", kind: "gramophone", seasons: ["2016", "2018", "2025"] }]],
    },
  ],
  individual: [
    {
      id: "pulitzer",
      title: "Pulitzer Prize",
      honours: [[], [{ competition: "Pulitzer Prize for Music", team: "DAMN.", kind: "medal", seasons: ["2018"] }]],
    },
    {
      id: "billboard",
      title: "Billboard Music Awards",
      honours: [
        [
          { competition: "Top Artist", team: "", kind: "trophy", seasons: ["2017", "2019"] },
          { competition: "Artist of the Decade", team: "", kind: "trophy", seasons: ["2021"] },
        ],
        [],
      ],
    },
    {
      id: "vma",
      title: "MTV Video of the Year",
      honours: [[], [{ competition: "MTV VMA Video of the Year", team: "", kind: "statuette", seasons: ["2015", "2017"] }]],
    },
    {
      id: "emmy",
      title: "Emmy Awards",
      note: "Won as a performer on the Super Bowl LVI halftime show and for the music direction of his Super Bowl LIX show.",
      honours: [
        [],
        [
          { competition: "Outstanding Variety Special (Live)", team: "", kind: "statuette", seasons: ["2022"] },
          { competition: "Outstanding Music Direction", team: "", kind: "statuette", seasons: ["2025"] },
        ],
      ],
    },
  ],
  records: [
    [
      "14 Billboard Hot 100 No. 1s, the most by a male solo artist, after “Janice STFU” debuted at No. 1 in May 2026.",
      "The most Billboard Hot 100 entries of any artist.",
      "42 songs on the Hot 100 in a single week in May 2026, a record.",
      "ICEMAN, HABIBTI and MAID OF HONOUR debuted at Nos. 1, 2 and 3 on the Billboard 200, the first artist to hold the top three at once.",
      "15 No. 1 albums on the Billboard 200, the most by a male solo artist.",
      "42 Billboard Music Awards, the most won by a male artist.",
      "Billboard’s Artist of the Decade for the 2010s.",
    ],
    [
      "27 Grammy Awards, the most won by a rapper.",
      "DAMN. won the 2018 Pulitzer Prize for Music, the first winner from outside classical music and jazz.",
      "Record of the Year in consecutive years, with “Not Like Us” in 2025 and “Luther” in 2026.",
      "Five Grammys in a single night four times: 2016, 2018, 2025 and 2026.",
      "Headlined the Super Bowl LIX halftime show on 9 February 2025, watched by 133.5 million, the most for any halftime show.",
      "Six Billboard Hot 100 No. 1s; “Luther” with SZA spent 13 weeks at No. 1 in 2025.",
    ],
  ],
};
