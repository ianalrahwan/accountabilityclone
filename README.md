20 files across a complete Next.js 15 + Supabase app:

Area	Files
Config	package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs
Database	supabase/schema.sql — tables, RLS policies, auto-profile trigger
Supabase lib	src/lib/supabase/client.ts, src/lib/supabase/server.ts
Auth	src/middleware.ts, src/app/auth/callback/route.ts
Pages	Landing, Dashboard, New Goal, Goal Detail, Partner View
Components	SignInButton, SignOutButton, GoalCard, CheckinButton, CheckinHistory, PartnerForm
Server Actions	src/app/actions.ts — create goal, delete goal, check-in, save/remove partner
To run it
Install Node.js — brew install node or nodejs.org

Create a Supabase project at supabase.com, then run supabase/schema.sql in the SQL Editor

Enable Google OAuth in Supabase → Authentication → Providers → Google

Set the redirect URL in Supabase → Authentication → URL Configuration:

Add http://localhost:3000/auth/callback
Configure env vars:


cp .env.local.example .env.local
# fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
Run it:


npm install
npm run dev