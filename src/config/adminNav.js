import { COMMUNITY_ADMIN_COLLAPSIBLE } from './communityAdminNav'
import { MALL_ADMIN_COLLAPSIBLE } from './mallAdminNav'
import {
  GENERAL_ADMIN_COLLAPSIBLE,
  IOAI_ADMIN_COLLAPSIBLE,
  K12_ADMIN_COLLAPSIBLE,
} from './curriculumAdminNav'

/** Admin path for Lab & Materials catalogue (courses_catalog non-video items) */
export const ADMIN_LABS_MATERIALS_PATH = '/admin/labs-materials'

/** Grouped sidebar navigation for the admin console (labels via adminI18n) */
export const ADMIN_NAV_GROUPS = [
  {
    titleKey: 'nav.group.overview',
    items: [
      { path: '/admin', labelKey: 'nav.dashboard', icon: '📊', end: true },
      { path: '/admin/settings', labelKey: 'nav.platform', icon: '⚙️' },
    ],
  },
  {
    titleKey: 'nav.group.content',
    items: [
      { path: '/admin/home', labelKey: 'nav.homePortal', icon: '🏠' },
      { path: ADMIN_LABS_MATERIALS_PATH, labelKey: 'nav.courses', icon: '🧪' },
      IOAI_ADMIN_COLLAPSIBLE,
      GENERAL_ADMIN_COLLAPSIBLE,
      K12_ADMIN_COLLAPSIBLE,
      { path: '/admin/showcase', labelKey: 'nav.achievements', icon: '🏅' },
      { path: '/admin/news', labelKey: 'nav.news', icon: '📰' },
      { path: '/admin/cert', labelKey: 'nav.certification', icon: '📜' },
      COMMUNITY_ADMIN_COLLAPSIBLE,
      MALL_ADMIN_COLLAPSIBLE,
    ],
  },
  {
    titleKey: 'nav.group.commerce',
    items: [
      { path: '/admin/payments', labelKey: 'nav.payments', icon: '💳' },
    ],
  },
  {
    titleKey: 'nav.group.users',
    items: [{ path: '/admin/users', labelKey: 'nav.userManagement', icon: '👥' }],
  },
]

export function isAdminNavActive(pathname, path, end = false) {
  if (end) return pathname === path
  return pathname === path || pathname.startsWith(`${path}/`)
}

/** Dashboard stat cards — labelKey maps to dashboard.cards.* */
export const ADMIN_DASHBOARD_CARDS = [
  { labelKey: 'dashboard.cards.homePortal', statKey: null, to: '/admin/home', icon: '🏠', color: 'bg-slate-100 border-slate-200' },
  { labelKey: 'dashboard.cards.achievements', statKey: 'showcase', to: '/admin/showcase', icon: '🏅', color: 'bg-amber-50 border-amber-200/60' },
  { labelKey: 'dashboard.cards.courses', statKey: 'courses', to: ADMIN_LABS_MATERIALS_PATH, icon: '🧪', color: 'bg-primary/10 border-primary/20' },
  { labelKey: 'dashboard.cards.community', statKey: 'mentors', to: '/admin/community/home', icon: '👥', color: 'bg-violet-50 border-violet-200/60' },
  { labelKey: 'dashboard.cards.certification', statKey: 'cert', to: '/admin/cert', icon: '📜', color: 'bg-emerald-50 border-emerald-200/60' },
  { labelKey: 'dashboard.cards.mall', statKey: 'mall', to: '/admin/mall/home', icon: '🛒', color: 'bg-orange-50 border-orange-200/60' },
  { labelKey: 'dashboard.cards.forum', statKey: 'threads', to: '/admin/community/forum', icon: '💬', color: 'bg-green-50 border-green-200/60' },
  { labelKey: 'dashboard.cards.videos', statKey: 'videos', to: '/admin/curriculum/ioai', icon: '🎬', color: 'bg-indigo-50 border-indigo-200/60' },
  { labelKey: 'dashboard.cards.orders', statKey: 'orders', to: '/admin/payments', icon: '💳', color: 'bg-violet-50 border-violet-200/60' },
  { labelKey: 'dashboard.cards.users', statKey: 'users', to: '/admin/users', icon: '👥', color: 'bg-slate-100 border-slate-200' },
  { labelKey: 'dashboard.cards.platform', statKey: null, to: '/admin/settings', icon: '⚙️', color: 'bg-slate-100 border-slate-200' },
]

export const ADMIN_DASHBOARD_QUICK_LINKS = [
  { labelKey: 'nav.homePortal', to: '/admin/home', className: 'px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium' },
  { labelKey: 'nav.achievements', to: '/admin/showcase', className: 'px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium' },
  { labelKey: 'nav.courses', to: ADMIN_LABS_MATERIALS_PATH, className: 'px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium' },
  { labelKey: 'nav.mallHub', to: '/admin/mall/home', className: 'px-4 py-2 rounded-xl bg-cyan-100 text-cyan-800 text-sm font-medium' },
  { labelKey: 'nav.communityHub', to: '/admin/community/home', className: 'px-4 py-2 rounded-xl bg-violet-100 text-violet-700 text-sm font-medium' },
  { labelKey: 'nav.certification', to: '/admin/cert', className: 'px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium' },
  { labelKey: 'nav.communityForum', to: '/admin/community/forum', className: 'px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium' },
  { labelKey: 'nav.payments', to: '/admin/payments', className: 'px-4 py-2 rounded-xl bg-violet-100 text-violet-700 text-sm font-medium' },
  { labelKey: 'nav.userManagement', to: '/admin/users', className: 'px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-medium' },
  { labelKey: 'nav.platform', to: '/admin/settings', className: 'px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-medium' },
]
