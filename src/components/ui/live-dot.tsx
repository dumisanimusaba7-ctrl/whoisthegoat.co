/** The red "on air" indicator. Static: it signals the vote is open, not activity. */
export function LiveDot({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-2 shrink-0 rounded-full bg-live ${className}`} />;
}
