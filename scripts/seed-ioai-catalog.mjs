#!/usr/bin/env node
/**
 * Upsert IOAI video course catalog (full track + 34 lessons) into Supabase.
 *
 * Usage:
 *   npm run seed:ioai
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { buildIOAIVideoCatalogEntries, buildIOAICourseListMeta } from '../src/config/ioaiCourseSystem.js'

const IOAI_VIDEO_COURSES = buildIOAIVideoCatalogEntries()
const COURSE_LIST_META = buildIOAICourseListMeta()

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const rows = IOAI_VIDEO_COURSES.map((c, i) => {
  const meta = COURSE_LIST_META[c.id] || {}
  return {
    slug: c.id,
    line: c.line,
    sub: c.sub,
    status: c.status,
    delivery_type: c.deliveryType,
    featured: !!c.featured,
    name: c.name,
    name_en: c.nameEn || c.name,
    description: c.desc,
    price: c.price,
    hours: c.hours,
    badge: c.badge,
    audience: c.audience,
    outcomes: c.outcomes || [],
    syllabus: c.syllabus || [],
    lab_slugs: c.labSlugs || [],
    sort_order: c.sortOrder ?? i,
    category: c.category || meta.category || 'ai-fundamentals',
    level: c.level || meta.level || 'beginner',
    lessons: c.lessons ?? meta.lessons ?? 1,
    rating: c.rating ?? meta.rating ?? 4.8,
    students: c.students ?? meta.students ?? 800,
    updated_at: new Date().toISOString(),
  }
})

console.log(`[seed-ioai] Upserting ${rows.length} IOAI video catalog rows…`)

const { error } = await admin.from('courses_catalog').upsert(rows, { onConflict: 'slug' })

if (error) {
  console.error('[seed-ioai] Failed:', error.message)
  process.exit(1)
}

const REMOVED_LEGACY = ['ioai-whitelist', 'ioai-aigc-sprint', 'ioai-mock', 'i1', 'i2']
const { error: delErr } = await admin.from('courses_catalog').delete().in('slug', REMOVED_LEGACY)
if (delErr) {
  console.warn('[seed-ioai] Legacy cleanup warning:', delErr.message)
} else {
  console.log(`[seed-ioai] Removed ${REMOVED_LEGACY.length} legacy IOAI video slugs`)
}

console.log('[seed-ioai] Done. Open /courses/ioai/video')
