// Main nav groups: groups separated by dividers
export const mainNavGroups = [
  [{ path: '/', label: 'Home' }],
  [{ path: '/showcase', label: 'Showcase' }],
  [
    { path: '/courses', label: 'AI Courses' },
    { path: '/research', label: 'Science Camp' },
    { path: '/events', label: 'Events Center' },
    { path: '/community', label: 'AI Community' },
    { path: '/growth', label: 'Growth Plan' },
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
