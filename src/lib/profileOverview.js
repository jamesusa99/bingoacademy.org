import { authFetch } from './checkout'
import { getAllLessonProgress } from './learningProgress'
import { loadAssessmentRecords } from './assessmentRecords'

const DEFAULT_LESSON_MINUTES = 45

/** Estimate watched / completed course time from client lesson progress. */
export function computeCourseHoursFromProgress(lessons = getAllLessonProgress()) {
  let totalMinutes = 0

  for (const progress of Object.values(lessons || {})) {
    if (!progress || typeof progress !== 'object') continue

    if (progress.completed) {
      totalMinutes += DEFAULT_LESSON_MINUTES
      continue
    }

    if (progress.videoPosition > 0) {
      totalMinutes += Math.min(progress.videoPosition / 60, DEFAULT_LESSON_MINUTES)
      continue
    }

    const segmentsDone = Object.values(progress.segmentsDone || {}).filter(Boolean).length
    if (segmentsDone > 0) {
      totalMinutes += (segmentsDone / 4) * DEFAULT_LESSON_MINUTES
    }
  }

  return Math.round(totalMinutes / 60)
}

export function resolveCapabilityLevel(serverLevel, localRecords = loadAssessmentRecords()) {
  if (serverLevel?.trim()) return serverLevel.trim()
  const latest = localRecords[0]
  return latest?.level?.trim() || null
}

export function formatOverviewHours(hours) {
  const n = Number(hours)
  if (!Number.isFinite(n) || n <= 0) return '0'
  return String(n)
}

export function formatOverviewPoints(points) {
  const n = Number(points)
  if (!Number.isFinite(n) || n <= 0) return '0'
  return n.toLocaleString()
}

export function formatOverviewMoney(cents, currency = 'usd') {
  const n = Number(cents)
  if (!Number.isFinite(n) || n <= 0) return '$0'
  if (currency?.toLowerCase() === 'usd') {
    return `$${(n / 100).toFixed(n % 100 === 0 ? 0 : 2)}`
  }
  return `${(n / 100).toFixed(2)} ${currency?.toUpperCase() || ''}`.trim()
}

export async function fetchMyProfileOverview() {
  return authFetch('/api/me/overview')
}

export function mergeProfileOverview(serverOverview) {
  const courseHours = computeCourseHoursFromProgress()
  const capabilityLevel = resolveCapabilityLevel(serverOverview?.capabilityLevel)

  return {
    courseHours,
    eventsJoined: serverOverview?.eventsJoined ?? 0,
    awardsWorksCount: serverOverview?.awardsWorksCount ?? 0,
    certificatesCount: serverOverview?.certificatesCount ?? 0,
    capabilityLevel,
    ordersCount: serverOverview?.ordersCount ?? 0,
    teachingKitCount: serverOverview?.teachingKitCount ?? 0,
    charityPoints: serverOverview?.charityPoints ?? 0,
    commissionBalanceCents: serverOverview?.commissionBalanceCents ?? 0,
    pendingCommissionCents: serverOverview?.pendingCommissionCents ?? 0,
    invitedCount: serverOverview?.invitedCount ?? 0,
    memberBenefitsToClaim: serverOverview?.memberBenefitsToClaim ?? 0,
  }
}

export function buildProfileOverviewCards(overview) {
  const capabilityDisplay = overview.capabilityLevel || '—'

  return [
    { label: 'Course hours', value: formatOverviewHours(overview.courseHours), unit: 'hrs', shareModule: null },
    { label: 'Events joined', value: String(overview.eventsJoined), unit: '', shareModule: overview.eventsJoined ? 'My Events' : null },
    {
      label: 'Awards / works',
      value: String(overview.awardsWorksCount),
      unit: '',
      shareModule: overview.awardsWorksCount ? 'My Works' : null,
    },
    {
      label: 'Certificates',
      value: String(overview.certificatesCount),
      unit: '',
      shareModule: overview.certificatesCount ? 'My Certificates' : null,
    },
    {
      label: 'Capability profile',
      value: capabilityDisplay,
      unit: '',
      shareModule: overview.capabilityLevel ? 'Capability Profile' : null,
    },
    { label: 'Orders', value: String(overview.ordersCount), unit: '', shareModule: overview.ordersCount ? 'My Orders' : null },
    {
      label: 'Teaching kit stock',
      value: String(overview.teachingKitCount),
      unit: 'items',
      shareModule: null,
    },
    {
      label: 'Charity points',
      value: formatOverviewPoints(overview.charityPoints),
      unit: 'pts',
      shareModule: null,
    },
    {
      label: 'Commission balance',
      value: formatOverviewMoney(overview.commissionBalanceCents),
      unit: '',
      shareModule: null,
    },
    {
      label: 'Invited',
      value: String(overview.invitedCount),
      unit: overview.invitedCount === 1 ? 'friend' : 'friends',
      shareModule: null,
    },
    {
      label: 'Pending commission',
      value: formatOverviewMoney(overview.pendingCommissionCents),
      unit: '',
      shareModule: null,
    },
    {
      label: 'Member benefits to claim',
      value: String(overview.memberBenefitsToClaim),
      unit: '',
      shareModule: null,
    },
  ]
}
