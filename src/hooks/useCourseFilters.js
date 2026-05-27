import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { COURSES_PER_PAGE } from '../config/courseListFilters'

const DEFAULTS = {
  category: 'all',
  level: 'all',
  price: 'all',
  sort: 'popular',
  search: '',
  page: 1,
}

export function useCourseFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      category: params.get('category') || DEFAULTS.category,
      level: params.get('level') || DEFAULTS.level,
      price: params.get('price') || DEFAULTS.price,
      sort: params.get('sort') || DEFAULTS.sort,
      search: params.get('search') || DEFAULTS.search,
      page: Math.max(1, parseInt(params.get('page') || '1', 10) || 1),
    }),
    [params]
  )

  const setFilters = useCallback(
    (patch) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(patch).forEach(([key, value]) => {
          if (value === undefined) return
          const def = DEFAULTS[key]
          if (value === def || value === '' || (key === 'page' && value === 1)) {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        })
        if (!('page' in patch) && Object.keys(patch).some((k) => k !== 'page')) {
          next.delete('page')
        }
        return next
      })
    },
    [setParams]
  )

  return { filters, setFilters, perPage: COURSES_PER_PAGE }
}
