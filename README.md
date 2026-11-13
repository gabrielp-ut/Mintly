# MINTLY

Responsive personal-finance web app built with React + Vite. The default interface is white + mint green and works on desktop and mobile.

## Included
- Dashboard with received income, committed expenses, available money and pie chart.
- One-time income, expenses, savings and investments.
- Daily, weekly and monthly recurring transactions.
- Scheduled expenses reserve money before they happen.
- Scheduled income only counts once its date is reached.
- Single-day recurring exceptions: skip or override one occurrence.
- Savings goals and progress bars.
- Spanish / English UI.
- User-defined income allocation percentages with 100% validation.
- Local demo mode via localStorage.
- Supabase-ready schema with Row Level Security for per-user data isolation.

## Run locally
```bash
npm install
npm run dev
```

## Replace your current Vite source
If you already created `personal-finance`, copy this project's `src/`, `index.html`, `vite.config.js` and dependencies into your existing folder, then run `npm install`.

## Supabase sync setup
1. Create a Supabase project.
2. In SQL Editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add your Project URL and Publishable Key:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
5. Restart `npm run dev`.

Without environment variables the app uses local demo mode. With both variables configured, authentication is required and the frontend reads and writes the five Supabase tables. Authenticated financial data is never persisted to the demo storage key.

Apply `supabase/schema.sql` in Supabase SQL Editor for both new and existing installations. It enables RLS, grants, Realtime publication, ownership foreign keys, validation constraints and indexes. New hardening constraints use `NOT VALID` so legacy rows are preserved while new writes are checked; audit legacy rows and validate those constraints separately. This repository change does not apply SQL to your remote project automatically.

The Settings page can import an existing local dataset after login. Import preserves cloud settings, remaps IDs per account, uploads parent recurrences before their children and supports retrying partial imports. Import is not an atomic database transaction.

## Financial behavior
- Available Money is a monthly figure, without a carry-over balance.
- Future income, one-time or recurring, counts only on its date.
- All expenses in the month reserve money, including future commitments.
- One-time savings and investments reduce available money when registered. Recurring savings and investments count when due.
- Materialized recurring occurrences are counted once.
- Monthly recurrences on days 29–31 use the last available day in shorter months.
- Expenses includes a switch to show all recurring transaction types. Each occurrence can be skipped, restored or have its amount changed without editing the series.
- Goals track progress independently. To reduce available money, record a savings transaction; changing a goal balance does not create one.
- Allocation percentages are targets, not automatic transfers. Changing currency changes formatting, without converting amounts.

## Verification
Run `npm test` for financial/date regression tests and `npm run build` for the production build. Live authentication, RLS isolation with two accounts, Realtime across devices and responsive layouts still require integration/browser verification.

## Important privacy boundary
Do not store card numbers, bank account numbers, government IDs, brokerage credentials or passwords in this app.
