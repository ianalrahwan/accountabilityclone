-- =========================================================
-- Accountability App Schema
-- Run this in your Supabase project's SQL Editor
-- =========================================================

-- Profiles (auto-populated on sign-up via trigger)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Goals
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);

-- Accountability partnerships (one per goal)
create table if not exists partnerships (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references goals(id) on delete cascade unique not null,
  partner_email text not null,
  partner_user_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Progress check-ins
create table if not exists checkins (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  checked_at timestamptz default now()
);

-- =========================================================
-- Trigger: auto-create profile on sign-up
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: when a user signs up, link them as partner on any pending partnerships
create or replace function public.handle_new_user_partnership()
returns trigger as $$
begin
  update public.partnerships
  set partner_user_id = new.id
  where partner_email = new.email
    and partner_user_id is null;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created_link_partnerships on public.profiles;
create trigger on_profile_created_link_partnerships
  after insert on public.profiles
  for each row execute function public.handle_new_user_partnership();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table profiles enable row level security;
alter table goals enable row level security;
alter table partnerships enable row level security;
alter table checkins enable row level security;

-- profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- goals: owner can do everything; partner can view
create policy "Goal owner full access"
  on goals for all using (auth.uid() = user_id);

create policy "Partner can view goals"
  on goals for select using (
    exists (
      select 1 from partnerships
      where partnerships.goal_id = goals.id
        and (
          partnerships.partner_user_id = auth.uid()
          or partnerships.partner_email = (select email from profiles where id = auth.uid())
        )
    )
  );

-- partnerships: owner can do everything; partner can view
create policy "Goal owner manages partnerships"
  on partnerships for all using (
    exists (
      select 1 from goals
      where goals.id = partnerships.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Partner can view their partnerships"
  on partnerships for select using (
    partner_user_id = auth.uid()
    or partner_email = (select email from profiles where id = auth.uid())
  );

-- checkins: owner can insert and view; partner can view
create policy "Goal owner manages checkins"
  on checkins for all using (
    exists (
      select 1 from goals
      where goals.id = checkins.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Partner can view checkins"
  on checkins for select using (
    exists (
      select 1 from partnerships
      where partnerships.goal_id = checkins.goal_id
        and (
          partnerships.partner_user_id = auth.uid()
          or partnerships.partner_email = (select email from profiles where id = auth.uid())
        )
    )
  );
