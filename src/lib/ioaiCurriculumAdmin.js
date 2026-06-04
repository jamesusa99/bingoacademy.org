import { supabase } from './supabase'
import { adminInsert, adminUpdate } from './admin/db'
import { saveCatalogCourse } from './admin/catalog'
import { assignStreamToCourse } from './admin/api'
import { getProgramCurriculum, isCurriculumLine } from '../config/programCurriculum'

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

export async function fetchCurriculumAdmin(productLine = 'ioai') {
  if (!isCurriculumLine(productLine)) {
    return { levels: [], rows: [], productLine }
  }

  const { data, error } = await supabase
    .from('course_levels')
    .select(CURRICULUM_ADMIN_SELECT)
    .eq('product_line', productLine)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'themes', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules', ascending: true })
    .order('sort_order', { referencedTable: 'themes.modules.lessons', ascending: true })

  if (error) throw new Error(error.message)
  const rows = flattenCurriculumForAdmin(data || [])
  const catalogMap = await fetchCatalogMapForSlugs(rows.map((r) => r.catalogSlug))
  return { levels: data || [], rows: attachCatalogToRows(rows, catalogMap), productLine }
}

async function fetchCatalogMapForSlugs(slugs) {
  const unique = [...new Set(slugs.filter(Boolean))]
  if (!unique.length) return new Map()

  const { data, error } = await supabase
    .from('courses_catalog')
    .select('slug, status, price, price_cents, currency, sort_order, rating, students')
    .in('slug', unique)

  if (error) throw new Error(error.message)
  return new Map((data || []).map((row) => [row.slug, row]))
}

function attachCatalogToRows(rows, catalogMap) {
  return rows.map((row) => {
    const cat = catalogMap.get(row.catalogSlug)
    return {
      ...row,
      catalogStatus: cat?.status ?? null,
      catalogPrice: cat?.price ?? '',
      catalogPriceCents: cat?.price_cents ?? '',
      catalogCurrency: cat?.currency ?? 'usd',
      catalogSortOrder: cat?.sort_order ?? row.sortOrder,
      catalogRating: cat?.rating ?? null,
      catalogStudents: cat?.students ?? null,
      hasCatalog: !!cat,
    }
  })
}

/** @deprecated use fetchCurriculumAdmin('ioai') */
export async function fetchIOAICurriculumAdmin() {
  return fetchCurriculumAdmin('ioai')
}

export async function fetchVideoAssetsForLessonPicker() {
  const { data, error } = await supabase
    .from('video_assets')
    .select(
      'id, title, cloudflare_uid, catalog_slug, status, product_line, stage_title, category_label, module_title, stage_slug, category_slug, module_slug'
    )
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

function buildLessonSlug(productLine, levelSlug, themeSlug, moduleSlug, lessonIndex) {
  const prefix = getProgramCurriculum(productLine).slugPrefix
  return `${prefix}-${levelSlug}-${themeSlug}-${moduleSlug}-l${lessonIndex + 1}`
}

function parseCatalogRating(value, fallback = 4.85) {
  return value !== '' && value != null && value !== undefined ? Number(value) || fallback : fallback
}

function parseCatalogStudents(value, fallback = 800) {
  return value !== '' && value != null && value !== undefined ? parseInt(value, 10) || fallback : fallback
}

function buildCatalogRow(
  productLine,
  {
    slug,
    level,
    theme,
    mod,
    lessonTitle,
    cloudflareUid,
    status,
    price,
    price_cents,
    currency,
    sort_order,
    rating,
    students,
  }
) {
  const config = getProgramCurriculum(productLine)
  const name = `${level.title} · ${theme.category_label || theme.title} · ${mod.title} · ${lessonTitle}`
  return {
    slug,
    line: config.line,
    sub: config.catalogSub,
    status: status || 'live',
    delivery_type: 'video',
    featured: false,
    name,
    name_en: lessonTitle,
    description: `${level.emoji || ''} ${level.title} · ${theme.title} · ${mod.title} — ${lessonTitle}.`.trim(),
    price: price?.trim() || config.catalogPrice,
    price_cents:
      price_cents !== '' && price_cents != null && price_cents !== undefined
        ? parseInt(price_cents, 10) || null
        : null,
    currency: currency?.trim()?.toLowerCase() || 'usd',
    hours: '1 lesson · ~45 min',
    badge: theme.category_label || theme.title,
    category: 'ai-fundamentals',
    level: 'beginner',
    lessons: 1,
    rating: parseCatalogRating(rating),
    students: parseCatalogStudents(students),
    outcomes: [`Complete ${mod.title} — ${lessonTitle}`],
    audience: config.catalogAudience,
    syllabus: [lessonTitle, mod.title, theme.title, level.title],
    lab_slugs: [],
    sort_order: sort_order != null && sort_order !== '' ? parseInt(sort_order, 10) || 0 : 1000,
    cloudflare_uid: cloudflareUid || null,
  }
}

function catalogPatchFromForm(productLine, catalogSlug, patch) {
  const config = getProgramCurriculum(productLine)
  return {
    slug: catalogSlug,
    line: config.line,
    sub: config.catalogSub,
    delivery_type: 'video',
    name: patch.title?.trim() || catalogSlug,
    status: patch.status || 'live',
    price: patch.price?.trim() || null,
    price_cents:
      patch.price_cents !== '' && patch.price_cents != null && patch.price_cents !== undefined
        ? parseInt(patch.price_cents, 10) || null
        : null,
    currency: patch.currency?.trim()?.toLowerCase() || 'usd',
    sort_order: parseInt(patch.sort_order, 10) || 0,
    rating: parseCatalogRating(patch.rating),
    students: parseCatalogStudents(patch.students),
    cloudflare_uid: patch.cloudflare_video_id?.trim() || null,
  }
}

export async function createProgramCourse(productLine, input) {
  if (!isCurriculumLine(productLine)) throw new Error('Invalid product line')

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
    status,
    price,
    price_cents,
    currency,
    sort_order,
    rating,
    students,
  } = input

  if (!lessonTitle?.trim()) throw new Error('课时标题不能为空')

  /** @type {object} */
  let level
  if (levelId) {
    const { data, error } = await supabase.from('course_levels').select('*').eq('id', levelId).single()
    if (error) throw new Error(error.message)
    level = data
  } else if (newLevel?.title?.trim()) {
    const sort = (await maxSortOrder('course_levels', { product_line: productLine })) + 1
    const slug = newLevel.slug?.trim() || toSlug(newLevel.title)
    level = await adminInsert('course_levels', {
      product_line: productLine,
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
    buildLessonSlug(productLine, level.slug, theme.slug, mod.slug, lessonSort)

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
      buildCatalogRow(productLine, {
        slug,
        level,
        theme,
        mod,
        lessonTitle: lessonTitle.trim(),
        cloudflareUid: cloudflare_video_id,
        status,
        price,
        price_cents,
        currency,
        sort_order,
        rating,
        students,
      })
    )
    if (cloudflare_video_id?.trim()) {
      await assignStreamToCourse({ catalogSlug: slug, uid: cloudflare_video_id.trim() })
    }
  }

  return { lesson, level, theme, module: mod }
}

/** @deprecated use createProgramCourse('ioai', input) */
export async function createIOAICourse(input) {
  return createProgramCourse('ioai', input)
}

export async function saveProgramLessonConfig(productLine, lessonId, patch) {
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
    await saveCatalogCourse(catalogPatchFromForm(productLine, catalogSlug, patch))
    if (cloudflareUid) {
      await assignStreamToCourse({ catalogSlug, uid: cloudflareUid })
    }
  }

  return data
}

/** @deprecated use saveProgramLessonConfig('ioai', lessonId, patch) */
export async function saveIOAILessonConfig(lessonId, patch) {
  return saveProgramLessonConfig('ioai', lessonId, patch)
}
