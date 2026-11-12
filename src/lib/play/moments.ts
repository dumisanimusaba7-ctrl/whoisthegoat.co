import type { StaticImageData } from "next/image";

import ronaldoSiu from "@/assets/play/moments/ronaldo-siu.jpg";
import mbappeArms from "@/assets/play/moments/mbappe-arms.jpg";
import mbappeSalute from "@/assets/play/moments/mbappe-salute.jpg";
import haalandZen from "@/assets/play/moments/haaland-zen.jpg";
import rashfordTemple from "@/assets/play/moments/rashford-temple.jpg";
import lewandowskiCross from "@/assets/play/moments/lewandowski-cross.jpg";
import neymarBow from "@/assets/play/moments/neymar-bow.jpg";
import salahSky from "@/assets/play/moments/salah-sky.jpg";
import messiEars from "@/assets/play/moments/messi-ears.jpg";
import messiShirt from "@/assets/play/moments/messi-shirt.jpg";
import bellinghamWide from "@/assets/play/moments/bellingham-wide.jpg";
import yamalRoar from "@/assets/play/moments/yamal-roar.jpg";
import viniDance from "@/assets/play/moments/vini-dance.jpg";
import palmerShrug from "@/assets/play/moments/palmer-shrug.jpg";
import griezmannL from "@/assets/play/moments/griezmann-l.jpg";
import pogbaDab from "@/assets/play/moments/pogba-dab.jpg";
import dybalaMask from "@/assets/play/moments/dybala-mask.jpg";
import ronaldoCalma from "@/assets/play/moments/ronaldo-calma.jpg";
import vardySlide from "@/assets/play/moments/vardy-slide.jpg";
import sakaFlag from "@/assets/play/moments/saka-flag.jpg";

/**
 * The original photo behind each silhouette, shown when the answer is revealed. Each is cropped to the
 * player's bounding box, the same box the outline was cut from, so it has the outline's exact ratio and
 * can take its place.
 */
export const MOMENTS: Record<string, StaticImageData> = {
  "ronaldo-siu": ronaldoSiu,
  "mbappe-arms": mbappeArms,
  "mbappe-salute": mbappeSalute,
  "haaland-zen": haalandZen,
  "rashford-temple": rashfordTemple,
  "lewandowski-cross": lewandowskiCross,
  "neymar-bow": neymarBow,
  "salah-sky": salahSky,
  "messi-ears": messiEars,
  "messi-shirt": messiShirt,
  "bellingham-wide": bellinghamWide,
  "yamal-roar": yamalRoar,
  "vini-dance": viniDance,
  "palmer-shrug": palmerShrug,
  "griezmann-l": griezmannL,
  "pogba-dab": pogbaDab,
  "dybala-mask": dybalaMask,
  "ronaldo-calma": ronaldoCalma,
  "vardy-slide": vardySlide,
  "saka-flag": sakaFlag,
};
