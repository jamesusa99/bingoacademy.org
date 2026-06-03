#!/usr/bin/env node
/**
 * Backfill courses_catalog.price_cents from display price text.
 *
 * Usage:
 *   npm run backfill:price-cents
 *   npm run backfill:price-cents -- --dry-run
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { parsePriceStringToCents } from '../server/lib/coursePricing.mjs'

const dryRun = process.argv.includes('--dry-run')

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: rows, error } = await admin
  .from('courses_catalog')
  .select('slug, name, price, price_cents, purchasable, status')
  .order('sort_order')

if (error) {
  console.error('[backfill] Failed to load catalog:', error.message)
  process.exit(1)
}

let updated = 0
let skipped = 0
let alreadySet = 0

for (const row of rows || []) {
  if (row.price_cents != null && row.price_cents > 0) {
    alreadySet++
    continue
  }

  const cents = parsePriceStringToCents(row.price)
  if (cents == null) {
    skipped++
    console.log(`  skip  ${row.slug} — "${row.price || '(empty)'}"`)
    continue
  }

  const patch = {
    price_cents: cents,
    updated_at: new Date().toISOString(),
  }

  if (row.purchasable == null && row.status !== 'coming-soon') {
    patch.purchasable = true
  }

  console.log(`  ${dryRun ? 'would set' : 'set'} ${row.slug} → ${cents} ($${(cents / 100).toFixed(2)})`)

  if (!dryRun) {
    const { error: upErr } = await admin.from('courses_catalog').update(patch).eq('slug', row.slug)
    if (upErr) {
      console.error(`  error ${row.slug}:`, upErr.message)
      continue
    }
  }
  updated++
}

console.log('')
console.log(`[backfill] Done${dryRun ? ' (dry run)' : ''}.`)
console.log(`  Updated: ${updated}`)
console.log(`  Already had price_cents: ${alreadySet}`)
console.log(`  Skipped (quote/coming soon/unparseable): ${skipped}`)
console.log(`  Total rows: ${rows?.length ?? 0}`)
