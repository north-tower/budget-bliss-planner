# Budget Bliss Planner

50/30/20 budgeting app built with React + Vite + TypeScript.

## Supabase Backend Architecture

This project now includes a Supabase-ready backend design with:

- Auth via email/password (plus optional Google OAuth).
- Row Level Security scoped to `auth.uid()` across all budget tables.
- Monthly budget upsert and summary RPC functions.
- Realtime support for `budget_items` cross-tab syncing.

### 1) Run SQL Migration

Apply this migration in Supabase SQL Editor (or CLI):

- `supabase/migrations/202603310001_budget_backend.sql`

It creates:

- `budgets` (one budget per user per month)
- `budget_items` (line items with category + ordering)
- RLS policies for both tables
- RPC: `upsert_budget(p_month, p_income)`
- RPC: `get_budget_summary(p_month)`
- Trigger-based `updated_at`
- Realtime publication setup for `budget_items`

### 2) Environment Variables

Create a local `.env` file with:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-public-anon-key
```

### 3) Frontend Supabase Helpers

Reusable frontend helpers are available at:

- `src/lib/supabase/client.ts` - Supabase client bootstrap
- `src/lib/supabase/auth.ts` - auth utilities
- `src/lib/supabase/budget-api.ts` - budget + budget_items + RPC calls
- `src/lib/supabase/realtime.ts` - realtime subscriptions
- `src/lib/supabase/types.ts` - app-level types

### 4) Realtime Usage Pattern

```ts
import { subscribeToBudgetItems, unsubscribeFromChannel } from "@/lib/supabase/realtime";

const channel = subscribeToBudgetItems(userId, () => {
  // re-fetch budget items
});

// cleanup
await unsubscribeFromChannel(channel);
```

### 5) Edge Function (Recommended)

Add a scheduled Edge Function that runs on the 1st of each month:

- clones previous month's budget items
- resets `actual_amount` to `0`
- creates starter template for the new month
