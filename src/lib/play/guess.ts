import type { StaticImageData } from "next/image";

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
};

export const SILHOUETTES: Silhouette[] = [
  { id: "ronaldo-siu", player: "Cristiano Ronaldo", celebration: "The Siu", fact: "A jump, a spin, then a landing with the arms down and the feet wide. The crowd shouts it back.", image: ronaldo, color: "#E8322A" },
  { id: "mbappe-arms", player: "Kylian Mbappé", celebration: "The arms crossed", fact: "Arms folded, hands tucked under the armpits. His go-to after a goal for France and PSG.", image: mbappeArms, color: "#2B4C9B" },
  { id: "mbappe-salute", player: "Kylian Mbappé", celebration: "The salute", fact: "A forehead salute that went viral at the 2026 World Cup. Fans nicknamed it Dictator Mbappé.", image: mbappeSalute, color: "#2B4C9B" },
  { id: "haaland-zen", player: "Erling Haaland", celebration: "The meditation", fact: "He sits cross-legged and goes quiet. He has said he loves meditation.", image: haaland, color: "#6CABDD" },
  { id: "rashford-temple", player: "Marcus Rashford", celebration: "The temple point", fact: "A finger to the head, now copied by players across the world.", image: rashford, color: "#DA291C" },
  { id: "lewandowski-cross", player: "Robert Lewandowski", celebration: "The crossed arms", fact: "He has called the meaning a family secret.", image: lewandowski, color: "#DC143C" },
  { id: "neymar-bow", player: "Neymar", celebration: "The bow", fact: "Bowing to the fans after scoring for Santos.", image: neymar, color: "#FFD400" },
  { id: "salah-sky", player: "Mohamed Salah", celebration: "Both fingers to the sky", fact: "Salah's goal celebration at Liverpool, back to the crowd and eyes up.", image: salah, color: "#C8102E" },
  { id: "messi-ears", player: "Lionel Messi", celebration: "Hands to the ears", fact: "Aimed at the Netherlands bench after scoring in the 2022 World Cup quarter-final.", image: messiEars, color: "#75AADB" },
  { id: "messi-shirt", player: "Lionel Messi", celebration: "The shirt show", fact: "April 2017: a last-minute winner at the Bernabéu and the shirt held up to the Real Madrid fans. Barcelona won 3–2.", image: messiShirt, color: "#A50044" },
  { id: "bellingham-wide", player: "Jude Bellingham", celebration: "Arms wide", fact: "His trademark since joining Real Madrid.", image: belling, color: "#EBB700" },
  { id: "yamal-roar", player: "Lamine Yamal", celebration: "The roar", fact: "Barcelona's teenage star. His signature after a goal is the 304 hand sign.", image: yamal, color: "#EDBB00" },
  { id: "vini-dance", player: "Vinícius Júnior", celebration: "The corner flag dance", fact: "Samba steps at the corner flag after he scores.", image: vini, color: "#FEBE10" },
  { id: "palmer-shrug", player: "Cole Palmer", celebration: "The cold shrug", fact: "Ice cold: the shrug he gave Manchester City fans after a late equaliser against his old club.", image: palmer, color: "#034694" },
  { id: "griezmann-l", player: "Antoine Griezmann", celebration: "Take the L", fact: "The Fortnite dance he brought to the 2018 World Cup final.", image: griezmann, color: "#1E3A8A" },
];

/** Players who are not an answer but could pass as one, so the wrong buttons are believable. */
const EXTRA_NAMES = [
  "Harry Kane", "Phil Foden", "Bukayo Saka", "Luis Suárez", "Thierry Henry", "Zinedine Zidane", "Ronaldinho", "Karim Benzema",
  "Son Heung-min", "Kevin De Bruyne", "Raphinha", "Rodrygo", "Ousmane Dembélé", "Lautaro Martínez", "Jamie Vardy", "Gareth Bale",
  "Sadio Mané", "Bruno Fernandes", "Pedri", "Federico Valverde",
];

export const OPTIONS_PER_QUESTION = 4;

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

/** All the silhouettes in a new order, each with the right name among believable wrong ones. */
export function buildQuestions(random: () => number = Math.random, source: Silhouette[] = SILHOUETTES): Question[] {
  const names = [...new Set([...source.map((s) => s.player), ...EXTRA_NAMES])];
  return shuffled(source, random).map((silhouette) => {
    const wrong = shuffled(names.filter((name) => name !== silhouette.player), random).slice(0, OPTIONS_PER_QUESTION - 1);
    return { silhouette, options: shuffled([silhouette.player, ...wrong], random) };
  });
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
  return `I got ${score}/${total} guessing footballers from their celebration silhouettes. Can you beat me?`;
}
