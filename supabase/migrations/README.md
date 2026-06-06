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
| `009_staff_admin_rls.sql` | Staff-only CMS writes; drop profiles_all_dev; role guard | Admin/editor can edit site data |
| `007_courses_catalog_portfolio.sql` | courses_catalog, portfolio_works | Tables exist |
| `008_courses_catalog_list_fields.sql` | category, level, lessons, rating, students, thumbnail | Columns exist |
| `010_course_video_stream.sql` | video_url, cloudflare_uid, video_assets | Columns exist |
| `011_course_enrollments.sql` | course_enrollments (Stripe unlocks) | Table exists |
| `012_profiles_role_service_bypass.sql` | Service role can update profiles.role | — |
| `013_course_checkout_pricing.sql` | price_cents, currency, purchasable on courses_catalog | Columns exist |
| `014_ioai_curriculum.sql` | course_levels, themes, modules, lessons | Curriculum admin |
| `015_ioai_curriculum_admin_fields.sql` | Extra curriculum admin columns | — |
| `016_curriculum_product_line.sql` | product_line on course_levels (ioai/general/k12) | Labs-materials grouping |
| `017_video_assets_curriculum.sql` | Video library curriculum fields | — |
| `018_lab_materials_lesson.sql` | courses_catalog.lesson_id → lessons | Lab/material lesson binding |
| `019_ioai_commerce.sql` | L3 module pricing, ioai_bundles, lesson trial | IOAI L3 purchase model |

**After migration 019**, backfill module catalog + migrate enrollments:

```bash
npm run migrate:ioai-commerce          # apply
npm run migrate:ioai-commerce -- --dry-run
```

**After migration 013**, backfill Stripe cents from display prices:

```bash
npm run backfill:price-cents          # apply
npm run backfill:price-cents -- --dry-run   # preview only
```

**Admin:** `/admin/courses` — add/edit/delete courses (powers `/courses` and video list UI).

Then import data:

```bash
npm run seed
```

Or Admin → Platform → **Import site data**.
