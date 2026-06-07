#!/usr/bin/env node
/**
 * Seed ioai_experiments from static ioaiTrainingLab.js (P4 migration helper).
 *
 * Usage:
 *   npm run seed:ioai-experiments
 *   npm run seed:ioai-experiments -- --dry-run
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { IOAI_LABS } from '../src/config/ioaiTrainingLab.js'

const dryRun = process.argv.includes('--dry-run')

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log(`Seeding ${IOAI_LABS.length} experiments from ioaiTrainingLab.js${dryRun ? ' (dry run)' : ''}…`)

  for (const lab of IOAI_LABS) {
    const slug = `ioai-${lab.id}`
    const payload = {
      slug,
      title: lab.title,
      subtitle: lab.subtitle || null,
      description: (lab.objectives || []).join(' · ') || null,
      play_type: 'training_lab',
      play_target: lab.id,
      status: 'live',
      sort_order: lab.number ?? 0,
      marketing_tags: lab.skills || [],
      product_line: 'ioai',
      updated_at: new Date().toISOString(),
    }

    if (dryRun) {
      console.log('  would upsert', slug, payload.title)
      continue
    }

    const { data: existing } = await admin.from('ioai_experiments').select('id').eq('slug', slug).maybeSingle()

    if (existing?.id) {
      const { error } = await admin.from('ioai_experiments').update(payload).eq('id', existing.id)
      if (error) {
        console.error('  update failed', slug, error.message)
      } else {
        console.log('  updated', slug)
      }
    } else {
      const { error } = await admin.from('ioai_experiments').insert({ ...payload, created_at: new Date().toISOString() })
      if (error) {
        console.error('  insert failed', slug, error.message)
      } else {
        console.log('  inserted', slug)
      }
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
