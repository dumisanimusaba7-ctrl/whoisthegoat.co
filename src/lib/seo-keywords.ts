import type { Debate, DebateOption } from "./debates";

/**
 * Search phrases. Google ignores the keywords meta tag, but other engines and
 * AI assistants read it, and the same phrases are written into each page's
 * visible text (headings, FAQ), which is what ranks.
 */

/** What people type when they want this site. */
export const GOAT_PHRASES = [
  "who is the goat",
  "who's the goat",
  "who is the GOAT",
  "goat",
  "GOAT meaning",
  "greatest of all time",
  "who is the greatest of all time",
  "GOAT debate",
  "GOAT vote",
  "GOAT poll",
  "vote for the GOAT",
  "the world decides",
  "who is the best player of all time",
  "best athlete of all time",
];

/** Names fans also search by, for the people and brands on the site. */
const ALSO_KNOWN_AS: Record<string, string[]> = {
  messi: ["Leo Messi", "Messi GOAT", "La Pulga"],
  pele: ["Pele", "Edson Arantes do Nascimento", "O Rei", "The King of Football", "Pelé GOAT"],
  maradona: ["Diego Armando Maradona", "El Pibe de Oro", "Hand of God", "Maradona GOAT"],
  ronaldo: ["Cristiano", "CR7", "Ronaldo GOAT"],
  yamal: ["Lamine Yamal Nasraoui Ebana", "Yamal Barcelona"],
  mbappe: ["Kylian Mbappe", "Mbappe", "Mbappé Real Madrid"],
  neymar: ["Neymar da Silva Santos Júnior", "Neymar Jr"],
  ronaldinho: ["Ronaldinho Gaúcho", "Ronaldo de Assis Moreira"],
  lebron: ["King James", "LeBron GOAT"],
  jordan: ["MJ", "Air Jordan", "Jordan GOAT"],
  tyson: ["Iron Mike", "Iron Mike Tyson"],
  ali: ["The Greatest", "Cassius Clay"],
  khabib: ["The Eagle", "Khabib 29-0"],
  mcgregor: ["The Notorious", "Notorious Conor McGregor"],
  hamilton: ["Sir Lewis Hamilton", "Lewis Hamilton Ferrari"],
  verstappen: ["Max Verstappen", "Super Max"],
  drake: ["Aubrey Graham", "Drizzy"],
  kendrick: ["Kendrick Lamar", "K.Dot"],
};

export function optionNames(option: DebateOption): string[] {
  return [option.name, option.shortName, ...(ALSO_KNOWN_AS[option.slug] ?? [])];
}

/** Every phrase for one debate: its own list, the names, and the ways people pair them. */
export function debateKeywords(debate: Debate): string[] {
  const [a, b] = debate.options;
  const pairs = [
    `${a.shortName} vs ${b.shortName}`,
    `${b.shortName} vs ${a.shortName}`,
    `${a.name} vs ${b.name}`,
    `${a.shortName} or ${b.shortName}`,
    `who is better ${a.shortName} or ${b.shortName}`,
    `${a.shortName} vs ${b.shortName} stats`,
    `${a.shortName} vs ${b.shortName} trophies`,
    `${a.shortName} vs ${b.shortName} GOAT`,
    `${a.shortName} vs ${b.shortName} vote`,
    `${a.shortName} vs ${b.shortName} poll`,
  ];
  const goat = debate.options.map((o) => `is ${o.shortName} the GOAT`);
  return unique([...debate.seo.keywords, ...pairs, ...goat, ...optionNames(a), ...optionNames(b), "who is the goat", "GOAT debate"]);
}

/** Site-wide: the GOAT phrases plus every name on the site. */
export function siteKeywords(debates: Debate[]): string[] {
  return unique([
    ...GOAT_PHRASES,
    ...debates.flatMap((d) => [d.title, ...d.options.map((o) => o.name)]),
  ]);
}

function unique(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
