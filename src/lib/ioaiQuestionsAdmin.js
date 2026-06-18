import { supabase } from './supabase'
import { formToQuestionRow } from '../config/ioaiQuestions'

function throwIfError(error, fallback = 'Database operation failed') {
  if (error) throw new Error(error.message || fallback)
}

export async function fetchQuestionsForScope(scopeType, scopeId) {
  const { data, error } = await supabase
    .from('ioai_question_items')
    .select('*')
    .eq('scope_type', scopeType)
    .eq('scope_id', scopeId)
    .order('sort_order')
  throwIfError(error)
  return data || []
}

/** Insert/update via Supabase client (staff RLS). Avoids CMS allowlist round-trip. */
export async function saveQuestion(id, payload) {
  if (id) {
    const { data, error } = await supabase
      .from('ioai_question_items')
      .update(payload)
      .eq('id', id)
      .select('id')
      .maybeSingle()
    throwIfError(error, 'Failed to update question')
    if (!data?.id) throw new Error('Failed to update question — no row returned')
    return data.id
  }

  const { data, error } = await supabase
    .from('ioai_question_items')
    .insert(payload)
    .select('id')
    .maybeSingle()
  throwIfError(error, 'Failed to create question')
  if (!data?.id) {
    throw new Error(
      'Failed to create question. Confirm migration 031 is applied and your account has admin/editor role.'
    )
  }
  return data.id
}

export async function deleteQuestion(id) {
  const { error } = await supabase.from('ioai_question_items').delete().eq('id', id)
  throwIfError(error, 'Failed to delete question')
}

export async function bulkUpdateQuestionStatus(ids, status) {
  const { error } = await supabase
    .from('ioai_question_items')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)
  throwIfError(error, 'Failed to bulk update question status')
}

export async function bulkImportQuestions(scopeType, scopeId, forms) {
  const existing = await fetchQuestionsForScope(scopeType, scopeId)
  const maxSort = existing.reduce((m, r) => Math.max(m, r.sort_order ?? 0), -1)
  let nextSort = maxSort + 1
  const ids = []

  for (const form of forms) {
    const payload = formToQuestionRow(form, scopeType, scopeId)
    const explicitSort = form.sort_order
    if (explicitSort == null || explicitSort === '') {
      payload.sort_order = nextSort++
    } else {
      payload.sort_order = parseInt(explicitSort, 10)
      nextSort = Math.max(nextSort, payload.sort_order + 1)
    }
    const id = await saveQuestion(null, payload)
    if (id) ids.push(id)
  }

  return ids
}

/** Batch counts for lesson rows in curriculum table */
export async function fetchQuestionCountsForLessons(lessonIds) {
  const ids = [...new Set(lessonIds.filter(Boolean))]
  if (!ids.length) return {}

  const { data, error } = await supabase
    .from('ioai_question_items')
    .select('scope_id, status')
    .eq('scope_type', 'lesson')
    .in('scope_id', ids)

  throwIfError(error)

  const map = Object.fromEntries(ids.map((id) => [id, { total: 0, live: 0, draft: 0 }]))
  for (const row of data || []) {
    const bucket = map[row.scope_id]
    if (!bucket) continue
    bucket.total += 1
    if (row.status === 'live') bucket.live += 1
    if (row.status === 'draft') bucket.draft += 1
  }
  return map
}
