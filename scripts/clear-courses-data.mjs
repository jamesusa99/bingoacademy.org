#!/usr/bin/env node
/**
 * Delete all course-related rows from Supabase.
 *
 * Usage: npm run clear:courses
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function count(table, filter) {
  let q = admin.from(table).select('*', { count: 'exact', head: true })
  if (filter) q = filter(q)
  const { count: n, error } = await q
  if (error?.message?.includes('does not exist')) return null
  if (error) throw new Error(`${table} count: ${error.message}`)
  return n ?? 0
}

async function deleteAll(table, { filter, label } = {}) {
  const before = await count(table, filter)
  if (before === null) {
    console.log(`[skip] ${label || table} — table does not exist`)
    return { table: label || table, before: 0, skipped: true }
  }
  if (before === 0) {
    console.log(`[ok]   ${label || table} — already empty`)
    return { table: label || table, before: 0, after: 0 }
  }

  let q = admin.from(table).delete()
  if (filter) {
    q = filter(q)
  } else {
    q = q.not('created_at', 'is', null)
  }

  let { error } = await q
  if (error) {
    const { error: e2 } = await admin.from(table).delete().gte('slug', '')
    if (e2) {
      const { error: e3 } = await admin.from(table).delete().gte('granted_at', '1970-01-01T00:00:00Z')
      if (e3) throw new Error(`clear ${table}: ${error.message}; fallback: ${e3.message}`)
    }
  }

  const after = await count(table, filter)
  console.log(`[ok]   ${label || table} — deleted ${before} row(s), remaining ${after ?? '?'}`)
  return { table: label || table, before, after }
}

console.log('[clear] Removing all course data from Supabase…\n')

const results = []

results.push(await deleteAll('course_enrollments', { label: 'course_enrollments' }))
results.push(
  await deleteAll('user_course_access', {
    label: 'user_course_access',
    filter: (q) => q.gte('granted_at', '1970-01-01T00:00:00Z'),
  })
)

// IOAI curriculum — deleting levels cascades themes → modules → lessons
results.push(await deleteAll('course_levels', { label: 'course_levels (+ themes/modules/lessons cascade)' }))

results.push(await deleteAll('courses_catalog', { label: 'courses_catalog' }))
results.push(await deleteAll('courses', { label: 'courses (legacy mall)' }))

const { count: linkedAssets, error: assetCountErr } = await admin
  .from('video_assets')
  .select('id', { count: 'exact', head: true })
  .not('catalog_slug', 'is', null)

if (!assetCountErr) {
  if (linkedAssets > 0) {
    const { error: unlinkErr } = await admin
      .from('video_assets')
      .update({ catalog_slug: null })
      .not('catalog_slug', 'is', null)
    if (unlinkErr) throw new Error(`video_assets unlink: ${unlinkErr.message}`)
    console.log(`[ok]   video_assets — cleared catalog_slug on ${linkedAssets} asset(s)`)
  } else {
    console.log('[ok]   video_assets — no catalog_slug links')
  }
  results.push({ table: 'video_assets.catalog_slug', before: linkedAssets ?? 0 })
} else if (!assetCountErr?.message?.includes('does not exist')) {
  console.log(`[skip] video_assets — ${assetCountErr.message}`)
}

console.log('\n[clear] Done.')
for (const r of results) {
  if (r.skipped) continue
  if (r.before > 0 || r.after === 0) {
    console.log(`  • ${r.table}: ${r.before ?? 0} → ${r.after ?? 0}`)
  }
}
