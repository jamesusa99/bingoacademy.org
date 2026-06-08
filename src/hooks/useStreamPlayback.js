import { useEffect, useState } from 'react'
import { getCourseVideo } from '../config/courseVideo'
import { fetchVideoStreamToken } from '../lib/checkout'
import { buildStreamIframeUrl, buildStreamManifestUrl } from '../lib/streamPlayback'

function resolvePlaybackFromTokenData(data, { limitPreview, uid, meta }) {
  const previewOnly = limitPreview || Boolean(data.previewOnly)
  const videoId = data.videoId || uid
  const manifest = buildStreamManifestUrl(videoId)

  if (data.playbackSrc) {
    return {
      playbackSrc: data.playbackSrc,
      iframeSrc: previewOnly ? null : data.iframeSrc || null,
      previewOnly,
    }
  }

  if (data.token && manifest) {
    return {
      playbackSrc: `${manifest}?token=${encodeURIComponent(data.token)}`,
      iframeSrc: previewOnly ? null : buildStreamIframeUrl(videoId, data.token),
      previewOnly,
    }
  }

  if (data.token && videoId) {
    return {
      playbackSrc: null,
      iframeSrc: previewOnly ? null : buildStreamIframeUrl(videoId, data.token),
      previewOnly,
    }
  }

  if (data.iframeSrc) {
    return {
      playbackSrc: previewOnly && manifest ? manifest : null,
      iframeSrc: previewOnly ? null : data.iframeSrc,
      previewOnly,
    }
  }

  if (manifest) {
    return {
      playbackSrc: manifest,
      iframeSrc: previewOnly ? null : buildStreamIframeUrl(videoId),
      previewOnly,
    }
  }

  if (meta.url) {
    return { playbackSrc: meta.url, iframeSrc: null, previewOnly }
  }

  return { playbackSrc: null, iframeSrc: null, previewOnly }
}

/**
 * Resolve Cloudflare Stream signed playback (or catalog MP4/HLS URL) for a lesson.
 * @param {{ limitPreview?: boolean }} opts — when true, prefer HLS and never return iframe-only (15s cap on <video>).
 */
export function useStreamPlayback({
  course,
  lessonSlug,
  fetchToken = true,
  adminPreview = false,
  limitPreview = false,
}) {
  const meta = getCourseVideo(course)
  const uid = meta.cloudflareUid
  const slug = lessonSlug || course?.id

  const [playbackSrc, setPlaybackSrc] = useState(meta.url)
  const [iframeSrc, setIframeSrc] = useState(null)
  const [previewOnly, setPreviewOnly] = useState(limitPreview)
  const [loading, setLoading] = useState(Boolean(uid && fetchToken))
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)

    if (!uid) {
      setPlaybackSrc(meta.url)
      setIframeSrc(null)
      setPreviewOnly(limitPreview)
      setLoading(false)
      return undefined
    }

    if (!fetchToken) {
      setPlaybackSrc(meta.url)
      setIframeSrc(null)
      setPreviewOnly(limitPreview)
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    fetchVideoStreamToken({ cloudflareVideoId: uid, lessonSlug: slug, adminPreview })
      .then((data) => {
        if (cancelled) return
        const resolved = resolvePlaybackFromTokenData(data, { limitPreview, uid, meta })
        setPlaybackSrc(resolved.playbackSrc)
        setIframeSrc(resolved.iframeSrc)
        setPreviewOnly(resolved.previewOnly)

        if (resolved.previewOnly && !resolved.playbackSrc) {
          setError('Preview player unavailable — configure CLOUDFLARE_STREAM_CUSTOMER_CODE on the server.')
        } else if (!resolved.playbackSrc && !resolved.iframeSrc) {
          setError('Unable to build playback URL')
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (limitPreview) {
          setPlaybackSrc(null)
          setIframeSrc(null)
          setError(err.message || 'Failed to load preview')
          return
        }
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
  }, [uid, slug, fetchToken, adminPreview, limitPreview, meta.url])

  return {
    playbackSrc,
    iframeSrc,
    poster: meta.poster,
    previewSeconds: meta.previewSeconds,
    previewOnly: previewOnly || limitPreview,
    isStream: meta.isStream,
    hasCustomVideo: meta.hasCustomVideo,
    cloudflareUid: uid,
    loading,
    error,
  }
}
