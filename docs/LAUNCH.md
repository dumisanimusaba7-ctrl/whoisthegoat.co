# Launch checklist & social playbook

## Before launch

- [ ] Supabase project created; migration applied; `npm run test:db` passes against it.
- [ ] `pg_cron` jobs present: `select jobname, schedule from cron.job;` should list
      `wigoat-prune-rate-limits` and `wigoat-scrub-network-hashes`.
- [ ] Vercel env vars set (`NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
      `VOTE_HASH_SECRET`). `VOTE_HASH_SECRET` stored somewhere safe: changing it
      lets everyone vote again.
- [ ] Domain `whoisthegoat.co` attached, HTTPS active.
- [ ] Cast a test vote on production, then remove it so the count starts at zero:
      ```sql
      delete from public.votes where created_at > now() - interval '10 minutes';
      ```
      (Counters correct themselves through the delete trigger.)
- [ ] Share a link in WhatsApp / X / iMessage and check the preview image.
- [ ] Check the honours in `src/lib/debates.ts` are still current.
- [ ] `hello@whoisthegoat.co` (or `NEXT_PUBLIC_CONTACT_EMAIL`) receives mail.
- [ ] Google Search Console: verify the domain and submit `/sitemap.xml`.
- [ ] Once AdSense approves the site: set the client and slot env vars, enable the
      consent message, redeploy.

## Watching a viral spike

- **Votes per minute:**
  `select date_trunc('minute', created_at) m, count(*) from votes where created_at > now() - interval '1 hour' group by 1 order by 1 desc;`
- **Networks hitting the limit:**
  `select encode(network_hash, 'hex'), window_kind, hits from vote_rate_limits where hits > 50 order by hits desc limit 20;`
- **Removing votes from one abusive network** (counters follow automatically):
  `delete from votes where network_hash = decode('<hex>', 'hex') and debate_id = (select id from debates where slug = 'messi-vs-ronaldo');`
- Tighten `VOTE_LIMIT_PER_MINUTE` / `VOTE_LIMIT_PER_DAY` in Vercel and redeploy if needed.

## Social playbook

Every post leads back to one URL: **whoisthegoat.co**. Use real numbers only,
copied from `/messi-vs-ronaldo/results` at the time of posting. Never round up,
never post a figure the site doesn't show.

**Formats that feed the loop**

- Screen-record the vote: question → tap → "THE WORLD HAS SPOKEN" reveal (≈6 s).
- Post the share card itself (Story format) with "Your turn."
- Country moments: "PORTUGAL HAS SPOKEN." with the real Portugal split from the
  results page, then "But what does the rest of the world think?"
- Milestones, only when they're true: "{N} PEOPLE HAVE VOTED." / "The gap is getting smaller."

**Copy starters**

> MESSI OR RONALDO?
> We've stopped arguing.
> Let the world decide.
> Vote now: whoisthegoat.co

> {TOTAL} VOTES. {COUNTRIES} COUNTRIES.
> One question.
> whoisthegoat.co

> {COUNTRY} HAS SPOKEN: {SPLIT}.
> Does the rest of the world agree?
> whoisthegoat.co

**Links:** use `whoisthegoat.co` in bios and posts. For a specific pick, link
`whoisthegoat.co/messi-vs-ronaldo/share/messi` (or `/ronaldo`): its preview shows
that player's card, and the page itself is the vote.
