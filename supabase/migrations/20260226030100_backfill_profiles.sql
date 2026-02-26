-- Backfill profiles for any auth.users that are missing a profile row.
-- This handles users who signed up before the trigger was in place.
insert into public.profiles (id, email, full_name, avatar_url)
select
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
