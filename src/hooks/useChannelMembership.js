import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { fetchChannelMe } from '../lib/channelsApi'

export function useChannelMembership() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const configured = isSupabaseConfigured

  const reload = useCallback(async () => {
    if (!configured) {
      setMemberships([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setMemberships([])
        setError(null)
        setLoading(false)
        return
      }
      const data = await fetchChannelMe()
      setMemberships(data.memberships || [])
      setError(null)
    } catch (err) {
      setMemberships([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [configured])

  useEffect(() => {
    reload()
  }, [reload])

  return { memberships, loading, error, configured, reload }
}
