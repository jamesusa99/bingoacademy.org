/** Grouped sidebar navigation for the admin console */
export const ADMIN_NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
      { path: '/admin/settings', label: 'Platform', icon: '⚙️' },
    ],
  },
  {
    title: 'Content',
    items: [
      { path: '/admin/home', label: 'Home Portal', icon: '🏠' },
      { path: '/admin/courses', label: 'Courses', icon: '📚' },
      { path: '/admin/showcase', label: 'Achievements', icon: '🏅' },
      { path: '/admin/research', label: 'AI Camp', icon: '⛺' },
      { path: '/admin/events', label: 'Events', icon: '🏆' },
      { path: '/admin/mentors', label: 'Instructors', icon: '👤' },
      { path: '/admin/career', label: 'Careers', icon: '💼' },
      { path: '/admin/cert', label: 'Certification', icon: '📜' },
      { path: '/admin/charity', label: 'Honors & Charity', icon: '🎗️' },
      { path: '/admin/forum', label: 'Forum', icon: '💬' },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { path: '/admin/mall-products', label: 'Mall Products', icon: '🛒' },
      { path: '/admin/payments', label: 'Payments', icon: '💳' },
    ],
  },
  {
    title: 'Media & platform',
    items: [
      { path: '/admin/video', label: 'Video (Stream)', icon: '🎬' },
      { path: '/admin/users', label: 'User management', icon: '👥' },
    ],
  },
]

export function isAdminNavActive(pathname, path, end = false) {
  if (end) return pathname === path
  return pathname === path || pathname.startsWith(`${path}/`)
}
