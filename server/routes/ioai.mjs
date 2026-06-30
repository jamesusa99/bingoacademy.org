import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import {
  IOAI_FULL_BUNDLE_SLUG,
  resolveUnlockedModuleSlugs,
  resolveUnlockedLessonSlugs,
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
import {
  fetchProgramStoreLevels,
  isCurriculumProductLine,
} from '../lib/programStore.mjs'
import {
  ensureStorefrontCourseBundles,
  fetchAdminCourseBundles,
  fetchLiveCourseBundles,
  syncCourseBundleModuleLinks,
  updateAdminCourseBundle,
} from '../lib/ioaiCourseBundles.mjs'

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

function isPublicModuleStatus(status) {
  return status === 'live' || status === 'coming-soon'
}

function isPublicModuleDetail(mod) {
  return mod && isPublicModuleStatus(mod.status)
}

function formatLessonExerciseSubmission(row) {
  if (!row) return null
  return {
    answers: row.answers || {},
    result: {
      score: row.score,
      totalScore: row.total_score,
      passed: row.passed,
      results: row.results || [],
    },
  }
}

async function fetchLatestLessonExerciseAttempt(admin, userId, lessonDbId) {
  const { data, error } = await admin
    .from('ioai_lesson_exercise_attempts')
    .select('answers, score, total_score, passed, results, submitted_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonDbId)
    .maybeSingle()
  if (error) throw error
  return formatLessonExerciseSubmission(data)
}

export function registerIoaiRoutes(app, { verifyAdminUser } = {}) {
  app.get('/api/program/:productLine/store', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const productLine = req.params.productLine?.trim()
    if (!isCurriculumProductLine(productLine)) {
      return res.status(400).json({ error: 'Invalid product line' })
    }

    try {
      const levels = await fetchProgramStoreLevels(admin, productLine)
      const payload = { levels, productLine, bundles: [], labBundles: [], fullBundle: null }

      if (productLine === 'ioai') {
        const { data: bundles } = await admin
          .from('ioai_bundles')
          .select('slug, bundle_type, title, cover_url, intro_html, price_cents, compare_at_cents, currency, marketing_tags, status, sort_order')
          .eq('status', 'live')
          .order('sort_order')
        payload.bundles = bundles || []
        payload.labBundles = (bundles || []).filter((b) => b.bundle_type === 'lab_pack')
        payload.fullBundle = (bundles || []).find((b) => b.slug === IOAI_FULL_BUNDLE_SLUG) || null
      }

      return res.json(payload)
    } catch (err) {
      return res.status(502).json({ error: err.message || 'Failed to load store' })
    }
  })

  app.get('/api/ioai/store', async (_req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const levels = await fetchProgramStoreLevels(admin, 'ioai')
      const { data: bundles } = await admin
        .from('ioai_bundles')
        .select('slug, bundle_type, title, cover_url, intro_html, price_cents, compare_at_cents, currency, marketing_tags, status, sort_order')
        .eq('status', 'live')
        .order('sort_order')
      const fullBundle = (bundles || []).find((b) => b.slug === IOAI_FULL_BUNDLE_SLUG) || null
      const labBundles = (bundles || []).filter((b) => b.bundle_type === 'lab_pack')

      return res.json({
        levels,
        bundles: bundles || [],
        labBundles,
        fullBundle,
      })
    } catch (err) {
      return res.status(502).json({ error: err.message || 'Failed to load store' })
    }
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
          id, slug, title, intro, trial_enabled, golab_enabled, status, sort_order, cloudflare_video_id, catalog_slug,
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
    const payload = { questions: sanitizeQuestions(rows), count: rows.length }

    const auth = await verifyAuthUser(req)
    if (auth.ok) {
      try {
        const submission = await fetchLatestLessonExerciseAttempt(admin, auth.user.id, lessonDbId)
        if (submission) payload.submission = submission
      } catch (err) {
        return res.status(502).json({ error: err.message || 'Failed to load exercise submission' })
      }
    }

    return res.json(payload)
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

  app.post('/api/ioai/lessons/:lessonRef/exercises/submit', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const lessonRef = req.params.lessonRef?.trim()
    const lessonDbId = await resolveLessonDbId(admin, lessonRef)
    if (!lessonDbId) return res.status(404).json({ error: 'Lesson not found' })

    const enrolledSlugs = await listEnrollmentSlugs(auth.admin, auth.user.id)
    const hasAccess = await userHasLessonAccess(auth.admin, auth.user.id, lessonRef, { enrolledSlugs })
    if (!hasAccess) return res.status(403).json({ error: 'Purchase required to submit exercises' })

    const rows = await fetchLiveQuestions(admin, { scopeType: 'lesson', scopeId: lessonDbId })
    const { answers } = req.body || {}
    const graded = gradeModuleTest(rows, answers || {})

    const { error: saveError } = await admin.from('ioai_lesson_exercise_attempts').upsert(
      {
        user_id: auth.user.id,
        lesson_id: lessonDbId,
        answers: answers || {},
        score: graded.score,
        total_score: graded.totalScore,
        passed: graded.passed,
        results: graded.results,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )
    if (saveError) return res.status(502).json({ error: saveError.message })

    return res.json(graded)
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

  app.get('/api/ioai/course-bundles', async (_req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const bundles = await fetchLiveCourseBundles(admin)
      return res.json({ bundles })
    } catch (err) {
      return res.status(502).json({ error: err.message || 'Failed to load course bundles' })
    }
  })

  if (verifyAdminUser) {
    const curriculumBundleLines = ['ioai', 'general', 'k12']

    for (const productLine of curriculumBundleLines) {
      const base = `/api/admin/${productLine}/course-bundles`

      app.get(base, async (req, res) => {
        const auth = await verifyAdminUser(req)
        if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

        const admin = getSupabaseAdmin()
        if (!admin) return res.status(503).json({ error: 'Database not configured' })

        try {
          const bundles = await fetchAdminCourseBundles(admin, productLine)
          return res.json({ bundles })
        } catch (err) {
          return res.status(502).json({ error: err.message || 'Failed to load course bundles' })
        }
      })

      app.put(`${base}/:id`, async (req, res) => {
        const auth = await verifyAdminUser(req)
        if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

        const admin = getSupabaseAdmin()
        if (!admin) return res.status(503).json({ error: 'Database not configured' })

        try {
          const bundle = await updateAdminCourseBundle(admin, req.params.id, req.body || {}, productLine)
          if (!bundle) return res.status(404).json({ error: 'Bundle not found' })
          return res.json({ bundle })
        } catch (err) {
          return res.status(502).json({ error: err.message || 'Failed to update bundle' })
        }
      })

      app.post(`${base}/:id/sync-modules`, async (req, res) => {
        const auth = await verifyAdminUser(req)
        if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

        const admin = getSupabaseAdmin()
        if (!admin) return res.status(503).json({ error: 'Database not configured' })

        const { levelSlug } = req.body || {}
        if (!levelSlug) return res.status(400).json({ error: 'levelSlug required' })

        try {
          const modules = await syncCourseBundleModuleLinks(admin, productLine, req.params.id, levelSlug)
          const bundles = await fetchAdminCourseBundles(admin, productLine)
          const bundle = bundles.find((row) => row.id === req.params.id)
          return res.json({ bundle, moduleCount: modules.length })
        } catch (err) {
          return res.status(502).json({ error: err.message || 'Failed to sync modules' })
        }
      })

      app.post(`${base}/ensure`, async (req, res) => {
        const auth = await verifyAdminUser(req)
        if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

        const admin = getSupabaseAdmin()
        if (!admin) return res.status(503).json({ error: 'Database not configured' })

        try {
          await ensureStorefrontCourseBundles(admin, productLine)
          const bundles = await fetchAdminCourseBundles(admin, productLine)
          return res.json({ bundles })
        } catch (err) {
          return res.status(502).json({ error: err.message || 'Failed to ensure bundles' })
        }
      })
    }
  }
}
