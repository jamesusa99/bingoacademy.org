import { supabase, isSupabaseConfigured } from './supabase'
import { COURSE_CATALOG, COURSE_STATUS, isCourseOffline } from '../config/coursesCatalog'
import { VIDEO_COURSE_SUB_BY_LINE } from '../config/courseListFilters'
import { PRODUCT_LINES } from '../config/products'
import {
  LAB_MATERIAL_TYPES,
  deliveryTypeForLabSub,
  normalizeLabMaterialSub,
} from '../config/labMaterials'
import {
  DEFAULT_ADMIN_PRODUCT_LINE,
  getProgramCurriculum,
  isCurriculumLine,
} from '../config/programCurriculum'
import { initialCatalogPriceFields, resolveCatalogPriceCents, formatPriceFromCents } from './coursePricing'
import { findLessonInTree } from './ioaiCourseStructure'
import { resolveLessonCatalogSlug, inferModuleCatalogSlugFromLessonSlug } from './ioaiStore'
import { IOAI_MODULE_PREVIEW_SECONDS } from '../config/ioaiPreview'

/** Default subcategory when switching product line in admin */
export function defaultSubForLine(lineId) {
  if (VIDEO_COURSE_SUB_BY_LINE[lineId]) return VIDEO_COURSE_SUB_BY_LINE[lineId]
  const line = PRODUCT_LINES.find((p) => p.id === lineId)
  return line?.subcategories[0]?.id || 'course'
}

/** Subcategories for Lab & Materials admin (5 unified types; excludes video & books) */
export function labMaterialsSubcategoriesForLine(_lineId) {
  return LAB_MATERIAL_TYPES
}

export function defaultLabMaterialsSubForLine(lineId) {
  return lineId === 'ioai' ? 'training-lab' : 'online-lab'
}

export function isLabMaterialsCatalogRow(row) {
  if (!row?.line || !row?.sub) return false
  if (VIDEO_COURSE_SUB_BY_LINE[row.line] === row.sub) return false
  if (row.sub === 'books' || row.sub === 'module' || row.sub === 'bundle') return false
  return true
}

/** Frontend catalog course object — lab / material kit (not video lesson or L3 module) */
export function isLabMaterialCatalogCourse(course) {
  if (!course?.line || !course?.sub) return false
  return isLabMaterialsCatalogRow({ line: course.line, sub: course.sub })
}

/** Map Supabase courses_catalog row → frontend course object */
export function rowToCatalogCourse(row) {
  return {
    id: row.slug,
    line: row.line,
    sub: row.sub,
    status: row.status || COURSE_STATUS.LIVE,
    deliveryType: row.delivery_type,
    featured: !!row.featured,
    name: row.name,
    nameEn: row.name_en || row.name,
    desc: row.description || '',
    price: row.price || '',
    priceCents: row.price_cents ?? null,
    currency: row.currency || 'usd',
    purchasable: row.purchasable ?? null,
    hours: row.hours || '',
    badge: row.badge || '',
    audience: row.audience || '',
    outcomes: row.outcomes || [],
    syllabus: row.syllabus || [],
    labSlugs: row.lab_slugs || [],
    materialsList: row.materials_list || [],
    category: row.category || 'ai-fundamentals',
    level: row.level || 'beginner',
    lessons: row.lessons ?? 12,
    rating: row.rating != null ? Number(row.rating) : 4.8,
    students: row.students ?? 800,
    thumbnail: row.thumbnail_url || null,
    sortOrder: row.sort_order ?? 0,
    videoUrl: row.video_url || null,
    videoPoster: row.video_poster || null,
    previewSeconds: row.preview_seconds ?? 90,
    cloudflareUid: row.cloudflare_uid || null,
    lessonId: row.lesson_id || null,
    moduleId: row.module_id || null,
  }
}

/** Map admin form → API payload */
export function formToCatalogPayload(form) {
  const parseJsonList = (raw, fallback = []) => {
    if (!raw?.trim()) return fallback
    try {
      const v = JSON.parse(raw)
      return Array.isArray(v) ? v : fallback
    } catch {
      return String(raw)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }

  const sub = normalizeLabMaterialSub(form.sub, form.line)
  const priceCents = resolveCatalogPriceCents(form.price, form.price_cents)
  const purchasableExplicit =
    form.purchasable === true || form.purchasable === 'true'
      ? true
      : form.purchasable === false || form.purchasable === 'false'
        ? false
        : null

  return {
    slug: form.slug?.trim(),
    line: form.line,
    sub,
    lesson_id: form.lesson_id || null,
    module_id: form.module_id || null,
    status: form.status || 'live',
    delivery_type: form.delivery_type || deliveryTypeForLabSub(sub, form.line),
    featured: !!form.featured,
    name: form.name?.trim(),
    name_en: form.name_en?.trim() || null,
    description: form.description?.trim() || null,
    price: form.price?.trim() || (priceCents ? formatPriceFromCents(priceCents, form.currency || 'usd') : null),
    price_cents: priceCents,
    currency: form.currency?.trim()?.toLowerCase() || 'usd',
    purchasable: purchasableExplicit ?? (priceCents != null && priceCents > 0),
    hours: form.hours?.trim() || null,
    badge: form.badge?.trim() || null,
    audience: form.audience?.trim() || null,
    outcomes: parseJsonList(form.outcomes),
    syllabus: parseJsonList(form.syllabus),
    lab_slugs: parseJsonList(form.lab_slugs),
    materials_list: parseJsonList(form.materials_list),
    sort_order: parseInt(form.sort_order, 10) || 0,
    category: form.category || 'ai-fundamentals',
    level: form.level || 'beginner',
    lessons: parseInt(form.lessons, 10) || 12,
    rating: form.rating !== '' ? Number(form.rating) : 4.8,
    students: parseInt(form.students, 10) || 800,
    thumbnail_url: form.thumbnail_url?.trim() || null,
    video_url: form.video_url?.trim() || null,
    video_poster: form.video_poster?.trim() || null,
    preview_seconds: form.preview_seconds !== '' ? parseInt(form.preview_seconds, 10) || 90 : 90,
    cloudflare_uid: form.cloudflare_uid?.trim() || null,
  }
}

export function catalogRowToForm(row) {
  if (!row) return null
  const { price, price_cents } = initialCatalogPriceFields({
    price: row.price || '',
    priceCents: row.price_cents,
    currency: row.currency || 'usd',
  })
  return {
    slug: row.slug || '',
    line: row.line || DEFAULT_ADMIN_PRODUCT_LINE,
    sub: normalizeLabMaterialSub(row.sub, row.line),
    lesson_id: row.lesson_id || '',
    module_id: row.module_id || '',
    status: row.status || 'live',
    delivery_type: row.delivery_type || '',
    featured: !!row.featured,
    name: row.name || '',
    name_en: row.name_en || '',
    description: row.description || '',
    price,
    price_cents,
    currency: row.currency || 'usd',
    purchasable: row.purchasable ?? '',
    hours: row.hours || '',
    badge: row.badge || '',
    audience: row.audience || '',
    outcomes: JSON.stringify(row.outcomes || [], null, 2),
    syllabus: JSON.stringify(row.syllabus || [], null, 2),
    lab_slugs: JSON.stringify(row.lab_slugs || [], null, 2),
    materials_list: JSON.stringify(row.materials_list || [], null, 2),
    sort_order: row.sort_order ?? 0,
    category: row.category || 'ai-fundamentals',
    level: row.level || 'beginner',
    lessons: row.lessons ?? 12,
    rating: row.rating ?? 4.8,
    students: row.students ?? 800,
    thumbnail_url: row.thumbnail_url || '',
    video_url: row.video_url || '',
    video_poster: row.video_poster || '',
    preview_seconds: row.preview_seconds ?? 90,
    cloudflare_uid: row.cloudflare_uid || '',
  }
}

const EMPTY_FORM = {
  slug: '',
  line: DEFAULT_ADMIN_PRODUCT_LINE,
  sub: defaultLabMaterialsSubForLine(DEFAULT_ADMIN_PRODUCT_LINE),
  lesson_id: '',
  module_id: '',
  status: 'live',
  delivery_type: 'lab',
  featured: false,
  name: '',
  name_en: '',
  description: '',
  price: '',
  price_cents: '',
  currency: 'usd',
  purchasable: true,
  hours: '12 sessions',
  badge: '',
  audience: '',
  outcomes: '[]',
  syllabus: '[]',
  lab_slugs: '[]',
  materials_list: '[]',
  sort_order: 0,
  category: 'ai-fundamentals',
  level: 'beginner',
  lessons: 12,
  rating: 4.8,
  students: 800,
  thumbnail_url: '',
  video_url: '',
  video_poster: '',
  preview_seconds: 90,
  cloudflare_uid: '',
}

export { EMPTY_FORM as CATALOG_FORM_EMPTY }

/** Load catalogue from Supabase when configured; no static merge when DB is available */
export async function fetchCourseCatalog() {
  if (!isSupabaseConfigured) {
    return { courses: [...COURSE_CATALOG], source: 'static' }
  }

  const { data, error } = await supabase.from('courses_catalog').select('*').order('sort_order')

  if (error) {
    return { courses: [], source: 'supabase', error: error.message }
  }

  return {
    courses: (data || []).map(rowToCatalogCourse),
    source: 'supabase',
  }
}

export function findCourseInList(courses, id) {
  return courses.find((c) => c.id === id) ?? null
}

/** Infer curriculum product line from catalog row or lesson slug prefix. */
export function inferProgramLineForSlug(id, catalogItem = null) {
  if (catalogItem?.line && isCurriculumLine(catalogItem.line)) return catalogItem.line
  if (!id || typeof id !== 'string') return null
  for (const line of ['ioai', 'general', 'k12']) {
    const prefix = getProgramCurriculum(line).slugPrefix
    if (id.startsWith(`${prefix}-`)) return line
  }
  return null
}

/** Merge curriculum-tree lesson metadata into a storefront catalog course row. */
export function buildLessonCatalogCourse(found, productLine, catalogRow = null) {
  const config = getProgramCurriculum(productLine)
  const lesson = found.lesson
  const slug = resolveLessonCatalogSlug(lesson)
  const cloudflareUid =
    catalogRow?.cloudflareUid ||
    lesson.cloudflareVideoId ||
    lesson.cloudflare_video_id ||
    null

  return {
    ...(catalogRow || {}),
    id: slug,
    line: config.line,
    sub: config.catalogSub,
    deliveryType: catalogRow?.deliveryType || 'video',
    status: catalogRow?.status || (lesson.status === 'offline' ? COURSE_STATUS.OFFLINE : COURSE_STATUS.LIVE),
    name: catalogRow?.name || lesson.title || slug,
    nameEn: catalogRow?.nameEn || lesson.title || slug,
    desc:
      catalogRow?.desc ||
      lesson.contentGoals ||
      lesson.content_goals ||
      lesson.knowledgePoints ||
      lesson.knowledge_points ||
      '',
    cloudflareUid,
    previewSeconds: catalogRow?.previewSeconds ?? IOAI_MODULE_PREVIEW_SECONDS,
    hours: catalogRow?.hours || '',
    price: catalogRow?.price || config.catalogPrice,
    badge: catalogRow?.badge || 'IOAI',
    outcomes: catalogRow?.outcomes || [],
    syllabus: catalogRow?.syllabus || [],
    labSlugs: catalogRow?.labSlugs || [],
    sortOrder: catalogRow?.sortOrder ?? lesson.sortOrder ?? 0,
    golabEnabled: Boolean(
      lesson.golabEnabled ?? lesson.golab_enabled ?? catalogRow?.golabEnabled
    ),
  }
}

/** Minimal catalog row for program lesson slugs when DB tree/catalog sync is missing. */
export function synthesizeProgramLessonItem(id, productLine) {
  if (!id || !productLine || !isCurriculumLine(productLine)) return null
  const config = getProgramCurriculum(productLine)
  const trackSlug = config.trackSlug
  if (id === trackSlug) return null

  const prefix = config.slugPrefix
  if (!id.startsWith(`${prefix}-`)) return null

  const isIoaiLesson = productLine === 'ioai' && inferModuleCatalogSlugFromLessonSlug(id)
  const isNumberedLesson = /-(l\d+|c\d+)$/i.test(id)
  if (!isIoaiLesson && !isNumberedLesson) return null

  return {
    id,
    line: config.line,
    sub: config.catalogSub,
    deliveryType: 'video',
    status: 'live',
    name: id,
    nameEn: id,
    desc: '',
    cloudflareUid: null,
    previewSeconds: IOAI_MODULE_PREVIEW_SECONDS,
    hours: '',
    price: config.catalogPrice,
    badge: productLine === 'ioai' ? 'IOAI' : config.line,
    outcomes: [],
    syllabus: [],
    labSlugs: [],
    sortOrder: 0,
  }
}

/**
 * Resolve /courses/detail/:id — catalog row plus curriculum tree (video uid, titles).
 * Stale offline catalog rows must not block live curriculum lessons or synthesized slugs.
 */
export function resolveCourseDetailItem(courses, id, tree, { includeOfflineCatalog = false } = {}) {
  if (!id) return { item: null, productLine: null }

  const rawCatalogItem = findCourseInList(courses, id)
  const productLine = inferProgramLineForSlug(id, rawCatalogItem)
  const found = tree?.length && productLine ? findLessonInTree(id, tree) : null

  if (found && productLine) {
    const catalogRow =
      rawCatalogItem && (!isCourseOffline(rawCatalogItem) || includeOfflineCatalog)
        ? rawCatalogItem
        : null
    return { item: buildLessonCatalogCourse(found, productLine, catalogRow), productLine }
  }

  const catalogActive =
    rawCatalogItem && (!isCourseOffline(rawCatalogItem) || includeOfflineCatalog)

  if (catalogActive) {
    return {
      item: rawCatalogItem,
      productLine: productLine || (isCurriculumLine(rawCatalogItem.line) ? rawCatalogItem.line : null),
    }
  }

  const synthesized = productLine ? synthesizeProgramLessonItem(id, productLine) : null
  if (synthesized) {
    const item = rawCatalogItem
      ? {
          ...synthesized,
          name: rawCatalogItem.name || synthesized.name,
          nameEn: rawCatalogItem.nameEn || rawCatalogItem.name || synthesized.nameEn,
          desc: rawCatalogItem.desc || synthesized.desc,
          cloudflareUid: rawCatalogItem.cloudflareUid || synthesized.cloudflareUid,
        }
      : synthesized
    return { item, productLine }
  }

  if (rawCatalogItem && includeOfflineCatalog) {
    return { item: rawCatalogItem, productLine }
  }

  return { item: null, productLine }
}

/** Normalize pack learning outcomes from JSONB, JSON string, or newline text */
export function parseOutcomesList(raw) {
  if (Array.isArray(raw)) {
    return raw.map((line) => String(line).trim()).filter(Boolean)
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((line) => String(line).trim()).filter(Boolean)
      }
    } catch {
      return raw.split('\n').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

/** Merge API lab pack + storefront catalog row for hero display */
export function mergeLabPackDisplayItem(pack, catalogCourse) {
  const fromApi = pack || {}
  const fromCatalog = catalogCourse || {}
  const outcomesFromApi = parseOutcomesList(fromApi.outcomes)
  const outcomesFromCatalog = parseOutcomesList(fromCatalog.outcomes)
  const description =
    String(fromApi.description || '').trim() ||
    String(fromCatalog.desc || fromCatalog.description || '').trim()

  return {
    line: fromApi.line || fromCatalog.line,
    sub: fromApi.sub || fromCatalog.sub,
    name: fromApi.name || fromCatalog.name,
    nameEn:
      fromApi.nameEn ||
      fromApi.name_en ||
      fromCatalog.nameEn ||
      fromApi.name ||
      fromCatalog.name,
    description,
    hours: fromApi.hours || fromCatalog.hours || '',
    audience: fromApi.audience || fromCatalog.audience || '',
    outcomes: outcomesFromApi.length ? outcomesFromApi : outcomesFromCatalog,
  }
}
