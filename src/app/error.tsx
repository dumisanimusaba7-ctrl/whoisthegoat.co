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
        <h1 className="type-headline text-5xl sm:text-6xl">Something went wrong</h1>
        <p className="mt-4 max-w-md text-lg text-mute-dark">This page didn’t load. Votes already cast are safe.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-light">
            Try again
          </button>
          <Link href="/" className="btn btn-outline text-white">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
