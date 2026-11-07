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

1. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.
2. Apply the schema and seed:
   ```bash
   supabase link --project-ref <your-ref>
   supabase db push                 # runs supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   Or paste both files into the Supabase SQL editor, in that order.

### Auth settings (Supabase dashboard → Authentication)

- **URL Configuration:** set Site URL to `https://dhive.co.za` and add these Redirect URLs:
  `https://dhive.co.za/auth/confirm`, `https://*-trev0rbs-projects.vercel.app/auth/confirm` (previews), `http://localhost:3000/auth/confirm`.
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

## Decisions so far

- **Rand-only (ZAR) for v1.** Paystack South Africa settles in ZAR, and mixing currencies broke price filters.
- **Zero platform fee.** Sellers get 100% of the price via Paystack subaccounts. DHIVE earns from featured
  listings (`products.featured_until`) and Pro subscriptions.
- **Prices in cents** (`price_cents`), matching what Paystack expects.
- **Writes to orders happen server-side only** (service role from checkout + webhook). RLS gives clients read
  access to their own orders/sales and nothing else.

## Roadmap (dev loop cycles)

- [x] **Cycle 1:** scaffold, Supabase schema + RLS, home / browse (search, category, price, sort) / listing pages, demo catalog, tests
- [x] **Cycle 2:** auth: magic-link sign-in, session refresh in `proxy.ts`, `/account` with profile edit + sign out
- [ ] **Cycle 3:** seller onboarding + dashboard: become a seller, create/edit/publish listings, upload deliverables to private storage
- [ ] **Cycle 4:** Paystack checkout: initialize transaction server-side, verify via webhook, create order, deliver file via signed URL
- [ ] **Cycle 5:** seller payouts: Paystack subaccount creation during onboarding, split so 100% goes to seller
- [ ] **Cycle 6:** buyer library (purchases), seller sales view, email receipts
- [ ] Later: featured listings (paid), Pro subscriptions, messaging, AI builder portal (Claude API)

### Open questions

- Who absorbs Paystack's transaction fee: the seller (`bearer: subaccount`) or DHIVE? This decides the payout split config in cycle 5.
- Should free listings require sign-in to download?
