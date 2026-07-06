import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

function isHlsSource(src) {
  if (!src) return false
  return src.includes('.m3u8') || src.includes('cloudflarestream.com')
}

function CodePanel() {
  return (
    <div className="relative h-full flex flex-col justify-center p-6 sm:p-8 lg:p-10">
      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-500/80 mb-3">
        Browser · Live code
      </p>
      <div className="font-mono text-[10px] sm:text-xs leading-relaxed text-cyan-300/95 space-y-0.5 max-w-xs mx-auto lg:mx-0 lg:ml-auto lg:mr-6">
        <p className="text-emerald-400/90"># BingoClaw — pick &amp; place</p>
        <p>
          <span className="text-violet-300">arm</span>.<span className="text-amber-200">move_to</span>(
          <span className="text-cyan-300">x=0.42</span>, <span className="text-cyan-300">y=0.18</span>)
        </p>
        <p>
          <span className="text-violet-300">gripper</span>.<span className="text-amber-200">close</span>()
        </p>
        <p>
          <span className="text-violet-300">vision</span>.<span className="text-amber-200">detect</span>(
          <span className="text-slate-400">&quot;target&quot;</span>)
        </p>
        <p className="text-slate-500 pt-1">
          <span className="hero-code-cursor inline-block w-2 h-3.5 bg-cyan-400/80 align-middle ml-0.5" />
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-400/80 font-mono max-w-xs mx-auto lg:mx-0 lg:ml-auto lg:mr-6">
        <span className="hero-sync-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        streaming to hardware…
      </div>
    </div>
  )
}

function PhysicalPanel() {
  return (
    <div className="relative h-full overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8">
      <p className="absolute top-6 sm:top-8 left-6 sm:left-8 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-400/80">
        Physical world · BingoClaw
      </p>

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(244,114,182,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-[220px] sm:max-w-[260px] aspect-square">
        {/* Arm base */}
        <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-20 h-3 rounded-full bg-slate-700/90 border border-slate-600 shadow-lg" />

        {/* Rotating arm */}
        <div className="hero-arm-pivot absolute bottom-[22%] left-1/2 origin-bottom">
          <div className="relative -translate-x-1/2">
            <div className="w-2.5 h-16 sm:h-20 rounded-full bg-gradient-to-t from-slate-600 to-cyan-500/80 shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
            <div className="hero-arm-forearm absolute top-0 left-1/2 origin-top -translate-x-1/2">
              <div className="w-2 h-12 sm:h-14 rounded-full bg-gradient-to-b from-cyan-500/70 to-violet-500/70" />
              <div className="hero-claw absolute -top-1 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                <span className="block w-1.5 h-5 sm:h-6 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                <span className="block w-1.5 h-5 sm:h-6 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Target object + trail */}
        <div className="hero-fallback-ball absolute top-[32%] right-[22%] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] rotate-12" />
        <div className="absolute top-[28%] right-[18%] w-16 h-16 rounded-full border border-dashed border-cyan-400/30 hero-target-ring" />
      </div>

      <p className="absolute bottom-6 sm:bottom-8 text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-400/60 uppercase">
        Embodied AI · Precision response
      </p>
    </div>
  )
}

function EmbodiedAiFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050810]" aria-hidden>
      <div className="absolute inset-0 grid lg:grid-cols-2">
        <div className="relative border-b lg:border-b-0 lg:border-r border-cyan-500/15 bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950">
          <CodePanel />
        </div>
        <div className="relative bg-gradient-to-bl from-[#0f172a] via-violet-950/50 to-slate-950 min-h-[200px] lg:min-h-0">
          <PhysicalPanel />
        </div>
      </div>
      {/* Center sync beam — desktop only */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400/40 bg-cyan-500/10 hero-sync-pulse" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/65 to-[#0f172a]/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/85 via-[#0f172a]/20 to-[#0f172a]/70" />
    </div>
  )
}

export default function HomeHeroVideoBackdrop({ videoUrl = '', posterUrl = '' }) {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const hasVideo = Boolean(videoUrl?.trim()) && !reducedMotion

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !hasVideo) return undefined

    const src = videoUrl.trim()
    const useHls = isHlsSource(src)
    let hls = null

    const markReady = () => setReady(true)

    if (useHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, startLevel: -1 })
      hls.loadSource(src)
      hls.attachMedia(el)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        el.play().catch(() => {})
        markReady()
      })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
      })
    } else if (useHls && el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src
      el.addEventListener('canplay', markReady)
      el.play().catch(() => {})
    } else {
      el.src = src
      el.addEventListener('canplay', markReady)
      el.play().catch(() => {})
    }

    return () => {
      el.removeEventListener('canplay', markReady)
      hls?.destroy()
    }
  }, [hasVideo, videoUrl])

  if (!hasVideo) {
    return <EmbodiedAiFallback />
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {!ready && posterUrl ? (
        <img src={posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
      ) : null}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-700 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        poster={posterUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Split-screen vignette — reinforces code ↔ physical world even with uploaded B-roll */}
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#0f172a]/55 via-transparent to-[#0f172a]/55" />
      <div className="absolute inset-0 lg:bg-[linear-gradient(90deg,transparent_calc(50%-1px),rgba(34,211,238,0.12)_50%,transparent_calc(50%+1px))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/72 to-[#0f172a]/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/88 via-[#0f172a]/25 to-[#0f172a]/55" />
    </div>
  )
}
