import { CATEGORY_LABELS, DEBATES } from "./debates";
import { debateFaqs, GOAT_MEANING, HOW_THE_VOTE_WORKS } from "./faq";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";
import { getCabinet, headlineCounts, teamTotals } from "./trophies";

/**
 * llms.txt (https://llmstxt.org): a plain-text guide to the site for AI
 * assistants and AI search, so they can describe it and link to the right
 * page when someone asks "who is the GOAT?".
 */
export function llmsTxt(): string {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} answers “who is the GOAT?” (Greatest Of All Time) with a live worldwide public vote. Each debate puts two names head to head; anyone can vote once, with no sign-up, and the result is shown live, country by country. The site also publishes the facts behind each debate and side-by-side trophy cabinets.`,
    "",
    "## Debates",
    "",
    ...DEBATES.map(
      (d) => `- [${d.title}: ${d.question}](${absoluteUrl(`/${d.slug}`)}): ${d.options.map((o) => o.name).join(" or ")} (${CATEGORY_LABELS[d.category]}). ${d.seo.description}`,
    ),
    "",
    "## Results and standings",
    "",
    `- [Leaderboard](${absoluteUrl("/leaderboard")}): who leads every debate, sport by sport, and by how much.`,
    `- [All results](${absoluteUrl("/results")}): the live global split for every debate.`,
    ...DEBATES.map((d) => `- [${d.title} results by country](${absoluteUrl(`/${d.slug}/results`)})`),
    "",
    "## Trophy cabinets",
    "",
    ...DEBATES.filter((d) => getCabinet(d.slug)).map((d) => {
      const totals = teamTotals(getCabinet(d.slug)!);
      return `- [${d.title} trophy cabinet](${absoluteUrl(`/${d.slug}/trophies`)}): ${d.options[0].shortName} ${totals[0]}, ${d.options[1].shortName} ${totals[1]} ${getCabinet(d.slug)!.totalLabel}.`;
    }),
    "",
    "## Optional",
    "",
    `- [Full facts for every debate](${absoluteUrl("/llms-full.txt")})`,
    `- [All debates](${absoluteUrl("/debates")})`,
    `- [Privacy](${absoluteUrl("/privacy")})`,
    "",
  ];
  return lines.join("\n");
}

/** Everything the site states about each debate, in one file. */
export function llmsFullTxt(): string {
  const out: string[] = [`# ${SITE_NAME}: every debate, in full`, "", `> ${SITE_DESCRIPTION}`, "", `## ${GOAT_MEANING.question}`, "", GOAT_MEANING.answer, "", `## ${HOW_THE_VOTE_WORKS.question}`, "", HOW_THE_VOTE_WORKS.answer, ""];
  for (const d of DEBATES) {
    const [a, b] = d.options;
    out.push(`## ${d.title}: ${d.question}`, "", `Vote: ${absoluteUrl(`/${d.slug}`)}`, `Live results: ${absoluteUrl(`/${d.slug}/results`)}`, "");
    out.push(...d.intro, "");
    out.push(`### Head to head (as of ${d.factsAsOf})`, "");
    for (const row of d.taleOfTheTape) out.push(`- ${row.label}: ${a.shortName} ${row.values[0]}, ${b.shortName} ${row.values[1]}`);
    out.push("");
    for (const option of d.options) {
      out.push(`### The case for ${option.name}`, "", ...option.caseFor.map((point) => `- ${point}`), "");
    }
    const cabinet = getCabinet(d.slug);
    if (cabinet) {
      const totals = teamTotals(cabinet);
      out.push(`### Trophy cabinet (${absoluteUrl(`/${d.slug}/trophies`)})`, "");
      out.push(`- ${cabinet.totalLabel}: ${a.shortName} ${totals[0]}, ${b.shortName} ${totals[1]}`);
      for (const row of cabinet.headline) {
        const [x, y] = headlineCounts(cabinet, row);
        out.push(`- ${row.label}: ${a.shortName} ${x}, ${b.shortName} ${y}`);
      }
      out.push("");
    }
    out.push("### Questions", "");
    for (const faq of debateFaqs(d).slice(0, -1)) out.push(`**${faq.question}** ${faq.answer}`, "");
  }
  return out.join("\n");
}
