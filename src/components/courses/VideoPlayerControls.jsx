import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play } from 'lucide-react'

/**
 * Overlay play/pause + fullscreen for HTML5 video players.
 */
export default function VideoPlayerControls({ videoRef, className = '' }) {
  const shellRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const getVideo = useCallback(() => videoRef?.current ?? null, [videoRef])

  const togglePlay = useCallback(() => {
    const video = getVideo()
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }, [getVideo])

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.()
      return
    }
    const target = shellRef.current?.closest('[data-video-shell]') || shellRef.current?.parentElement
    await target?.requestFullscreen?.()
  }, [])

  useEffect(() => {
    const video = getVideo()
    if (!video) return undefined

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    setPlaying(!video.paused)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
  }, [getVideo, videoRef?.current])

  return (
    <div ref={shellRef} className={`pointer-events-none ${className}`}>
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition"
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
