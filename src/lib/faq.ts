import type { Debate } from "./debates";
import { SITE_NAME } from "./site";

export type Faq = { question: string; answer: string };

/** "GOAT" written out, for the pages people reach by searching the word. */
export const GOAT_MEANING: Faq = {
  question: "What does GOAT mean?",
  answer:
    "GOAT stands for “Greatest Of All Time”. Fans use it for the one player, fighter, artist or brand they rate above everyone else, and arguing about who deserves it is one of the oldest debates in sport.",
};

export const HOW_THE_VOTE_WORKS: Faq = {
  question: `How does the vote on ${SITE_NAME} work?`,
  answer:
    "Anyone can vote once per debate, with no sign-up. Every percentage comes straight from the vote count and updates as votes arrive, and each country’s split is shown once it has enough votes. Repeat votes and automated traffic are turned away.",
};

/** The first two sentences of a list of facts, as one answer. */
function summarise(points: string[], count = 3): string {
  return points.slice(0, count).join(" ");
}

/**
 * Questions people ask about a debate, answered from the facts on its page.
 * The live split isn't quoted here: the board keeps it hidden until you vote.
 */
export function debateFaqs(debate: Debate): Faq[] {
  const [a, b] = debate.options;
  const tape = debate.taleOfTheTape.map((row) => `${row.label}: ${a.shortName} ${row.values[0]}, ${b.shortName} ${row.values[1]}`).join("; ");
  return [
    {
      question: `${debate.question.replace(/\?$/, "")}: ${a.shortName} or ${b.shortName}?`,
      answer: `That’s for the world to decide. ${SITE_NAME} runs a live public vote on ${debate.title}: cast yours in one tap, then see how every country has voted. ${debate.intro[0]}`,
    },
    { question: `What has ${a.name} won?`, answer: summarise(a.caseFor) },
    { question: `What has ${b.name} won?`, answer: summarise(b.caseFor) },
    {
      question: `How do ${a.shortName} and ${b.shortName} compare?`,
      answer: `As of ${debate.factsAsOf}: ${tape}.`,
    },
    HOW_THE_VOTE_WORKS,
  ];
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
