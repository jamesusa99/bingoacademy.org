// Main nav — short labels for compact header
export const mainNavGroups = [
  [{ path: '/', label: 'Home' }],
  [{ path: '/showcase', label: 'Achievements' }],
  [
    { path: '/courses', label: 'Courses' },
    { path: '/research', label: 'AI Camp' },
    { path: '/events', label: 'Events' },
    { path: '/community', label: 'Community' },
  ],
  [{ path: '/career', label: 'Careers' }],
  [{ path: '/cert', label: 'Cert' }],
  [{ path: '/mall', label: 'Mall' }],
  [{ path: '/charity', label: 'Honors' }],
]

// Auth nav (right side)
export const authNav = [
  { path: '/profile', label: 'Profile' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
]

export const allNavGroups = [...mainNavGroups, authNav]
export const mainNav = mainNavGroups.flat()
