import { supabase } from './supabase'
import { adminDelete, adminInsert, adminUpdate } from './admin/db'
import { formToQuestionRow } from '../config/ioaiQuestions'

export async function fetchQuestionsForScope(scopeType, scopeId) {
  const { data, error } = await supabase
    .from('ioai_question_items')
    .select('*')
    .eq('scope_type', scopeType)
    .eq('scope_id', scopeId)
    .order('sort_order')
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveQuestion(id, payload) {
  if (id) {
    await adminUpdate('ioai_question_items', id, payload)
    return id
  }
  const row = await adminInsert('ioai_question_items', payload)
  return row?.id
}

export async function deleteQuestion(id) {
  await adminDelete('ioai_question_items', id)
}

export async function bulkUpdateQuestionStatus(ids, status) {
  for (const id of ids) {
    await adminUpdate('ioai_question_items', id, { status, updated_at: new Date().toISOString() })
  }
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
