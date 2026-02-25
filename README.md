# Accountability App

A goal-tracking app with accountability partners, built with Next.js 15 and Supabase.

## Project Structure

20 files across a complete Next.js 15 + Supabase app:

| Area | Files |
|------|-------|
| **Config** | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs` |
| **Database** | `supabase/schema.sql` — tables, RLS policies, auto-profile trigger |
| **Supabase lib** | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` |
| **Auth** | `src/middleware.ts`, `src/app/auth/callback/route.ts` |
| **Pages** | Landing, Dashboard, New Goal, Goal Detail, Partner View |
| **Components** | SignInButton, SignOutButton, GoalCard, CheckinButton, CheckinHistory, PartnerForm |
| **Server Actions** | `src/app/actions.ts` — create goal, delete goal, check-in, save/remove partner |

## Getting Started

1. **Install Node.js**

   ```sh
   brew install node
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run `supabase/schema.sql` in the SQL Editor

3. **Enable Google OAuth** in Supabase → Authentication → Providers → Google

4. **Set the redirect URL** in Supabase → Authentication → URL Configuration:

   ```
   http://localhost:3000/auth/callback
   ```

5. **Configure env vars:**

   ```sh
   cp .env.local.example .env.local
   # fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

6. **Run it:**

   ```sh
   npm install
   npm run dev
   ```
