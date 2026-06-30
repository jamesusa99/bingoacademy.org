import { supabase, isSupabaseConfigured } from './supabase'
import { loadAssessmentRecords } from './assessmentRecords'
import { getAllLessonProgress } from './learningProgress'
import { BINGO_ACADEMY_NAME } from '../config/bingoCert'

const CERT_FIELDS =
  'id, source, title, subtitle, level_label, issuer, issued_at, verify_code, href, metadata, created_at'

const ACHIEVEMENT_FIELDS =
  'id, category, icon, title, description, earned_at, href, metadata, created_at'

function verifyCodeFromDedupe(dedupeKey) {
  const hash = dedupeKey.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()
  return `BINGO-${hash || 'CERT'}`
}

export async function fetchMyCertificates(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { data: [], error: new Error('Sign in required') }
  }
  const { data, error } = await supabase
    .from('user_certificates')
    .select(CERT_FIELDS)
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
    .limit(100)
  return { data: data || [], error }
}

export async function fetchMyAchievements(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { data: [], error: new Error('Sign in required') }
  }
  const { data, error } = await supabase
    .from('user_achievements')
    .select(ACHIEVEMENT_FIELDS)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(100)
  return { data: data || [], error }
}

async function upsertCertificate(userId, row) {
  const dedupeKey = row.metadata?.dedupe_key
  if (!dedupeKey) return { error: null }

  const { data: existing } = await supabase
    .from('user_certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('metadata->>dedupe_key', dedupeKey)
    .maybeSingle()

  if (existing) return { error: null }

  const { error } = await supabase.from('user_certificates').insert({
    user_id: userId,
    source: row.source,
    title: row.title,
    subtitle: row.subtitle || null,
    level_label: row.level_label || null,
    issuer: row.issuer || BINGO_ACADEMY_NAME,
    issued_at: row.issued_at || new Date().toISOString(),
    verify_code: row.verify_code || verifyCodeFromDedupe(dedupeKey),
    href: row.href || null,
    metadata: row.metadata,
  })

  return { error }
}

async function upsertAchievement(userId, row) {
  const dedupeKey = row.metadata?.dedupe_key
  if (!dedupeKey) return { error: null }

  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('metadata->>dedupe_key', dedupeKey)
    .maybeSingle()

  if (existing) return { error: null }

  const { error } = await supabase.from('user_achievements').insert({
    user_id: userId,
    category: row.category || 'course',
    icon: row.icon || '🏅',
    title: row.title,
    description: row.description || null,
    earned_at: row.earned_at || new Date().toISOString(),
    href: row.href || null,
    metadata: row.metadata,
  })

  return { error }
}

function certificatesFromAssessments() {
  return loadAssessmentRecords()
    .filter((r) => r.pct >= 60)
    .map((r) => {
      const dedupeKey = `assessment-cert:${r.assessmentId}:${r.at}`
      return {
        source: 'assessment',
        title: `${r.title} · Capability Certificate`,
        subtitle: `Score ${r.score}/${r.total} (${r.pct}%)`,
        level_label: r.level || null,
        issued_at: new Date(r.at).toISOString(),
        verify_code: verifyCodeFromDedupe(dedupeKey),
        href: '/assessment',
        metadata: { dedupe_key: dedupeKey, assessment_id: r.assessmentId, pct: r.pct },
      }
    })
}

function achievementsFromAssessments() {
  return loadAssessmentRecords().map((r) => {
    const dedupeKey = `assessment-achievement:${r.id}`
    return {
      category: 'assessment',
      icon: '🧠',
      title: `Completed ${r.title}`,
      description: `Scored ${r.pct}% · ${r.level || 'Placement recorded'}`,
      earned_at: new Date(r.at).toISOString(),
      href: '/assessment',
      metadata: { dedupe_key: dedupeKey, assessment_id: r.assessmentId },
    }
  })
}

function achievementsFromLessonProgress() {
  const lessons = getAllLessonProgress()
  return Object.entries(lessons)
    .filter(([, p]) => p.completed)
    .map(([lessonId, p]) => {
      const dedupeKey = `lesson-complete:${lessonId}`
      return {
        category: 'course',
        icon: '✅',
        title: 'Lesson completed',
        description: `Finished lesson ${lessonId.replace(/-/g, ' ')}`,
        earned_at: p.completedAt ? new Date(p.completedAt).toISOString() : new Date().toISOString(),
        href: '/profile/study',
        metadata: { dedupe_key: dedupeKey, lesson_id: lessonId },
      }
    })
}

/**
 * Push local assessment & lesson progress into Supabase (deduped).
 */
export async function syncLocalAccomplishments(userId) {
  if (!isSupabaseConfigured || !userId) return { error: null }

  const certRows = certificatesFromAssessments()
  const achievementRows = [...achievementsFromAssessments(), ...achievementsFromLessonProgress()]

  for (const row of certRows) {
    const { error } = await upsertCertificate(userId, row)
    if (error && !error.message?.includes('does not exist')) return { error }
  }

  for (const row of achievementRows) {
    const { error } = await upsertAchievement(userId, row)
    if (error && !error.message?.includes('does not exist')) return { error }
  }

  return { error: null }
}

export function formatAccomplishmentDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export async function persistAssessmentResult(userId, record) {
  if (!isSupabaseConfigured || !userId || !record) return { error: null }

  const { error } = await supabase.from('assessment_results').insert({
    user_id: userId,
    assessment_type: record.assessmentId || record.title || 'assessment',
    score: record.score ?? null,
    total: record.total ?? null,
    level: record.level || null,
    feedback: record.pct != null ? `${record.pct}%` : null,
  })

  if (error && !error.message?.includes('does not exist')) {
    return { error }
  }
  return { error: null }
}

export async function recordAssessmentAccomplishments(userId, record) {
  if (!userId || !record) return

  await persistAssessmentResult(userId, record)

  if (record.pct >= 60) {
    const dedupeKey = `assessment-cert:${record.assessmentId}:${record.at}`
    await upsertCertificate(userId, {
      source: 'assessment',
      title: `${record.title} · Capability Certificate`,
      subtitle: `Score ${record.score}/${record.total} (${record.pct}%)`,
      level_label: record.level || null,
      issued_at: new Date(record.at).toISOString(),
      verify_code: verifyCodeFromDedupe(dedupeKey),
      href: '/assessment',
      metadata: { dedupe_key: dedupeKey, assessment_id: record.assessmentId, pct: record.pct },
    })
  }

  await upsertAchievement(userId, {
    category: 'assessment',
    icon: '🧠',
    title: `Completed ${record.title}`,
    description: `Scored ${record.pct}% · ${record.level || 'Placement recorded'}`,
    earned_at: new Date(record.at).toISOString(),
    href: '/assessment',
    metadata: { dedupe_key: `assessment-achievement:${record.id}`, assessment_id: record.assessmentId },
  })
}
