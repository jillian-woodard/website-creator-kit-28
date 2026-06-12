# Deploy Steps

## 1. Push code to GitHub

In your terminal, from inside the project folder:

```bash
git add -A
git commit -m "Add Stripe subscription paywall"
git push origin main
```

## 2. Run the database migration

Go to supabase.com → your project → SQL Editor → paste and run this:

```sql
-- (contents of supabase/migrations/20260612000000_add_subscriptions.sql)
```

Or use the Supabase CLI:
```bash
supabase db push
```

## 3. Add Supabase Edge Function secrets

Go to supabase.com → your project → Edge Functions → Manage secrets, and add:

| Secret name            | Value                                      |
|------------------------|--------------------------------------------|
| STRIPE_SECRET_KEY      | sk_live_... (from Stripe → Developers → API Keys) |
| STRIPE_PRICE_ID        | price_1ThYSYF60hRdEzh9Xsx9TAWs            |
| STRIPE_WEBHOOK_SECRET  | whsec_... (from step 5 below)              |

## 4. Deploy Edge Functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

## 5. Set up Stripe webhook

Go to Stripe → Developers → Webhooks → Add endpoint:
- URL: https://sfpgnszudaeoigcmhzfy.supabase.co/functions/v1/stripe-webhook
- Events to listen for:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed

Copy the **Signing secret** (whsec_...) and add it as STRIPE_WEBHOOK_SECRET in step 3.

## 6. Deploy to Vercel

1. Go to vercel.com → New Project → import `jillian-woodard/website-creator-kit-28`
2. Under **Environment Variables**, add:
   - VITE_SUPABASE_URL = https://sfpgnszudaeoigcmhzfy.supabase.co
   - VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGci... (your anon key)
3. Click Deploy

That's it — your site is live and monetized.
