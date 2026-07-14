# Figure

Figure is an AI styling companion. Instead of starting from a wardrobe scan, the interview starts with a user's taste (a free-text vibe description, visual style cues, body type, budget, and occasions), then turns that into shoppable, brand-aware outfit recommendations. Users can also connect Gmail to import past purchases and mix them into new outfits ("Mix My Closet").

Live site: https://figure-ai-stylist.vercel.app

## Stack

- Frontend: React + Vite + TypeScript, Tailwind, shadcn/ui
- Backend: Supabase (Postgres, Auth, Edge Functions)
- AI: Anthropic Claude, called from edge functions
- Product search: SerpAPI (Google Shopping)
- Payments: Stripe (checkout + subscriptions)
- Transactional email: Resend (custom SMTP for Supabase Auth)
- Hosting: Vercel, auto-deploys on push to `main`

## Local setup

```bash
npm install
cp .env.example .env   # fill in your own Supabase project values
npm run dev
```

Required env vars (see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

## Supabase project

The live/only Supabase project is **"Style Engine"**, ref `sfpgnszudaeoigcmhzfy`, under the `jwoodard840@gmail.com` org. This is currently on the **free tier**, which auto-pauses after a period of inactivity — if the live site seems down, check whether the project has paused before debugging application code.

### Edge functions

| Function | Purpose |
|---|---|
| `generate-style-profile` | Turns raw interview answers into AI-written keywords, style brief, etc. |
| `generate-for-you-recs` | Core recommendation engine — brand-aware, budget/gender filtered, aesthetic-tag scored, body-type silhouette guided. See below. |
| `fetch-products` | Runs a search query against SerpAPI Google Shopping, filtered by budget. |
| `generate-outfits` / `generate-closet-outfits` | Outfit generation, including from imported closet items. |
| `store-email-connection` / `scan-email-purchases` | Gmail OAuth connection and purchase-history scanning for closet import. |
| `tag-closet-item` | Tags a closet item with style metadata. |
| `create-checkout-session` / `stripe-webhook` | Stripe subscription checkout and billing event handling. |

There's no CI/CD wired up for edge functions — they don't deploy automatically on git push. After merging a change under `supabase/functions/`, you have to manually paste the updated file into the Supabase dashboard's Edge Functions → Code editor and click **Deploy**. See `DEPLOY_STEPS.md` for the original Stripe setup runbook (secrets, webhook registration, etc.).

### `generate-for-you-recs` in detail

This is the function most actively developed. It:

1. Derives the user's style signals from the visual cue photos they picked (mapped to categories like "Streetwear & Casual" via `ICON_CATEGORY_MAP`) and any Style Words folded into their vibe description text.
2. Filters a static 250-brand directory (`BRAND_DIRECTORY`) per shopping category by budget overlap and gender availability, then ranks the filtered brands by aesthetic-tag overlap with the user's style signals.
3. Adds body-type silhouette guidance (`SILHOUETTE_GUIDE`, sourced from `src/lib/bodyTypeStyling.ts`) for Tops, Bottoms, Dresses, and Outerwear, so Claude can favor flattering garment cuts (wrap, A-line, empire waist) without ever naming body size or body type in the actual search query.
4. Sends all of this to Claude to generate one brand-led search query per category.
5. Calls `fetch-products` for each query and returns categorized, shoppable results.

## Known gaps before charging real money

- **Free-tier Supabase auto-pause.** Needs a plan upgrade before relying on this for paying customers.
- **Resend is in sandbox mode**, so transactional email (password reset, etc.) likely lands in spam rather than inboxes. Needs a verified sending domain.
- **Stripe checkout is built but unverified end-to-end.** The `create-checkout-session` / `stripe-webhook` functions and `subscriptions` table exist, but no real (or Stripe test-mode) purchase has been run through the full flow to confirm it correctly creates/updates a subscription row.
- **Gmail import has never been manually tested end-to-end** on the live site.

## Deployment

- **Frontend:** push to `main` on GitHub → Vercel auto-deploys.
- **Database migrations:** run manually via the Supabase SQL Editor.
- **Edge functions:** manual copy-paste-and-deploy via the Supabase dashboard (see above).
