import type { Cabinet } from "@/lib/trophies";

// Sources: https://en.wikipedia.org/wiki/Khabib_Nurmagomedov https://en.wikipedia.org/wiki/Conor_McGregor https://en.wikipedia.org/wiki/Cage_Warriors https://en.wikipedia.org/wiki/UFC_329 https://en.wikipedia.org/wiki/Best_Fighter_ESPY_Award https://en.wikipedia.org/wiki/Best_MMA_Fighter_ESPY_Award https://en.wikipedia.org/wiki/BBC_Sports_Personality_World_Sport_Star_of_the_Year
export const KHABIB_VS_MCGREGOR: Cabinet = {
  asOf: "October 2026",
  totalLabel: "title wins",
  intro: "Every professional title and major award, side by side.",
  teamTitle: "Titles",
  teamBlurb: "Each professional MMA title won, in the UFC and elsewhere. These make up the totals.",
  individualTitle: "Awards and honours",
  individualBlurb: "The sport’s fighter-of-the-year awards, the UFC Hall of Fame and wider honours.",
  headline: [
    { label: "UFC titles", kind: "belt", category: "ufc" },
    { label: "Cage Warriors titles", kind: "belt", category: "other-mma" },
    { label: "UFC Hall of Fame", kind: "trophy", competition: "UFC Hall of Fame" },
    { label: "ESPY awards", kind: "statuette", category: "espy" },
    { label: "Fighter of the Year awards", kind: "trophy", category: "fighter-of-the-year" },
  ],
  footnote:
    "Totals count each professional MMA title won, interim titles included and labelled; defences are not counted. Sambo titles are listed separately. Records as of October 2026, after McGregor’s loss at UFC 329 in July 2026.",
  team: [
    {
      id: "ufc",
      title: "UFC titles",
      honours: [
        [{ competition: "UFC Lightweight Championship", team: "Lightweight", kind: "belt", seasons: ["2018"] }],
        [
          { competition: "Interim UFC Featherweight Championship", team: "Featherweight", kind: "belt", seasons: ["2015"] },
          { competition: "UFC Featherweight Championship", team: "Featherweight", kind: "belt", seasons: ["2015"] },
          { competition: "UFC Lightweight Championship", team: "Lightweight", kind: "belt", seasons: ["2016"] },
        ],
      ],
    },
    {
      id: "other-mma",
      title: "Other promotions’ titles",
      honours: [
        [],
        [
          { competition: "Cage Warriors Featherweight Championship", team: "Featherweight", kind: "belt", seasons: ["2012"] },
          { competition: "Cage Warriors Lightweight Championship", team: "Lightweight", kind: "belt", seasons: ["2012"] },
        ],
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
        { competition: "World Combat Sambo Championships", team: "Russia", kind: "medal", seasons: ["2009", "2010"] },
        { competition: "Russian Combat Sambo Championships", team: "", kind: "medal", seasons: ["2009"] },
      ],
      [],
    ],
  },
  individual: [
    {
      id: "hall-of-fame",
      title: "UFC Hall of Fame",
      honours: [[{ competition: "UFC Hall of Fame", team: "", kind: "trophy", seasons: ["2022"] }], []],
    },
    {
      id: "espy",
      title: "ESPY awards",
      honours: [
        [{ competition: "ESPY Best MMA Fighter", team: "", kind: "statuette", seasons: ["2021"] }],
        [{ competition: "ESPY Best Fighter", team: "", kind: "statuette", seasons: ["2016"] }],
      ],
    },
    {
      id: "fighter-of-the-year",
      title: "Fighter of the Year awards",
      honours: [
        [{ competition: "World MMA Awards International Fighter of the Year", team: "", kind: "trophy", seasons: ["2016"] }],
        [
          { competition: "World MMA Awards Fighter of the Year", team: "", kind: "trophy", seasons: ["2015", "2016"] },
          { competition: "World MMA Awards International Fighter of the Year", team: "", kind: "trophy", seasons: ["2014", "2015"] },
          { competition: "Sherdog Fighter of the Year", team: "", kind: "trophy", seasons: ["2015", "2016"] },
        ],
      ],
    },
    {
      id: "national",
      title: "Wider honours",
      honours: [
        [{ competition: "BBC World Sport Star of the Year", team: "", kind: "trophy", seasons: ["2020"] }],
        [{ competition: "RTÉ Sports Person of the Year", team: "", kind: "trophy", seasons: ["2016"] }],
      ],
    },
  ],
  records: [
    [
      "Retired unbeaten with a 29–0 professional record, 13–0 in the UFC.",
      "Finished 19 of his 29 wins: eight by knockout and eleven by submission.",
      "Three successful UFC lightweight title defences, against McGregor, Poirier and Gaethje.",
      "21 takedowns against Abel Trujillo at UFC 160 in 2013, the most in a single UFC fight.",
      "The first Muslim to win a UFC title.",
      "Two-time world combat sambo champion, in 2009 and 2010.",
    ],
    [
      "The first fighter to hold UFC titles in two weight classes at the same time, from November 2016.",
      "Knocked out José Aldo in 13 seconds at UFC 194, the fastest finish in a UFC title fight.",
      "Held the Cage Warriors featherweight and lightweight titles at the same time in 2012.",
      "Headlined the five highest-selling UFC pay-per-views; UFC 229 drew about 2.4 million buys.",
      "Five Performance of the Night bonuses in a row, a UFC record.",
      "A professional record of 22–7, with 19 wins by knockout; 10–5 in the UFC.",
    ],
  ],
};
