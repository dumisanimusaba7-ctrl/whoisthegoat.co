import type { ReactNode } from "react";

/** Dark title band used at the top of secondary pages. */
export function PageHero({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
        <p className="type-label text-mute-dark">{kicker}</p>
        <h1 className="type-headline mt-4 max-w-4xl text-[2.6rem] sm:text-6xl lg:text-7xl">{title}</h1>
        {children ? <div className="mt-4 max-w-2xl text-lg leading-relaxed text-mute-dark">{children}</div> : null}
      </div>
    </section>
  );
}
