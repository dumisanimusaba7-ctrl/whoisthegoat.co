import { connection, type NextRequest } from "next/server";

import { NO_STORE } from "@/lib/server/request";
import { formatSetupReport, runSetupCheck } from "@/lib/server/setup-check";

/**
 * Is this deployment able to take votes? Open it in a browser for a
 * plain-text report of each setting and of what the database said. Never
 * shows keys or secrets. Answers 503 until everything checks out, so it also
 * works as an uptime check.
 */
export async function GET(request: NextRequest) {
  // Always run on request: a report prerendered at build time would go stale.
  await connection();
  const report = await runSetupCheck(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  return new Response(formatSetupReport(report), {
    status: report.ready ? 200 : 503,
    headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" },
  });
}
