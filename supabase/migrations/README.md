# Supabase migrations

Run **once** on a new project, in order. All files are safe to **re-run** (idempotent).

| File | Purpose | Skip if |
|------|---------|--------|
| `../schema.sql` | Core CMS tables (courses, events, home, showcase, …) | Tables already exist |
| `002_admin_platform.sql` | profiles, video, orders, platform_settings | Already ran 002 |
| `003_user_profiles_extend.sql` | Extra profile columns (phone, status, tier, …) | Columns exist |
| `004_backfill_profiles_from_auth.sql` | Sync auth.users → profiles | — (safe to re-run) |
| `005_profiles_admin_policies.sql` | Admin RLS on profiles | — |
| `006_fix_profiles_rls_recursion.sql` | Remove bad policy + confirm admin RLS | User mgmt works |
| `007_courses_catalog_portfolio.sql` | courses_catalog, portfolio_works | Tables exist |
| `008_courses_catalog_list_fields.sql` | category, level, lessons, rating, students, thumbnail | Columns exist |

**Admin:** `/admin/courses-catalog` — add/edit/delete courses (powers `/courses` and video list UI).

Then import data:

```bash
npm run seed
```

Or Admin → Platform → **Import site data**.
