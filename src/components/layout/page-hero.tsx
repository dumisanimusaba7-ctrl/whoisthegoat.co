import type { ReactNode } from "react";

/** Title band at the top of secondary pages. */
export function PageHero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
        {/* Scales down on the narrowest phones so long titles ("Leaderboard") fit. */}
        <h1 className="type-headline text-[min(2.6rem,10vw)] sm:text-6xl">{title}</h1>
        {children ? <div className="mt-4 max-w-xl text-lg leading-relaxed text-mute-dark">{children}</div> : null}
      </div>
    </section>
  );
}
