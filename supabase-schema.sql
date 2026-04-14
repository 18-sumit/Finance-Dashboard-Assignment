-- Run this in Supabase SQL Editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  balance numeric(12,2) not null default 0,
  color text not null default '#4f46e5',
  icon text not null default 'Wallet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#64748b',
  icon text not null default 'Tag',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  category_id text not null,
  account_id uuid not null references public.accounts(id) on delete cascade,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_transactions_category
    foreign key (user_id, category_id)
    references public.categories (user_id, id)
    on delete restrict
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  month date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_budget_per_category_per_month unique (user_id, category_id, month),
  constraint fk_budgets_category
    foreign key (user_id, category_id)
    references public.categories (user_id, id)
    on delete cascade
);

create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date desc);
create index if not exists idx_budgets_user_id on public.budgets(user_id);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "accounts own rows" on public.accounts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories own rows" on public.categories
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions own rows" on public.transactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budgets own rows" on public.budgets
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
