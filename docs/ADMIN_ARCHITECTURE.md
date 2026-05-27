# Bingo Academy Admin Platform Architecture

This document maps the **target stack** to the **current repository** (Vite + React SPA). The public site can stay on Vite deployed to Vercel; a future Next.js app can share the same Supabase schema and API routes.

## Layer mapping

| Layer | Target | Current implementation |
|-------|--------|-------------------------|
| Frontend & gateway | Vercel (Next.js) | **Vite + React** (`/admin/*`), static deploy on Vercel; optional Next.js migration later |
| Data & auth | Supabase (PostgreSQL) | `supabase/schema.sql` + `supabase/migrations/002_admin_platform.sql` |
| Video | Cloudflare Stream | `video_assets` table + `POST /api/admin/stream/upload-url` |
| Payments | Stripe | `orders`, `stripe_products` + `POST /api/webhooks/stripe` |
| Heavy compute | Railway or Vercel serverless | `server/index.mjs` (local/Railway) · `api/server.js` (Vercel `/api/admin/*`) |

## Admin routes (SPA)

| Path | Module |
|------|--------|
| `/admin/login` | Admin sign-in (Supabase Auth) |
| `/admin` | Operations dashboard |
| `/admin/home` | Home portal CMS |
| `/admin/courses` | Courses catalogue (`courses_catalog`) |
| `/admin/mall` | Mall listings (`courses` table) |
| `/admin/showcase` | Achievements cases |
| `/admin/events` | Events |
| `/admin/forum` | Community forum moderation |
| `/admin/mentors` | Instructors |
| `/admin/research` | AI Camp |
| `/admin/career` | Careers |
| `/admin/cert` | Certification tiers |
| `/admin/mall-products` | Mall products |
| `/admin/charity` | Honors & charity |
| `/admin/video` | Cloudflare Stream assets |
| `/admin/payments` | Stripe orders & products |
| `/admin/users` | User management (profile, tier, school, roles, notes, orders) |
| `/admin/settings` | Platform health & env checklist |

## Auth model

1. Users sign in via Supabase Auth (email or Google).
2. Row in `profiles` with `role` ∈ `admin` | `editor` | `user`.
3. `AdminGuard` allows `/admin/*` only when `role` is `admin` or `editor`.
4. Fallback: `VITE_ADMIN_EMAILS` (comma-separated) for bootstrap before profiles exist.

**Production:** tighten RLS so content tables are read-public, write-admin-only (service role or `auth.jwt()` role claim).

## Environment variables

### Frontend (`.env.local`)

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAILS=you@bingoacademy.org
```

### API server (Railway / `server/index.mjs`)

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
ADMIN_API_SECRET=          # optional Bearer for /api/admin/*
OPENAI_API_KEY=            # existing chat
```

## Deployment sketch

```
[Users] → Vercel (static Vite build)
              ↓
         Supabase Auth + Postgres
              ↓
[Railway] Express API ← Stripe webhooks, Stream uploads, future Python workers
```

## Next steps (recommended)

1. Run `supabase/schema.sql`, then migrations `002`–`007` in Supabase SQL Editor.
2. Import frontend data: `npm run seed` or Admin → Platform → **Import site data**.
3. Set your user `profiles.role = 'admin'` after first login.
4. Configure Cloudflare Stream + Stripe; verify `/admin/settings` shows green checks.
5. Replace permissive RLS with role-based policies before production.
6. Optionally split admin UI into Next.js App Router while keeping this API.
