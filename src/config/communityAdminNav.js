/** Admin sidebar: Community hub sections (mirrors /community tabs) */

export const COMMUNITY_ADMIN_BASE = '/admin/community'

export const COMMUNITY_ADMIN_SECTIONS = [
  { id: 'home', path: '/admin/community/home', labelKey: 'nav.communityHome', icon: '🏠' },
  { id: 'forum', path: '/admin/community/forum', labelKey: 'nav.communityForum', icon: '💬' },
  { id: 'scholars', path: '/admin/community/scholars', labelKey: 'nav.communityScholars', icon: '⭐' },
  { id: 'courses', path: '/admin/community/courses', labelKey: 'nav.communityCourses', icon: '📜' },
  { id: 'mentors', path: '/admin/community/mentors', labelKey: 'nav.communityMentors', icon: '🏆' },
  { id: 'partners', path: '/admin/community/partners', labelKey: 'nav.communityPartners', icon: '🏫' },
  { id: 'checkin', path: '/admin/community/checkin', labelKey: 'nav.communityCheckin', icon: '📅' },
]

export const COMMUNITY_ADMIN_COLLAPSIBLE = {
  type: 'collapsible',
  id: 'community',
  labelKey: 'nav.communityHub',
  icon: '🏘️',
  basePath: COMMUNITY_ADMIN_BASE,
  children: COMMUNITY_ADMIN_SECTIONS,
}

export function isCommunityAdminPath(pathname) {
  return pathname === COMMUNITY_ADMIN_BASE || pathname.startsWith(`${COMMUNITY_ADMIN_BASE}/`)
}

export function communitySectionFromPath(pathname) {
  const match = COMMUNITY_ADMIN_SECTIONS.find(
    (s) => pathname === s.path || pathname.startsWith(`${s.path}/`)
  )
  return match?.id ?? null
}
