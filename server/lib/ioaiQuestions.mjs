import {
  IOAI_QUESTION_STATUS,
  gradeIoaiQuestion,
  sanitizeQuestionForClient,
} from '../../src/config/ioaiQuestions.js'

export async function fetchLiveQuestions(admin, { scopeType, scopeId }) {
  const { data, error } = await admin
    .from('ioai_question_items')
    .select('*')
    .eq('scope_type', scopeType)
    .eq('scope_id', scopeId)
    .eq('status', IOAI_QUESTION_STATUS.LIVE)
    .order('sort_order')
  if (error) throw error
  return data || []
}

export async function countLiveQuestions(admin, { scopeType, scopeId }) {
  const { count, error } = await admin
    .from('ioai_question_items')
    .select('id', { count: 'exact', head: true })
    .eq('scope_type', scopeType)
    .eq('scope_id', scopeId)
    .eq('status', IOAI_QUESTION_STATUS.LIVE)
  if (error) throw error
  return count || 0
}

export async function resolveLessonDbId(admin, lessonRef) {
  if (!lessonRef) return null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRe.test(lessonRef)) {
    const { data } = await admin.from('lessons').select('id').eq('id', lessonRef).maybeSingle()
    return data?.id || null
  }
  const { data } = await admin
    .from('lessons')
    .select('id')
    .or(`catalog_slug.eq.${lessonRef},slug.eq.${lessonRef}`)
    .maybeSingle()
  return data?.id || null
}

export async function resolveModuleDbId(admin, moduleRef) {
  if (!moduleRef) return null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRe.test(moduleRef)) {
    const { data } = await admin.from('modules').select('id, catalog_slug').eq('id', moduleRef).maybeSingle()
    return data || null
  }
  const { data } = await admin
    .from('modules')
    .select('id, catalog_slug')
    .or(`catalog_slug.eq.${moduleRef},slug.eq.${moduleRef}`)
    .maybeSingle()
  return data || null
}

export function sanitizeQuestions(rows) {
  return (rows || []).map(sanitizeQuestionForClient)
}

export function gradeSingleQuestion(row, userAnswer) {
  return gradeIoaiQuestion(row, userAnswer)
}

export function gradeModuleTest(rows, answersByQuestionId) {
  let score = 0
  let total = 0
  const results = []

  for (const row of rows || []) {
    total += row.score ?? 1
    const userAnswer = answersByQuestionId?.[row.id]
    const graded = gradeIoaiQuestion(row, userAnswer)
    score += graded.earnedScore
    results.push({
      questionId: row.id,
      ...graded,
    })
  }

  return { score, totalScore: total, passed: score === total && total > 0, results }
}
