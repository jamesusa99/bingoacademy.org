/**
 * Map URL paths to SEO/GEO page types for segmented reporting.
 */

export const PAGE_TYPES = {
  home: 'home',
  program: 'program',
  course: 'course',
  lab: 'lab',
  article: 'article',
  guide: 'guide',
  trust: 'trust',
  landing: 'landing',
  assessment: 'assessment',
  auth: 'auth',
  profile: 'profile',
  admin: 'admin',
  other: 'other',
}

export function resolvePageType(pathname = '/') {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return PAGE_TYPES.home
  if (path.startsWith('/programs/')) return PAGE_TYPES.program
  if (path.startsWith('/courses/') || path.startsWith('/ioai/') || path === '/curriculum') {
    return PAGE_TYPES.course
  }
  if (
    path.startsWith('/labs/') ||
    path.startsWith('/exploration') ||
    path === '/lab'
  ) {
    return PAGE_TYPES.lab
  }
  if (path.startsWith('/guides/')) return PAGE_TYPES.guide
  if (path.startsWith('/news/')) return PAGE_TYPES.article
  if (
    path.startsWith('/about') ||
    path.startsWith('/instructors') ||
    path.startsWith('/methodology') ||
    path.startsWith('/outcomes') ||
    path.startsWith('/safety-and-privacy')
  ) {
    return PAGE_TYPES.trust
  }
  if (
    path === '/try-ai' ||
    path === '/ioai-masterclass' ||
    path === '/ai-classes-for-kids' ||
    path === '/usaaio-prep'
  ) {
    return PAGE_TYPES.landing
  }
  if (path === '/assessment') return PAGE_TYPES.assessment
  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/auth/') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  ) {
    return PAGE_TYPES.auth
  }
  if (path.startsWith('/profile')) return PAGE_TYPES.profile
  if (path.startsWith('/admin')) return PAGE_TYPES.admin
  return PAGE_TYPES.other
}
