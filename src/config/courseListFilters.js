/** Filter options for AI Video Courses list (design spec §3.2) */

export const COURSE_CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'AI Fundamentals', value: 'ai-fundamentals' },
  { label: 'Machine Learning', value: 'machine-learning' },
  { label: 'Deep Learning', value: 'deep-learning' },
  { label: 'NLP', value: 'nlp' },
  { label: 'Computer Vision', value: 'computer-vision' },
]

export const COURSE_LEVELS = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

export const COURSE_PRICE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
]

export const COURSE_SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low–High', value: 'price-asc' },
  { label: 'Price: High–Low', value: 'price-desc' },
]

export const COURSES_PER_PAGE = 9

/** Subcategory id that maps to “AI Video Courses” per product line */
export const VIDEO_COURSE_SUB_BY_LINE = {
  general: 'course',
  ioai: 'video',
  k12: 'course',
}

export function isVideoCoursesSub(lineId, subId) {
  return Boolean(subId && VIDEO_COURSE_SUB_BY_LINE[lineId] === subId)
}
