-- Fix RLS infinite recursion: add SECURITY DEFINER helper to break the
-- goals <-> partnerships cycle, then rebuild affected policies.

-- 1. Helper function: reads goal owner bypassing RLS
create or replace function public.goal_owner_id(gid uuid)
returns uuid as $$
  select user_id from public.goals where id = gid;
$$ language sql security definer stable;

-- 2. Drop all affected policies
drop policy if exists "Goal owner can view partnerships" on partnerships;
drop policy if exists "Goal owner can insert partnerships" on partnerships;
drop policy if exists "Goal owner can update partnerships" on partnerships;
drop policy if exists "Goal owner can delete partnerships" on partnerships;

drop policy if exists "Goal owner can insert checkins" on checkins;
drop policy if exists "Goal owner can view checkins" on checkins;
drop policy if exists "Goal owner can delete checkins" on checkins;

drop policy if exists "Goal owner can insert stake contracts" on stake_contracts;
drop policy if exists "Goal owner can update stake contracts" on stake_contracts;
drop policy if exists "Goal owner can delete stake contracts" on stake_contracts;
drop policy if exists "Goal owner can view stake contracts" on stake_contracts;

drop policy if exists "Goal owner can view deductions" on deduction_log;

-- 3. Recreate using goal_owner_id() instead of subquerying goals

-- partnerships
create policy "Goal owner can insert partnerships"
  on partnerships for insert with check (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can update partnerships"
  on partnerships for update using (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can delete partnerships"
  on partnerships for delete using (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can view partnerships"
  on partnerships for select using (
    goal_owner_id(goal_id) = auth.uid()
  );

-- checkins
create policy "Goal owner can insert checkins"
  on checkins for insert with check (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can view checkins"
  on checkins for select using (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can delete checkins"
  on checkins for delete using (
    goal_owner_id(goal_id) = auth.uid()
  );

-- stake_contracts
create policy "Goal owner can insert stake contracts"
  on stake_contracts for insert with check (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can update stake contracts"
  on stake_contracts for update using (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can delete stake contracts"
  on stake_contracts for delete using (
    goal_owner_id(goal_id) = auth.uid()
  );

create policy "Goal owner can view stake contracts"
  on stake_contracts for select using (
    goal_owner_id(goal_id) = auth.uid()
  );

-- deduction_log
create policy "Goal owner can view deductions"
  on deduction_log for select using (
    exists (
      select 1 from stake_contracts sc
      where sc.id = deduction_log.contract_id
        and goal_owner_id(sc.goal_id) = auth.uid()
    )
  );
