#!/usr/bin/env node
/**
 * Replace community_mentors with latest seed data (founding team titles, Shannon Wang name).
 *
 * Usage:
 *   npm run seed:community-mentors
 *   npm run seed:community-mentors -- --force
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { COMMUNITY_MENTORS } from '../src/config/seed/siteFallbacks.js'

const force = process.argv.includes('--force')
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function tableCount(table) {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`${table} count: ${error.message}`)
  return count ?? 0
}

async function clearTable(table) {
  const { error } = await admin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(`clear ${table}: ${error.message}`)
}

async function syncCommunityMentors() {
  const existing = await tableCount('community_mentors')
  if (existing > 0 && !force) {
    console.log(`[community-mentors] Skipped — ${existing} row(s) exist. Use --force to replace.`)
    return { skipped: true, existing }
  }

  if (existing > 0) {
    console.log('[community-mentors] Clearing existing mentors…')
    await clearTable('community_mentors')
  }

  const rows = COMMUNITY_MENTORS.map((m, i) => ({
    name: m.name,
    title: m.title,
    photo: m.photo,
    tag: m.tag,
    intro: m.intro,
    awards: m.awards,
    type: m.type,
    sort_order: i,
  }))

  const { error } = await admin.from('community_mentors').insert(rows)
  if (error) throw new Error(`community_mentors insert: ${error.message}`)

  const summary = { mentors: rows.length, force }
  console.log('[community-mentors] Synced mentors:', summary)
  return summary
}

try {
  const result = await syncCommunityMentors()
  console.log(JSON.stringify(result, null, 2))
} catch (err) {
  console.error('[community-mentors] Failed:', err.message)
  process.exit(1)
}
