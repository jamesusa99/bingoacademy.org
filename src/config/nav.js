// Bingo AI Academy · main navigation
export const mainNavGroups = [
  [{ path: '/', label: 'AI Era Portal' }],
  [
    { path: '/assessment', label: 'Assessment' },
    { path: '/courses', label: 'AI Courses' },
    { path: '/lab', label: 'AI Exploration Lab' },
  ],
  [
    { path: '/showcase', label: 'Achievements' },
    { path: '/cert', label: 'Certification' },
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

export const mainNav = mainNavGroups.flat()
