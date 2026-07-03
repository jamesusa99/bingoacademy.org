import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { EXIT_INTENT_EXCLUDED_PREFIXES, EXIT_INTENT_STORAGE_KEY } from '../config/funnel'

function isExcludedPath(pathname) {
  return EXIT_INTENT_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function hasSeenExitIntent() {
  try {
    return sessionStorage.getItem(EXIT_INTENT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markExitIntentSeen() {
  try {
    sessionStorage.setItem(EXIT_INTENT_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function useExitIntent() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    markExitIntentSeen()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (isExcludedPath(location.pathname)) return undefined
    if (isAuthenticated) return undefined
    if (hasSeenExitIntent()) return undefined

    const handleMouseOut = (e) => {
      if (e.relatedTarget != null) return
      if (e.clientY > 12) return
      setOpen(true)
      markExitIntentSeen()
    }

    document.documentElement.addEventListener('mouseout', handleMouseOut)
    return () => document.documentElement.removeEventListener('mouseout', handleMouseOut)
  }, [location.pathname, isAuthenticated])

  return { open, close }
}
