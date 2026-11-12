import type { StaticImageData } from "next/image";

import pogba from "@/assets/play/silhouettes/pogba-dab.png";
import dybala from "@/assets/play/silhouettes/dybala-mask.png";
import ronaldoCalma from "@/assets/play/silhouettes/ronaldo-calma.png";
import vardy from "@/assets/play/silhouettes/vardy-slide.png";
import saka from "@/assets/play/silhouettes/saka-flag.png";
import belling from "@/assets/play/silhouettes/bellingham-wide.png";
import griezmann from "@/assets/play/silhouettes/griezmann-l.png";
import haaland from "@/assets/play/silhouettes/haaland-zen.png";
import lewandowski from "@/assets/play/silhouettes/lewandowski-cross.png";
import mbappeArms from "@/assets/play/silhouettes/mbappe-arms.png";
import mbappeSalute from "@/assets/play/silhouettes/mbappe-salute.png";
import messiEars from "@/assets/play/silhouettes/messi-ears.png";
import messiShirt from "@/assets/play/silhouettes/messi-shirt.png";
import neymar from "@/assets/play/silhouettes/neymar-bow.png";
import palmer from "@/assets/play/silhouettes/palmer-shrug.png";
import rashford from "@/assets/play/silhouettes/rashford-temple.png";
import ronaldo from "@/assets/play/silhouettes/ronaldo-siu.png";
import salah from "@/assets/play/silhouettes/salah-sky.png";
import vini from "@/assets/play/silhouettes/vini-dance.png";
import yamal from "@/assets/play/silhouettes/yamal-roar.png";

/** One celebration, cut down to its outline. The answer is revealed in the player's colour. */
export type Silhouette = {
  id: string;
  /** The player's full name, as shown on the answer buttons. */
  player: string;
  /** What the celebration is called. */
  celebration: string;
  /** One line shown after the answer. */
  fact: string;
  /** The outline, black on transparent (used as a mask). */
  image: StaticImageData;
  /** The colour the outline turns when the answer is shown. */
  color: string;
  /** Where the original photo is, so the answer can link to it instead of the site hosting it. */
  source: { name: string; url: string };
  /** Thin light lines for hands that sit in front of the body and would otherwise vanish into the outline. */
  hands?: StaticImageData;
};

export const SILHOUETTES: Silhouette[] = [
  { id: "ronaldo-siu", player: "Cristiano Ronaldo", celebration: "The Siu", fact: "A jump, a spin, then a landing with the arms down and the feet wide. The crowd shouts it back.", image: ronaldo, color: "#E8322A", source: { name: "Yardbarker", url: "https://www.yardbarker.com/soccer/articles/what_is_the_meaning_and_origin_of_cristiano_ronaldos_iconic_siuuu_celebration/s1_17615_43986650" } },
  { id: "mbappe-arms", player: "Kylian Mbappé", celebration: "The arms crossed", fact: "Arms folded, hands tucked under the armpits. His go-to after a goal for France and PSG.", image: mbappeArms, color: "#2B4C9B", source: { name: "talkSPORT", url: "https://talksport.com/football/423670/the-meaning-behind-kylian-mbappes-goal-celebration-for-france-and-psg-explained/" } },
  { id: "mbappe-salute", player: "Kylian Mbappé", celebration: "The salute", fact: "A forehead salute that went viral at the 2026 World Cup. Fans nicknamed it Dictator Mbappé.", image: mbappeSalute, color: "#2B4C9B", source: { name: "X", url: "https://x.com/fedevalv_/status/2072099337321042060" } },
  { id: "haaland-zen", player: "Erling Haaland", celebration: "The meditation", fact: "He sits cross-legged and goes quiet. He has said he loves meditation.", image: haaland, color: "#6CABDD", source: { name: "ESPN", url: "https://www.espn.com/soccer/story/_/id/37582110/love-meditation" } },
  { id: "rashford-temple", player: "Marcus Rashford", celebration: "The temple point", fact: "A finger to the head, now copied by players across the world.", image: rashford, color: "#DA291C", source: { name: "The Sun", url: "https://www.thesun.co.uk/sport/21129876/why-marcus-rashford-point-head-celebration-man-utd-saka/" } },
  { id: "lewandowski-cross", player: "Robert Lewandowski", celebration: "The crossed arms", fact: "He has called the meaning a family secret.", image: lewandowski, color: "#DC143C", source: { name: "Goal", url: "https://www.goal.com/en-sa/news/what-lewandowski-celebration-meaning-barcelona-goal-gesture/bltb432598af901c86e" } },
  { id: "neymar-bow", player: "Neymar", celebration: "The bow", fact: "Bowing to the fans after scoring for Santos.", image: neymar, color: "#FFD400", source: { name: "Getty Images", url: "https://www.gettyimages.com/detail/news-photo/footballer-neymar-of-brazilian-team-santos-makes-a-bow-to-news-photo/144150534" } },
  { id: "salah-sky", player: "Mohamed Salah", celebration: "Both fingers to the sky", fact: "Salah's goal celebration at Liverpool, back to the crowd and eyes up.", image: salah, color: "#C8102E", source: { name: "Goal", url: "https://www.goal.com/en/news/explained-mohamed-salah-goal-celebrations-meaning-liverpool-stars-on-pitch-gestures/1uj2zappvknhi1pojuqm0oae6e" } },
  { id: "messi-ears", player: "Lionel Messi", celebration: "Hands to the ears", fact: "Aimed at the Netherlands bench after scoring in the 2022 World Cup quarter-final.", image: messiEars, color: "#75AADB", source: { name: "Barca Universal", url: "https://barcauniversal.com/the-mystery-behind-lionel-messis-celebration-vs-netherlands/" } },
  { id: "messi-shirt", player: "Lionel Messi", celebration: "The shirt show", fact: "April 2017: a last-minute winner at the Bernabéu and the shirt held up to the Real Madrid fans. Barcelona won 3–2.", image: messiShirt, color: "#A50044", source: { name: "Goal", url: "https://www.goal.com/en-us/news/lionel-messi-celebration-vs-real-madrid-barcelona-clasico-jersey-taunt-explained/blt2e72ff6807bbfa1b" } },
  { id: "bellingham-wide", player: "Jude Bellingham", celebration: "Arms wide", fact: "His trademark since joining Real Madrid.", image: belling, color: "#EBB700", source: { name: "The Guardian", url: "https://www.theguardian.com/football/blog/2023/oct/30/jude-bellingham-clasico-real-madrid-barcelona-la-liga" } },
  { id: "yamal-roar", player: "Lamine Yamal", celebration: "The roar", fact: "Barcelona's teenage star. His signature after a goal is the 304 hand sign.", image: yamal, color: "#EDBB00", source: { name: "FourFourTwo", url: "https://www.fourfourtwo.com/news/what-does-lamine-yamal-3-0-4-goal-celebration-mean-spain-stars-gesture-explained" } },
  { id: "vini-dance", player: "Vinícius Júnior", celebration: "The corner flag dance", fact: "Samba steps at the corner flag after he scores.", image: vini, color: "#FEBE10", source: { name: "Stabroek News", url: "https://www.stabroeknews.com/2022/09/17/sports/neymar-defends-vinicius-over-criticism-of-goal-celebrations/" } },
  { id: "palmer-shrug", player: "Cole Palmer", celebration: "The cold shrug", fact: "Ice cold: the shrug he gave Manchester City fans after a late equaliser against his old club.", image: palmer, color: "#034694", source: { name: "The Sun", url: "https://www.the-sun.com/sport/9637809/cole-palmer-chelsea-england-penalty-man-city/" } },
  { id: "pogba-dab", player: "Paul Pogba", celebration: "The dab", fact: "He dabbed through his Manchester United years, then retired it in 2017.", image: pogba, color: "#DA291C", source: { name: "ESPN", url: "https://www.espn.com/soccer/story/_/id/37477148/manchester-united-ace-paul-pogba-scores-dab-goal-colombia" } },
  { id: "dybala-mask", player: "Paulo Dybala", celebration: "The mask", fact: "Arms crossed over the face like a gladiator's mask. His signature at Juventus.", image: dybala, color: "#E0A800", source: { name: "Irish Mirror", url: "https://www.irishmirror.ie/sport/soccer/soccer-news/paulo-dybala-reveals-inspiration-behind-13626058" } },
  { id: "ronaldo-calma", player: "Cristiano Ronaldo", celebration: "Calma, calma", fact: "First done on 21 April 2012 at the Camp Nou, palms down to the Barcelona crowd: calm down.", image: ronaldoCalma, color: "#E8322A", source: { name: "Managing Madrid", url: "https://www.managingmadrid.com/2022/4/21/23035264/10-years-ago-today-ronaldos-calma-calma-celebration-in-camp-nou" } },
  { id: "vardy-slide", player: "Jamie Vardy", celebration: "The corner flag slide", fact: "December 2020: a late winner at Sheffield United, then a slide into the corner flag.", image: vardy, color: "#0053A0", source: { name: "The Standard", url: "https://www.standard.co.uk/sport/football/sheffield-united-vs-leicester-city-result-jamie-vardy-goal-corner-flag-b193546.html" } },
  { id: "saka-flag", player: "Bukayo Saka", celebration: "The corner flag", fact: "Corner flag in hand after scoring for Arsenal.", image: saka, color: "#EF0107", source: { name: "The Sun", url: "https://www.the-sun.com/sport/7528359/what-does-bukayo-saka-celebration-mean/" } },
  { id: "griezmann-l", player: "Antoine Griezmann", celebration: "Take the L", fact: "The Fortnite dance he brought to the 2018 World Cup final.", image: griezmann, color: "#1E3A8A", source: { name: "Irish Mirror", url: "https://www.irishmirror.ie/sport/soccer/soccer-news/antoine-griezmanns-celebration-against-real-12327481" } },
];

/**
 * What a silhouette gives away: the hair and the height. A wrong answer is only believable if it
 * looks like the right one from the outside, so the choices are picked by these two things.
 */
export type Hair =
  /** Tight curls, afros, short twists. */
  | "curly"
  /** Long hair, a ponytail, a bun, braids. */
  | "long"
  /** Shaved or cropped close. */
  | "buzz"
  /** Short and neat. */
  | "short"
  /** Quiffs, slicked back, gelled, dyed. */
  | "styled"
  | "bald";

export type Looks = { hair: Hair; height: number };

/** Everyone who can be a button: the answers and the players who could pass for them. Heights in cm, roughly. */
export const LOOKS: Record<string, Looks> = {
  // The answers, as they look in the silhouette.
  "Cristiano Ronaldo": { hair: "styled", height: 187 },
  "Kylian Mbappé": { hair: "buzz", height: 178 },
  "Erling Haaland": { hair: "long", height: 194 },
  "Marcus Rashford": { hair: "curly", height: 185 },
  "Robert Lewandowski": { hair: "short", height: 185 },
  Neymar: { hair: "styled", height: 175 },
  "Mohamed Salah": { hair: "curly", height: 175 },
  "Lionel Messi": { hair: "short", height: 170 },
  "Jude Bellingham": { hair: "curly", height: 186 },
  "Lamine Yamal": { hair: "curly", height: 180 },
  "Vinícius Júnior": { hair: "curly", height: 176 },
  "Cole Palmer": { hair: "short", height: 185 },
  "Antoine Griezmann": { hair: "styled", height: 176 },
  "Paul Pogba": { hair: "styled", height: 191 },
  "Paulo Dybala": { hair: "styled", height: 177 },
  "Jamie Vardy": { hair: "short", height: 179 },
  "Bukayo Saka": { hair: "curly", height: 178 },
  // Players who are never the answer, but could pass for one.
  "Diego Maradona": { hair: "curly", height: 165 },
  Pelé: { hair: "curly", height: 173 },
  "Sadio Mané": { hair: "curly", height: 175 },
  Pedri: { hair: "curly", height: 174 },
  Gavi: { hair: "curly", height: 173 },
  Ronaldinho: { hair: "long", height: 181 },
  Raphinha: { hair: "long", height: 176 },
  "Federico Valverde": { hair: "long", height: 182 },
  "Gabriel Batistuta": { hair: "long", height: 185 },
  "Gareth Bale": { hair: "long", height: 185 },
  "Johan Cruyff": { hair: "long", height: 180 },
  "Zlatan Ibrahimović": { hair: "long", height: 195 },
  "Thierry Henry": { hair: "buzz", height: 188 },
  "Didier Drogba": { hair: "buzz", height: 189 },
  "Romelu Lukaku": { hair: "buzz", height: 191 },
  "Samuel Eto'o": { hair: "buzz", height: 180 },
  "Luis Suárez": { hair: "short", height: 182 },
  "Karim Benzema": { hair: "short", height: 185 },
  "Harry Kane": { hair: "short", height: 188 },
  "Kevin De Bruyne": { hair: "short", height: 181 },
  Rodrygo: { hair: "short", height: 174 },
  "Lautaro Martínez": { hair: "short", height: 174 },
  "Eden Hazard": { hair: "short", height: 175 },
  "Raheem Sterling": { hair: "short", height: 170 },
  "Phil Foden": { hair: "styled", height: 171 },
  "Son Heung-min": { hair: "styled", height: 183 },
  "Ousmane Dembélé": { hair: "styled", height: 178 },
  "David Beckham": { hair: "styled", height: 183 },
  "Zinedine Zidane": { hair: "bald", height: 185 },
  "Bruno Fernandes": { hair: "bald", height: 179 },
  "Andrés Iniesta": { hair: "bald", height: 171 },
};

/** How close two hair types look in outline: the same, near each other, or nothing alike. */
const HAIR_LOOK: Record<Hair, Partial<Record<Hair, number>>> = {
  curly: { curly: 4, long: 1, short: 1 },
  long: { long: 4, curly: 1, styled: 1 },
  buzz: { buzz: 4, bald: 2, short: 2 },
  short: { short: 4, styled: 2, buzz: 2, curly: 1 },
  styled: { styled: 4, short: 2, long: 1 },
  bald: { bald: 4, buzz: 2 },
};

/** How believable `candidate` is as a wrong answer for `answer`: higher is harder to rule out. */
export function resemblance(answer: Looks, candidate: Looks): number {
  const hair = HAIR_LOOK[answer.hair][candidate.hair] ?? -3;
  const gap = Math.abs(answer.height - candidate.height);
  const height = gap <= 4 ? 2 : gap <= 8 ? 1 : gap <= 14 ? 0 : -1;
  return hair + height;
}

export const OPTIONS_PER_QUESTION = 4;

/** How many of the closest look-alikes the wrong answers are drawn from. */
const LOOKALIKES = 10;

export type Question = { silhouette: Silhouette; options: string[] };

/** A random order for a new game. Pass `random` to make it repeatable. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Three wrong names that look like the answer in outline, so the pose has to do the work. */
export function lookalikes(answer: string, random: () => number = Math.random): string[] {
  const target = LOOKS[answer];
  const ranked = Object.keys(LOOKS)
    .filter((name) => name !== answer)
    .map((name) => ({ name, score: resemblance(target, LOOKS[name]) }))
    // Random order first, so equally good look-alikes change from game to game.
    .sort(() => random() - 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, LOOKALIKES);
  return shuffled(ranked, random)
    .slice(0, OPTIONS_PER_QUESTION - 1)
    .map((entry) => entry.name);
}

/** How many silhouettes one game asks. The bank can be bigger: each game draws from it. */
export const QUESTIONS_PER_GAME = 20;

/**
 * A new game: `count` silhouettes from the bank, each with the right name among believable wrong
 * ones. Silhouettes in `seen` (from earlier games) come last, so a rematch is mostly new poses.
 */
export function buildQuestions(
  random: () => number = Math.random,
  source: Silhouette[] = SILHOUETTES,
  seen: ReadonlySet<string> = new Set(),
  count: number = QUESTIONS_PER_GAME,
): Question[] {
  const fresh = shuffled(source.filter((s) => !seen.has(s.id)), random);
  const old = shuffled(source.filter((s) => seen.has(s.id)), random);
  const picked = shuffled([...fresh, ...old].slice(0, count), random);
  return picked.map((silhouette) => ({
    silhouette,
    options: shuffled([silhouette.player, ...lookalikes(silhouette.player, random)], random),
  }));
}

/** The ranks, from the top. A rank needs at least this share of the answers. */
const RANKS = [
  { min: 0.85, title: "Shadow Master" },
  { min: 0.65, title: "Shadow Hunter" },
  { min: 0.45, title: "Shadow Spotter" },
  { min: 0.25, title: "Shadow Student" },
  { min: 0, title: "Still in the Dark" },
] as const;

export function rankFor(score: number, total: number): string {
  const share = total === 0 ? 0 : score / total;
  return (RANKS.find((rank) => share >= rank.min) ?? RANKS[RANKS.length - 1]).title;
}

/** One played question, for the score card. */
export type Played = { id: string; right: boolean };

const CODE_BASE = 36;

/**
 * A game as a short code for the score card: for each question, two base-36 characters holding the
 * silhouette's place in the bank (so the bank only ever grows at the end) and whether it was right.
 */
export function encodeRun(played: readonly Played[], source: Silhouette[] = SILHOUETTES): string | null {
  const parts: string[] = [];
  for (const { id, right } of played) {
    const index = source.findIndex((s) => s.id === id);
    if (index < 0) return null;
    parts.push((index * 2 + (right ? 1 : 0)).toString(CODE_BASE).padStart(2, "0"));
  }
  return parts.join("");
}

/** The questions a code describes, or null unless it is `count` different silhouettes whose right answers add up to `score`. */
export function decodeRun(code: string | null | undefined, score: number, source: Silhouette[] = SILHOUETTES, count: number = QUESTIONS_PER_GAME): Played[] | null {
  if (!code || code.length !== count * 2 || !/^[0-9a-z]+$/.test(code)) return null;
  const played: Played[] = [];
  for (let i = 0; i < code.length; i += 2) {
    const value = parseInt(code.slice(i, i + 2), CODE_BASE);
    const silhouette = source[Math.floor(value / 2)];
    if (!silhouette) return null;
    played.push({ id: silhouette.id, right: value % 2 === 1 });
  }
  if (new Set(played.map((p) => p.id)).size !== count) return null;
  return played.filter((p) => p.right).length === score ? played : null;
}

export function ratingFor(score: number, total: number): string {
  const share = total === 0 ? 0 : score / total;
  if (share === 1) return "Perfect. You know every celebration.";
  if (share >= 0.8) return "Superfan. Hardly anything gets past you.";
  if (share >= 0.6) return "You know your football.";
  if (share >= 0.4) return "Not bad. Some of those were tricky.";
  return "Time to watch more goals.";
}

export function shareLine(score: number, total: number): string {
  return `${rankFor(score, total)}: I got ${score}/${total} guessing footballers from their celebration silhouettes. Can you beat me?`;
}
