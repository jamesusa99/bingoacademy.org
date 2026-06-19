import { isCurriculumLine } from '../config/programCurriculum'

export async function fetchProgramStore(productLine) {
  if (!isCurriculumLine(productLine)) {
    throw new Error(`Unknown product line: ${productLine}`)
  }

  const res = await fetch(`/api/program/${encodeURIComponent(productLine)}/store`)
  const text = await res.text()
  let body = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    if (text.trimStart().startsWith('<!')) {
      throw new Error('Program store API unavailable (received HTML instead of JSON).')
    }
    throw new Error(`Failed to load program store (${res.status})`)
  }
  if (!res.ok) throw new Error(body.error || `Failed to load program store (${res.status})`)
  return body
}
