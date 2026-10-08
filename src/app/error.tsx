"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
        <p className="type-label text-mute-dark">Something went wrong</p>
        <h1 className="type-headline mt-4 text-5xl sm:text-7xl">Play stopped</h1>
        <p className="mt-4 max-w-md text-lg text-mute-dark">
          This page hit a problem loading. Votes already cast are safe.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="type-label inline-flex h-12 items-center bg-white px-5 text-ink transition-colors hover:bg-paper-2"
          >
            Try again
          </button>
          <Link href="/" className="type-label inline-flex h-12 items-center border border-white/30 px-5 transition-colors hover:bg-white/10">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
