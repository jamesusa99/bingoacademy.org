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
  [{ path: '/career', label: 'Smart Careers' }],
  [{ path: '/cert', label: 'Certification' }],
  [{ path: '/mall', label: 'AI Mall' }],
  [{ path: '/charity', label: 'Honors & Charity' }],
]

// Auth nav (right side — Profile, Login, Register)
export const authNav = [
  { path: '/profile', label: 'Profile' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
]

export const allNavGroups = [...mainNavGroups, authNav]
export const mainNav = mainNavGroups.flat()
