import type { ReactNode } from "react";

/** Title band at the top of secondary pages. */
export function PageHero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
        <h1 className="type-headline text-[2.6rem] sm:text-6xl">{title}</h1>
        {children ? <div className="mt-4 max-w-xl text-lg leading-relaxed text-mute-dark">{children}</div> : null}
      </div>
    </section>
  );
}
