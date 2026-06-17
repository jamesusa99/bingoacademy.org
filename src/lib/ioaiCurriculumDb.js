import { getProgramCurriculum, isCurriculumLine } from '../config/programCurriculum'
import { supabase, isSupabaseConfigured } from './supabase'

const CURRICULUM_SELECT = `
  id,
  slug,
  title,
  emoji,
  sort_order,
  themes (
    id,
    slug,
    title,
    category_label,
    sort_order,
    modules (
      id,
      slug,
      title,
      sort_order,
      catalog_slug,
      price_cents,
      currency,
      lessons (
        id,
        slug,
        title,
        sort_order,
        cloudflare_video_id,
        catalog_slug,
        trial_enabled,
        knowledge_points,
        content_goals
      )
    )
  )
`

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

/** Map Supabase nested rows → frontend CourseLevel tree */
export function mapDbCurriculumToTree(rows) {
  if (!rows?.length) return []

  return [...rows].sort(sortByOrder).map((level) => ({
    id: level.slug,
    title: level.title,
    emoji: level.emoji || '',
    themes: [...(level.themes || [])].sort(sortByOrder).map((theme) => ({
      id: theme.slug,
      title: theme.title,
      categoryLabel: theme.category_label || theme.title,
      modules: [...(theme.modules || [])].sort(sortByOrder).map((mod) => ({
        id: mod.slug,
        title: mod.title,
        catalogSlug: mod.catalog_slug || null,
        priceCents: mod.price_cents ?? null,
        currency: mod.currency || 'usd',
        lessons: [...(mod.lessons || [])].sort(sortByOrder).map((lesson) => ({
          id: lesson.catalog_slug || lesson.slug,
          catalogSlug: lesson.catalog_slug || lesson.slug,
          slug: lesson.slug,
          title: lesson.title,
          cloudflareVideoId: lesson.cloudflare_video_id || null,
          trialEnabled: Boolean(lesson.trial_enabled),
          knowledgePoints: lesson.knowledge_points || '',
          contentGoals: lesson.content_goals || '',
        })),
      })),
    })),
  }))
}

export function countCurriculumLessons(tree) {
  let n = 0
  for (const level of tree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        n += mod.lessons?.length || 0
      }
    }
  }
  return n
}

export function countCurriculumModules(tree) {
  let n = 0
  for (const level of tree) {
    for (const theme of level.themes || []) {
      n += theme.modules?.length || 0
    }
  }
  return n
}

export function buildCurriculumSummary(tree, productLine = 'ioai', titleOverride = null) {
  const levels = tree.length
  const modules = countCurriculumModules(tree)
  const lessons = countCurriculumLessons(tree)
  const title = titleOverride || getProgramCurriculum(productLine).summaryTitle
  return {
    title,
    productLine,
    levels,
    modules,
    lessons,
    summary: `${levels} levels · ${modules} modules · ${lessons} lessons`,
  }
}

/** Fetch curriculum tree from Supabase for a product line */
export async function fetchCurriculumFromDb(productLine = 'ioai') {
  if (!isSupabaseConfigured) {
    return { tree: [], source: 'none', error: 'Supabase not configured', productLine }
  }

  if (!isCurriculumLine(productLine)) {
    return { tree: [], source: 'none', error: null, productLine }
  }

  const { data, error } = await supabase
    .from('course_levels')
    .select(CURRICULUM_SELECT)
    .eq('product_line', productLine)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'themes', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules.lessons', ascending: true })

  if (error) {
    return { tree: [], source: 'supabase', error: error.message, productLine }
  }

  const tree = mapDbCurriculumToTree(data)
  return {
    tree,
    summary: buildCurriculumSummary(tree, productLine),
    source: tree.length ? 'supabase' : 'empty',
    error: null,
    productLine,
  }
}

/** @deprecated use fetchCurriculumFromDb('ioai') */
export async function fetchIOAICurriculumFromDb() {
  return fetchCurriculumFromDb('ioai')
}

export const IOAI_ACCESS_SCOPE = 'ioai_masterclass'

/** Check user_course_access + course_enrollments for IOAI masterclass */
export async function fetchIOAIAccessStatus(userId) {
  if (!userId || !isSupabaseConfigured) {
    return { hasAccess: false, scopes: [] }
  }

  const [accessRes, enrollRes] = await Promise.all([
    supabase
      .from('user_course_access')
      .select('access_scope, granted_at')
      .eq('user_id', userId)
      .eq('access_scope', IOAI_ACCESS_SCOPE)
      .maybeSingle(),
    supabase
      .from('course_enrollments')
      .select('course_slug')
      .eq('user_id', userId)
      .in('course_slug', ['ioai-competition-system', 'ioai-track']),
  ])

  const fromAccess = Boolean(accessRes.data)
  const fromEnrollment = (enrollRes.data || []).length > 0

  return {
    hasAccess: fromAccess || fromEnrollment,
    scopes: fromAccess ? [IOAI_ACCESS_SCOPE] : [],
    fromEnrollment,
  }
}
