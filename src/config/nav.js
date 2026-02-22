// Main nav groups: groups separated by dividers
export const mainNavGroups = [
  [{ path: '/', label: 'AI Era Portal' }],
  [{ path: '/showcase', label: 'Achievements' }],
  [
    { path: '/courses', label: 'AI Courses' },
    { path: '/research', label: 'AI Camp' },
    { path: '/events', label: 'Events Center' },
    { path: '/community', label: 'AI Community' },
  ],
  [{ path: '/cert', label: 'Certification' }],
  [{ path: '/mall', label: 'AI Mall' }],
  [{ path: '/charity', label: 'Honors & Charity' }],
  [{ path: '/profile', label: 'Profile' }],
]

// Auth nav
export const authNav = [
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
]

export const allNavGroups = [...mainNavGroups, authNav]
export const mainNav = mainNavGroups.flat()
