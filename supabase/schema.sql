-- MINTLY - secure multi-device schema
create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  date date not null, type text not null check (type in ('income','expense','savings','investment')),
  amount numeric(12,2) not null check (amount >= 0), category text not null default 'Other', concept text not null,
  recurring_id uuid null, created_at timestamptz not null default now()
);
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense','savings','investment')), amount numeric(12,2) not null check (amount >= 0),
  category text not null default 'Other', concept text not null, frequency text not null check (frequency in ('daily','weekly','monthly')),
  days_of_week int[] not null default '{}', start_date date not null, end_date date null, active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.recurring_exceptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  recurring_id uuid not null references public.recurring_transactions(id) on delete cascade, date date not null,
  action text not null check (action in ('skip','override')), override_amount numeric(12,2) null, unique(recurring_id,date)
);
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, target_amount numeric(12,2) not null check (target_amount > 0), saved_amount numeric(12,2) not null default 0 check(saved_amount >= 0),
  target_date date null, created_at timestamptz not null default now()
);
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade, language text not null default 'es' check(language in ('es','en')),
  currency text not null default 'USD', usable_percentage int not null default 60 check(usable_percentage between 0 and 100),
  savings_percentage int not null default 10 check(savings_percentage between 0 and 100), investment_percentage int not null default 30 check(investment_percentage between 0 and 100),
  updated_at timestamptz not null default now(), constraint allocation_total check(usable_percentage+savings_percentage+investment_percentage=100)
);

alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.recurring_exceptions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.user_settings enable row level security;

revoke all on table public.transactions, public.recurring_transactions, public.recurring_exceptions, public.savings_goals, public.user_settings from anon, authenticated;
grant select,insert,update,delete on public.transactions, public.recurring_transactions, public.recurring_exceptions, public.savings_goals, public.user_settings to authenticated;

drop policy if exists "users own transactions" on public.transactions;
drop policy if exists "users own recurring" on public.recurring_transactions;
drop policy if exists "users own exceptions" on public.recurring_exceptions;
drop policy if exists "users own goals" on public.savings_goals;
drop policy if exists "users own settings" on public.user_settings;
create policy "users own transactions" on public.transactions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users own recurring" on public.recurring_transactions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users own exceptions" on public.recurring_exceptions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users own goals" on public.savings_goals for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users own settings" on public.user_settings for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Enable realtime for device-to-device updates (safe to rerun).
do $$
declare t text;
begin
  foreach t in array array['transactions','recurring_transactions','recurring_exceptions','savings_goals','user_settings'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Harden ownership of relationships, including existing installations.
-- NOT VALID preserves legacy rows while enforcing all new writes; validate after auditing legacy data.
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.recurring_transactions'::regclass and conname='recurring_owner_unique') then
    alter table public.recurring_transactions add constraint recurring_owner_unique unique (id,user_id);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.recurring_exceptions'::regclass and conname='exception_recurring_owner') then
    alter table public.recurring_exceptions add constraint exception_recurring_owner
      foreign key (recurring_id,user_id) references public.recurring_transactions(id,user_id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.transactions'::regclass and conname='transaction_recurring_owner') then
    alter table public.transactions add constraint transaction_recurring_owner
      foreign key (recurring_id,user_id) references public.recurring_transactions(id,user_id) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.recurring_exceptions'::regclass and conname='valid_override_amount') then
    alter table public.recurring_exceptions add constraint valid_override_amount
      check (action <> 'override' or (override_amount is not null and override_amount >= 0)) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.recurring_transactions'::regclass and conname='valid_recurrence_dates') then
    alter table public.recurring_transactions add constraint valid_recurrence_dates
      check (end_date is null or end_date >= start_date) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.recurring_transactions'::regclass and conname='valid_recurrence_weekdays') then
    alter table public.recurring_transactions add constraint valid_recurrence_weekdays
      check (days_of_week <@ array[0,1,2,3,4,5,6] and (frequency <> 'weekly' or cardinality(days_of_week) > 0)) not valid;
  end if;
end $$;

create index if not exists transactions_user_date_idx on public.transactions(user_id,date);
create index if not exists recurring_user_idx on public.recurring_transactions(user_id);
create index if not exists exceptions_user_idx on public.recurring_exceptions(user_id);
create index if not exists goals_user_idx on public.savings_goals(user_id);
