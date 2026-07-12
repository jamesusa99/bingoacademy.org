import { lazy, Suspense, useEffect, useState } from 'react'

const ChatWidget = lazy(() => import('./ChatWidget'))

/** Defer chat widget until after first paint / idle — keeps marketing entry lighter */
export default function LazyChatWidget() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const show = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(show, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const t = window.setTimeout(show, 1500)
    return () => window.clearTimeout(t)
  }, [])

  if (!ready) return null

  return (
    <Suspense fallback={null}>
      <ChatWidget />
    </Suspense>
  )
}
