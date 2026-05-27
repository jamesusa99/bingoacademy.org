#!/usr/bin/env node
/**
 * Import all frontend fallback data into Supabase.
 *
 * Usage:
 *   npm run seed              # skip tables that already have rows
 *   npm run seed -- --force   # clear & re-import seedable tables
 *
 * Requires in .env.local:
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { runSiteSeed } from './lib/seedSupabase.mjs'

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

console.log(force ? '[seed] Force re-import…' : '[seed] Import (skip non-empty tables)…')

try {
  const summary = await runSiteSeed(admin, { force })
  console.log(JSON.stringify(summary, null, 2))
  console.log('\n[seed] Done. Open /admin to review content.')
} catch (err) {
  console.error('[seed] Failed:', err.message)
  if (err.message.includes('Could not find the table')) {
    console.error('\nRun supabase/schema.sql and migrations 002–007 in Supabase SQL Editor first.')
  }
  process.exit(1)
}
