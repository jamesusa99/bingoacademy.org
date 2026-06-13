/**
 * Migrate pack-scoped lab_experiments into ioai_experiments public library.
 * Run after applying migration 027.
 *
 * Usage: node scripts/migrate-lab-to-public-library.mjs [--dry-run]
 */
import { createClient } from '@supabase/supabase-js'

const dryRun = process.argv.includes('--dry-run')
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })

async function uniqueSlug(base) {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await admin.from('ioai_experiments').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    slug = `${base}-${n}`
    n += 1
  }
}

async function main() {
  const { data: legacy, error } = await admin
    .from('lab_experiments')
    .select(
      `
      id, pack_slug, slug, title, content, purpose, materials_list, runtime_config, sort_order, status, ioai_experiment_id,
      steps:lab_experiment_steps (
        id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
        external_url, download_url, download_label, programming_config, sort_order
      )
    `
    )
    .order('pack_slug')
    .order('sort_order')

  if (error) throw new Error(error.message)

  let created = 0
  let linked = 0
  let refs = 0

  const packRefs = new Map()

  for (const row of legacy || []) {
    if (row.ioai_experiment_id) {
      linked += 1
      const list = packRefs.get(row.pack_slug) || []
      list.push({ experiment_id: row.ioai_experiment_id, sort_order: row.sort_order ?? 0 })
      packRefs.set(row.pack_slug, list)
      continue
    }

    const baseSlug = `${row.pack_slug}-${row.slug}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    const slug = await uniqueSlug(baseSlug)

    if (dryRun) {
      console.log(`[dry-run] would create ioai_experiment ${slug} from ${row.pack_slug}/${row.slug}`)
      created += 1
      continue
    }

    const { data: createdExp, error: createErr } = await admin
      .from('ioai_experiments')
      .insert({
        slug,
        title: row.title,
        content: row.content || '',
        purpose: row.purpose || '',
        materials_list: row.materials_list || [],
        runtime_config: row.runtime_config || { type: 'steps_only' },
        status: row.status || 'live',
        sort_order: row.sort_order ?? 0,
        source_lab_experiment_id: row.id,
      })
      .select('id')
      .single()

    if (createErr) {
      console.error(`Failed ${row.pack_slug}/${row.slug}:`, createErr.message)
      continue
    }

    created += 1

    const steps = row.steps || []
    if (steps.length) {
      await admin.from('ioai_experiment_steps').insert(
        steps.map((s) => ({
          experiment_id: createdExp.id,
          title: s.title || '',
          step_type: s.step_type,
          body: s.body || '',
          video_url: s.video_url,
          cloudflare_video_id: s.cloudflare_video_id,
          ppt_url: s.ppt_url,
          external_url: s.external_url,
          download_url: s.download_url,
          download_label: s.download_label,
          programming_config: s.programming_config || {},
          sort_order: s.sort_order ?? 0,
        }))
      )
    }

    await admin.from('lab_experiments').update({ ioai_experiment_id: createdExp.id }).eq('id', row.id)

    const list = packRefs.get(row.pack_slug) || []
    list.push({ experiment_id: createdExp.id, sort_order: row.sort_order ?? 0 })
    packRefs.set(row.pack_slug, list)
  }

  for (const [packSlug, items] of packRefs.entries()) {
    items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    if (dryRun) {
      console.log(`[dry-run] would set ${items.length} refs on pack ${packSlug}`)
      refs += items.length
      continue
    }

    await admin.from('lab_pack_experiment_refs').delete().eq('pack_slug', packSlug)
    await admin.from('lab_pack_experiment_refs').insert(
      items.map((item, sort_order) => ({
        pack_slug: packSlug,
        experiment_id: item.experiment_id,
        sort_order,
      }))
    )
    refs += items.length
  }

  console.log(`Done. created=${created}, already_linked=${linked}, pack_refs=${refs}${dryRun ? ' (dry-run)' : ''}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
