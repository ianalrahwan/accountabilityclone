-- Fix RLS policies to prevent infinite recursion
-- Drop old policies that used "for all" and had circular references

-- Drop old goals policies
drop policy if exists "Goal owner full access" on goals;
drop policy if exists "Partner can view goals" on goals;

-- Create new split goals policies
create policy "Goal owner can insert"
  on goals for insert with check (auth.uid() = user_id);

create policy "Goal owner can update"
  on goals for update using (auth.uid() = user_id);

create policy "Goal owner can delete"
  on goals for delete using (auth.uid() = user_id);

create policy "Goal owner can view"
  on goals for select using (auth.uid() = user_id);

create policy "Partner can view goals"
  on goals for select using (
    exists (
      select 1 from partnerships
      where partnerships.goal_id = goals.id
        and partnerships.partner_user_id = auth.uid()
    )
  );

-- Drop old partnerships policies
drop policy if exists "Goal owner manages partnerships" on partnerships;
drop policy if exists "Partner can view their partnerships" on partnerships;

-- Create new split partnerships policies
create policy "Goal owner can insert partnerships"
  on partnerships for insert with check (
    exists (
      select 1 from goals
      where goals.id = partnerships.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can update partnerships"
  on partnerships for update using (
    exists (
      select 1 from goals
      where goals.id = partnerships.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can delete partnerships"
  on partnerships for delete using (
    exists (
      select 1 from goals
      where goals.id = partnerships.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can view partnerships"
  on partnerships for select using (
    exists (
      select 1 from goals
      where goals.id = partnerships.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Partner can view their partnerships"
  on partnerships for select using (
    partner_user_id = auth.uid()
  );

-- Drop old checkins policies
drop policy if exists "Goal owner manages checkins" on checkins;
drop policy if exists "Partner can view checkins" on checkins;

-- Create new split checkins policies
create policy "Goal owner can insert checkins"
  on checkins for insert with check (
    exists (
      select 1 from goals
      where goals.id = checkins.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can view checkins"
  on checkins for select using (
    exists (
      select 1 from goals
      where goals.id = checkins.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can delete checkins"
  on checkins for delete using (
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
        and partnerships.partner_user_id = auth.uid()
    )
  );

-- Drop old stake_contracts policies
drop policy if exists "Goal owner manages stake contracts" on stake_contracts;
drop policy if exists "Recipient can view stake contracts" on stake_contracts;

-- Create new split stake_contracts policies
create policy "Goal owner can insert stake contracts"
  on stake_contracts for insert with check (
    exists (
      select 1 from goals
      where goals.id = stake_contracts.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can update stake contracts"
  on stake_contracts for update using (
    exists (
      select 1 from goals
      where goals.id = stake_contracts.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can delete stake contracts"
  on stake_contracts for delete using (
    exists (
      select 1 from goals
      where goals.id = stake_contracts.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Goal owner can view stake contracts"
  on stake_contracts for select using (
    exists (
      select 1 from goals
      where goals.id = stake_contracts.goal_id
        and goals.user_id = auth.uid()
    )
  );

create policy "Recipient can view stake contracts"
  on stake_contracts for select using (
    recipient_user_id = auth.uid()
  );

-- Drop old deduction_log policy
drop policy if exists "Recipient can view deductions" on deduction_log;

-- Create new deduction_log policy (without subquery to profiles)
create policy "Recipient can view deductions"
  on deduction_log for select using (
    exists (
      select 1 from stake_contracts sc
      where sc.id = deduction_log.contract_id
        and sc.recipient_user_id = auth.uid()
    )
  );
