import {
  GONE_PATHS,
  PERMANENT_REDIRECTS,
  PREFIX_REDIRECTS,
  resolveCoursesTypeRedirect,
  coursesHasLegacyTypeParam,
} from '../../config/urlMigrations.mjs'
import { coursePathFromLineQuery } from './courseSeo.mjs'
import { isProductLabSub, labsPath } from './coursePathData.mjs'

const VALID_PRODUCT_LINES = new Set(['ioai', 'general', 'k12'])

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

/**
 * Fast redirect / gone checks before express.static.
 */
export function createEarlyRouteMiddleware() {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api/')) return next()

    const path = normalizePath(req.path)
    const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''

    if (GONE_PATHS.has(path)) {
      return next()
    }

    if (PERMANENT_REDIRECTS[path]) {
      return res.redirect(301, PERMANENT_REDIRECTS[path])
    }

    for (const { prefix, target } of PREFIX_REDIRECTS) {
      if (path.startsWith(prefix)) {
        return res.redirect(301, target)
      }
    }

    if (path === '/courses' && search) {
      const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      if (coursesHasLegacyTypeParam(searchParams)) {
        const target = resolveCoursesTypeRedirect(searchParams.get('type'))
        const current = `${path}${search}`
        if (target && current !== target) {
          return res.redirect(301, target)
        }
      }

      const line = searchParams.get('line')?.trim()
      if (line) {
        const sub = searchParams.get('sub')?.trim() || ''
        let target
        if (!VALID_PRODUCT_LINES.has(line)) {
          target = coursePathFromLineQuery('ioai', sub)
        } else if (line === 'ioai' && sub === 'module') {
          target = '/courses/ioai'
        } else if (sub && isProductLabSub(line, sub)) {
          target = labsPath(line, sub)
        } else {
          target = coursePathFromLineQuery(line, sub)
        }
        const current = `${path}${search}`
        if (target && current !== target) {
          return res.redirect(301, target)
        }
      }
    }

    return next()
  }
}
