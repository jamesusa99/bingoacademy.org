import {
  COMMUNITY_SCHOLAR_TIERS,
  COMMUNITY_SCHOLARS,
  COMMUNITY_CHECKIN_TASKS,
  COMMUNITY_CHECKIN_REWARDS,
  COMMUNITY_CHECKIN_POINTS_GUIDE,
  COMMUNITY_PARTNERS,
  COMMUNITY_HOME_DEFAULT,
  COMMUNITY_CERT_COURSES_DEFAULT,
} from '../config/seed/communityContent'

export function mapScholarTierRow(row) {
  if (!row) return null
  return {
    id: row.slug,
    slug: row.slug,
    dbId: row.id,
    label: row.label,
    age: row.age || '',
    desc: row.description || '',
    focus: row.focus || '',
    pts: row.pts ?? 0,
    color: row.color || 'bg-slate-100 text-slate-700 border-slate-200',
    icon: row.icon || '⭐',
    isHighest: Boolean(row.is_highest),
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapScholarRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    grade: row.grade || '',
    tier: row.tier_slug,
    achievement: row.achievement || '',
    path: row.path || '',
    avatar: row.avatar || '⭐',
    pts: row.pts ?? 0,
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapCheckinTaskRow(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    type: row.task_type,
    icon: row.icon || '📅',
    title: row.title,
    desc: row.description || '',
    pts: row.pts ?? 0,
    scholarPts: row.scholar_pts ?? 0,
    exclusive: Boolean(row.exclusive),
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapCheckinRewardRow(row) {
  if (!row) return null
  return {
    id: row.id,
    icon: row.icon || '🎁',
    title: row.title,
    pts: row.pts ?? 0,
    desc: row.description || '',
    stock: row.stock || '',
    scholarOnly: Boolean(row.scholar_only),
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapPartnerRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    region: row.region || '',
    type: row.type || '',
    sortOrder: row.sort_order ?? 0,
  }
}

export function defaultScholarTiers() {
  return COMMUNITY_SCHOLAR_TIERS.map((row, index) =>
    mapScholarTierRow({ ...row, id: row.slug, sort_order: row.sort_order ?? index })
  )
}

export function defaultScholars() {
  return COMMUNITY_SCHOLARS.map((row, index) =>
    mapScholarRow({ ...row, id: `fallback-${index}`, sort_order: row.sort_order ?? index })
  )
}

export function defaultCheckinTasks() {
  return COMMUNITY_CHECKIN_TASKS.map((row, index) =>
    mapCheckinTaskRow({ ...row, id: row.slug || `task-${index}`, sort_order: row.sort_order ?? index })
  )
}

export function defaultCheckinRewards() {
  return COMMUNITY_CHECKIN_REWARDS.map((row, index) =>
    mapCheckinRewardRow({ ...row, id: `reward-${index}`, sort_order: row.sort_order ?? index })
  )
}

export function mapCheckinPointsGuideRow(row, index = 0) {
  if (!row) return null
  return {
    id: row.id ?? `guide-${index}`,
    title: row.title || '',
    pts: row.pts || '',
    scholarPts: row.scholar_pts || '',
    streakOnly: Boolean(row.streak_only),
    sortOrder: row.sort_order ?? index,
  }
}

export function defaultCheckinPointsGuide() {
  return COMMUNITY_CHECKIN_POINTS_GUIDE.map((row, index) =>
    mapCheckinPointsGuideRow({ ...row, sort_order: row.sort_order ?? index }, index)
  ).filter(Boolean)
}

export function defaultPartners() {
  return COMMUNITY_PARTNERS.map((row, index) =>
    mapPartnerRow({ ...row, id: `partner-${index}`, sort_order: row.sort_order ?? index })
  )
}

export function defaultCommunityHome() {
  return { ...COMMUNITY_HOME_DEFAULT }
}

export function defaultCertCourses() {
  return [...COMMUNITY_CERT_COURSES_DEFAULT]
}
