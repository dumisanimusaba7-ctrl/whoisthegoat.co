import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Static Archivo instances for the image renderer (it can't use variable
// fonts or WOFF2). Read once per server instance.
const dir = join(process.cwd(), "assets/fonts");

const [condensedBlack, expandedBold, bold, medium] = await Promise.all([
  readFile(join(dir, "Archivo-CondensedBlack.ttf")),
  readFile(join(dir, "Archivo-ExpandedBold.ttf")),
  readFile(join(dir, "Archivo-Bold.ttf")),
  readFile(join(dir, "Archivo-Medium.ttf")),
]);

export const CARD_FONTS = [
  { name: "Display", data: condensedBlack, weight: 900 as const, style: "normal" as const },
  { name: "Wide", data: expandedBold, weight: 700 as const, style: "normal" as const },
  { name: "Text", data: bold, weight: 700 as const, style: "normal" as const },
  { name: "Text", data: medium, weight: 500 as const, style: "normal" as const },
];
