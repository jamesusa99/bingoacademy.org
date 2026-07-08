import { useEffect, useState } from 'react'

/** Subscribe to a CSS media query (defaults to false during SSR/first paint). */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function useIsDesktop(breakpoint = 1024) {
  return useMediaQuery(`(min-width: ${breakpoint}px)`)
}
