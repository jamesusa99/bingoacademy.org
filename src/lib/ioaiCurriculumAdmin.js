import { supabase } from './supabase'
import { adminInsert, adminUpdate } from './admin/db'
import { saveCatalogCourse } from './admin/catalog'
import { assignStreamToCourse } from './admin/api'

const CURRICULUM_ADMIN_SELECT = `
  id,
  slug,
  title,
  emoji,
  summary,
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
      summary,
      sort_order,
      lessons (
        id,
        slug,
        title,
        sort_order,
        knowledge_points,
        content_goals,
        cloudflare_video_id,
        catalog_slug
      )
    )
  )
`

function sortRows(rows) {
  return [...(rows || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/** Flat rows for admin table: 阶段 | 类别 | 模块 | 主题（课时） | 知识点 | 内容/目标 */
export function flattenCurriculumForAdmin(levels) {
  /** @type {Array<object>} */
  const rows = []
  for (const level of sortRows(levels)) {
    for (const theme of sortRows(level.themes)) {
      const categoryLabel = theme.category_label || theme.title
      for (const mod of sortRows(theme.modules)) {
        for (const lesson of sortRows(mod.lessons)) {
          rows.push({
            lessonId: lesson.id,
            levelId: level.id,
            themeId: theme.id,
            moduleId: mod.id,
            stage: level.title,
            stageSlug: level.slug,
            stageEmoji: level.emoji,
            module: mod.title,
            moduleSlug: mod.slug,
            category: categoryLabel,
            categorySlug: theme.slug,
            themeTitle: theme.title,
            lessonTitle: lesson.title,
            lessonSlug: lesson.slug,
            knowledgePoints: lesson.knowledge_points || '',
            contentGoals: lesson.content_goals || '',
            cloudflareVideoId: lesson.cloudflare_video_id || '',
            catalogSlug: lesson.catalog_slug || lesson.slug,
            sortOrder: lesson.sort_order ?? 0,
          })
        }
      }
    }
  }
  return rows
}

export async function fetchIOAICurriculumAdmin() {
  const { data, error } = await supabase
    .from('course_levels')
    .select(CURRICULUM_ADMIN_SELECT)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'themes', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules.lessons', ascending: true })

  if (error) throw new Error(error.message)
  return { levels: data || [], rows: flattenCurriculumForAdmin(data || []) }
}

export async function fetchVideoAssetsForLessonPicker() {
  const { data, error } = await supabase
    .from('video_assets')
    .select('id, title, cloudflare_uid, catalog_slug, status')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

async function maxSortOrder(table, filter = {}) {
  let q = supabase.from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1)
  for (const [key, val] of Object.entries(filter)) {
    q = q.eq(key, val)
  }
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data?.[0]?.sort_order ?? -1
}

function toSlug(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildLessonSlug(levelSlug, themeSlug, moduleSlug, lessonIndex) {
  return `ioai-${levelSlug}-${themeSlug}-${moduleSlug}-l${lessonIndex + 1}`
}

function buildCatalogRow({ slug, level, theme, mod, lessonTitle, cloudflareUid }) {
  const name = `${level.title} · ${theme.category_label || theme.title} · ${mod.title} · ${lessonTitle}`
  return {
    slug,
    line: 'ioai',
    sub: 'video',
    status: 'live',
    delivery_type: 'video',
    featured: false,
    name,
    name_en: lessonTitle,
    description: `${level.emoji || ''} ${level.title} · ${theme.title} · ${mod.title} — ${lessonTitle}.`.trim(),
    price: 'Included in IOAI Track',
    hours: '1 lesson · ~45 min',
    badge: theme.category_label || theme.title,
    category: 'ai-fundamentals',
    level: 'beginner',
    lessons: 1,
    rating: 4.85,
    students: 800,
    outcomes: [`Complete ${mod.title} — ${lessonTitle}`],
    audience: 'IOAI competition trainees',
    syllabus: [lessonTitle, mod.title, theme.title, level.title],
    lab_slugs: [],
    sort_order: 1000,
    cloudflare_uid: cloudflareUid || null,
  }
}

async function syncLessonVideoToCatalog(catalogSlug, cloudflareUid, lessonTitle) {
  if (!catalogSlug?.trim()) return
  const slug = catalogSlug.trim()
  const uid = cloudflareUid?.trim()

  await saveCatalogCourse({
    slug,
    line: 'ioai',
    sub: 'video',
    status: 'live',
    delivery_type: 'video',
    name: lessonTitle || slug,
    cloudflare_uid: uid || null,
  })

  if (uid) {
    await assignStreamToCourse({ catalogSlug: slug, uid })
  }
}

export async function createIOAICourse(input) {
  const {
    levelId,
    newLevel,
    themeId,
    newTheme,
    moduleId,
    newModule,
    lessonTitle,
    lessonSlug: lessonSlugInput,
    knowledge_points,
    content_goals,
    cloudflare_video_id,
    syncCatalog = true,
  } = input

  if (!lessonTitle?.trim()) throw new Error('课时标题不能为空')

  /** @type {object} */
  let level
  if (levelId) {
    const { data, error } = await supabase.from('course_levels').select('*').eq('id', levelId).single()
    if (error) throw new Error(error.message)
    level = data
  } else if (newLevel?.title?.trim()) {
    const sort = (await maxSortOrder('course_levels')) + 1
    const slug = newLevel.slug?.trim() || toSlug(newLevel.title)
    level = await adminInsert('course_levels', {
      slug,
      title: newLevel.title.trim(),
      emoji: newLevel.emoji?.trim() || null,
      sort_order: sort,
    })
  } else {
    throw new Error('请选择或新建阶段')
  }

  /** @type {object} */
  let theme
  if (themeId) {
    const { data, error } = await supabase.from('themes').select('*').eq('id', themeId).single()
    if (error) throw new Error(error.message)
    theme = data
  } else if (newTheme?.title?.trim()) {
    const sort = (await maxSortOrder('themes', { level_id: level.id })) + 1
    const slug = newTheme.slug?.trim() || toSlug(newTheme.title)
    theme = await adminInsert('themes', {
      level_id: level.id,
      slug,
      title: newTheme.title.trim(),
      category_label: newTheme.category_label?.trim() || newTheme.title.trim(),
      sort_order: sort,
    })
  } else {
    throw new Error('请选择或新建类别')
  }

  /** @type {object} */
  let mod
  if (moduleId) {
    const { data, error } = await supabase.from('modules').select('*').eq('id', moduleId).single()
    if (error) throw new Error(error.message)
    mod = data
  } else if (newModule?.title?.trim()) {
    const sort = (await maxSortOrder('modules', { theme_id: theme.id })) + 1
    const slug = newModule.slug?.trim() || toSlug(newModule.title)
    mod = await adminInsert('modules', {
      theme_id: theme.id,
      slug,
      title: newModule.title.trim(),
      sort_order: sort,
    })
  } else {
    throw new Error('请选择或新建模块')
  }

  const lessonSort = (await maxSortOrder('lessons', { module_id: mod.id })) + 1
  const slug =
    lessonSlugInput?.trim() ||
    buildLessonSlug(level.slug, theme.slug, mod.slug, lessonSort)

  const lesson = await adminInsert('lessons', {
    module_id: mod.id,
    slug,
    title: lessonTitle.trim(),
    sort_order: lessonSort,
    knowledge_points: knowledge_points?.trim() || null,
    content_goals: content_goals?.trim() || null,
    cloudflare_video_id: cloudflare_video_id?.trim() || null,
    catalog_slug: slug,
  })

  if (syncCatalog) {
    await saveCatalogCourse(
      buildCatalogRow({
        slug,
        level,
        theme,
        mod,
        lessonTitle: lessonTitle.trim(),
        cloudflareUid: cloudflare_video_id,
      })
    )
    if (cloudflare_video_id?.trim()) {
      await syncLessonVideoToCatalog(slug, cloudflare_video_id, lessonTitle.trim())
    }
  }

  return { lesson, level, theme, module: mod }
}

export async function saveIOAILessonConfig(lessonId, patch) {
  const catalogSlug = patch.catalog_slug?.trim() || null
  const cloudflareUid = patch.cloudflare_video_id?.trim() || null

  const data = await adminUpdate('lessons', lessonId, {
    title: patch.title,
    knowledge_points: patch.knowledge_points ?? null,
    content_goals: patch.content_goals ?? null,
    cloudflare_video_id: cloudflareUid,
    catalog_slug: catalogSlug,
    updated_at: new Date().toISOString(),
  })

  if (catalogSlug) {
    await syncLessonVideoToCatalog(catalogSlug, cloudflareUid, patch.title)
  }

  return data
}
