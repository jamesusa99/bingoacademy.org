import { supabase, isSupabaseConfigured } from './supabase'
import { COURSE_CATALOG, COURSE_STATUS } from '../config/coursesCatalog'
import { VIDEO_COURSE_SUB_BY_LINE } from '../config/courseListFilters'
import { PRODUCT_LINES } from '../config/products'

/** Default subcategory when switching product line in admin */
export function defaultSubForLine(lineId) {
  if (VIDEO_COURSE_SUB_BY_LINE[lineId]) return VIDEO_COURSE_SUB_BY_LINE[lineId]
  const line = PRODUCT_LINES.find((p) => p.id === lineId)
  return line?.subcategories[0]?.id || 'course'
}

/** Subcategories for Lab & Materials admin (excludes AI Video Courses) */
export function labMaterialsSubcategoriesForLine(lineId) {
  const line = PRODUCT_LINES.find((p) => p.id === lineId)
  if (!line) return []
  const videoSub = VIDEO_COURSE_SUB_BY_LINE[lineId]
  return line.subcategories.filter((s) => s.id !== videoSub)
}

export function defaultLabMaterialsSubForLine(lineId) {
  return labMaterialsSubcategoriesForLine(lineId)[0]?.id || 'online-lab'
}

export function isLabMaterialsCatalogRow(row) {
  if (!row?.line || !row?.sub) return true
  return VIDEO_COURSE_SUB_BY_LINE[row.line] !== row.sub
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

  return {
    slug: form.slug?.trim(),
    line: form.line,
    sub: form.sub || null,
    status: form.status || 'live',
    delivery_type: form.delivery_type || null,
    featured: !!form.featured,
    name: form.name?.trim(),
    name_en: form.name_en?.trim() || null,
    description: form.description?.trim() || null,
    price: form.price?.trim() || null,
    price_cents: form.price_cents !== '' && form.price_cents != null ? parseInt(form.price_cents, 10) || null : null,
    currency: form.currency?.trim()?.toLowerCase() || 'usd',
    purchasable: form.purchasable === '' || form.purchasable == null ? null : !!form.purchasable,
    hours: form.hours?.trim() || null,
    badge: form.badge?.trim() || null,
    audience: form.audience?.trim() || null,
    outcomes: parseJsonList(form.outcomes),
    syllabus: parseJsonList(form.syllabus),
    lab_slugs: parseJsonList(form.lab_slugs),
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
  return {
    slug: row.slug || '',
    line: row.line || 'general',
    sub: row.sub || '',
    status: row.status || 'live',
    delivery_type: row.delivery_type || '',
    featured: !!row.featured,
    name: row.name || '',
    name_en: row.name_en || '',
    description: row.description || '',
    price: row.price || '',
    price_cents: row.price_cents ?? '',
    currency: row.currency || 'usd',
    purchasable: row.purchasable ?? '',
    hours: row.hours || '',
    badge: row.badge || '',
    audience: row.audience || '',
    outcomes: JSON.stringify(row.outcomes || [], null, 2),
    syllabus: JSON.stringify(row.syllabus || [], null, 2),
    lab_slugs: JSON.stringify(row.lab_slugs || [], null, 2),
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
  line: 'general',
  sub: 'online-lab',
  status: 'live',
  delivery_type: 'lab',
  featured: false,
  name: '',
  name_en: '',
  description: '',
  price: '',
  price_cents: '',
  currency: 'usd',
  purchasable: '',
  hours: '12 sessions',
  badge: '',
  audience: '',
  outcomes: '[]',
  syllabus: '[]',
  lab_slugs: '[]',
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
