// Bingo AI Academy · main navigation
import { NAV_PROGRAMS } from './programs'

export const programsNav = {
  label: 'Programs',
  items: NAV_PROGRAMS,
}

export const mainNavPrimary = [
  programsNav,
  { path: '/courses', label: 'Courses' },
  { path: '/lab', label: 'Labs' },
  { path: '/exploration', label: 'AI Exploration', highlight: true },
  { path: '/pricing', label: 'Pricing' },
]

export const mainNavSecondary = [
  { path: '/assessment', label: 'Assessment' },
  { path: '/showcase', label: 'Achievements' },
  { path: '/cert', label: 'Certification' },
  { path: '/community', label: 'Community' },
  { path: '/mall', label: 'AI Mall' },
]

/** @deprecated flat list for mobile/footer fallbacks */
export const mainNavGroups = [
  [{ path: '/', label: 'Home' }],
  mainNavPrimary.filter((n) => !n.items).map(({ path, label, highlight }) => ({ path, label, highlight })),
  mainNavSecondary,
  [{ path: '/profile', label: 'Profile' }],
]

export const mainNav = [
  { path: '/', label: 'Home' },
  ...NAV_PROGRAMS.map((p) => ({ path: p.href, label: p.label })),
  ...mainNavPrimary.filter((n) => !n.items),
  ...mainNavSecondary,
  { path: '/compare', label: 'Compare' },
]

export const authNav = [
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
]
