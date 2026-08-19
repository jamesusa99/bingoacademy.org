import { useEffect, useRef, useState } from 'react'
import { loadHls } from '../../lib/loadHls'

function isHlsSource(src) {
  if (!src) return false
  return src.includes('.m3u8') || src.includes('cloudflarestream.com')
}

function NotebookCodePanel() {
  return (
    <div className="relative h-full flex flex-col justify-center p-6 sm:p-8 lg:p-10">
      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-500/80 mb-3">
        Jupyter · Python
      </p>
      <div className="font-mono text-[10px] sm:text-xs leading-relaxed text-cyan-300/95 space-y-0.5 max-w-xs mx-auto lg:mx-0 lg:ml-auto lg:mr-6">
        <p className="text-emerald-400/90"># Train a simple classifier</p>
        <p>
          <span className="text-violet-300">model</span> = <span className="text-amber-200">nn.Sequential</span>(...)
        </p>
        <p>
          <span className="text-violet-300">loss</span> = <span className="text-amber-200">criterion</span>(
          <span className="text-cyan-300">pred</span>, <span className="text-cyan-300">y</span>)
        </p>
        <p>
          <span className="text-violet-300">loss</span>.<span className="text-amber-200">backward</span>()
        </p>
        <p>
          <span className="text-violet-300">optimizer</span>.<span className="text-amber-200">step</span>()
        </p>
        <p className="text-slate-500 pt-1">
          <span className="hero-code-cursor inline-block w-2 h-3.5 bg-cyan-400/80 align-middle ml-0.5" />
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-400/80 font-mono max-w-xs mx-auto lg:mx-0 lg:ml-auto lg:mr-6">
        <span className="hero-sync-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        epoch 12 · val_acc 0.91
      </div>
    </div>
  )
}

function MetricsPanel() {
  return (
    <div className="relative h-full overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8">
      <p className="absolute top-6 sm:top-8 left-6 sm:left-8 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400/80">
        Model training · Evaluation
      </p>

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(129,140,248,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-[240px] sm:max-w-[280px]">
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Training loss</p>
          <div className="flex items-end gap-1 h-16 mb-4">
            {[72, 58, 48, 40, 34, 28, 24, 20, 18, 16].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-cyan-600/80 to-cyan-400/90 hero-metric-bar"
                style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Confusion matrix</p>
          <div className="grid grid-cols-3 gap-1">
            {['0.82', '0.06', '0.04', '0.05', '0.88', '0.07', '0.03', '0.05', '0.91'].map((v, i) => (
              <div
                key={i}
                className="aspect-square rounded bg-violet-500/20 border border-violet-400/20 flex items-center justify-center text-[9px] font-mono text-violet-200/90"
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 sm:bottom-8 text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-400/60 uppercase">
        Reproducible ML experiments
      </p>
    </div>
  )
}

function MlLabFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050810]" aria-hidden>
      <div className="absolute inset-0 grid lg:grid-cols-2">
        <div className="relative border-b lg:border-b-0 lg:border-r border-cyan-500/15 bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950">
          <NotebookCodePanel />
        </div>
        <div className="relative bg-gradient-to-bl from-[#0f172a] via-violet-950/50 to-slate-950 min-h-[200px] lg:min-h-0">
          <MetricsPanel />
        </div>
      </div>
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
    let cancelled = false

    const markReady = () => setReady(true)

    async function setup() {
      if (useHls) {
        const { default: Hls } = await loadHls()
        if (cancelled) return
        if (Hls.isSupported()) {
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
          return
        }
        if (el.canPlayType('application/vnd.apple.mpegurl')) {
          el.src = src
          el.addEventListener('canplay', markReady)
          el.play().catch(() => {})
          return
        }
      }

      el.src = src
      el.addEventListener('canplay', markReady)
      el.play().catch(() => {})
    }

    setup().catch(() => {})

    return () => {
      cancelled = true
      el.removeEventListener('canplay', markReady)
      hls?.destroy()
    }
  }, [hasVideo, videoUrl])

  if (!hasVideo) {
    return <MlLabFallback />
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {!ready && posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          width={1920}
          height={1080}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/72 to-[#0f172a]/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/88 via-[#0f172a]/25 to-[#0f172a]/55" />
    </div>
  )
}
