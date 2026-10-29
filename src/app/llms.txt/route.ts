import { llmsTxt } from "@/lib/llms";

/** https://whoisthegoats.com/llms.txt — the site described for AI assistants. */
export function GET() {
  return new Response(llmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
