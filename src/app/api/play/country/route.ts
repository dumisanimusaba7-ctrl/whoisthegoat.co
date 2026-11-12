import { NextResponse, type NextRequest } from "next/server";

import { clientCountry } from "@/lib/server/network";
import { NO_STORE } from "@/lib/server/request";

/** The visitor's country, as the edge network reports it (null when unknown), so a board can offer "your country". */
export function GET(request: NextRequest) {
  return NextResponse.json({ country: clientCountry(request.headers) }, { headers: NO_STORE });
}
