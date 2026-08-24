import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchChannelMe } from '../lib/channelsApi'

export function useChannelMembership() {
  const { loading: authLoading, isAuthenticated, user } = useAuth()
  const [memberships, setMemberships] = useState([])
  const [policy, setPolicy] = useState(null)
  const [mode, setMode] = useState('personal')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const configured = isSupabaseConfigured

  const reload = useCallback(async () => {
    if (!configured) {
      setMemberships([])
      setPolicy(null)
      setMode('personal')
      setLoading(false)
      return
    }
    if (authLoading) {
      setLoading(true)
      return
    }
    if (!isAuthenticated || !user) {
      setMemberships([])
      setPolicy(null)
      setMode('personal')
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchChannelMe()
      setMemberships(data.memberships || [])
      setPolicy(data.policy || null)
      setMode(data.mode || 'personal')
      setError(data.personalError && !(data.memberships || []).length ? data.personalError : null)
    } catch (err) {
      setMemberships([])
      setPolicy(null)
      setMode('personal')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [configured, authLoading, isAuthenticated, user?.id])

  useEffect(() => {
    reload()
  }, [reload])

  return { memberships, policy, mode, loading, error, configured, reload }
}
