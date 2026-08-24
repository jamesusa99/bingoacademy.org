import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { captureChannelCodeFromSearch } from '../lib/channelReferral'

/** Persist ?ref= / ?channel= referral codes across the session. */
export default function ChannelRefCapture() {
  const location = useLocation()

  useEffect(() => {
    captureChannelCodeFromSearch(location.search)
  }, [location.search])

  return null
}
