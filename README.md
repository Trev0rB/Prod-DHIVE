# DHIVE

The AI marketplace where creators keep 100%. Buy and sell AI tools, automations, templates and courses.
Next.js 16 (App Router, Cache Components) · Supabase · Paystack · Vercel.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

With no Supabase env vars set, the app runs on a built-in demo catalog (ported from the original
prototype), so it works out of the box.

### Connect Supabase

1. Copy `.env.example` to `.env.local` and fill in your project URL and publishable key (`sb_publishable_…`).
2. Apply the schema and seed (production is already set up; this is for a fresh project):
   ```bash
   supabase link --project-ref <your-ref>
   supabase db push                 # runs supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   Or paste both files into the Supabase SQL editor, in that order.

### Auth settings (Supabase dashboard → Authentication)

- **URL Configuration:** set Site URL to `https://prod-dhive.vercel.app` (switch to `https://dhive.co.za` once the domain moves) and add these Redirect URLs:
  `https://prod-dhive.vercel.app/auth/confirm`, `https://dhive.co.za/auth/confirm`,
  `https://prod-dhive-*-trevors-projects-63317564.vercel.app/auth/confirm` (previews), `http://localhost:3000/auth/confirm`.
- **Email template (Magic Link), optional:** so links work when opened on a different device, change the link to
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. The default `?code=` link also works, as long as it's opened in the same browser.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Layout

```
src/app/            routes: / (home), /browse, /p/[slug] (listing), /sell
src/components/     header, footer, search, product cards
src/lib/catalog.ts  catalog reads ('use cache', tagged "products"/"categories")
src/lib/filter.ts   query parsing + in-memory filter/sort (demo mode)
supabase/           migrations (schema + RLS) and seed data
```

## Production

- **Supabase:** project `Digital Hive Marketplace` (`vizdhfbdfzgozaokhzmo`, eu-west-1). Migrations 0001 + 0002 and the
  category seed are applied. Security advisors are clean, and the RLS + column grants were checked by trying each escalation
  as a signed-in and an anonymous user.
- **Vercel:** project `prod-dhive` → https://prod-dhive.vercel.app. Deploys from `main`; PRs get login-protected preview URLs.
  Functions run in Dublin (`dub1`), next to the Supabase database.

## Decisions so far

- **Rand-only (ZAR) for v1.** Paystack South Africa settles in ZAR, and mixing currencies broke price filters.
- **Zero platform fee.** Sellers get 100% of the price via Paystack subaccounts. DHIVE earns from featured
  listings (`products.featured_until`) and Pro subscriptions.
- **Prices in cents** (`price_cents`), matching what Paystack expects.
- **Becoming a seller** goes through the `become_seller()` database function; clients can't set `is_seller` directly.
- **Files** live in Supabase Storage under `<user id>/…`. Deliverables are private: only the seller and buyers with a
  paid order can read them (`can_download()`). Uploads go browser → Storage directly, because Vercel caps request bodies at ~4.5 MB.
  The two definer functions are flagged by the Supabase advisor as callable by signed-in users. That's intended: both only act on the caller.
- **Writes to orders happen server-side only** (service role from checkout + webhook). RLS gives clients read
  access to their own orders/sales and nothing else.

## Roadmap (dev loop cycles)

- [x] **Cycle 1:** scaffold, Supabase schema + RLS, home / browse (search, category, price, sort) / listing pages, demo catalog, tests
- [x] **Cycle 2:** auth: magic-link sign-in, session refresh in `proxy.ts`, `/account` with profile edit + sign out
- [x] **Cycle 3:** seller onboarding (`/sell`), `/dashboard`, create/edit/publish/archive listings, direct-to-storage uploads (private deliverables, public cover images)
- [x] **Cycle 4:** Paystack checkout (buyer pays the card fee), webhook + callback verification, seller payout accounts (Paystack subaccounts), free claims, buyer library with signed downloads
- [ ] **Cycle 5:** seller sales view, email receipts, refunds/disputes handling
- [ ] **Cycle 6:** move dhive.co.za to this project, legal pages (terms, privacy, seller terms), launch checklist
- [ ] Later: featured listings (paid), Pro subscriptions, messaging, AI builder portal (Claude API)

## Payments setup

1. Add to Vercel (Production + Preview), **server-only**: `PAYSTACK_SECRET_KEY` and `SUPABASE_SECRET_KEY` (see `.env.example`).
   Until both exist, paid checkout and payout setup stay switched off; free listings and downloads still work.
2. In Paystack → Settings → API Keys & Webhooks, set the webhook URL to `https://prod-dhive.vercel.app/api/paystack/webhook`
   (test and live are configured separately).
3. Each seller adds a payout account at `/dashboard/payouts` (creates a Paystack subaccount with a 0% platform share).

**How the money flows:** the buyer pays price + Paystack's fee (2.9% + R1, excl. 15% VAT; R1 waived under R10; see
`src/lib/fees.ts`). The full charge goes to the seller's subaccount with `bearer: "subaccount"`, so Paystack takes its fee
there and the seller nets exactly the listing price. DHIVE receives nothing from sales. International cards cost a little
more (3.1% + R1), so on those the seller nets a few rand less.

**Trust model:** orders are only marked paid by the server after re-verifying the reference with Paystack and checking
status, currency, reference and the exact amount. The webhook signature (HMAC-SHA512) is checked first. Clients can't
write orders at all.

### Open questions

- Should free listings require sign-in to download? (Currently yes, so they land in the buyer's library.)
