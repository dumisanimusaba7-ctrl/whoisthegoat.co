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

/** The original photo behind each silhouette, shown when the answer is revealed. `focus` is where the player is in the photo (x% y%), so a crop keeps them in view. */
export type Moment = { photo: StaticImageData; focus: string };

export const MOMENTS: Record<string, Moment> = {
  "ronaldo-siu": { photo: ronaldoSiu, focus: "50% 52%" },
  "mbappe-arms": { photo: mbappeArms, focus: "54% 50%" },
  "mbappe-salute": { photo: mbappeSalute, focus: "49% 56%" },
  "haaland-zen": { photo: haalandZen, focus: "53% 52%" },
  "rashford-temple": { photo: rashfordTemple, focus: "56% 51%" },
  "lewandowski-cross": { photo: lewandowskiCross, focus: "42% 51%" },
  "neymar-bow": { photo: neymarBow, focus: "37% 54%" },
  "salah-sky": { photo: salahSky, focus: "48% 50%" },
  "messi-ears": { photo: messiEars, focus: "52% 51%" },
  "messi-shirt": { photo: messiShirt, focus: "44% 53%" },
  "bellingham-wide": { photo: bellinghamWide, focus: "50% 56%" },
  "yamal-roar": { photo: yamalRoar, focus: "52% 51%" },
  "vini-dance": { photo: viniDance, focus: "40% 52%" },
  "palmer-shrug": { photo: palmerShrug, focus: "49% 53%" },
  "griezmann-l": { photo: griezmannL, focus: "76% 53%" },
  "pogba-dab": { photo: pogbaDab, focus: "56% 55%" },
  "dybala-mask": { photo: dybalaMask, focus: "34% 54%" },
  "ronaldo-calma": { photo: ronaldoCalma, focus: "52% 52%" },
  "vardy-slide": { photo: vardySlide, focus: "42% 52%" },
  "saka-flag": { photo: sakaFlag, focus: "42% 53%" },
};
