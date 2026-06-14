create extension if not exists "pgcrypto";

create type public.person_role as enum ('dad', 'kid');
create type public.transaction_direction as enum ('dad_owes_kid', 'kid_owes_dad');
create type public.transaction_source as enum ('web', 'sms');

create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role public.person_role not null,
  phone text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint phone_e164ish check (phone ~ '^\+[1-9][0-9]{7,14}$')
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text not null default 'sparkles',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references public.people(id) on delete restrict,
  submitted_by_id uuid not null references public.people(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  description text not null check (length(trim(description)) > 0),
  category_id uuid not null references public.categories(id) on delete restrict,
  direction public.transaction_direction not null,
  source public.transaction_source not null default 'web',
  raw_sms_text text,
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  needs_review boolean not null default false,
  review_reason text,
  is_paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references public.people(id) on delete restrict,
  submitted_by_id uuid not null references public.people(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  direction public.transaction_direction not null,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger people_updated_at
before update on public.people
for each row execute function public.set_updated_at();

create trigger transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create index people_phone_idx on public.people(phone);
create index transactions_kid_paid_idx on public.transactions(kid_id, is_paid);
create index transactions_direction_idx on public.transactions(direction);
create index transactions_category_idx on public.transactions(category_id);
create index transactions_needs_review_idx on public.transactions(needs_review) where needs_review = true;
create index settlements_kid_idx on public.settlements(kid_id);

insert into public.people (name, role, phone) values
  ('Dad', 'dad', '+15550000001'),
  ('Jesse', 'kid', '+15550000002'),
  ('Brother 1', 'kid', '+15550000003'),
  ('Brother 2', 'kid', '+15550000004')
on conflict (phone) do update set name = excluded.name, role = excluded.role;

insert into public.categories (name, slug, icon) values
  ('Food / Delivery', 'food-delivery', 'utensils'),
  ('Clothing / Shopping', 'clothing-shopping', 'shirt'),
  ('Travel / Transport', 'travel-transport', 'car'),
  ('Subscriptions', 'subscriptions', 'refresh-cw'),
  ('Errands', 'errands', 'shopping-bag'),
  ('Gifts', 'gifts', 'gift'),
  ('Health', 'health', 'heart-pulse'),
  ('Entertainment', 'entertainment', 'ticket'),
  ('Other', 'other', 'sparkles')
on conflict (slug) do update set name = excluded.name, icon = excluded.icon;

alter table public.people enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.settlements enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.people to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert on public.settlements to authenticated;

create or replace function public.current_person_id()
returns uuid
language sql
stable
security invoker
as $$
  select id
  from public.people
  where phone = auth.jwt() ->> 'phone'
  limit 1
$$;

create or replace function public.current_person_role()
returns public.person_role
language sql
stable
security invoker
as $$
  select role from public.people where id = public.current_person_id()
$$;

create policy "categories are readable by signed in family"
on public.categories for select
to authenticated
using (public.current_person_id() is not null);

create policy "people are visible to dad or self"
on public.people for select
to authenticated
using (
  public.current_person_role() = 'dad'
  or id = public.current_person_id()
);

create policy "transactions visible to dad or related kid"
on public.transactions for select
to authenticated
using (
  public.current_person_role() = 'dad'
  or kid_id = public.current_person_id()
);

create policy "transactions insertable by dad or related kid"
on public.transactions for insert
to authenticated
with check (
  (
    public.current_person_role() = 'dad'
    and submitted_by_id = public.current_person_id()
  )
  or (
    public.current_person_role() = 'kid'
    and kid_id = public.current_person_id()
    and submitted_by_id = public.current_person_id()
  )
);

create policy "transactions updateable by dad or related kid"
on public.transactions for update
to authenticated
using (
  public.current_person_role() = 'dad'
  or kid_id = public.current_person_id()
)
with check (
  public.current_person_role() = 'dad'
  or kid_id = public.current_person_id()
);

create policy "settlements visible to dad or related kid"
on public.settlements for select
to authenticated
using (
  public.current_person_role() = 'dad'
  or kid_id = public.current_person_id()
);

create policy "settlements insertable by dad or related kid"
on public.settlements for insert
to authenticated
with check (
  public.current_person_role() = 'dad'
  or kid_id = public.current_person_id()
);
