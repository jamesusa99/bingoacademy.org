import { enrichLessonsWithResourceFlags } from './ioaiExperiments.mjs'
import { mapLabExtrasByModuleId } from './ioaiCommerce.mjs'

export const CURRICULUM_PRODUCT_LINES = ['ioai', 'general', 'k12']

const STORE_SELECT = `
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

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

function isPublicModuleStatus(status) {
  return status === 'live' || status === 'coming-soon'
}

export function mapStoreTree(levels, extrasByModuleId = new Map(), lessonFlags = new Map()) {
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
            }
          }),
      })),
  }))
}

export function isCurriculumProductLine(line) {
  return CURRICULUM_PRODUCT_LINES.includes(line)
}

export async function fetchProgramStoreLevels(admin, productLine) {
  const { data: levels, error } = await admin
    .from('course_levels')
    .select(STORE_SELECT)
    .eq('product_line', productLine)
    .eq('status', 'live')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'themes', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules.lessons', ascending: true })

  if (error) throw new Error(error.message)

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

  return mapStoreTree(levels, extrasByModuleId, lessonFlags)
}
