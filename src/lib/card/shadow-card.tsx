import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { rankFor, SILHOUETTES, type Played } from "@/lib/play/guess";
import { SITE_DOMAIN } from "@/lib/site";

import { CARD_FONTS } from "./fonts";
import { Brand, Canvas, CARD_FORMATS, fitDisplay, Layer, MUTED, RULE, WHITE, type CardFormat } from "./share-card";

const GOLD = "#FFD400";
const PAPER = "#F4F3EF";

type Tile = { src: string | null; right: boolean };

// Each outline is tinted once per colour and kept for the life of the server instance.
const tinted = new Map<string, Promise<string | null>>();

/** A silhouette as a PNG data URL in one colour, at a given opacity. */
function tint(id: string, color: string, opacity: number): Promise<string | null> {
  const key = `${id}|${color}|${opacity}`;
  let image = tinted.get(key);
  if (!image) {
    image = (async () => {
      const file = join(/* turbopackIgnore: true */ process.cwd(), "src/assets/play/silhouettes", `${id}.png`);
      const { data, info } = await sharp(await readFile(file)).toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
      const out = Buffer.alloc(info.width * info.height * 4);
      for (let i = 0; i < info.width * info.height; i++) {
        out[i * 4] = r;
        out[i * 4 + 1] = g;
        out[i * 4 + 2] = b;
        out[i * 4 + 3] = Math.round(data[i * info.channels + info.channels - 1] * opacity);
      }
      const png = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).resize({ height: 360 }).png().toBuffer();
      return `data:image/png;base64,${png.toString("base64")}`;
    })().catch((error) => {
      console.error(`[card] couldn't tint ${id}:`, error);
      tinted.delete(key);
      return null;
    });
    tinted.set(key, image);
  }
  return image;
}

async function tilesFor(played: Played[] | null): Promise<Tile[]> {
  // With no result (a link preview), every outline is shown in its colour.
  const list: Played[] = played ?? SILHOUETTES.slice(0, 20).map((s) => ({ id: s.id, right: true }));
  return Promise.all(
    list.map(async ({ id, right }) => {
      const silhouette = SILHOUETTES.find((s) => s.id === id);
      if (!silhouette) return { src: null, right };
      return { src: await (right ? tint(id, silhouette.color, 1) : tint(id, "#FFFFFF", 0.3)), right };
    }),
  );
}

function Grid({ tiles, columns, tileW, tileH, gap }: { tiles: Tile[]; columns: number; tileW: number; tileH: number; gap: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: columns * tileW + (columns - 1) * gap, gap }}>
      {tiles.map((tile, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            width: tileW,
            height: tileH,
            padding: tileH * 0.08,
            background: tile.right ? PAPER : "rgba(255,255,255,0.07)",
          }}
        >
          {tile.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not the DOM
            <img src={tile.src} width={tileW - tileH * 0.16} height={tileH - tileH * 0.16} alt="" style={{ objectFit: "contain", objectPosition: "center bottom" }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ShadowCard({ score, total, tiles, shape }: { score: number; total: number; tiles: Tile[]; shape: "post" | "square" | "og" }) {
  const rank = rankFor(score, total).toUpperCase();
  const { width, height } = CARD_FORMATS[shape];
  const pad = shape === "og" ? 52 : 64;

  if (shape === "og") {
    const gridW = 640;
    const gap = 10;
    const tileW = Math.floor((gridW - gap * 4) / 5);
    const tileH = Math.floor((height - pad * 2 - gap * 3) / 4);
    const textW = width - gridW - pad * 3;
    return (
      <Canvas>
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 10, background: GOLD }} />
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: pad, left: pad, bottom: pad, width: textW }}>
          <Brand size={38} />
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 22, letterSpacing: "0.08em", color: MUTED }}>WHO IS THAT?</div>
          <div style={{ display: "flex", fontFamily: "Display", fontSize: fitDisplay(rank, textW, 96), lineHeight: 0.86, color: GOLD, marginTop: 8 }}>{rank}</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 14 }}>
            <div style={{ display: "flex", fontFamily: "Display", fontSize: 150, lineHeight: 0.9 }}>{score}</div>
            <div style={{ display: "flex", fontFamily: "Display", fontSize: 64, color: MUTED }}>{`/${total}`}</div>
          </div>
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 20, letterSpacing: "0.1em", marginTop: 18 }}>CAN YOU BEAT ME?</div>
        </div>
        <div style={{ display: "flex", position: "absolute", top: pad, right: pad }}>
          <Grid tiles={tiles} columns={5} tileW={tileW} tileH={tileH} gap={gap} />
        </div>
      </Canvas>
    );
  }

  const gap = 14;
  const tileW = Math.floor((width - pad * 2 - gap * 4) / 5);
  const tileH = shape === "post" ? 168 : 128;
  return (
    <Canvas>
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 12, background: GOLD }} />
      <Layer style={{ flexDirection: "column", padding: `${pad}px ${pad}px ${pad - 8}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={shape === "post" ? 52 : 44} />
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 20, letterSpacing: "0.12em", color: WHITE }}>WHO IS THAT?</div>
        </div>
        <div style={{ display: "flex", flexGrow: 1 }} />
        <div style={{ display: "flex", fontFamily: "Display", fontSize: fitDisplay(rank, width - pad * 2, shape === "post" ? 190 : 150), lineHeight: 0.86, color: GOLD }}>{rank}</div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 8 }}>
          <div style={{ display: "flex", fontFamily: "Display", fontSize: shape === "post" ? 240 : 170, lineHeight: 0.9 }}>{score}</div>
          <div style={{ display: "flex", fontFamily: "Display", fontSize: shape === "post" ? 100 : 72, color: MUTED }}>{`/${total}`}</div>
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", fontFamily: "Wide", fontSize: 24, letterSpacing: "0.08em", color: MUTED }}>CELEBRATIONS NAMED</div>
        </div>
        <div style={{ display: "flex", marginTop: shape === "post" ? 30 : 22 }}>
          <Grid tiles={tiles} columns={5} tileW={tileW} tileH={tileH} gap={gap} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, paddingTop: 26, borderTop: `2px solid ${RULE}`, fontFamily: "Wide", fontSize: 24, letterSpacing: "0.1em" }}>
          <div style={{ display: "flex", color: MUTED }}>CAN YOU BEAT ME?</div>
          <div style={{ display: "flex" }}>{`PLAY AT ${SITE_DOMAIN.toUpperCase()}`}</div>
        </div>
      </Layer>
    </Canvas>
  );
}

/** The score card for the silhouette game, as a JPEG: the rank, the score and the 20 outlines, right ones in colour. */
export async function renderShadowCard(options: { score: number; total: number; played: Played[] | null; format: CardFormat; headers?: Record<string, string> }): Promise<Response> {
  const { score, total, played, format, headers } = options;
  if (format !== "post" && format !== "square" && format !== "og") return new Response("Not found", { status: 404 });
  const tiles = await tilesFor(played);
  const png = await new ImageResponse(<ShadowCard score={score} total={total} tiles={tiles} shape={format} />, { ...CARD_FORMATS[format], fonts: CARD_FONTS }).arrayBuffer();
  const quality = format === "post" ? 94 : format === "square" ? 88 : 88;
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality, chromaSubsampling: "4:4:4", mozjpeg: true, progressive: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg", ...headers } });
}
