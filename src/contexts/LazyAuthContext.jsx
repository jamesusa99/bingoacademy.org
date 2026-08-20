import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { signInWithGoogle, signInWithFacebook, formatAuthError } from '../lib/auth'
import { storePostLoginRedirect } from '../lib/authRedirect'
import { storePendingAuthAction } from '../lib/lazyRegistration'
import { useAuth } from './AuthContext'
import LazyAuthModal from '../components/funnel/LazyAuthModal'

const LazyAuthContext = createContext(null)

export function LazyAuthProvider({ children }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [modal, setModal] = useState(null)

  const closeLazyAuth = useCallback(() => setModal(null), [])

  useEffect(() => {
    if (!isAuthenticated || !modal?.onAuthed) return
    modal.onAuthed()
    setModal(null)
  }, [isAuthenticated, modal])

  const openLazyAuth = useCallback(
    ({ copyKey = 'saveProgress', pendingAction = null, onAuthed = null, title, subtitle, googleLabel } = {}) => {
      if (isAuthenticated) {
        onAuthed?.()
        return
      }
      setModal({
        copyKey,
        pendingAction,
        onAuthed,
        title,
        subtitle,
        googleLabel,
      })
    },
    [isAuthenticated]
  )

  const gateAction = useCallback(
    ({ copyKey, pendingAction, onAuthed, title, subtitle, googleLabel }) => {
      if (isAuthenticated) {
        onAuthed?.()
        return
      }
      openLazyAuth({ copyKey, pendingAction, onAuthed, title, subtitle, googleLabel })
    },
    [isAuthenticated, openLazyAuth]
  )

  const handleOAuthSignIn = useCallback(
    async (signIn) => {
      const returnPath = `${location.pathname}${location.search}`
      if (modal?.pendingAction) {
        storePendingAuthAction(modal.pendingAction)
      }
      storePostLoginRedirect(returnPath)
      const { error } = await signIn()
      if (error) {
        throw new Error(formatAuthError(error))
      }
    },
    [location.pathname, location.search, modal?.pendingAction]
  )

  const handleGoogleSignIn = useCallback(() => handleOAuthSignIn(signInWithGoogle), [handleOAuthSignIn])
  const handleFacebookSignIn = useCallback(() => handleOAuthSignIn(signInWithFacebook), [handleOAuthSignIn])

  const value = useMemo(
    () => ({ openLazyAuth, gateAction, closeLazyAuth }),
    [openLazyAuth, gateAction, closeLazyAuth]
  )

  return (
    <LazyAuthContext.Provider value={value}>
      {children}
      <LazyAuthModal
        open={Boolean(modal)}
        copyKey={modal?.copyKey}
        title={modal?.title}
        subtitle={modal?.subtitle}
        googleLabel={modal?.googleLabel}
        onClose={closeLazyAuth}
        onGoogleSignIn={handleGoogleSignIn}
        onFacebookSignIn={handleFacebookSignIn}
      />
    </LazyAuthContext.Provider>
  )
}

export function useLazyAuth() {
  const ctx = useContext(LazyAuthContext)
  if (!ctx) throw new Error('useLazyAuth must be used within LazyAuthProvider')
  return ctx
}
