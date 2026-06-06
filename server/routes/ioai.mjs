import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import {
  IOAI_FULL_BUNDLE_SLUG,
  getBundleBySlug,
  resolveUnlockedModuleSlugs,
  resolveUnlockedLessonSlugs,
  mapLabExtrasByModuleId,
  listLabMaterialsForModule,
  mapLabMaterialRow,
  resolveModuleTotalPriceCents,
} from '../lib/ioaiCommerce.mjs'

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

function mapStoreTree(levels, extrasByModuleId = new Map()) {
  return [...(levels || [])].sort(sortByOrder).map((level) => ({
    id: level.slug,
    title: level.title,
    emoji: level.emoji || '',
    coverUrl: level.cover_url || null,
    summaryShort: level.summary_short || level.summary || '',
    intro: level.intro_json || {},
    highlightTags: level.highlight_tags || [],
    status: level.status || 'live',
    themes: [...(level.themes || [])]
      .filter((t) => t.status !== 'hidden' && !t.hidden)
      .sort(sortByOrder)
      .map((theme) => ({
        id: theme.slug,
        title: theme.title,
        categoryLabel: theme.category_label || theme.title,
        coverUrl: theme.cover_url || null,
        introHtml: theme.intro_html || '',
        status: theme.status || 'live',
        modules: [...(theme.modules || [])]
          .filter((m) => m.status === 'live')
          .sort(sortByOrder)
          .map((mod) => {
            const extrasCents = extrasByModuleId.get(mod.id) || 0
            const baseCents = mod.price_cents ?? 0
            const totalCents = baseCents + extrasCents
            return {
            id: mod.slug,
            catalogSlug: mod.catalog_slug,
            title: mod.title,
            coverUrl: mod.cover_url || null,
            introHtml: mod.intro_html || mod.summary || '',
            priceCents: baseCents || null,
            extrasPriceCents: extrasCents || null,
            totalPriceCents: totalCents > 0 ? totalCents : null,
            compareAtCents: mod.compare_at_cents ?? null,
            currency: mod.currency || 'usd',
            marketingTags: mod.marketing_tags || [],
            lessonCount: mod.lessons?.length ?? 0,
            lessons: [...(mod.lessons || [])]
              .filter((l) => l.status !== 'hidden' && l.status !== 'draft')
              .sort(sortByOrder)
              .map((lesson) => ({
                id: lesson.slug,
                title: lesson.title,
                intro: lesson.intro || '',
                trialEnabled: Boolean(lesson.trial_enabled),
                sortOrder: lesson.sort_order ?? 0,
              })),
          }})
      })),
  }))
}

export function registerIoaiRoutes(app) {
  app.get('/api/ioai/store', async (_req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { data: levels, error } = await admin
      .from('course_levels')
      .select(
        `
        id, slug, title, emoji, summary, summary_short, cover_url, intro_json,
        highlight_tags, status, sort_order,
        themes (
          id, slug, title, category_label, cover_url, intro_html, status, hidden, sort_order,
          modules (
            id, slug, title, summary, cover_url, intro_html, catalog_slug,
            price_cents, compare_at_cents, currency, marketing_tags, status, sort_order,
            lessons (
              id, slug, title, intro, trial_enabled, status, sort_order
            )
          )
        )
      `
      )
      .eq('product_line', 'ioai')
      .eq('status', 'live')
      .order('sort_order')
      .order('sort_order', { referencedTable: 'themes', ascending: true })
      .order('sort_order', { referencedTable: 'themes.modules', ascending: true })
      .order('sort_order', { referencedTable: 'themes.modules.lessons', ascending: true })

    if (error) {
      return res.status(502).json({ error: error.message })
    }

    const { data: bundles } = await admin
      .from('ioai_bundles')
      .select('slug, bundle_type, title, cover_url, intro_html, price_cents, compare_at_cents, currency, marketing_tags, status, sort_order')
      .eq('status', 'live')
      .order('sort_order')

    const fullBundle = (bundles || []).find((b) => b.slug === IOAI_FULL_BUNDLE_SLUG) || null

    const moduleIds = []
    for (const level of levels || []) {
      for (const theme of level.themes || []) {
        for (const mod of theme.modules || []) {
          if (mod.id) moduleIds.push(mod.id)
        }
      }
    }
    const extrasByModuleId = await mapLabExtrasByModuleId(admin, moduleIds)

    return res.json({
      levels: mapStoreTree(levels, extrasByModuleId),
      bundles: bundles || [],
      fullBundle,
    })
  })

  app.get('/api/ioai/modules/:catalogSlug', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const catalogSlug = req.params.catalogSlug?.trim()
    if (!catalogSlug) return res.status(400).json({ error: 'catalogSlug required' })

    const { data: mod, error } = await admin
      .from('modules')
      .select(
        `
        id, slug, title, summary, cover_url, intro_html, catalog_slug,
        price_cents, compare_at_cents, currency, marketing_tags, status,
        theme:themes (
          slug, title, category_label, intro_html,
          level:course_levels ( slug, title, emoji, product_line )
        ),
        lessons (
          id, slug, title, intro, trial_enabled, status, sort_order, cloudflare_video_id, catalog_slug
        )
      `
      )
      .eq('catalog_slug', catalogSlug)
      .maybeSingle()

    if (error) return res.status(502).json({ error: error.message })
    if (!mod) return res.status(404).json({ error: 'Module not found' })

    const labMaterials = (await listLabMaterialsForModule(admin, mod.id)).map(mapLabMaterialRow).filter(Boolean)
    const extrasPriceCents = labMaterials.reduce((sum, row) => sum + (row.priceCents || 0), 0)
    const totalPriceCents = await resolveModuleTotalPriceCents(admin, mod)

    return res.json({
      module: {
        ...mod,
        extrasPriceCents: extrasPriceCents || null,
        totalPriceCents: totalPriceCents > 0 ? totalPriceCents : null,
        labMaterials,
      },
    })
  })

  app.get('/api/me/ioai-access', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const enrolledSlugs = await listEnrollmentSlugs(auth.admin, auth.user.id)
    const moduleSlugs = [...(await resolveUnlockedModuleSlugs(auth.admin, auth.user.id, enrolledSlugs))]
    const lessonSlugs = await resolveUnlockedLessonSlugs(auth.admin, auth.user.id, enrolledSlugs)

    return res.json({
      enrolledSlugs,
      moduleSlugs,
      lessonSlugs,
      hasFullTrack:
        enrolledSlugs.includes(IOAI_FULL_BUNDLE_SLUG) || enrolledSlugs.includes('ioai-track'),
    })
  })
}
