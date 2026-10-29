import { llmsFullTxt } from "@/lib/llms";

/** https://whoisthegoats.com/llms-full.txt — every debate's facts, for AI assistants. */
export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
