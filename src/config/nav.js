import { PROGRAMS, programPath } from './programs'

/** Main site navigation — Programs dropdown + core sections */
export const programsNav = {
  label: 'Programs',
  items: PROGRAMS.map((p) => ({
    path: programPath(p.slug),
    label: p.title,
    icon: p.icon,
    desc: p.audience,
  })),
}

export const mainNavGroups = [
  [{ path: '/', label: 'Home' }],
  [
    { type: 'programs-dropdown', label: 'Programs' },
    { path: '/courses', label: 'Courses' },
    { path: '/curriculum', label: 'Video Lessons' },
    { path: '/labs', label: 'Labs' },
    { path: '/exploration', label: 'AI Exploration' },
  ],
  [
    { path: '/compare', label: 'Compare' },
    { path: '/showcase', label: 'Achievements' },
    { path: '/cert', label: 'Pricing' },
    { path: '/community', label: 'Community' },
  ],
  [
    { path: '/mall', label: 'AI Mall' },
    { path: '/profile', label: 'Profile' },
  ],
]

export const authNav = [
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
]

/** Flat list for mobile scroll (programs expanded) */
export const mainNav = [
  { path: '/', label: 'Home' },
  ...PROGRAMS.map((p) => ({ path: programPath(p.slug), label: p.icon + ' ' + p.title.split(' ')[0] })),
  { path: '/courses', label: 'Courses' },
  { path: '/curriculum', label: 'Video Lessons' },
  { path: '/labs', label: 'Labs' },
  { path: '/exploration', label: 'Explore' },
  { path: '/compare', label: 'Compare' },
  { path: '/showcase', label: 'Achievements' },
  { path: '/cert', label: 'Pricing' },
  { path: '/community', label: 'Community' },
  { path: '/mall', label: 'Mall' },
  { path: '/profile', label: 'Profile' },
]
