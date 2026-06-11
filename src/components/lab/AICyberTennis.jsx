import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetection from '@tensorflow-models/pose-detection'
import CyberTennisTelemetry from './CyberTennisTelemetry'
import { createPongAudio } from '../../lib/cyberTennisAudio'
import {
  clearTrail,
  computeSwingVector,
  createCyberBall,
  projectBall,
  pushTrail,
  stepCyberBall,
} from '../../lib/cyberTennisPhysics'
import {
  CYBER_TENNIS_NEON,
  CYBER_TENNIS_VIDEO,
  HIT_FLASH_MS,
  POSE_CONFIDENCE_MIN,
  RACKET_RADIUS,
  TENNIS_ARM_BONES,
  TENNIS_ARM_JOINTS,
} from '../../config/cyberTennis'

const MATRIX_UI_MS = 100

function formatMetric(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return '—'
  return digits > 0 ? value.toFixed(digits) : String(Math.round(value))
}

function getJoint(keypoints, name) {
  const kp = keypoints.find((k) => k.name === name && (k.score ?? 0) >= POSE_CONFIDENCE_MIN)
  if (!kp) return null
  return { x: kp.x, y: kp.y, score: kp.score ?? 0 }
}

/**
 * AI Cyber Tennis — Phase 4: swing velocity math + educational telemetry.
 */
export default function AICyberTennis() {
  const webcamRef = useRef(null)
  const overlayRef = useRef(null)
  const stageRef = useRef(null)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const lastFrameTsRef = useRef(0)
  const lastPhysicsTsRef = useRef(0)
  const fpsSamplesRef = useRef([])
  const prevRacketRef = useRef(null)
  const swingRef = useRef({ dx: 0, dy: 0, magnitude: 0 })
  const ballRef = useRef(createCyberBall())
  const hitFxRef = useRef([])
  const rallyHitsRef = useRef(0)
  const audioRef = useRef(null)
  const lastMatrixUiRef = useRef(0)

  /** Game-loop racket + swing — no React re-renders */
  const racketRef = useRef({ x: 0, y: 0, active: false, confidence: 0 })

  const [gameActive, setGameActive] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [cameraReady, setCameraReady] = useState(false)
  const [modelStatus, setModelStatus] = useState('Initializing WebGL…')
  const [modelReady, setModelReady] = useState(false)
  const [modelError, setModelError] = useState(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [telemetry, setTelemetry] = useState({})

  const videoConstraints = {
    ...CYBER_TENNIS_VIDEO,
    facingMode,
  }

  const syncCanvasSize = useCallback(() => {
    const canvas = overlayRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const { width, height } = stage.getBoundingClientRect()
    const w = Math.round(width)
    const h = Math.round(height)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }, [])

  const mapPoint = useCallback((x, y, scaleX, scaleY, canvasW, mirrored) => {
    const px = x * scaleX
    return { x: mirrored ? canvasW - px : px, y: y * scaleY }
  }, [])

  const pushTelemetry = useCallback((patch) => {
    const now = performance.now()
    if (now - lastMatrixUiRef.current < MATRIX_UI_MS) return
    lastMatrixUiRef.current = now
    setTelemetry((prev) => ({ ...prev, ...patch }))
  }, [])

  const drawVirtualRacket = useCallback((ctx, x, y, swing) => {
    ctx.save()
    ctx.strokeStyle = CYBER_TENNIS_NEON.green
    ctx.lineWidth = 4
    ctx.shadowColor = CYBER_TENNIS_NEON.green
    ctx.shadowBlur = 22
    ctx.beginPath()
    ctx.arc(x, y, RACKET_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 10
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.stroke()

    if (swing && swing.magnitude > 1) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + swing.dx * 2.5, y + swing.dy * 2.5)
      ctx.strokeStyle = CYBER_TENNIS_NEON.cyan
      ctx.lineWidth = 3
      ctx.shadowColor = CYBER_TENNIS_NEON.cyan
      ctx.shadowBlur = 12
      ctx.stroke()
    }
    ctx.restore()
  }, [])

  const averageArmConfidence = useCallback((keypoints) => {
    const scores = TENNIS_ARM_JOINTS.map((name) => getJoint(keypoints, name)?.score).filter(
      (s) => s != null
    )
    if (!scores.length) return 0
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }, [])

  const updateRacketFromPose = useCallback(
    (keypoints, scaleX, scaleY, canvasW, canvasH, mirrored, poseScore) => {
      const wrist = getJoint(keypoints, 'right_wrist')
      if (!wrist) {
        racketRef.current.active = false
        swingRef.current = { dx: 0, dy: 0, magnitude: 0 }
        pushTelemetry({
          racketCoords: '—',
          swingSpeed: '—',
          aiConfidence: '—',
        })
        return
      }

      const p = mapPoint(wrist.x, wrist.y, scaleX, scaleY, canvasW, mirrored)
      const swing = computeSwingVector(prevRacketRef.current, p)
      swingRef.current = swing

      const armConf = averageArmConfidence(keypoints)
      const aiConf = poseScore != null ? (poseScore + armConf) / 2 : armConf

      racketRef.current.x = p.x
      racketRef.current.y = p.y
      racketRef.current.active = true
      racketRef.current.confidence = aiConf

      pushTelemetry({
        racketCoords: `(${Math.round(p.x)}, ${Math.round(p.y)})`,
        swingSpeed: formatMetric(swing.magnitude, 1),
        aiConfidence: formatMetric(aiConf * 100, 0),
      })

      prevRacketRef.current = { x: p.x, y: p.y, t: performance.now() }
    },
    [averageArmConfidence, mapPoint, pushTelemetry]
  )

  const drawArmSkeleton = useCallback(
    (ctx, keypoints, scaleX, scaleY, canvasW, mirrored) => {
      const byName = {}
      for (const name of TENNIS_ARM_JOINTS) {
        const joint = getJoint(keypoints, name)
        if (joint) {
          byName[name] = mapPoint(joint.x, joint.y, scaleX, scaleY, canvasW, mirrored)
        }
      }

      ctx.strokeStyle = CYBER_TENNIS_NEON.skeleton
      ctx.lineWidth = 3
      ctx.shadowColor = CYBER_TENNIS_NEON.skeleton
      ctx.shadowBlur = 8
      for (const [a, b] of TENNIS_ARM_BONES) {
        const p1 = byName[a]
        const p2 = byName[b]
        if (!p1 || !p2) continue
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      for (const name of TENNIS_ARM_JOINTS) {
        const p = byName[name]
        if (!p) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = CYBER_TENNIS_NEON.skeleton
        ctx.fill()
      }

      const visibleCount = TENNIS_ARM_JOINTS.filter((n) => byName[n]).length
      pushTelemetry({ keypoints: String(visibleCount) })
    },
    [mapPoint, pushTelemetry]
  )

  const handleHit = useCallback((proj, swingMag = 0) => {
    rallyHitsRef.current += 1
    hitFxRef.current.push({ x: proj.sx, y: proj.sy, bornAt: performance.now() })
    setScore((s) => s + 1)
    setCombo((c) => c + 1)
    audioRef.current?.playPong({ combo: rallyHitsRef.current })
    pushTelemetry({
      collisions: String(rallyHitsRef.current),
      lastHitSwing: formatMetric(swingMag, 1),
    })
  }, [pushTelemetry])

  const handleMiss = useCallback(() => {
    rallyHitsRef.current = 0
    ballRef.current = createCyberBall()
    clearTrail(ballRef.current)
    hitFxRef.current = []
    setScore(0)
    setCombo(0)
    pushTelemetry({ collisions: '0' })
  }, [pushTelemetry])

  const drawHitFlashes = useCallback((ctx) => {
    const now = performance.now()
    hitFxRef.current = hitFxRef.current.filter((f) => now - f.bornAt < HIT_FLASH_MS)
    for (const f of hitFxRef.current) {
      const t = (now - f.bornAt) / HIT_FLASH_MS
      const r = 18 + t * 90
      ctx.save()
      ctx.globalAlpha = 1 - t
      ctx.strokeStyle = CYBER_TENNIS_NEON.hitFlash
      ctx.lineWidth = 3
      ctx.shadowColor = CYBER_TENNIS_NEON.ball
      ctx.shadowBlur = 24
      ctx.beginPath()
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2)
      ctx.stroke()
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(f.x, f.y)
        ctx.lineTo(f.x + Math.cos(a) * r * 0.7, f.y + Math.sin(a) * r * 0.7)
        ctx.strokeStyle = CYBER_TENNIS_NEON.cyan
        ctx.stroke()
      }
      ctx.restore()
    }
  }, [])

  const drawBall = useCallback((ctx, ball, proj) => {
    const { sx, sy, radius } = proj
    pushTrail(ball, sx, sy)

    for (let i = 0; i < ball.trail.length; i++) {
      const pt = ball.trail[i]
      const alpha = (i + 1) / ball.trail.length
      ctx.beginPath()
      ctx.arc(pt.sx, pt.sy, radius * alpha * 0.65, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.35})`
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fillStyle = CYBER_TENNIS_NEON.ball
    ctx.shadowColor = CYBER_TENNIS_NEON.ball
    ctx.shadowBlur = 22
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(sx - radius * 0.25, sy - radius * 0.25, radius * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fill()
  }, [])

  const drawCourt = useCallback((ctx, w, h) => {
    ctx.strokeStyle = `${CYBER_TENNIS_NEON.wall}66`
    ctx.lineWidth = 2
    ctx.strokeRect(w * 0.08, h * 0.1, w * 0.84, h * 0.78)
    ctx.beginPath()
    ctx.moveTo(w * 0.08, h * 0.1)
    ctx.lineTo(w * 0.5, h * 0.22)
    ctx.lineTo(w * 0.92, h * 0.1)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(w * 0.08, h * 0.88)
    ctx.lineTo(w * 0.5, h * 0.72)
    ctx.lineTo(w * 0.92, h * 0.88)
    ctx.stroke()
  }, [])

  const updateAndDrawGame = useCallback(
    (ctx, w, h, dt) => {
      const ball = ballRef.current
      const event = stepCyberBall(ball, racketRef.current, swingRef.current, w, h, dt)
      const proj = event.proj || projectBall(ball, w, h)

      drawCourt(ctx, w, h)
      drawBall(ctx, ball, proj)

      if (racketRef.current.active) {
        drawVirtualRacket(ctx, racketRef.current.x, racketRef.current.y, swingRef.current)
      }

      drawHitFlashes(ctx)

      if (event.type === 'hit') handleHit(proj, event.swingMagnitude ?? swingRef.current.magnitude)
      if (event.type === 'miss') handleMiss()

      pushTelemetry({
        ballVel: formatMetric(Math.abs(ball.vz), 0),
        ballZ: formatMetric(ball.z, 1),
      })
    },
    [drawBall, drawCourt, drawHitFlashes, drawVirtualRacket, handleHit, handleMiss, pushTelemetry]
  )

  const renderFrame = useCallback(
    (keypoints, scaleX, scaleY, mirrored, poseScore) => {
      const canvas = overlayRef.current
      if (!canvas) return
      syncCanvasSize()
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const now = performance.now()
      const dt = lastPhysicsTsRef.current
        ? Math.min(0.05, (now - lastPhysicsTsRef.current) / 1000)
        : 1 / 60
      lastPhysicsTsRef.current = now

      if (keypoints?.length) {
        updateRacketFromPose(keypoints, scaleX, scaleY, w, h, mirrored, poseScore)
        drawArmSkeleton(ctx, keypoints, scaleX, scaleY, w, mirrored)
      } else {
        racketRef.current.active = false
        swingRef.current = { dx: 0, dy: 0, magnitude: 0 }
        pushTelemetry({
          keypoints: '0',
          racketCoords: '—',
          swingSpeed: '—',
          aiConfidence: '—',
        })
      }

      updateAndDrawGame(ctx, w, h, dt)
    },
    [drawArmSkeleton, pushTelemetry, syncCanvasSize, updateAndDrawGame, updateRacketFromPose]
  )

  const detectFrame = useCallback(async () => {
    if (!gameActive || !detectorRef.current) return
    const video = webcamRef.current?.video
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectFrame)
      return
    }

    const t0 = performance.now()
    try {
      const poses = await detectorRef.current.estimatePoses(video, {
        flipHorizontal: facingMode === 'user',
      })
      const pose = poses[0]
      const vw = video.videoWidth || 1
      const vh = video.videoHeight || 1
      syncCanvasSize()
      const canvas = overlayRef.current
      const scaleX = canvas ? canvas.width / vw : 1
      const scaleY = canvas ? canvas.height / vh : 1
      const mirrored = facingMode === 'user'

      renderFrame(pose?.keypoints ?? [], scaleX, scaleY, mirrored, pose?.score)

      const latency = performance.now() - t0
      const now = performance.now()
      if (lastFrameTsRef.current) {
        const dt = now - lastFrameTsRef.current
        fpsSamplesRef.current.push(1000 / dt)
        if (fpsSamplesRef.current.length > 20) fpsSamplesRef.current.shift()
        const avg = fpsSamplesRef.current.reduce((a, b) => a + b, 0) / fpsSamplesRef.current.length
        pushTelemetry({ fps: formatMetric(avg, 0), latency: formatMetric(latency, 0) })
      }
      lastFrameTsRef.current = now
    } catch (err) {
      console.error(err)
    }

    rafRef.current = requestAnimationFrame(detectFrame)
  }, [facingMode, gameActive, pushTelemetry, renderFrame, syncCanvasSize])

  useEffect(() => {
    audioRef.current = createPongAudio()
    return () => audioRef.current?.dispose()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setModelStatus('Loading WebGL backend…')
        await tf.setBackend('webgl')
        await tf.ready()
        if (cancelled) return

        setModelStatus('Loading MoveNet SINGLEPOSE_LIGHTNING…')
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        })
        if (cancelled) {
          detector.dispose?.()
          return
        }
        detectorRef.current = detector
        setModelReady(true)
        setModelStatus('MoveNet ready')
      } catch (err) {
        console.error(err)
        setModelError(err.message || 'Failed to load MoveNet')
        setModelStatus('MoveNet failed')
      }
    })()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      detectorRef.current?.dispose?.()
    }
  }, [])

  useEffect(() => {
    if (!gameActive || !modelReady) return undefined
    rafRef.current = requestAnimationFrame(detectFrame)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [detectFrame, gameActive, modelReady])

  useEffect(() => {
    const onResize = () => syncCanvasSize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [syncCanvasSize])

  const startGame = () => {
    if (!modelReady) return
    ballRef.current = createCyberBall()
    rallyHitsRef.current = 0
    hitFxRef.current = []
    swingRef.current = { dx: 0, dy: 0, magnitude: 0 }
    lastPhysicsTsRef.current = 0
    racketRef.current = { x: 0, y: 0, active: false, confidence: 0 }
    prevRacketRef.current = null
    fpsSamplesRef.current = []
    setScore(0)
    setCombo(0)
    setTelemetry({ collisions: '0', ballZ: '100' })
    setGameActive(true)
  }

  const stopGame = () => {
    setGameActive(false)
    setCameraReady(false)
    racketRef.current.active = false
    swingRef.current = { dx: 0, dy: 0, magnitude: 0 }
    prevRacketRef.current = null
    const canvas = overlayRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const toggleCamera = () => {
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
    setCameraReady(false)
    racketRef.current.active = false
    swingRef.current = { dx: 0, dy: 0, magnitude: 0 }
    prevRacketRef.current = null
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#050810] text-slate-100 flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 opacity-35"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(16,185,129,0.22), transparent), radial-gradient(ellipse 40% 35% at 90% 80%, rgba(244,114,182,0.12), transparent)',
        }}
      />

      <header className="relative shrink-0 border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/exploration"
              className="text-xs text-emerald-400/90 hover:text-emerald-300 font-medium inline-flex items-center mb-1 transition-colors"
            >
              ← AI Exploration Lab
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-200 via-white to-cyan-200 bg-clip-text text-transparent">
              AI Cyber Tennis
            </h1>
            <p
              className={`text-xs font-mono mt-0.5 ${modelReady ? 'text-emerald-400' : modelError ? 'text-red-400' : 'text-amber-400'}`}
            >
              {modelReady ? '●' : modelError ? '✕' : '◌'} {modelStatus}
              {modelReady ? ' · Phase 4 swing math' : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/20 min-h-[44px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Score</span>
              <span className="text-lg font-mono font-bold text-emerald-300 tabular-nums">{score}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-fuchsia-500/20 min-h-[44px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Combo</span>
              <span className="text-lg font-mono font-bold text-fuchsia-300 tabular-nums">{combo}</span>
            </div>
            {gameActive ? (
              <>
                <button
                  type="button"
                  onClick={stopGame}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold bg-red-950/60 border border-red-500/40 text-red-200 hover:bg-red-900/40 transition"
                >
                  Stop
                </button>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-emerald-500/30"
                >
                  {facingMode === 'user' ? '🤳 Front' : '📷 Back'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startGame}
                disabled={!modelReady}
                className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {modelReady ? 'Start' : 'Loading AI…'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_minmax(280px,340px)] gap-4 p-4 sm:p-5 max-w-7xl mx-auto w-full min-h-0">
        <section className="flex flex-col min-w-0 min-h-[min(72vh,640px)] lg:min-h-0">
          <div
            ref={stageRef}
            className={`relative flex-1 w-full rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
              gameActive
                ? 'border-emerald-400/40 shadow-[0_0_48px_rgba(16,185,129,0.2)]'
                : 'border-slate-700/60 bg-slate-900/50 aspect-[4/3] max-h-[min(72vh,640px)]'
            }`}
          >
            {!modelReady && !modelError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/95 px-6 text-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin"
                  aria-hidden
                />
                <p className="text-sm text-emerald-200/90">{modelStatus}</p>
                <p className="text-xs text-slate-500">MoveNet SINGLEPOSE_LIGHTNING · TensorFlow.js WebGL</p>
              </div>
            )}

            {modelError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-slate-950/95 px-6 text-center">
                <p className="text-sm text-red-300">Could not load pose model</p>
                <p className="text-xs text-slate-500">{modelError}</p>
              </div>
            )}

            {gameActive ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored={facingMode === 'user'}
                  videoConstraints={videoConstraints}
                  onLoadedData={() => {
                    setCameraReady(true)
                    syncCanvasSize()
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  aria-label="MoveNet skeleton and virtual racket overlay"
                />
                {!cameraReady && modelReady && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 text-sm text-emerald-200/80 px-6 text-center">
                    Allow camera access to play…
                  </div>
                )}
              </>
            ) : (
              modelReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-gradient-to-b from-emerald-950/50 to-slate-950">
                  <span className="text-6xl" aria-hidden>
                    🎾
                  </span>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Cyber Squash: a depth-tracked ball flies toward you — swing your virtual racket to
                    rally. Miss and your score resets.
                  </p>
                  <p className="text-xs text-[#fde047] font-mono">z-depth physics · Web Audio pong · pose hit detect</p>
                </div>
              )
            )}
          </div>
        </section>

        <CyberTennisTelemetry active={gameActive && cameraReady && modelReady} metrics={telemetry} />
      </main>
    </div>
  )
}
