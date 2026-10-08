import type { ReactNode } from "react";

import type { Debate } from "@/lib/debates";
import { getPageResults } from "@/lib/server/results";
import { getSiteUrl } from "@/lib/site";

import { Arena } from "./arena";
import { DebateProvider } from "./debate-provider";
import { PostVote } from "./post-vote";

/** Question → vote → live result → share, for one debate. */
export async function DebateExperience({ debate, banner }: { debate: Debate; banner?: ReactNode }) {
  const results = await getPageResults(debate.slug);
  return (
    <DebateProvider debate={debate} siteUrl={getSiteUrl().origin} initialResults={results}>
      <Arena banner={banner} />
      <PostVote />
    </DebateProvider>
  );
}
