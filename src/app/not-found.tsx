import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
        <p className="type-label text-mute-dark">404</p>
        <h1 className="type-headline mt-4 text-5xl sm:text-7xl">Out of bounds</h1>
        <p className="mt-4 max-w-md text-lg text-mute-dark">That page doesn’t exist. The vote does.</p>
        <Link
          href="/"
          className="type-label mt-8 inline-flex h-12 w-fit items-center gap-2 bg-white px-5 text-ink transition-colors hover:bg-paper-2"
        >
          Cast your vote <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
