# WHOISTHEGOAT.CO

**The world decides.** A live, global vote on sport's biggest debates. The launch
debate is **Messi vs Ronaldo**.

The whole product is one loop:

> question → one-tap vote → live global result → personal share card → new visitors

No accounts, no sign-up, no email. Every number on the site comes straight from
the vote database.

---

## Stack

- **Next.js 16** (App Router, Cache Components, Turbopack) + **TypeScript**
- **Supabase** (Postgres): votes, counters and all vote logic live in SQL functions
- **Vercel**: hosting, edge cache, geolocation, BotID
- **Tailwind CSS v4**, self-hosted **Archivo** variable font
- `next/og` for share cards and link previews
- **Vitest** for unit tests, plain SQL assertions for the database

## How it works

```
Browser ──► CDN (static pages, prerendered, revalidated every 30s)
   │
   ├─► GET  /api/results/:debate        edge-cached 5s, polled by open pages
   ├─► GET  /api/card/:debate/:choice/:format   PNG share card, edge-cached 60s
   ├─► GET  /api/og/:debate             link-preview image, edge-cached 5 min
   └─► POST /api/vote                   never cached
            │  origin check → BotID → cookie voter id → HMAC(voter), HMAC(network)
            ▼
        Supabase RPC  cast_vote()  ── one transaction:
            rate limit per network → insert vote (PK = debate + voter)
            → trigger bumps sharded counters → return fresh totals
```

**Viral traffic.** Pages are fully static (`ensureStatic = "navigation"` makes the build
fail if anything would render per request). Live numbers come from a results endpoint
the CDN shares for 5 seconds, so a million open tabs cost the database roughly one
read per region every 5 seconds. Totals are read from sharded counter rows
(16 per option), never by counting the votes table, so a burst of votes doesn't
queue on one hot row. Locally, `cast_vote` sustained ~2,900 votes/s with no failures.

**Real-time.** Open pages poll while visible, pause in background tabs, back off
on errors, and never let a stale cache hit move a count backwards. When nobody is
voting, nothing moves.

## Vote integrity

| Threat | Protection |
| --- | --- |
| Repeat votes | Random voter id in an `HttpOnly` first-party cookie; the database primary key `(debate, voter_hash)` makes a second vote impossible. A returning voter gets their original choice back. |
| Bots | Vercel BotID (invisible challenge) on `POST /api/vote` when deployed on Vercel; same-origin check; JSON-only, size-capped bodies. |
| Rapid fire / ballot stuffing | Per-network limits (IPv4 address, or IPv6 `/64`) per minute and per day, enforced inside the vote transaction. Rejected attempts still count. |
| Tampering | Browser never talks to Supabase. RLS is on for every table with no policies, `anon`/`authenticated` have no grants, and only `service_role` can run the functions. Votes are immutable (trigger); option ↔ debate integrity is a composite foreign key. |
| Clean-up | Deleting votes (e.g. a flagged network) automatically corrects every counter. `rebuild_debate_tallies()` recomputes them from scratch. |

Mobile carriers put many people behind one IP, so IP limits are deliberately
generous rather than "one vote per IP".

## Privacy

Stored per vote: debate, option, time, two-letter country (from Vercel's edge
geolocation), an HMAC of the cookie id, and an HMAC of the network address.
No raw IPs, no names, no emails. The network hash is erased after 30 days and
rate-limit windows after 2 days (scheduled with `pg_cron`). A country's split is
only published once it passes `MIN_COUNTRY_VOTES`. See `/privacy`.

---

## Getting started

### 1. Database (Supabase)

Create a Supabase project, then apply the schema with either:

- **Dashboard:** SQL Editor → paste and run `supabase/migrations/20261008120000_voting.sql`, or
- **CLI:** `supabase init` (keep the existing `supabase/` folder), `supabase link --project-ref <ref>`, `supabase db push`.

The migration creates the tables, functions, access rules and the
`messi-vs-ronaldo` debate, and schedules maintenance with `pg_cron` (enabled on
Supabase by default). Optional check against the live database:

```bash
DATABASE_URL="postgres://…" npm run test:db   # runs in a transaction, rolls back
```

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://whoisthegoat.co` |
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_SECRET_KEY` | yes | Secret (`sb_secret_…`) or legacy `service_role` key. Server only. |
| `VOTE_HASH_SECRET` | yes | `openssl rand -hex 32`. Keep it stable. |
| `VOTE_LIMIT_PER_MINUTE` / `VOTE_LIMIT_PER_DAY` | no | Defaults 10 / 200 per network per debate |
| `MIN_COUNTRY_VOTES` | no | Default 10 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Shown on `/privacy` (default `hello@whoisthegoat.co`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_RESULTS`, `NEXT_PUBLIC_ADSENSE_SLOT_EDITORIAL` | no | Ads render only when set |
| `NEXT_PUBLIC_BOTID_DISABLED` | no | `1` turns BotID off everywhere |

Without database variables the site still builds and renders. Live figures show as
unavailable and voting returns a clear "briefly unavailable" message. Nothing is faked.

### 3. Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + unit tests
npm run build && npm start
```

## Deploying to Vercel

1. Import the repository into Vercel (framework preset: Next.js).
2. Add the environment variables above for Production (and Preview if wanted).
   Keep "Automatically expose System Environment Variables" on: BotID uses
   `NEXT_PUBLIC_VERCEL_ENV` to switch itself on.
3. Add the `whoisthegoat.co` domain.
4. Optional: Firewall → enable **BotID Deep Analysis** for stronger bot detection.

Vercel supplies the visitor IP and country headers the vote API relies on. On another
host, make sure the proxy overwrites `x-real-ip` / `x-forwarded-for` and provides a
country header (`x-vercel-ip-country` or `cf-ipcountry`).

## Google AdSense

1. Apply for AdSense with the domain. Once approved, set `NEXT_PUBLIC_ADSENSE_CLIENT`
   (adds the AdSense script, the `google-adsense-account` meta tag and `/ads.txt`).
2. Create two display ad units and set their slot ids. Placements: below the live
   result (never near the vote buttons) and between editorial sections. Each is
   labelled "Advertisement" and reserves its height.
3. In AdSense → Privacy & messaging, enable Google's consent message for the
   EEA, UK and Switzerland.

## Adding a debate

1. Add an entry to `DEBATES` in `src/lib/debates.ts` (names, colours, shirt
   numbers, copy, SEO).
2. Insert the matching rows (same slugs) in a new migration:

   ```sql
   insert into public.debates (slug, title, sport, status, opened_at)
   values ('haaland-vs-mbappe', 'Haaland vs Mbappé', 'football', 'live', now());
   insert into public.debate_options (debate_id, slug, name, position)
   select id, o.slug, o.name, o.position from public.debates,
     (values ('haaland', 'Erling Haaland', 1), ('mbappe', 'Kylian Mbappé', 2)) o(slug, name, position)
   where debates.slug = 'haaland-vs-mbappe';
   ```

Pages, results, share cards, OG images and the sitemap pick it up automatically.
Set `status = 'closed'` to stop voting while keeping the results public.
The data layer supports any number of options; the arena layout is built for two.

## Project layout

```
src/app/                 routes: /, /[debate], /[debate]/results, /[debate]/share/[choice],
                         /debates, /results, /privacy, API routes, metadata routes
src/components/debate/   arena (vote + reveal), share panel, results board, editorial
src/lib/                 debate registry, results maths, formatting, SEO helpers
src/lib/server/          Supabase client, vote processing, network/IP handling
src/lib/card/            share card and OG image renderer
supabase/migrations/     schema, functions, access control, launch debate
supabase/tests/          SQL assertions
tests/                   unit tests (Vitest)
assets/fonts/            static Archivo cuts for the image renderer
brand/                   original logo artwork and the traced vector mark
docs/LAUNCH.md           launch checklist and social playbook
```

## Content

Editorial facts (honours, records) live in `src/lib/debates.ts` with a `factsAsOf`
date shown on the page. They're current to October 2026; check them after
milestones such as the Ballon d'Or ceremony.

Fonts: Archivo and Montserrat (used for the wordmark outlines) are licensed under
the SIL Open Font License.

WHOISTHEGOAT.CO is an independent fan vote, not affiliated with any player, club,
league or federation.
