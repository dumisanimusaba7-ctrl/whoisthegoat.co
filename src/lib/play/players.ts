/** One of the most-debated footballers in the elimination game. Server-safe: no images here (see portraits.ts). */
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
  /** The most iconic photo, 1080×1350 with the face a third of the way down, for the share card. */
  cardFile: string;
  credits: {
    /** The face portrait used in the game. */
    portrait: { by: string; licence: string; url: string };
    /** Where the iconic photo on the share card came from. */
    iconic: { by: string; url: string };
  };
};

export const PLAYERS: PlayPlayer[] = [];

export function getPlayer(slug: string): PlayPlayer | undefined {
  return PLAYERS.find((player) => player.slug === slug);
}

/** Full name for the card line: "Lamine Yamal". */
export function fullName(player: PlayPlayer): string {
  return player.firstName ? `${player.firstName} ${player.name}` : player.name;
}

/** The shape the winner-card renderer wants. Everyone else in the game was beaten. */
export function pickCardPlayer(player: PlayPlayer) {
  return {
    slug: player.slug,
    fullName: fullName(player),
    name: player.name,
    color: player.color,
    photoFile: player.cardFile,
    beaten: Math.max(PLAYERS.length - 1, 0),
  };
}
