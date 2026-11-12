/** The 15 most-debated footballers in the elimination game. Server-safe: no images here (see portraits.ts). */
export type PlayPlayer = {
  slug: string;
  /** Shown small above the name: "Lionel". Empty when the name says it all. */
  firstName: string;
  /** Shown big under the portrait: "Messi". */
  name: string;
  /** Accent colour (their shirt). */
  color: string;
  /** The debate they are in on the site, if any, to send winners' fans to the real vote. */
  debateSlug?: string;
  debateTitle?: string;
  /** The winner-card photo, 1080×1350 with the face a third of the way down, as a path from the project root. */
  cardFile: string;
  /** Where the photos came from. */
  credits: {
    portrait: string;
    card: string;
  };
};

const CC = (who: string, licence: string, file: string) => `${who}, ${licence}, Wikimedia Commons (${file})`;

/** The order here is part of every shared link (see encodeOrder): only ever add players at the end. */
export const PLAYERS: PlayPlayer[] = [
  { slug: "messi", firstName: "Lionel", name: "Messi", color: "#75AADB", debateSlug: "messi-vs-ronaldo", debateTitle: "Messi vs Ronaldo", cardFile: "assets/play/messi.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Leo Messi Argentina v Egypt 7 July 2026-1.jpg"), card: "Al Jazeera gallery, 2022 World Cup final" } },
  { slug: "ronaldo", firstName: "Cristiano", name: "Ronaldo", color: "#E8322A", debateSlug: "messi-vs-ronaldo", debateTitle: "Messi vs Ronaldo", cardFile: "assets/play/ronaldo.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Cristiano Ronaldo Croatia v Portugal 2 July 2026-075 (cropped).jpg"), card: "Real Madrid celebration, news photo" } },
  { slug: "pele", firstName: "", name: "Pelé", color: "#009C3B", debateSlug: "pele-vs-maradona", debateTitle: "Pelé vs Maradona", cardFile: "assets/play/pele.jpg", credits: { portrait: CC("Unknown author", "public domain", "Pele con brasil (cropped).jpg"), card: CC("Associated Press", "public domain", "Pele celebrating 1970.jpg") } },
  { slug: "maradona", firstName: "Diego", name: "Maradona", color: "#75AADB", debateSlug: "pele-vs-maradona", debateTitle: "Pelé vs Maradona", cardFile: "assets/play/maradona.jpg", credits: { portrait: "Supplied by the site owner", card: "Supplied by the site owner (1986 World Cup final)" } },
  { slug: "cruyff", firstName: "Johan", name: "Cruyff", color: "#FF6A13", cardFile: "assets/play/cruyff.jpg", credits: { portrait: CC("Rob Mieremet / Anefo", "CC0", "Johan Cruijff (1974).jpg"), card: "Supplied by the site owner (Netherlands, 1974)" } },
  { slug: "zidane", firstName: "Zinedine", name: "Zidane", color: "#2B5BD7", cardFile: "assets/play/zidane.jpg", credits: { portrait: "Supplied by the site owner", card: "Supplied by the site owner" } },
  { slug: "ronaldo9", firstName: "Ronaldo", name: "Ronaldo Nazário", color: "#FEBE10", cardFile: "assets/play/ronaldo9.jpg", credits: { portrait: CC("Lula Oficial", "CC BY-SA 4.0", "12.12.2025 Cerimônia de lançamento do SBT News (cropped2).jpg"), card: "2002 World Cup celebration, news photo" } },
  { slug: "ronaldinho", firstName: "", name: "Ronaldinho", color: "#A50044", cardFile: "assets/play/ronaldinho.jpg", credits: { portrait: CC("Reto Stauffer", "CC BY-SA 2.0 de", "Ronaldinho061115.jpg"), card: "Barcelona era, news photo" } },
  { slug: "neymar", firstName: "", name: "Neymar", color: "#FFDC02", debateSlug: "neymar-vs-ronaldinho", debateTitle: "Neymar vs Ronaldinho", cardFile: "assets/play/neymar.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Neymar Junior Brazil V Morocco 13 June 2026-40.jpg"), card: "Rio 2016 Olympic gold, news photo" } },
  { slug: "mbappe", firstName: "Kylian", name: "Mbappé", color: "#3D6BE0", debateSlug: "yamal-vs-mbappe", debateTitle: "Yamal vs Mbappé", cardFile: "assets/play/mbappe.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Kylian Mbappe France v Senegal 16 June 2026-391 (cropped).jpg"), card: "Supplied by the site owner (PSG salute)" } },
  { slug: "haaland", firstName: "Erling", name: "Haaland", color: "#6CABDD", cardFile: "assets/play/haaland.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Erling Haaland Morocco v Norway 7 June 2026-51.jpg"), card: "Meditation celebration, news photo" } },
  { slug: "yamal", firstName: "Lamine", name: "Yamal", color: "#004D98", debateSlug: "yamal-vs-mbappe", debateTitle: "Yamal vs Mbappé", cardFile: "assets/play/yamal.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Lamine Yamal France v Spain 7.24.26-142.jpg"), card: "Euro 2024 final, news photo" } },
  { slug: "salah", firstName: "Mohamed", name: "Salah", color: "#C8102E", cardFile: "assets/play/salah.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Mohamed Salah Argentina v Egypt 7 July 2026-163 (cropped).jpg"), card: "Supplied by the site owner (Liverpool, arms out)" } },
  { slug: "vinicius", firstName: "Vinícius", name: "Vinícius Jr", color: "#E8E8E8", cardFile: "assets/play/vinicius.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Vinícius Júnior Brazil V Morocco 13 June 2026-207 (cropped).jpg"), card: "2024 Champions League final, news photo" } },
  { slug: "lewandowski", firstName: "Robert", name: "Lewandowski", color: "#DC143C", cardFile: "assets/play/lewandowski.jpg", credits: { portrait: CC("Bryan Berlin", "CC BY-SA 4.0", "Robert Lewandowski NYCFC v Chicago 25 July 2026-383.jpg"), card: "Bayern celebration, news photo" } },
];

export function getPlayer(slug: string): PlayPlayer | undefined {
  return PLAYERS.find((player) => player.slug === slug);
}

/** Full name for the card line: "Lamine Yamal". */
export function fullName(player: PlayPlayer): string {
  return player.firstName ? `${player.firstName} ${player.name}` : player.name;
}

/** One character per player: their place in PLAYERS, in base 36. */
const CODE_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * The order the beaten players were knocked out, as a short code for the share
 * link ("a03b…", one character each). Null unless it is exactly the other 14,
 * each once.
 */
export function encodeOrder(slugs: string[], winnerSlug: string): string | null {
  if (slugs.length !== PLAYERS.length - 1) return null;
  const indices = slugs.map((slug) => PLAYERS.findIndex((player) => player.slug === slug));
  const seen = new Set(indices);
  const winner = PLAYERS.findIndex((player) => player.slug === winnerSlug);
  if (winner < 0 || seen.size !== slugs.length || seen.has(-1) || seen.has(winner)) return null;
  return indices.map((index) => CODE_DIGITS[index]).join("");
}

/** The players in the order they were knocked out, or null if the code isn't exactly that for this winner. Nothing but known players can come out. */
export function decodeOrder(code: string | null | undefined, winnerSlug: string): PlayPlayer[] | null {
  if (!code || code.length !== PLAYERS.length - 1) return null;
  const players = [...code].map((digit) => PLAYERS[CODE_DIGITS.indexOf(digit)]);
  if (players.some((player) => !player) || new Set(players).size !== players.length) return null;
  if (players.some((player) => player.slug === winnerSlug)) return null;
  return players;
}

/** The shape the winner-card renderer wants. `order` is who they knocked out, first to last. */
export function pickCardPlayer(player: PlayPlayer, order?: PlayPlayer[] | null) {
  return {
    slug: player.slug,
    fullName: fullName(player),
    name: player.name,
    color: player.color,
    photoFile: player.cardFile,
    beaten: PLAYERS.length - 1,
    beatenNames: order?.map((beaten) => beaten.name),
  };
}
