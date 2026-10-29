import { JsonLd } from "@/components/json-ld";
import { faqJsonLd, type Faq } from "@/lib/faq";

/** Common questions, open to read and marked up for search engines and AI assistants. */
export function FaqSection({ title = "Questions", faqs }: { title?: string; faqs: Faq[] }) {
  return (
    <section aria-labelledby="faq-title" className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <h2 id="faq-title" className="type-title">
          {title}
        </h2>
        <div className="border-t-2 border-ink">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-rule">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                <h3 className="text-base">{faq.question}</h3>
                <span aria-hidden="true" className="shrink-0 text-xl leading-none transition-transform duration-[var(--duration-ui)] group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 leading-relaxed text-ink/75">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={faqJsonLd(faqs)} />
    </section>
  );
}
