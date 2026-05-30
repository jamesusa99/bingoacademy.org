import { isCourseComingSoon } from '../config/coursesCatalog'
import { buildIOAICourseListMeta } from '../config/ioaiCourseSystem'

const IOAI_LIST_META = buildIOAICourseListMeta()

/** Per-course list metadata (category, level, engagement) — also used by seed */
export const COURSE_LIST_META = {
  ...IOAI_LIST_META,
  'g-literacy': { category: 'ai-fundamentals', level: 'beginner', lessons: 36, rating: 4.7, students: 3200 },
  'g1': { category: 'ai-fundamentals', level: 'beginner', lessons: 12, rating: 4.8, students: 1840 },
  'k-classroom': { category: 'ai-fundamentals', level: 'beginner', lessons: 24, rating: 4.6, students: 680 },
  'k2': { category: 'ai-fundamentals', level: 'beginner', lessons: 24, rating: 4.6, students: 540 },
}

const THUMB_GRADIENTS = {
  general: 'from-cyan-600/80 via-primary/70 to-sky-900',
  ioai: 'from-amber-500/80 via-orange-600/70 to-amber-950',
  k12: 'from-violet-600/80 via-purple-600/70 to-violet-950',
}

export function parsePrice(priceStr = '') {
  const s = String(priceStr).toLowerCase()
  if (!s || s.includes('coming soon') || s.includes('quote')) {
    return { amount: null, isFree: false, unknown: true }
  }
  if (s.includes('free') || s === '$0') {
    return { amount: 0, isFree: true, unknown: false }
  }
  const match = s.replace(/,/g, '').match(/\$?([\d.]+)/)
  const amount = match ? parseFloat(match[1]) : null
  return { amount, isFree: amount === 0, unknown: amount == null }
}

function parseLessons(hours = '') {
  const m = String(hours).match(/(\d+)\s*session/i)
  if (m) return parseInt(m[1], 10)
  const w = String(hours).match(/(\d+)\s*week/i)
  if (w) return parseInt(w[1], 10) * 2
  return 12
}

function parseDuration(hours = '') {
  const h = String(hours)
  if (/session/i.test(h)) return h.replace(/·.*/, '').trim()
  if (/week/i.test(h)) return h.split('·')[0].trim()
  return h || '12 hours'
}

export function enrichCourseForList(item) {
  const meta = COURSE_LIST_META[item.id] || {}
  const priceInfo = parsePrice(item.price)
  const comingSoon = isCourseComingSoon(item)

  return {
    ...item,
    category: item.category || meta.category || 'ai-fundamentals',
    level: item.level || meta.level || 'beginner',
    lessons: item.lessons ?? meta.lessons ?? parseLessons(item.hours),
    rating: item.rating ?? meta.rating ?? 4.8,
    students: item.students ?? meta.students ?? 800,
    duration: parseDuration(item.hours),
    priceNumeric: priceInfo.amount,
    isFree: priceInfo.isFree,
    priceUnknown: priceInfo.unknown || comingSoon,
    thumbnailGradient: THUMB_GRADIENTS[item.line] || THUMB_GRADIENTS.general,
    comingSoon,
  }
}

export function filterAndSortCourses(courses, filters) {
  let list = courses.map(enrichCourseForList)

  const q = (filters.search || '').trim().toLowerCase()
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        (c.badge && c.badge.toLowerCase().includes(q))
    )
  }

  if (filters.category && filters.category !== 'all') {
    list = list.filter((c) => c.category === filters.category)
  }

  if (filters.level && filters.level !== 'all') {
    list = list.filter((c) => c.level === filters.level)
  }

  if (filters.price === 'free') {
    list = list.filter((c) => c.isFree)
  } else if (filters.price === 'paid') {
    list = list.filter((c) => !c.isFree && !c.priceUnknown)
  }

  const sort = filters.sort || 'popular'
  list = [...list].sort((a, b) => {
    if (sort === 'newest') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name)
    }
    if (sort === 'price-asc') {
      return (a.priceNumeric ?? 99999) - (b.priceNumeric ?? 99999)
    }
    if (sort === 'price-desc') {
      return (b.priceNumeric ?? -1) - (a.priceNumeric ?? -1)
    }
    return b.students - a.students
  })

  return list
}

export function paginateCourses(courses, page, perPage) {
  const total = courses.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage
  return {
    items: courses.slice(start, start + perPage),
    page: safePage,
    totalPages,
    total,
  }
}
