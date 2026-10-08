import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
        <p className="type-label tabular text-mute-dark">404</p>
        <h1 className="type-headline mt-3 text-5xl sm:text-6xl">Page not found</h1>
        <p className="mt-4 max-w-md text-lg text-mute-dark">There’s nothing at this address.</p>
        <Link href="/" className="btn btn-light mt-8 w-fit">
          Go to the vote
        </Link>
      </div>
    </section>
  );
}
