/**
 * Test mode lets one browser vote any number of times, so the vote and the
 * reveal can be tried end to end before launch. The votes are still real and
 * counted: clear them with supabase/reset_votes.sql. Read on both server and
 * client and inlined at build time, so switching it needs a redeploy.
 * Every page says when it's on. Never launch with it on.
 */
export const voteTestMode = process.env.NEXT_PUBLIC_VOTE_TEST_MODE === "1";
