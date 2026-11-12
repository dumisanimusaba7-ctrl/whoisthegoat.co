import type { StaticImageData } from "next/image";

import cruyff from "@/assets/play/cruyff.jpg";
import haaland from "@/assets/play/haaland.jpg";
import lewandowski from "@/assets/play/lewandowski.jpg";
import maradona from "@/assets/play/maradona.jpg";
import mbappe from "@/assets/play/mbappe.jpg";
import messi from "@/assets/play/messi.jpg";
import neymar from "@/assets/play/neymar.jpg";
import pele from "@/assets/play/pele.jpg";
import ronaldinho from "@/assets/play/ronaldinho.jpg";
import ronaldo from "@/assets/play/ronaldo.jpg";
import ronaldo9 from "@/assets/play/ronaldo9.jpg";
import salah from "@/assets/play/salah.jpg";
import vinicius from "@/assets/play/vinicius.jpg";
import yamal from "@/assets/play/yamal.jpg";
import zidane from "@/assets/play/zidane.jpg";

/** The face portraits (1200×1323, face a little above the middle), by player slug. */
export const PORTRAITS: Record<string, StaticImageData> = {
  cruyff,
  haaland,
  lewandowski,
  maradona,
  mbappe,
  messi,
  neymar,
  pele,
  ronaldinho,
  ronaldo,
  ronaldo9,
  salah,
  vinicius,
  yamal,
  zidane,
};
