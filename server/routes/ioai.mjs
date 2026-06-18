import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import {
  IOAI_FULL_BUNDLE_SLUG,
  resolveUnlockedModuleSlugs,
  resolveUnlockedLessonSlugs,
  mapLabExtrasByModuleId,
  listLabMaterialsForModule,
  mapLabMaterialRow,
} from '../lib/ioaiCommerce.mjs'
import { enrichLessonsWithResourceFlags } from '../lib/ioaiExperiments.mjs'
import {
  countLiveQuestions,
  fetchLiveQuestions,
  gradeModuleTest,
  gradeSingleQuestion,
  resolveLessonDbId,
  resolveModuleDbId,
  sanitizeQuestions,
} from '../lib/ioaiQuestions.mjs'
import { userHasLessonAccess, userHasModuleAccess } from '../lib/ioaiCommerce.mjs'

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

function isPublicModuleStatus(status) {
  return status === 'live' || status === 'coming-soon'
}

function isPublicModuleDetail(mod) {
  return mod && isPublicModuleStatus(mod.status)
}

function mapStoreTree(levels, extrasByModuleId = new Map(), lessonFlags = new Map()) {
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
          .filter((m) => isPublicModuleStatus(m.status))
          .sort(sortByOrder)
          .map((mod) => {
            const comingSoon = mod.status === 'coming-soon'
            const extrasCents = comingSoon ? 0 : extrasByModuleId.get(mod.id) || 0
            const baseCents = comingSoon ? null : mod.price_cents ?? 0
            return {
            id: mod.slug,
            catalogSlug: mod.catalog_slug,
            title: mod.title,
            status: mod.status || 'live',
            coverUrl: mod.cover_url || null,
            summary: mod.summary || '',
            learningObjectives: mod.learning_objectives || '',
            learningOutcomes: mod.learning_outcomes || '',
            introHtml: mod.summary || '',
            priceCents: comingSoon ? null : baseCents || null,
            extrasPriceCents: comingSoon ? null : extrasCents || null,
            totalPriceCents: comingSoon ? null : baseCents > 0 ? baseCents : null,
            compareAtCents: comingSoon ? null : mod.compare_at_cents ?? null,
            currency: mod.currency || 'usd',
            marketingTags: mod.marketing_tags || [],
            lessonCount: mod.lessons?.length ?? 0,
            lessons: [...(mod.lessons || [])]
              .filter((l) => l.status !== 'hidden' && l.status !== 'draft')
              .sort(sortByOrder)
              .map((lesson) => {
                const catalogSlug = lesson.catalog_slug || lesson.slug
                const flags = lessonFlags.get(lesson.id) || {}
                return {
                  id: catalogSlug,
                  lessonDbId: lesson.id,
                  catalogSlug,
                  slug: lesson.slug,
                  title: lesson.title,
                  intro: lesson.intro || '',
                  trialEnabled: Boolean(lesson.trial_enabled),
                  sortOrder: lesson.sort_order ?? 0,
                  cloudflareVideoId: lesson.cloudflare_video_id || null,
                  hasExperiments: Boolean(flags.hasExperiments),
                  hasLessonMaterials: Boolean(flags.hasLessonMaterials),
                }
              }),
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
            id, slug, title, summary, learning_objectives, learning_outcomes, cover_url, intro_html, catalog_slug,
            price_cents, compare_at_cents, currency, marketing_tags, status, sort_order,
            lessons (
              id, slug, title, intro, trial_enabled, status, sort_order, catalog_slug, cloudflare_video_id
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
    const lessonIds = []
    for (const level of levels || []) {
      for (const theme of level.themes || []) {
        for (const mod of theme.modules || []) {
          if (mod.id) moduleIds.push(mod.id)
          for (const lesson of mod.lessons || []) {
            if (lesson.id) lessonIds.push(lesson.id)
          }
        }
      }
    }
    const extrasByModuleId = await mapLabExtrasByModuleId(admin, moduleIds)
    const lessonFlags = await enrichLessonsWithResourceFlags(admin, lessonIds)

    const labBundles = (bundles || []).filter((b) => b.bundle_type === 'lab_pack')

    return res.json({
      levels: mapStoreTree(levels, extrasByModuleId, lessonFlags),
      bundles: bundles || [],
      labBundles,
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
        id, slug, title, summary, learning_objectives, learning_outcomes, cover_url, intro_html, catalog_slug,
        price_cents, compare_at_cents, currency, marketing_tags, status,
        theme:themes (
          slug, title, category_label, intro_html,
          level:course_levels ( slug, title, emoji, product_line )
        ),
        lessons (
          id, slug, title, intro, trial_enabled, status, sort_order, cloudflare_video_id, catalog_slug,
          content_goals, knowledge_points
        )
      `
      )
      .eq('catalog_slug', catalogSlug)
      .maybeSingle()

    if (error) return res.status(502).json({ error: error.message })
    if (!isPublicModuleDetail(mod)) return res.status(404).json({ error: 'Module not found' })

    const comingSoon = mod.status === 'coming-soon'
    const labMaterials = (await listLabMaterialsForModule(admin, mod.id)).map(mapLabMaterialRow).filter(Boolean)
    const extrasPriceCents = comingSoon
      ? null
      : labMaterials.reduce((sum, row) => sum + (row.priceCents || 0), 0)
    const totalPriceCents = comingSoon ? null : mod.price_cents ?? 0

    const lessonIds = (mod.lessons || []).map((l) => l.id).filter(Boolean)
    const lessonFlags = await enrichLessonsWithResourceFlags(admin, lessonIds)

    const lessons = [...(mod.lessons || [])]
      .filter((l) => l.status !== 'hidden' && l.status !== 'draft')
      .sort(sortByOrder)
      .map((lesson) => {
        const catalogSlug = lesson.catalog_slug || lesson.slug
        const flags = lessonFlags.get(lesson.id) || {}
        return {
          ...lesson,
          catalogSlug,
          hasExperiments: Boolean(flags.hasExperiments),
          hasLessonMaterials: Boolean(flags.hasLessonMaterials),
        }
      })

    return res.json({
      module: {
        ...mod,
        lessons,
        price_cents: comingSoon ? null : mod.price_cents,
        compare_at_cents: comingSoon ? null : mod.compare_at_cents,
        extrasPriceCents: extrasPriceCents || null,
        totalPriceCents: totalPriceCents > 0 ? totalPriceCents : null,
        labMaterials: comingSoon ? labMaterials.map((item) => ({ ...item, priceCents: null })) : labMaterials,
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

  app.get('/api/ioai/lessons/:lessonRef/exercises', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const lessonDbId = await resolveLessonDbId(admin, req.params.lessonRef?.trim())
    if (!lessonDbId) return res.json({ questions: [], count: 0 })

    const rows = await fetchLiveQuestions(admin, { scopeType: 'lesson', scopeId: lessonDbId })
    return res.json({ questions: sanitizeQuestions(rows), count: rows.length })
  })

  app.post('/api/ioai/lessons/:lessonRef/exercises/grade', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const auth = await verifyAuthUser(req)
    const lessonRef = req.params.lessonRef?.trim()
    const lessonDbId = await resolveLessonDbId(admin, lessonRef)
    if (!lessonDbId) return res.status(404).json({ error: 'Lesson not found' })

    const enrolledSlugs = auth.ok ? await listEnrollmentSlugs(admin, auth.user.id) : []
    const hasAccess = auth.ok
      ? await userHasLessonAccess(admin, auth.user.id, lessonRef, { enrolledSlugs })
      : false
    if (!hasAccess) return res.status(403).json({ error: 'Purchase required to submit exercises' })

    const { questionId, answer } = req.body || {}
    if (!questionId) return res.status(400).json({ error: 'questionId required' })

    const { data: row, error } = await admin
      .from('ioai_question_items')
      .select('*')
      .eq('id', questionId)
      .eq('scope_type', 'lesson')
      .eq('scope_id', lessonDbId)
      .eq('status', 'live')
      .maybeSingle()
    if (error) return res.status(502).json({ error: error.message })
    if (!row) return res.status(404).json({ error: 'Question not found' })

    const result = gradeSingleQuestion(row, answer)
    return res.json({ questionId, ...result })
  })

  app.get('/api/ioai/modules/:moduleRef/test', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const mod = await resolveModuleDbId(admin, req.params.moduleRef?.trim())
    if (!mod?.id) return res.json({ questions: [], count: 0 })

    const rows = await fetchLiveQuestions(admin, { scopeType: 'module', scopeId: mod.id })
    return res.json({ questions: sanitizeQuestions(rows), count: rows.length, moduleId: mod.id })
  })

  app.post('/api/ioai/modules/:moduleRef/test/submit', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const mod = await resolveModuleDbId(admin, req.params.moduleRef?.trim())
    if (!mod?.id) return res.status(404).json({ error: 'Module not found' })

    const enrolledSlugs = await listEnrollmentSlugs(admin, auth.user.id)
    const hasModule = await userHasModuleAccess(admin, auth.user.id, mod.catalog_slug, { enrolledSlugs })
    if (!hasModule) return res.status(403).json({ error: 'Purchase required for module test' })

    const rows = await fetchLiveQuestions(admin, { scopeType: 'module', scopeId: mod.id })
    const { answers } = req.body || {}
    const graded = gradeModuleTest(rows, answers || {})

    await admin.from('ioai_module_test_attempts').insert({
      user_id: auth.user.id,
      module_id: mod.id,
      answers: answers || {},
      score: graded.score,
      total_score: graded.totalScore,
      passed: graded.passed,
    })

    return res.json(graded)
  })
}
