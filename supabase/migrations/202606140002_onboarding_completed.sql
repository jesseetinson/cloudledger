alter table public.people
add column if not exists onboarding_completed boolean not null default false;

update public.people
set onboarding_completed = false
where onboarding_completed is null;
