/**
 * A script that runs synchronously while the HTML is parsed, before first
 * paint. Rendered as inert text on the client so React doesn't re-run or
 * warn about it during hydration.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
