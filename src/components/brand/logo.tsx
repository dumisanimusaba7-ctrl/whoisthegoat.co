import {
  MARK_PATH,
  MARK_VIEWBOX,
  WORDMARK_NAME_PATH,
  WORDMARK_TLD_PATH,
  WORDMARK_VIEWBOX,
} from "./logo-paths";

type SvgProps = { className?: string; title?: string };

/** The goat-head mark. Inherits `currentColor`. */
export function LogoMark({ className, title }: SvgProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={MARK_PATH} />
    </svg>
  );
}

/** "whoisthegoat.co" set in the brand wordmark. Inherits `currentColor`. */
export function LogoWordmark({ className, title }: SvgProps) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={WORDMARK_NAME_PATH} />
      <path d={WORDMARK_TLD_PATH} />
    </svg>
  );
}

/** Horizontal lockup used in the site header and footer. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-6 w-auto shrink-0 sm:h-7" />
      <LogoWordmark className="h-[13px] w-auto sm:h-[15px]" />
      <span className="sr-only">WHOISTHEGOAT.CO</span>
    </span>
  );
}
