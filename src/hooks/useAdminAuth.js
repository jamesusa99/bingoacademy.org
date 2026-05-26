import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { resolveAdminAccess } from '../lib/admin/auth'
import { isSupabaseConfigured } from '../lib/supabase'

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState(null)
  const [via, setVia] = useState(null)

  useEffect(() => {
    let mounted = true

    async function check() {
      if (authLoading) return
      if (!user) {
        if (mounted) {
          setIsAdmin(false)
          setProfile(null)
          setVia(null)
          setChecking(false)
        }
        return
      }

      setChecking(true)
      const result = await resolveAdminAccess(user)
      if (mounted) {
        setIsAdmin(result.isAdmin)
        setProfile(result.profile)
        setVia(result.via)
        setChecking(false)
      }
    }

    check()
    return () => {
      mounted = false
    }
  }, [user, authLoading])

  return {
    user,
    profile,
    isAdmin,
    via,
    loading: authLoading || checking,
    configured: isSupabaseConfigured,
  }
}
