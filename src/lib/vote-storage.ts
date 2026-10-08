/**
 * Remembers this browser's vote so returning visitors land on their result.
 * The server is the source of truth (via the voter cookie); this is a
 * convenience and degrades silently when storage is unavailable.
 */

export type StoredVote = { choice: string; country: string | null; at: string };

export function voteStorageKey(debateSlug: string): string {
  return `wigoat:vote:v1:${debateSlug}`;
}

export function readStoredVote(debateSlug: string, validChoices: string[]): StoredVote | null {
  try {
    const raw = window.localStorage.getItem(voteStorageKey(debateSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredVote>;
    if (typeof parsed.choice !== "string" || !validChoices.includes(parsed.choice)) return null;
    return {
      choice: parsed.choice,
      country: typeof parsed.country === "string" ? parsed.country : null,
      at: typeof parsed.at === "string" ? parsed.at : "",
    };
  } catch {
    return null;
  }
}

export function writeStoredVote(debateSlug: string, vote: StoredVote): void {
  try {
    window.localStorage.setItem(voteStorageKey(debateSlug), JSON.stringify(vote));
  } catch {
    // Private mode or storage full: the cookie still identifies the voter.
  }
}

/**
 * Inline script run before first paint: flags the arena as "already voted"
 * so the vote buttons don't flash for returning visitors.
 */
export function prevotedScript(debateSlug: string, elementId: string, validChoices: string[]): string {
  return `try{var v=JSON.parse(localStorage.getItem(${JSON.stringify(voteStorageKey(debateSlug))})||"null");if(v&&${JSON.stringify(validChoices)}.indexOf(v.choice)>-1)document.getElementById(${JSON.stringify(elementId)}).setAttribute("data-prevoted","")}catch(e){}`;
}
