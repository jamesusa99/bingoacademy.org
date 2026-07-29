import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import {
  CANVAS_H,
  CANVAS_W,
  CELL,
  COLS,
  DROP_MS,
  FINGER_TETRIS_EDUCATION,
  FINGER_TETRIS_NEON,
  FINGER_TETRIS_VIDEO,
  HAND_BONES,
  HAND_CONFIDENCE_MIN,
  HAND_DETECTOR_CONFIG,
  HAND_DETECTOR_TFJS_FALLBACK,
  HARD_DROP_COOLDOWN_MS,
  HARD_DROP_VY,
  HOW_TO_PLAY_STEPS,
  INDEX_TIP,
  PINCH_THRESHOLD_PX,
  ROTATE_COOLDOWN_MS,
  ROWS,
  THUMB_TIP,
  pinchThresholdForVideo,
} from '../../config/fingerTetris'
import {
  columnFromNormalizedX,
  createGameState,
  ghostY,
  hardDrop,
  movePieceToColumn,
  resetGame,
  stepGravity,
  tryMove,
  tryRotate,
} from '../../lib/fingerTetris/engine'

const TELEMETRY_MS = 100

function formatMetric(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return '—'
  return digits > 0 ? Number(value).toFixed(digits) : String(Math.round(value))
}

function drawBoard(ctx, state, playing) {
  const { board, piece, gameOver } = state
  ctx.fillStyle = '#050810'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.strokeStyle = FINGER_TETRIS_NEON.grid
      ctx.strokeRect(x * CELL, y * CELL, CELL, CELL)
      const color = board[y][x]
      if (color) {
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
        ctx.shadowBlur = 0
      }
    }
  }

  if (piece) {
    const gy = ghostY(board, piece)
    ctx.fillStyle = FINGER_TETRIS_NEON.ghost
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (!piece.shape[y][x]) continue
        ctx.fillRect((piece.x + x) * CELL + 2, (gy + y) * CELL + 2, CELL - 4, CELL - 4)
      }
    }

    ctx.fillStyle = piece.color
    ctx.shadowColor = piece.color
    ctx.shadowBlur = 16
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (!piece.shape[y][x]) continue
        ctx.fillRect((piece.x + x) * CELL + 1, (piece.y + y) * CELL + 1, CELL - 2, CELL - 2)
      }
    }
    ctx.shadowBlur = 0
  }

  if (!playing) {
    ctx.fillStyle = 'rgba(5,8,16,0.72)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = FINGER_TETRIS_NEON.cyan
    ctx.font = 'bold 18px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('READY', CANVAS_W / 2, CANVAS_H / 2 - 10)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px monospace'
    ctx.fillText('Click Start Arena', CANVAS_W / 2, CANVAS_H / 2 + 14)
  } else if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = FINGER_TETRIS_NEON.magenta
    ctx.font = 'bold 22px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 8)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px monospace'
    ctx.fillText('Press Restart', CANVAS_W / 2, CANVAS_H / 2 + 16)
  }
}

/**
 * AI Finger Tetris — MediaPipe Hands → Canvas Tetris controller.
 */
export default function AIFingerTetris() {
  const webcamRef = useRef(null)
  const overlayRef = useRef(null)
  const stageRef = useRef(null)
  const gameCanvasRef = useRef(null)
  const boardSectionRef = useRef(null)
  const detectorRef = useRef(null)
  const trackRafRef = useRef(null)
  const gameRafRef = useRef(null)
  const lastTsRef = useRef(0)
  const lastUiRef = useRef(0)
  const bagRef = useRef([])
  const gameRef = useRef(createGameState(bagRef))
  const lastRotateRef = useRef(0)
  const lastHardDropRef = useRef(0)
  const prevTipRef = useRef(null)
  const pinchActiveRef = useRef(false)
  const estimatingRef = useRef(false)
  const gameActiveRef = useRef(false)
  const handSeenRef = useRef(false)

  const [gameActive, setGameActive] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [modelStatus, setModelStatus] = useState('Initializing WebGL…')
  const [modelReady, setModelReady] = useState(false)
  const [modelError, setModelError] = useState(null)
  const [hud, setHud] = useState({ score: 0, lines: 0, level: 1 })
  const [handSeen, setHandSeen] = useState(false)
  const [telemetry, setTelemetry] = useState({
    indexX: '—',
    pinch: '—',
    confidence: '—',
    pinchLimit: PINCH_THRESHOLD_PX,
  })

  const pushTelemetry = useCallback((patch) => {
    const now = performance.now()
    if (now - lastUiRef.current < TELEMETRY_MS) return
    lastUiRef.current = now
    setTelemetry((prev) => ({ ...prev, ...patch }))
    const g = gameRef.current
    setHud({ score: g.score, lines: g.lines, level: g.level })
  }, [])

  const syncOverlaySize = useCallback(() => {
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

  const paintGame = useCallback(() => {
    const canvas = gameCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawBoard(ctx, gameRef.current, gameActiveRef.current)
  }, [])

  const drawHandSkeleton = useCallback((ctx, keypoints, scaleX, scaleY, mirrorX, canvasW) => {
    const map = (kp) => {
      const x = kp.x * scaleX
      return { x: mirrorX ? canvasW - x : x, y: kp.y * scaleY }
    }

    ctx.strokeStyle = FINGER_TETRIS_NEON.green
    ctx.lineWidth = 2.5
    ctx.shadowColor = FINGER_TETRIS_NEON.green
    ctx.shadowBlur = 12
    ctx.lineCap = 'round'

    for (const [a, b] of HAND_BONES) {
      const pa = keypoints[a]
      const pb = keypoints[b]
      if (!pa || !pb) continue
      const A = map(pa)
      const B = map(pb)
      ctx.beginPath()
      ctx.moveTo(A.x, A.y)
      ctx.lineTo(B.x, B.y)
      ctx.stroke()
    }

    const tip = keypoints[INDEX_TIP]
    if (tip) {
      const T = map(tip)
      ctx.beginPath()
      ctx.fillStyle = FINGER_TETRIS_NEON.red
      ctx.shadowColor = FINGER_TETRIS_NEON.red
      ctx.shadowBlur = 22
      ctx.arc(T.x, T.y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.shadowBlur = 8
      ctx.fillStyle = '#fff'
      ctx.arc(T.x, T.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }, [])

  const applyFingerControls = useCallback((keypoints, videoW, _videoH, now) => {
    const tip = keypoints[INDEX_TIP]
    const thumb = keypoints[THUMB_TIP]
    if (!tip || !thumb) return null

    const mirroredX = videoW - tip.x
    const nx = mirroredX / videoW
    const targetCol = columnFromNormalizedX(nx)
    if (gameActiveRef.current) {
      movePieceToColumn(gameRef.current, targetCol)
    }

    const pinch = Math.hypot(tip.x - thumb.x, tip.y - thumb.y)
    const pinchLimit = pinchThresholdForVideo(videoW)
    if (pinch < pinchLimit) {
      if (
        gameActiveRef.current &&
        !pinchActiveRef.current &&
        now - lastRotateRef.current >= ROTATE_COOLDOWN_MS
      ) {
        if (tryRotate(gameRef.current)) lastRotateRef.current = now
      }
      pinchActiveRef.current = true
    } else {
      pinchActiveRef.current = false
    }

    const prev = prevTipRef.current
    if (prev && prev.t > 0) {
      const dt = Math.max(1, now - prev.t)
      const vy = (tip.y - prev.y) / dt
      if (
        gameActiveRef.current &&
        vy > HARD_DROP_VY &&
        now - lastHardDropRef.current >= HARD_DROP_COOLDOWN_MS &&
        !gameRef.current.gameOver
      ) {
        hardDrop(gameRef.current)
        lastHardDropRef.current = now
        prevTipRef.current = null
      } else {
        prevTipRef.current = { y: tip.y, t: now }
      }
    } else {
      prevTipRef.current = { y: tip.y, t: now }
    }

    return { mirroredX, pinch, pinchLimit }
  }, [])

  // Hand tracking loop (independent of Tetris gravity)
  const trackLoop = useCallback(() => {
    const detector = detectorRef.current
    const video = webcamRef.current?.video
    const overlay = overlayRef.current

    if (detector && video && video.readyState >= 2 && !estimatingRef.current) {
      estimatingRef.current = true
      syncOverlaySize()
      const ctx = overlay?.getContext('2d')
      detector
        .estimateHands(video, { flipHorizontal: false, staticImageMode: false })
        .then((hands) => {
          if (!overlay || !ctx) return
          ctx.clearRect(0, 0, overlay.width, overlay.height)
          const hand = hands[0]
          if (hand && (hand.score ?? 0) >= HAND_CONFIDENCE_MIN) {
            if (!handSeenRef.current) {
              handSeenRef.current = true
              setHandSeen(true)
            }
            const scaleX = overlay.width / video.videoWidth
            const scaleY = overlay.height / video.videoHeight
            drawHandSkeleton(ctx, hand.keypoints, scaleX, scaleY, true, overlay.width)

            const stats = applyFingerControls(
              hand.keypoints,
              video.videoWidth,
              video.videoHeight,
              performance.now(),
            )
            if (stats) {
              pushTelemetry({
                indexX: formatMetric(stats.mirroredX, 0),
                pinch: formatMetric(stats.pinch, 0),
                pinchLimit: Math.round(stats.pinchLimit),
                confidence: formatMetric((hand.score ?? 0) * 100, 0),
              })
            }
          } else {
            if (handSeenRef.current) {
              handSeenRef.current = false
              setHandSeen(false)
            }
            prevTipRef.current = null
            pinchActiveRef.current = false
            pushTelemetry({
              indexX: '—',
              pinch: '—',
              confidence: hand ? formatMetric((hand.score ?? 0) * 100, 0) : '—',
            })
          }
        })
        .catch((err) => console.error(err))
        .finally(() => {
          estimatingRef.current = false
        })
    }

    trackRafRef.current = requestAnimationFrame(trackLoop)
  }, [applyFingerControls, drawHandSkeleton, pushTelemetry, syncOverlaySize])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setModelStatus('Loading WebGL backend…')
        await tf.setBackend('webgl')
        await tf.ready()
        if (cancelled) return

        setModelStatus('Loading MediaPipe Hands…')
        let detector
        try {
          detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            HAND_DETECTOR_CONFIG,
          )
        } catch (cdnErr) {
          console.warn('MediaPipe CDN failed, trying TFJS runtime…', cdnErr)
          setModelStatus('CDN blocked — loading TFJS Hands…')
          detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            HAND_DETECTOR_TFJS_FALLBACK,
          )
        }
        if (cancelled) {
          detector.dispose?.()
          return
        }
        detectorRef.current = detector
        setModelReady(true)
        setModelError(null)
        setModelStatus('MediaPipe Hands ready — show your hand')
      } catch (err) {
        console.error(err)
        setModelError(err.message || 'Failed to load MediaPipe Hands')
        setModelStatus('Hand model failed')
      }
    })()
    return () => {
      cancelled = true
      if (trackRafRef.current) cancelAnimationFrame(trackRafRef.current)
      if (gameRafRef.current) cancelAnimationFrame(gameRafRef.current)
      detectorRef.current?.dispose?.()
      detectorRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!modelReady) return undefined
    trackRafRef.current = requestAnimationFrame(trackLoop)
    return () => {
      if (trackRafRef.current) cancelAnimationFrame(trackRafRef.current)
    }
  }, [modelReady, trackLoop])

  // Dedicated Tetris gravity loop — starts only when playing
  useEffect(() => {
    if (!gameActive) {
      if (gameRafRef.current) cancelAnimationFrame(gameRafRef.current)
      gameRafRef.current = null
      paintGame()
      return undefined
    }

    lastTsRef.current = 0
    let lastHud = 0
    const tick = (now) => {
      const dt = lastTsRef.current ? now - lastTsRef.current : 16
      lastTsRef.current = now
      const dropMs = Math.max(120, DROP_MS - (gameRef.current.level - 1) * 60)
      stepGravity(gameRef.current, dt, dropMs)
      paintGame()
      if (now - lastHud > 120) {
        lastHud = now
        const g = gameRef.current
        setHud({ score: g.score, lines: g.lines, level: g.level })
      }
      gameRafRef.current = requestAnimationFrame(tick)
    }
    gameRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (gameRafRef.current) cancelAnimationFrame(gameRafRef.current)
    }
  }, [gameActive, paintGame])

  useEffect(() => {
    const onResize = () => syncOverlaySize()
    window.addEventListener('resize', onResize)
    paintGame()
    return () => window.removeEventListener('resize', onResize)
  }, [paintGame, syncOverlaySize])

  useEffect(() => {
    if (!gameActive) return undefined
    const onKey = (e) => {
      const g = gameRef.current
      if (!g?.piece || g.gameOver) return
      let handled = true
      if (e.key === 'ArrowLeft') tryMove(g, -1, 0)
      else if (e.key === 'ArrowRight') tryMove(g, 1, 0)
      else if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z') tryRotate(g)
      else if (e.key === 'ArrowDown') tryMove(g, 0, 1)
      else if (e.key === ' ' || e.key === 'Enter') hardDrop(g)
      else handled = false
      if (handled) {
        e.preventDefault()
        paintGame()
        setHud({ score: g.score, lines: g.lines, level: g.level })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameActive, paintGame])

  const startGame = () => {
    if (!modelReady) return
    resetGame(gameRef.current)
    lastRotateRef.current = 0
    lastHardDropRef.current = 0
    prevTipRef.current = null
    pinchActiveRef.current = false
    gameActiveRef.current = true
    setHud({ score: 0, lines: 0, level: 1 })
    setGameActive(true)
    paintGame()
    // Ensure the Tetris board is visible (especially on mobile)
    requestAnimationFrame(() => {
      boardSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const stopGame = () => {
    gameActiveRef.current = false
    setGameActive(false)
    prevTipRef.current = null
    paintGame()
  }

  const restart = () => {
    resetGame(gameRef.current)
    lastRotateRef.current = 0
    lastHardDropRef.current = 0
    prevTipRef.current = null
    pinchActiveRef.current = false
    gameActiveRef.current = true
    setHud({ score: 0, lines: 0, level: 1 })
    paintGame()
  }

  const startBlockedReason = !cameraReady
    ? 'Waiting for camera permission…'
    : !modelReady
      ? modelError || 'Loading hand model…'
      : null

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#050810] text-slate-100 flex flex-col relative">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 20% 0%, rgba(34,211,238,0.2), transparent), radial-gradient(ellipse 45% 35% at 90% 70%, rgba(217,70,239,0.14), transparent)',
        }}
      />

      <header className="relative shrink-0 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/exploration"
              className="text-xs text-cyan-400/90 hover:text-cyan-300 font-medium inline-flex items-center mb-1 transition-colors"
            >
              ← Back to Exploration
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
              AI Finger Tetris
            </h1>
            <p
              className={`text-xs font-mono mt-0.5 ${
                gameActive
                  ? 'text-fuchsia-300'
                  : modelReady
                    ? 'text-emerald-400'
                    : modelError
                      ? 'text-red-400'
                      : 'text-amber-400'
              }`}
            >
              {gameActive ? `● PLAYING · Score ${hud.score}` : modelReady ? '●' : modelError ? '✕' : '◌'}{' '}
              {gameActive ? `Lines ${hud.lines} · Lv ${hud.level}` : modelStatus}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {!gameActive ? (
              <button
                type="button"
                onClick={startGame}
                disabled={!modelReady || !cameraReady}
                title={startBlockedReason || 'Start the Tetris arena'}
                className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              >
                Start Arena
              </button>
            ) : (
              <>
                <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-300 px-2 py-1 rounded border border-fuchsia-400/40 bg-fuchsia-500/10">
                  Live
                </span>
                <button
                  type="button"
                  onClick={restart}
                  className="min-h-[44px] px-4 rounded-xl border border-cyan-400/40 text-cyan-200 text-sm font-semibold hover:bg-cyan-500/10"
                >
                  Restart
                </button>
                <button
                  type="button"
                  onClick={stopGame}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
        {startBlockedReason && !gameActive ? (
          <p className="max-w-7xl mx-auto mt-2 text-xs text-amber-300/90">{startBlockedReason}</p>
        ) : null}
      </header>

      <main className="relative flex-1 grid lg:grid-cols-2 gap-4 p-4 sm:p-5 max-w-7xl mx-auto w-full min-h-0">
        {/* Tetris board first on mobile so Start Arena change is obvious */}
        <section
          ref={boardSectionRef}
          className="order-1 lg:order-2 flex flex-col items-center lg:items-start gap-3 min-h-0"
        >
          <div className="flex flex-wrap gap-4 text-xs font-mono w-full max-w-[300px] items-end justify-between">
            <div className="flex gap-4">
              <div>
                <span className="text-slate-500">Score</span>
                <p className="text-lg text-cyan-300 font-bold tabular-nums">{hud.score}</p>
              </div>
              <div>
                <span className="text-slate-500">Lines</span>
                <p className="text-lg text-emerald-300 font-bold tabular-nums">{hud.lines}</p>
              </div>
              <div>
                <span className="text-slate-500">Level</span>
                <p className="text-lg text-fuchsia-300 font-bold tabular-nums">{hud.level}</p>
              </div>
            </div>
            <p
              className={`text-[10px] uppercase tracking-widest font-bold ${
                gameActive ? 'text-fuchsia-300' : 'text-slate-500'
              }`}
            >
              {gameActive ? 'Arena live' : 'Idle'}
            </p>
          </div>
          <canvas
            ref={gameCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={`w-full max-w-[300px] rounded-xl border bg-[#050810] ${
              gameActive
                ? 'border-fuchsia-400/70 shadow-[0_0_50px_rgba(217,70,239,0.35)]'
                : 'border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
            }`}
            style={{ imageRendering: 'pixelated', aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
          />
          <p className="text-xs text-slate-400 max-w-[300px]">
            {gameActive
              ? handSeen
                ? 'Neon piece falling — move index left/right to steer.'
                : 'Pieces are falling. Show a hand for gesture control, or use arrow keys.'
              : 'Board shows READY until you start. After Start, overlay clears and a neon piece falls.'}
          </p>
        </section>

        <section className="order-2 lg:order-1 flex flex-col gap-3 min-h-0">
          <div
            ref={stageRef}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-black shadow-[0_0_40px_rgba(34,211,238,0.15)]"
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              videoConstraints={FINGER_TETRIS_VIDEO}
              className="absolute inset-0 h-full w-full object-contain bg-black"
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => {
                setCameraReady(false)
                setModelError('Camera permission denied or unavailable')
              }}
            />
            <canvas ref={overlayRef} className="absolute inset-0 h-full w-full pointer-events-none" />
            <div
              className={`absolute top-2 left-2 text-[10px] font-mono px-2 py-1 rounded border ${
                handSeen
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-slate-900/80 border-slate-600 text-slate-400'
              }`}
            >
              {handSeen ? '● Hand detected' : '○ Show one hand in frame'}
            </div>
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-sm text-slate-400">
                Waiting for camera…
              </div>
            )}
          </div>

          <div className="rounded-xl border border-fuchsia-500/25 bg-slate-950/80 p-4 font-mono text-xs space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-400 font-bold">AI Telemetry</p>
            <dl className="grid grid-cols-3 gap-2">
              <div>
                <dt className="text-slate-500">Index X Pos</dt>
                <dd className="text-cyan-300 text-sm mt-0.5">{telemetry.indexX}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Pinch Distance</dt>
                <dd className="text-emerald-300 text-sm mt-0.5">
                  {telemetry.pinch}
                  {telemetry.pinch !== '—' ? (
                    <span className="text-slate-500"> / &lt;{telemetry.pinchLimit}</span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">AI Confidence</dt>
                <dd className="text-fuchsia-300 text-sm mt-0.5">
                  {telemetry.confidence === '—' ? '—' : `${telemetry.confidence}%`}
                </dd>
              </div>
            </dl>
            <p className="text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
              {FINGER_TETRIS_EDUCATION}
            </p>
          </div>

          <details className="rounded-xl border border-cyan-500/20 bg-slate-950/70 p-4 text-xs">
            <summary className="cursor-pointer text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
              How to play
            </summary>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed mt-3">
              {HOW_TO_PLAY_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="text-slate-500 pt-2 mt-2 border-t border-slate-800">
              Keyboard: ← → move · ↑ / Z rotate · ↓ soft drop · Space hard drop
            </p>
          </details>
        </section>
      </main>
    </div>
  )
}
