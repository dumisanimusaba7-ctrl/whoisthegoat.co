import { initBotId } from "botid/client/core";

import { botProtectionEnabled, PROTECTED_ROUTES } from "@/lib/bot-protection";

// Vercel BotID: attaches an invisible challenge to vote requests so the
// server can reject automated clients.
if (botProtectionEnabled) {
  initBotId({ protect: PROTECTED_ROUTES });
}
