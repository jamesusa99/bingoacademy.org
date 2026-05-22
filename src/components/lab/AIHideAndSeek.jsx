import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Webcam from 'react-webcam'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import confetti from 'canvas-confetti'
import ConfidenceGauge from './ConfidenceGauge'
import {
  AI_EDUCATION_BLURB,
  DETECTION_THRESHOLD,
  HIDE_AND_SEEK_TARGETS,
  SUCCESS_DISPLAY_MS,
  getTargetConfidence,
  pickRandomTarget,
} from '../../config/hideAndSeek'

const VIDEO_CONSTRAINTS_BASE = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
}

const NEON_GREEN = '#39ff14'
const NEON_GREEN_DIM = 'rgba(57, 255, 20, 0.35)'
const NEON_TARGET = '#5dffa8'
const NEON_TARGET_FILL = 'rgba(93, 255, 168, 0.22)'
const NEON_NEAR = 'rgba(251, 191, 36, 0.9)'

export default function AIHideAndSeek() {
  const webcamRef = useRef(null)
  const overlayRef = useRef(null)
  const videoContainerRef = useRef(null)
  const modelRef = useRef(null)
  const rafRef = useRef(null)
  const detectingRef = useRef(false)
  const targetRef = useRef(pickRandomTarget())
  const celebratingRef = useRef(false)
  const fpsRef = useRef({ frames: 0, lastTick: performance.now() })

  const [score, setScore] = useState(0)
  const [scorePop, setScorePop] = useState(false)
  const [target, setTarget] = useState(targetRef.current)
  const [targetConfidence, setTargetConfidence] = useState(0)
  const [facingMode, setFacingMode] = useState('environment')
  const [engineStatus, setEngineStatus] = useState('AI Vision Engine: Initializing...')
  const [modelReady, setModelReady] = useState(false)
  const [detections, setDetections] = useState([])
  const [fps, setFps] = useState(0)
  const [cameraReady, setCameraReady] = useState(false)
  const [foundFlash, setFoundFlash] = useState(false)

  const videoConstraints = {
    ...VIDEO_CONSTRAINTS_BASE,
    facingMode,
  }

  const syncCanvasSize = useCallback(() => {
    const canvas = overlayRef.current
    const container = videoContainerRef.current
    if (!canvas || !container) return

    const { width, height } = container.getBoundingClientRect()
    const w = Math.round(width)
    const h = Math.round(height)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }, [])

  const drawPredictions = useCallback(
    (predictions, mirrored) => {
      const canvas = overlayRef.current
      const video = webcamRef.current?.video
      if (!canvas || !video) return

      syncCanvasSize()
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      const vw = video.videoWidth || w
      const vh = video.videoHeight || h
      const scaleX = w / vw
      const scaleY = h / vh
      const targetClass = targetRef.current.className

      ctx.clearRect(0, 0, w, h)

      predictions.forEach((p) => {
        const [x, y, width, height] = p.bbox
        let bx = x * scaleX
        const by = y * scaleY
        const bw = width * scaleX
        const bh = height * scaleY

        if (mirrored) bx = w - bx - bw

        const isSameClass = p.class.toLowerCase() === targetClass
        const isWinner = isSameClass && p.score >= DETECTION_THRESHOLD
        const isNear = isSameClass && p.score >= 0.35 && p.score < DETECTION_THRESHOLD

        const stroke = isWinner ? NEON_TARGET : isNear ? NEON_NEAR : NEON_GREEN
        const fill = isWinner ? NEON_TARGET_FILL : isNear ? 'rgba(251, 191, 36, 0.15)' : NEON_GREEN_DIM

        ctx.save()
        ctx.shadowColor = stroke
        ctx.shadowBlur = isWinner ? 16 : 8
        ctx.strokeStyle = stroke
        ctx.lineWidth = isWinner ? 3 : 2
        ctx.fillStyle = fill
        ctx.fillRect(bx, by, bw, bh)
        ctx.strokeRect(bx, by, bw, bh)

        const corner = Math.min(14, bw * 0.2, bh * 0.2)
        const drawCorner = (cx, cy, dx, dy) => {
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx + dx * corner, cy)
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx, cy + dy * corner)
          ctx.stroke()
        }
        drawCorner(bx, by, 1, 1)
        drawCorner(bx + bw, by, -1, 1)
        drawCorner(bx, by + bh, 1, -1)
        drawCorner(bx + bw, by + bh, -1, -1)
        ctx.restore()

        const label = `${p.class} ${(p.score * 100).toFixed(0)}%`
        ctx.font = '600 11px Inter, system-ui, sans-serif'
        const tw = ctx.measureText(label).width + 12
        const labelY = Math.max(0, by - 22)
        ctx.fillStyle = 'rgba(0, 20, 8, 0.82)'
        ctx.fillRect(bx, labelY, tw, 22)
        ctx.strokeStyle = stroke
        ctx.lineWidth = 1
        ctx.strokeRect(bx, labelY, tw, 22)
        ctx.fillStyle = stroke
        ctx.fillText(label, bx + 6, labelY + 15)
      })
    },
    [syncCanvasSize]
  )

  const handleSuccess = useCallback(() => {
    if (celebratingRef.current) return
    celebratingRef.current = true

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#39ff14', '#fde047', '#22d3ee', '#f472b6', '#a78bfa'],
    })
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#39ff14', '#fde047'],
    })
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#39ff14', '#fde047'],
    })

    setFoundFlash(true)
    setTargetConfidence(1)
    setScore((s) => s + 1)
    setScorePop(true)
    setTimeout(() => setScorePop(false), 600)

    setTimeout(() => {
      const next = pickRandomTarget(targetRef.current.className)
      targetRef.current = next
      setTarget(next)
      setTargetConfidence(0)
      setFoundFlash(false)
      celebratingRef.current = false
    }, SUCCESS_DISPLAY_MS)
  }, [])

  const tickFps = useCallback(() => {
    fpsRef.current.frames += 1
    const now = performance.now()
    if (now - fpsRef.current.lastTick >= 1000) {
      setFps(fpsRef.current.frames)
      fpsRef.current.frames = 0
      fpsRef.current.lastTick = now
    }
  }, [])

  const detectFrame = useCallback(async () => {
    const video = webcamRef.current?.video
    const model = modelRef.current
    const mirrored = facingMode === 'user'

    if (!video || video.readyState < 2 || !model || !modelReady || !cameraReady) {
      rafRef.current = requestAnimationFrame(detectFrame)
      return
    }

    if (detectingRef.current) {
      rafRef.current = requestAnimationFrame(detectFrame)
      return
    }

    detectingRef.current = true
    try {
      const predictions = await model.detect(video)
      tickFps()
      setDetections(predictions)

      if (!celebratingRef.current) {
        setTargetConfidence(getTargetConfidence(predictions, targetRef.current.className))
      }

      drawPredictions(predictions, mirrored)

      if (!celebratingRef.current) {
        const match = predictions.find(
          (p) =>
            p.class.toLowerCase() === targetRef.current.className &&
            p.score >= DETECTION_THRESHOLD
        )
        if (match) handleSuccess()
      }
    } catch (err) {
      console.error('[AI Hide & Seek] detectFrame:', err)
    } finally {
      detectingRef.current = false
      rafRef.current = requestAnimationFrame(detectFrame)
    }
  }, [
    cameraReady,
    modelReady,
    facingMode,
    tickFps,
    drawPredictions,
    handleSuccess,
  ])

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        setEngineStatus('AI Vision Engine: Loading COCO-SSD…')
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
        if (cancelled) return
        modelRef.current = model
        setModelReady(true)
        setEngineStatus('AI Vision Engine: Online')
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setModelReady(false)
          setEngineStatus('AI Vision Engine: Offline — reload to retry')
        }
      }
    }

    loadModel()
    return () => {
      cancelled = true
      modelRef.current = null
      setModelReady(false)
    }
  }, [])

  useEffect(() => {
    if (!modelReady || !cameraReady) return
    rafRef.current = requestAnimationFrame(detectFrame)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [modelReady, cameraReady, detectFrame])

  useEffect(() => {
    const container = videoContainerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      syncCanvasSize()
      drawPredictions(detections, facingMode === 'user')
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [syncCanvasSize, drawPredictions, detections, facingMode])

  const toggleCamera = () => {
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
    setCameraReady(false)
    setTargetConfidence(0)
  }

  const winThresholdPct = Math.round(DETECTION_THRESHOLD * 100)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100 flex flex-col">
      <header className="shrink-0 border-b border-cyan-500/20 bg-slate-900/95 backdrop-blur px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto w-full">
          <Link
            to="/lab"
            className="text-xs text-cyan-400/90 hover:text-cyan-300 font-medium min-h-[44px] inline-flex items-center transition-colors"
          >
            ← AI Exploration Lab
          </Link>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 flex-1 justify-end">
            <div
              className={`flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/80 px-4 py-2 min-h-[44px] transition-transform duration-300 ${
                scorePop ? 'scale-110 border-cyan-400/60' : ''
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Score</span>
              <span className="text-2xl font-bold tabular-nums text-cyan-400 transition-all duration-300">
                {score}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 min-h-[44px] transition-all duration-500 ease-out ${
                foundFlash
                  ? 'border-[#39ff14] bg-[#39ff14]/20 shadow-[0_0_28px_rgba(57,255,20,0.4)] scale-105'
                  : 'border-amber-500/40 bg-amber-500/10'
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Target</span>
              <span
                key={target.className}
                className="text-lg sm:text-xl font-bold text-amber-200 transition-opacity duration-500"
              >
                {target.emoji} Find a: {target.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h1 className="text-lg font-bold text-white tracking-tight">AI Hide &amp; Seek 🎮</h1>
            <button
              type="button"
              onClick={toggleCamera}
              disabled={foundFlash}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-600 hover:border-[#39ff14]/50 hover:bg-slate-700 transition-all duration-300 disabled:opacity-50"
            >
              {facingMode === 'environment' ? '📷 Back camera' : '🤳 Front camera'}
            </button>
          </div>

          <div
            ref={videoContainerRef}
            className={`relative w-full aspect-[4/3] max-h-[min(70vh,520px)] mx-auto rounded-2xl overflow-hidden border-2 bg-slate-900 transition-all duration-500 ease-out ${
              foundFlash
                ? 'border-[#39ff14] shadow-[0_0_48px_rgba(57,255,20,0.35)]'
                : 'border-[#39ff14]/25 shadow-[0_0_40px_rgba(57,255,20,0.12)]'
            }`}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={facingMode === 'user'}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onLoadedData={() => {
                setCameraReady(true)
                syncCanvasSize()
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-label="Object detection overlay"
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-sm text-slate-400 px-6 text-center">
                📸 Allow camera access to start the game!
              </div>
            )}
            {!modelReady && cameraReady && (
              <div className="absolute bottom-3 left-3 right-3 text-center text-xs font-mono text-[#39ff14]/90 bg-black/50 rounded-xl py-2 px-3">
                {engineStatus}
              </div>
            )}
            {foundFlash && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-[#39ff14]/10 backdrop-blur-[2px] transition-opacity duration-300">
                <span className="text-4xl sm:text-5xl font-black text-[#39ff14] drop-shadow-[0_0_16px_#39ff14] animate-bounce">
                  Found it! 🎉
                </span>
                <span className="text-sm text-amber-100 mt-2 font-medium">Next target coming up…</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-3 text-center lg:text-left leading-relaxed">
            Hold your object in view — when the confidence bar hits {winThresholdPct}%, you win!
          </p>
        </main>

        <aside className="lg:w-80 shrink-0 flex flex-col gap-4">
          <div className="card border-slate-700/80 bg-slate-900/90 p-5 text-slate-200 rounded-2xl !shadow-none">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#39ff14]/90 mb-2">
              Science dashboard
            </p>
            <p
              className={`text-sm font-mono leading-relaxed transition-colors duration-300 ${
                modelReady ? 'text-[#39ff14]' : 'text-cyan-100/90'
              }`}
            >
              {engineStatus}
            </p>

            <div className="mt-4">
              <ConfidenceGauge
                confidence={targetConfidence}
                targetLabel={target.label}
                targetEmoji={target.emoji}
                celebrating={foundFlash}
              />
            </div>

            <p className="mt-4 text-xs text-slate-400 leading-relaxed rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
              💡 {AI_EDUCATION_BLURB}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60 transition-colors duration-300">
                <dt className="text-slate-500 uppercase tracking-wide">FPS</dt>
                <dd className="text-lg font-bold text-[#39ff14] tabular-nums mt-0.5">{fps}</dd>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
                <dt className="text-slate-500 uppercase tracking-wide">In frame</dt>
                <dd className="text-lg font-bold text-[#39ff14] tabular-nums mt-0.5">
                  {detections.length}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card border-slate-700/80 bg-slate-900/60 p-4 rounded-2xl !shadow-none">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 mb-2">
              How to play 🌟
            </p>
            <ol className="text-xs text-slate-400 space-y-2.5 list-none leading-relaxed">
              {[
                'Read the target at the top — then go find it!',
                'Point your camera so the object is inside the box.',
                'Watch the confidence bar fill up to 65%+.',
                'Celebrate when you see “Found it!” and score a point!',
              ].map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-2">All targets</p>
            <div className="flex flex-wrap gap-1.5">
              {HIDE_AND_SEEK_TARGETS.map((t) => (
                <span
                  key={t.className}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-all duration-300 ${
                    t.className === target.className
                      ? 'border-amber-400/70 bg-amber-500/25 text-amber-100 scale-105'
                      : 'border-slate-700 text-slate-500'
                  }`}
                >
                  {t.emoji} {t.label}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
