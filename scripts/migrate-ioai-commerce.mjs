#!/usr/bin/env node
/**
 * Backfill IOAI L3 module commerce after 019_ioai_commerce.sql:
 * - catalog_slug + price on each module
 * - courses_catalog row per module (purchasable)
 * - deprecate per-lesson purchasable rows
 * - ioai_bundles full track + module links
 * - migrate lesson enrollments → module enrollments
 *
 * Usage:
 *   npm run migrate:ioai-commerce
 *   npm run migrate:ioai-commerce -- --dry-run
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'

const IOAI_FULL_BUNDLE_SLUG = 'ioai-competition-system'
const DEFAULT_MODULE_PRICE_CENTS = 9900
const FULL_BUNDLE_PRICE_CENTS = 299000

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

export function buildModuleCatalogSlug(levelSlug, themeSlug, moduleSlug) {
  const level = slugifyPart(levelSlug)
  const theme = slugifyPart(themeSlug)
  const module = slugifyPart(moduleSlug)
  if (!level || !theme || !module) return null
  return `ioai-${level}-${theme}-${module}`
}

function slugifyPart(value) {
  if (!value || typeof value !== 'string') return null
  const s = value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return s || null
}

/** Resolve L3 catalog_slug even when level/theme/module slugs are incomplete in DB */
export function resolveModuleCatalogSlug(mod) {
  if (mod.catalog_slug?.trim()) return mod.catalog_slug.trim()

  const level = slugifyPart(mod.levelSlug || mod.levelTitle)
  const theme = slugifyPart(mod.themeSlug || mod.themeTitle)
  const module = slugifyPart(mod.slug || mod.title)

  if (level && theme && module) return `ioai-${level}-${theme}-${module}`
  if (theme && module) return `ioai-${theme}-${module}`

  for (const lesson of mod.lessons || []) {
    const lessonSlug = (lesson.catalog_slug || lesson.slug || '').trim()
    if (!lessonSlug.startsWith('ioai-')) continue
    const derived = lessonSlug.replace(/-l\d+$/i, '')
    if (derived && derived.length > 5 && derived !== lessonSlug) return derived
  }

  if (module) return `ioai-mod-${module}`
  if (mod.id) return `ioai-mod-${String(mod.id).replace(/-/g, '').slice(0, 12)}`

  throw new Error(
    `Cannot resolve catalog_slug for module "${mod.title || 'unknown'}" (level=${mod.levelSlug}, theme=${mod.themeSlug}, module=${mod.slug})`
  )
}

function formatUsd(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

async function fetchModuleRows() {
  const { data: levels, error } = await admin
    .from('course_levels')
    .select(
      `
      id, slug, title, emoji, product_line,
      themes (
        id, slug, title, category_label,
        modules (
          id, slug, title, summary, sort_order, catalog_slug, price_cents,
          lessons ( id, slug, catalog_slug )
        )
      )
    `
    )
    .eq('product_line', 'ioai')

  if (error) throw new Error(error.message)

  /** @type {Array<object>} */
  const modules = []
  for (const level of levels || []) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        modules.push({
          ...mod,
          levelSlug: level.slug,
          levelTitle: level.title,
          themeSlug: theme.slug,
          themeTitle: theme.title,
          categoryLabel: theme.category_label || theme.title,
        })
      }
    }
  }
  return modules
}

async function main() {
  console.log(`[migrate-ioai-commerce] ${dryRun ? 'DRY RUN' : 'apply'}…`)

  const modules = await fetchModuleRows()
  console.log(`Found ${modules.length} IOAI modules`)

  const lessonToModuleSlug = new Map()
  const moduleUpdates = []

  for (const mod of modules) {
    const catalogSlug = resolveModuleCatalogSlug(mod)
    if (!mod.slug?.trim() || !mod.levelSlug || !mod.themeSlug) {
      console.warn(
        `  [warn] module "${mod.title}" missing slugs (level=${mod.levelSlug || '—'}, theme=${mod.themeSlug || '—'}, module=${mod.slug || '—'}) → using ${catalogSlug}`
      )
    }
    const lessonCount = mod.lessons?.length || 0
    const priceCents = mod.price_cents > 0 ? mod.price_cents : DEFAULT_MODULE_PRICE_CENTS

    for (const lesson of mod.lessons || []) {
      const lessonSlug = lesson.catalog_slug || lesson.slug
      if (lessonSlug) lessonToModuleSlug.set(lessonSlug, catalogSlug)
      if (lesson.slug) lessonToModuleSlug.set(lesson.slug, catalogSlug)
    }

    moduleUpdates.push({
      id: mod.id,
      catalog_slug: catalogSlug,
      price_cents: priceCents,
      currency: 'usd',
      status: 'live',
      in_full_track: true,
    })

    const catalogRow = {
      slug: catalogSlug,
      line: 'ioai',
      sub: 'module',
      status: 'live',
      delivery_type: 'video',
      featured: false,
      purchasable: true,
      name: `${mod.levelTitle} · ${mod.categoryLabel} · ${mod.title}`,
      name_en: mod.title,
      description: mod.summary || `${mod.title} — ${lessonCount} lesson(s)`,
      price: formatUsd(priceCents),
      price_cents: priceCents,
      currency: 'usd',
      hours: `${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`,
      lessons: lessonCount,
      sort_order: mod.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    }

    console.log(`  module ${catalogSlug} → ${formatUsd(priceCents)} (${lessonCount} lessons)`)

    if (!dryRun) {
      const patch = {
        catalog_slug: catalogSlug,
        price_cents: priceCents,
        currency: 'usd',
        status: 'live',
        in_full_track: true,
      }
      const { error: modErr } = await admin.from('modules').update(patch).eq('id', mod.id)
      if (modErr) throw new Error(`module update ${catalogSlug}: ${modErr.message}`)

      const { error: catErr } = await admin.from('courses_catalog').upsert(catalogRow, { onConflict: 'slug' })
      if (catErr) throw new Error(`catalog upsert ${catalogSlug}: ${catErr.message}`)
    }
  }

  // Deprecate per-lesson IOAI video catalog as purchasable
  const lessonSlugs = [...lessonToModuleSlug.keys()]
  if (lessonSlugs.length && !dryRun) {
    const { error: depErr } = await admin
      .from('courses_catalog')
      .update({ purchasable: false, updated_at: new Date().toISOString() })
      .eq('line', 'ioai')
      .eq('sub', 'video')
      .in('slug', lessonSlugs)
    if (depErr) console.warn('[warn] deprecate lesson catalogs:', depErr.message)
    else console.log(`Deprecated purchasable flag on ${lessonSlugs.length} lesson catalog rows`)
  }

  // Full bundle
  const fullModuleIds = modules.map((m) => m.id)
  const totalLessons = modules.reduce((n, m) => n + (m.lessons?.length || 0), 0)

  const bundleRow = {
    slug: IOAI_FULL_BUNDLE_SLUG,
    bundle_type: 'full',
    title: 'IOAI Full Track',
    price_cents: FULL_BUNDLE_PRICE_CENTS,
    compare_at_cents: null,
    currency: 'usd',
    status: 'live',
    intro_html: `All IOAI modules — ${modules.length} units, ${totalLessons} lessons`,
    sort_order: 0,
    updated_at: new Date().toISOString(),
  }

  if (!dryRun) {
    const { data: bundle, error: bErr } = await admin
      .from('ioai_bundles')
      .upsert(bundleRow, { onConflict: 'slug' })
      .select('id')
      .single()
    if (bErr) throw new Error(`bundle upsert: ${bErr.message}`)

    await admin.from('ioai_bundle_modules').delete().eq('bundle_id', bundle.id)
    const links = fullModuleIds.map((moduleId, i) => ({
      bundle_id: bundle.id,
      module_id: moduleId,
      sort_order: i,
    }))
    if (links.length) {
      const { error: linkErr } = await admin.from('ioai_bundle_modules').insert(links)
      if (linkErr) throw new Error(`bundle modules: ${linkErr.message}`)
    }

    // Legacy catalog row: keep slug for redirects only; checkout reads ioai_bundles
    await admin.from('courses_catalog').upsert(
      {
        slug: IOAI_FULL_BUNDLE_SLUG,
        line: 'ioai',
        sub: 'bundle',
        status: 'live',
        delivery_type: 'video',
        featured: true,
        purchasable: false,
        name: 'IOAI Competition System — Full Track',
        price: formatUsd(FULL_BUNDLE_PRICE_CENTS),
        price_cents: FULL_BUNDLE_PRICE_CENTS,
        currency: 'usd',
        lessons: totalLessons,
        sort_order: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )
    console.log(`Full bundle ${IOAI_FULL_BUNDLE_SLUG} → ${fullModuleIds.length} modules`)
  }

  // Migrate enrollments: lesson slug → module slug
  const { data: enrollments, error: enrErr } = await admin.from('course_enrollments').select('user_id, course_slug, source, order_id')
  if (enrErr) throw new Error(enrErr.message)

  let migrated = 0
  for (const row of enrollments || []) {
    const slug = row.course_slug
    if (!slug || slug === IOAI_FULL_BUNDLE_SLUG || slug.startsWith('ioai-') === false) continue

    const moduleSlug = lessonToModuleSlug.get(slug)
    if (!moduleSlug || moduleSlug === slug) continue

    console.log(`  enrollment ${slug} → ${moduleSlug} (user ${row.user_id.slice(0, 8)}…)`)
    migrated += 1

    if (!dryRun) {
      await admin.from('course_enrollments').upsert(
        {
          user_id: row.user_id,
          course_slug: moduleSlug,
          source: row.source || 'stripe',
          order_id: row.order_id,
        },
        { onConflict: 'user_id,course_slug' }
      )
    }
  }

  console.log(`Migrated ${migrated} lesson enrollment(s) to module slug(s)`)
  console.log('[migrate-ioai-commerce] Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
