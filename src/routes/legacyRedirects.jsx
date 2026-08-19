import { Navigate, useSearchParams } from 'react-router-dom'

const CURRICULUM_PRESERVE = ['checkout', 'session_id', 'module', 'lesson']

/** /curriculum and /curriculum?line=ioai → canonical /ioai/curriculum */
export function CurriculumLegacyRedirect() {
  const [params] = useSearchParams()
  const next = new URLSearchParams()
  for (const key of CURRICULUM_PRESERVE) {
    const val = params.get(key)
    if (val != null && val !== '') next.set(key, val)
  }
  const q = next.toString()
  return <Navigate to={q ? `/ioai/curriculum?${q}` : '/ioai/curriculum'} replace />
}
