/** Logged-in student navigation — learning workspace (no marketing entries) */

export const STUDENT_NAV = [
  { path: '/profile/study', label: 'Study Center' },
  { path: '/ioai/curriculum', label: 'My Course' },
  { path: '/profile', hash: 'progress', label: 'Progress' },
  { path: '/profile', hash: 'support', label: 'Support' },
  { path: '/profile', label: 'Profile' },
]

export function studentNavTo(item) {
  if (item.hash) return { pathname: item.path, hash: `#${item.hash}` }
  return item.path
}

export function isStudentNavActive(loc, item) {
  if (item.hash === 'progress') {
    return loc.pathname === '/profile' && loc.hash === '#progress'
  }
  if (item.hash === 'support') {
    return loc.pathname === '/profile' && loc.hash === '#support'
  }
  if (item.label === 'Profile') {
    return loc.pathname === '/profile' && !loc.hash
  }
  if (item.path === '/profile/study') {
    return loc.pathname === '/profile/study' || loc.pathname.startsWith('/profile/study/')
  }
  if (item.path === '/ioai/curriculum') {
    return loc.pathname === '/ioai/curriculum' || (loc.pathname === '/curriculum' && loc.search.includes('line=ioai'))
  }
  return loc.pathname === item.path
}

/** Footer links for authenticated students */
export const STUDENT_FOOTER_NAV = [
  { path: '/profile/study', label: 'Study Center' },
  { path: '/ioai/curriculum', label: 'My Course' },
  { path: '/profile', hash: 'progress', label: 'Progress' },
  { path: '/profile', hash: 'support', label: 'Support' },
  { path: '/profile', label: 'Profile' },
]
