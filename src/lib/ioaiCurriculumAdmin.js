import { supabase } from './supabase'
import { adminInsert, adminUpdate, adminDelete } from './admin/db'
import { saveCatalogCourse, deleteCatalogCourse } from './admin/catalog'
import { assignStreamToCourse } from './admin/api'
import { getProgramCurriculum, isCurriculumLine } from '../config/programCurriculum'
import { COURSE_STATUS } from '../config/coursesCatalog'
import { buildModuleCatalogSlug } from './ioaiStore'

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
      catalog_slug,
      price_cents,
      compare_at_cents,
      currency,
      intro_html,
      cover_url,
      status,
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

/** Group curriculum tree by L3 modules (each module contains L4 lessons) */
export function groupModulesForAdmin(levels) {
  /** @type {Array<object>} */
  const groups = []
  for (const level of sortRows(levels)) {
    for (const theme of sortRows(level.themes)) {
      const categoryLabel = theme.category_label || theme.title
      for (const mod of sortRows(theme.modules)) {
        const lessons = sortRows(mod.lessons).map((lesson) => ({
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
        }))
        groups.push({
          moduleDbId: mod.id,
          levelDbId: level.id,
          themeDbId: theme.id,
          stage: level.title,
          stageSlug: level.slug,
          stageEmoji: level.emoji,
          category: categoryLabel,
          categorySlug: theme.slug,
          themeTitle: theme.title,
          moduleTitle: mod.title,
          moduleSlug: mod.slug,
          moduleSummary: mod.summary || '',
          catalogSlug: mod.catalog_slug || '',
          coverUrl: mod.cover_url || '',
          priceCents: mod.price_cents ?? null,
          compareAtCents: mod.compare_at_cents ?? null,
          currency: mod.currency || 'usd',
          introHtml: mod.intro_html || '',
          status: mod.status || 'live',
          sortOrder: mod.sort_order ?? 0,
          levelSlug: level.slug,
          lessons,
        })
      }
    }
  }
  return groups
}

function formatUsd(cents) {
  if (cents == null) return ''
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
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
  const moduleGroups = groupModulesForAdmin(data || [])
  const rows = flattenCurriculumForAdmin(data || [])
  const catalogSlugs = [
    ...rows.map((r) => r.catalogSlug),
    ...moduleGroups.map((g) => g.catalogSlug).filter(Boolean),
  ]
  const catalogMap = await fetchCatalogMapForSlugs(catalogSlugs)
  const rowsWithCatalog = attachCatalogToRows(rows, catalogMap)
  const moduleGroupsWithCatalog = moduleGroups.map((group) => ({
    ...group,
    catalogPrice: catalogMap.get(group.catalogSlug)?.price ?? (group.priceCents ? formatUsd(group.priceCents) : ''),
    catalogPriceCents: catalogMap.get(group.catalogSlug)?.price_cents ?? group.priceCents,
    lessons: attachCatalogToRows(group.lessons, catalogMap),
  }))
  return {
    levels: data || [],
    rows: rowsWithCatalog,
    moduleGroups: moduleGroupsWithCatalog,
    productLine,
  }
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
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug
}

function slugFromInput(explicit, title, fallbackPrefix) {
  return explicit?.trim() || toSlug(title) || `${fallbackPrefix}-${Date.now()}`
}

async function findLevelById(levelId) {
  const { data, error } = await supabase.from('course_levels').select('*').eq('id', levelId).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function findOrCreateLevel(productLine, { levelId, newLevel }) {
  if (levelId) {
    const existing = await findLevelById(levelId)
    if (existing) return existing
  }

  const title = newLevel?.title?.trim()
  if (!title) throw new Error('请选择或新建阶段')

  const slug = slugFromInput(newLevel?.slug, title, 'stage')
  const { data: bySlug, error: slugErr } = await supabase
    .from('course_levels')
    .select('*')
    .eq('product_line', productLine)
    .eq('slug', slug)
    .maybeSingle()
  if (slugErr) throw new Error(slugErr.message)

  if (bySlug) {
    const updates = {}
    if (title !== bySlug.title) updates.title = title
    const emoji = newLevel?.emoji?.trim()
    if (emoji && emoji !== bySlug.emoji) updates.emoji = emoji
    if (Object.keys(updates).length) {
      updates.updated_at = new Date().toISOString()
      return adminUpdate('course_levels', bySlug.id, updates)
    }
    return bySlug
  }

  const sort = (await maxSortOrder('course_levels', { product_line: productLine })) + 1
  return adminInsert('course_levels', {
    product_line: productLine,
    slug,
    title,
    emoji: newLevel?.emoji?.trim() || null,
    sort_order: sort,
  })
}

async function findThemeById(themeId) {
  const { data, error } = await supabase.from('themes').select('*').eq('id', themeId).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function findOrCreateTheme(levelId, { themeId, newTheme }) {
  if (themeId) {
    const existing = await findThemeById(themeId)
    if (existing) return existing
  }

  const title = newTheme?.title?.trim() || newTheme?.category_label?.trim()
  if (!title) throw new Error('请选择或新建类别')

  const slug = slugFromInput(newTheme?.slug, title, 'category')
  const { data: bySlug, error: slugErr } = await supabase
    .from('themes')
    .select('*')
    .eq('level_id', levelId)
    .eq('slug', slug)
    .maybeSingle()
  if (slugErr) throw new Error(slugErr.message)

  const categoryLabel = newTheme?.category_label?.trim() || title

  if (bySlug) {
    const updates = {}
    if (title !== bySlug.title) updates.title = title
    if (categoryLabel !== bySlug.category_label) updates.category_label = categoryLabel
    if (Object.keys(updates).length) {
      updates.updated_at = new Date().toISOString()
      return adminUpdate('themes', bySlug.id, updates)
    }
    return bySlug
  }

  const sort = (await maxSortOrder('themes', { level_id: levelId })) + 1
  return adminInsert('themes', {
    level_id: levelId,
    slug,
    title,
    category_label: categoryLabel,
    sort_order: sort,
  })
}

async function findModuleById(moduleId) {
  const { data, error } = await supabase.from('modules').select('*').eq('id', moduleId).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function findOrCreateModule(themeId, { moduleId, newModule }) {
  if (moduleId) {
    const existing = await findModuleById(moduleId)
    if (existing) return existing
  }

  const title = newModule?.title?.trim()
  if (!title) throw new Error('请选择或新建模块')

  const slug = slugFromInput(newModule?.slug, title, 'module')
  const { data: bySlug, error: slugErr } = await supabase
    .from('modules')
    .select('*')
    .eq('theme_id', themeId)
    .eq('slug', slug)
    .maybeSingle()
  if (slugErr) throw new Error(slugErr.message)

  if (bySlug) {
    if (title !== bySlug.title) {
      return adminUpdate('modules', bySlug.id, {
        title,
        updated_at: new Date().toISOString(),
      })
    }
    return bySlug
  }

  const sort = (await maxSortOrder('modules', { theme_id: themeId })) + 1
  return adminInsert('modules', {
    theme_id: themeId,
    slug,
    title,
    sort_order: sort,
  })
}

async function ensureUniqueLessonSlug(baseSlug) {
  let slug = baseSlug
  let suffix = 1
  while (true) {
    const { data, error } = await supabase.from('lessons').select('id').eq('slug', slug).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return slug
    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }
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

  const level = await findOrCreateLevel(productLine, { levelId, newLevel })
  const theme = await findOrCreateTheme(level.id, { themeId, newTheme })
  const mod = await findOrCreateModule(theme.id, { moduleId, newModule })

  const moduleCatalogSlug =
    mod.catalog_slug?.trim() ||
    buildModuleCatalogSlug(level.slug, theme.slug, mod.slug)
  if (moduleCatalogSlug && !mod.catalog_slug) {
    await adminUpdate('modules', mod.id, {
      catalog_slug: moduleCatalogSlug,
      updated_at: new Date().toISOString(),
    })
    mod.catalog_slug = moduleCatalogSlug
  }

  const lessonSort = (await maxSortOrder('lessons', { module_id: mod.id })) + 1
  const baseSlug =
    lessonSlugInput?.trim() ||
    buildLessonSlug(productLine, level.slug, theme.slug, mod.slug, lessonSort)
  const slug = await ensureUniqueLessonSlug(baseSlug)

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

function sumCatalogRowsPriceCents(rows) {
  return (rows || []).reduce((sum, row) => {
    const cents = row.price_cents != null && row.price_cents > 0 ? row.price_cents : null
    return sum + (cents || 0)
  }, 0)
}

async function sumLabExtrasForModule(moduleDbId) {
  const { data: direct } = await supabase
    .from('courses_catalog')
    .select('price_cents, price, lesson_id')
    .eq('module_id', moduleDbId)

  let legacyTotal = 0
  const { data: lessons } = await supabase.from('lessons').select('id').eq('module_id', moduleDbId)
  const lessonIds = (lessons || []).map((l) => l.id)
  if (lessonIds.length) {
    const { data: legacy } = await supabase
      .from('courses_catalog')
      .select('price_cents, price')
      .in('lesson_id', lessonIds)
      .is('module_id', null)
    legacyTotal = sumCatalogRowsPriceCents(legacy)
  }

  return sumCatalogRowsPriceCents(direct) + legacyTotal
}

function buildModuleCatalogPayload(productLine, group, patch, { totalPriceCents = null } = {}) {
  const config = getProgramCurriculum(productLine)
  const baseCents =
    patch.price_cents !== '' && patch.price_cents != null && patch.price_cents !== undefined
      ? parseInt(patch.price_cents, 10) || null
      : null
  const priceCents = totalPriceCents != null && totalPriceCents > 0 ? totalPriceCents : baseCents
  const lessonCount = group.lessonCount ?? group.lessons?.length ?? 0
  const title = patch.title?.trim() || group.moduleTitle
  const coverUrl = patch.cover_url?.trim() || null

  return {
    slug: patch.catalog_slug?.trim(),
    line: config.line,
    sub: 'module',
    status: patch.status || COURSE_STATUS.LIVE,
    delivery_type: 'video',
    featured: false,
    purchasable: true,
    name: `${group.stage} · ${group.category} · ${title}`,
    name_en: title,
    description: patch.summary?.trim() || `${title} — ${lessonCount} lesson(s)`,
    price: patch.price?.trim() || (priceCents ? formatUsd(priceCents) : null),
    price_cents: priceCents,
    currency: (patch.currency || 'usd').trim().toLowerCase(),
    hours: `${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`,
    lessons: lessonCount,
    sort_order: parseInt(patch.sort_order, 10) || group.sortOrder || 0,
    rating: parseCatalogRating(patch.rating),
    students: parseCatalogStudents(patch.students),
    thumbnail_url: coverUrl,
  }
}

/** Save L3 module settings and sync purchasable courses_catalog row (sub=module). */
export async function saveProgramModuleConfig(productLine, moduleDbId, patch, groupContext = {}) {
  if (!isCurriculumLine(productLine)) throw new Error('Invalid product line')
  if (!moduleDbId) throw new Error('Missing module id')

  const priceCents =
    patch.price_cents !== '' && patch.price_cents != null && patch.price_cents !== undefined
      ? parseInt(patch.price_cents, 10) || null
      : null

  let catalogSlug = patch.catalog_slug?.trim() || null
  if (!catalogSlug && groupContext.levelSlug && groupContext.moduleSlug) {
    catalogSlug = buildModuleCatalogSlug(
      groupContext.levelSlug,
      groupContext.categorySlug || groupContext.themeSlug,
      groupContext.moduleSlug
    )
  }

  const data = await adminUpdate('modules', moduleDbId, {
    title: patch.title?.trim(),
    summary: patch.summary?.trim() || null,
    catalog_slug: catalogSlug,
    price_cents: priceCents,
    currency: (patch.currency || 'usd').trim().toLowerCase(),
    intro_html: patch.intro_html?.trim() || null,
    cover_url: patch.cover_url?.trim() || null,
    updated_at: new Date().toISOString(),
  })

  const baseCents = priceCents ?? 0

  if (catalogSlug && baseCents > 0) {
    await saveCatalogCourse(
      buildModuleCatalogPayload(
        productLine,
        { ...groupContext, moduleTitle: patch.title?.trim() || groupContext.moduleTitle },
        { ...patch, catalog_slug: catalogSlug, price_cents: priceCents }
      )
    )
  }

  return data
}

/** Re-sync module courses_catalog row (base price only; labs are optional add-ons) */
export async function resyncModuleCatalogPrice(productLine, moduleDbId) {
  if (!isCurriculumLine(productLine) || !moduleDbId) return

  const { data: mod } = await supabase
    .from('modules')
    .select(
      `
      id, slug, title, summary, catalog_slug, price_cents, currency, intro_html, cover_url, status, sort_order,
      theme:themes (
        slug, title, category_label,
        level:course_levels ( slug, title, product_line )
      ),
      lessons ( id )
    `
    )
    .eq('id', moduleDbId)
    .maybeSingle()

  if (!mod?.catalog_slug || mod.theme?.level?.product_line !== productLine) return

  const level = mod.theme?.level
  const theme = mod.theme
  const groupContext = {
    stage: level?.title || '',
    category: theme?.category_label || theme?.title || '',
    moduleTitle: mod.title,
    lessons: mod.lessons || [],
    sortOrder: mod.sort_order ?? 0,
  }

  const baseCents = mod.price_cents ?? 0
  if (baseCents <= 0) return

  await saveCatalogCourse(
    buildModuleCatalogPayload(
      productLine,
      groupContext,
      {
        title: mod.title,
        summary: mod.summary || '',
        catalog_slug: mod.catalog_slug,
        price_cents: baseCents,
        currency: mod.currency || 'usd',
        cover_url: mod.cover_url || '',
        status: mod.status || COURSE_STATUS.LIVE,
        sort_order: mod.sort_order ?? 0,
      }
    )
  )
}
export async function saveIOAIModuleConfig(moduleDbId, patch, ctx) {
  return saveProgramModuleConfig('ioai', moduleDbId, patch, ctx)
}

/** Delete L3 module, its L4 lessons (DB cascade), and linked catalog rows. Lab/material rows keep module_id=NULL. */
export async function deleteProgramModule(productLine, { moduleDbId } = {}) {
  if (!isCurriculumLine(productLine)) throw new Error('Invalid product line')
  if (!moduleDbId) throw new Error('Missing module id')

  const { data: mod, error } = await supabase
    .from('modules')
    .select(
      `
      id, catalog_slug,
      theme:themes ( level:course_levels ( product_line ) ),
      lessons ( id, slug, catalog_slug )
    `
    )
    .eq('id', moduleDbId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!mod) throw new Error('Module not found')
  if (mod.theme?.level?.product_line && mod.theme.level.product_line !== productLine) {
    throw new Error('Module does not belong to this product line')
  }

  const modSlug = mod.catalog_slug?.trim()
  if (modSlug) {
    try {
      await deleteCatalogCourse(modSlug)
    } catch (err) {
      if (err?.status !== 404) throw err
    }
  }

  for (const lesson of mod.lessons || []) {
    const slug = (lesson.catalog_slug || lesson.slug)?.trim()
    if (!slug) continue
    try {
      await deleteCatalogCourse(slug)
    } catch (err) {
      if (err?.status !== 404) throw err
    }
  }

  return adminDelete('modules', moduleDbId)
}

/** @deprecated use deleteProgramModule('ioai', input) */
export async function deleteIOAIModule(input) {
  return deleteProgramModule('ioai', input)
}

/** Delete a curriculum lesson and its linked L4 catalog row (if any). */
export async function deleteProgramLesson(_productLine, { lessonId, catalogSlug } = {}) {
  if (!lessonId) throw new Error('Missing lesson id')

  const slug = catalogSlug?.trim()
  if (slug) {
    try {
      await deleteCatalogCourse(slug)
    } catch (err) {
      if (err?.status !== 404) throw err
    }
  }

  return adminDelete('lessons', lessonId)
}

/** @deprecated use deleteProgramLesson('ioai', input) */
export async function deleteIOAILesson(input) {
  return deleteProgramLesson('ioai', input)
}
