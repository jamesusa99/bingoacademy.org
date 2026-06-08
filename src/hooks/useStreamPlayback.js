import { useEffect, useState } from 'react'
import { getCourseVideo } from '../config/courseVideo'
import { fetchVideoStreamToken } from '../lib/checkout'
import { buildStreamIframeUrl, buildStreamManifestUrl } from '../lib/streamPlayback'

/**
 * Resolve Cloudflare Stream signed playback (or catalog MP4/HLS URL) for a lesson.
 */
export function useStreamPlayback({ course, lessonSlug, fetchToken = true, adminPreview = false }) {
  const meta = getCourseVideo(course)
  const uid = meta.cloudflareUid
  const slug = lessonSlug || course?.id

  const [playbackSrc, setPlaybackSrc] = useState(meta.url)
  const [iframeSrc, setIframeSrc] = useState(null)
  const [loading, setLoading] = useState(Boolean(uid && fetchToken))
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)

    if (!uid) {
      setPlaybackSrc(meta.url)
      setIframeSrc(null)
      setLoading(false)
      return undefined
    }

    if (!fetchToken) {
      setPlaybackSrc(meta.url)
      setIframeSrc(null)
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    fetchVideoStreamToken({ cloudflareVideoId: uid, lessonSlug: slug, adminPreview })
      .then((data) => {
        if (cancelled) return
        const videoId = data.videoId || uid
        const manifest = buildStreamManifestUrl(videoId)
        if (data.token && manifest) {
          setPlaybackSrc(`${manifest}?token=${encodeURIComponent(data.token)}`)
          setIframeSrc(buildStreamIframeUrl(videoId, data.token))
        } else if (data.token && videoId) {
          setPlaybackSrc(null)
          setIframeSrc(buildStreamIframeUrl(videoId, data.token))
        } else if (data.iframeSrc) {
          setPlaybackSrc(null)
          setIframeSrc(data.iframeSrc)
        } else if (manifest) {
          setPlaybackSrc(manifest)
          setIframeSrc(buildStreamIframeUrl(videoId))
        } else if (meta.url) {
          setPlaybackSrc(meta.url)
          setIframeSrc(null)
        } else {
          setError('Unable to build playback URL')
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (meta.url) {
          setPlaybackSrc(meta.url)
          setIframeSrc(null)
        } else {
          setPlaybackSrc(null)
          setIframeSrc(null)
          setError(err.message || 'Failed to load video')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [uid, slug, fetchToken, adminPreview, meta.url])

  return {
    playbackSrc,
    iframeSrc,
    poster: meta.poster,
    previewSeconds: meta.previewSeconds,
    isStream: meta.isStream,
    hasCustomVideo: meta.hasCustomVideo,
    cloudflareUid: uid,
    loading,
    error,
  }
}
