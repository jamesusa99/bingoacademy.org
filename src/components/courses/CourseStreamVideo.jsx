import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

function isHlsSource(src) {
  if (!src) return false
  return src.includes('.m3u8') || src.includes('cloudflarestream.com')
}

/**
 * HTML5 video with HLS.js for Cloudflare Stream manifests.
 * Forwards ref to the underlying <video> element.
 */
export default function CourseStreamVideo({
  src,
  poster,
  videoRef,
  className = 'w-full h-full object-contain',
  playsInline = true,
  preload = 'metadata',
  controls = false,
  controlsList,
  onLoadedMetadata,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}) {
  const internalRef = useRef(null)
  const hlsRef = useRef(null)

  const setRef = (node) => {
    internalRef.current = node
    if (typeof videoRef === 'function') {
      videoRef(node)
    } else if (videoRef) {
      videoRef.current = node
    }
  }

  useEffect(() => {
    const video = internalRef.current
    if (!video || !src) return undefined

    const useHls = isHlsSource(src)

    if (useHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('[CourseStreamVideo] HLS fatal error', data.type)
        }
      })
      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    }

    if (useHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      return undefined
    }

    video.src = src
    return undefined
  }, [src])

  return (
    <video
      ref={setRef}
      poster={poster || undefined}
      className={className}
      playsInline={playsInline}
      preload={preload}
      controls={controls}
      controlsList={controlsList}
      onLoadedMetadata={onLoadedMetadata}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
    />
  )
}

export { isHlsSource }
