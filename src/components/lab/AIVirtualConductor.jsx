import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetection from '@tensorflow-models/pose-detection'
import ConductorDial from './ConductorDial'
import PoseDataMatrix from './PoseDataMatrix'
import {
  KEYPOINT_MIN_SCORE,
  LERP_ALPHA,
  POSE_BONES,
  TEMPO_IDLE,
  TEMPO_MAX,
  TEMPO_MIN,
  VOLUME_MAX,
  buildDataMatrixSnapshot,
  computeTargetTempoFromWave,
  computeTargetVolume,
  getKeypoint,
  isSquatPose,
  lerp,
  pushWristX,
  wristDeltaXNorm,
} from '../../config/conductorPose'

/** Throttle React updates for Data Matrix (~10 Hz); canvas/audio stay per-frame */
const MATRIX_UI_MS = 100

const VIDEO_CONSTRAINTS_BASE = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
}

const NEON_BLUE = '#60a5fa'
const NEON_CYAN = '#22d3ee'

/**
 * AI Virtual Conductor — MoveNet pose estimation + skeleton overlay.
 */
export default function AIVirtualConductor() {
  const webcamRef = useRef(null)
  const overlayRef = useRef(null)
  const stageRef = useRef(null)
  const audioRef = useRef(null)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const detectingRef = useRef(false)
  const smoothedVolumeRef = useRef(0.7)
  const smoothedTempoRef = useRef(TEMPO_IDLE)
  const rightWristHistoryRef = useRef([])
  const isSquatRef = useRef(false)
  const manualPausedRef = useRef(false)
  const lastMatrixUiPushRef = useRef(0)

  const [conductorActive, setConductorActive] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [cameraReady, setCameraReady] = useState(false)
  const [audioError, setAudioError] = useState(null)
  const [modelStatus, setModelStatus] = useState('Loading MoveNet…')
  const [modelReady, setModelReady] = useState(false)
  const [keypointCount, setKeypointCount] = useState(0)
  const [matrixSnapshot, setMatrixSnapshot] = useState(null)
  const [matrixFrameSize, setMatrixFrameSize] = useState(null)

  const [volume, setVolume] = useState(70)
  const [tempo, setTempo] = useState(1.0)
  const [status, setStatus] = useState('Paused')
  const [squatActive, setSquatActive] = useState(false)

  const videoConstraints = {
    ...VIDEO_CONSTRAINTS_BASE,
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

  const mapPoint = useCallback((x, y, scaleX, scaleY) => {
    return { x: x * scaleX, y: y * scaleY }
  }, [])

  const pushMatrixUi = useCallback((keypoints, poseScore, frameW, frameH) => {
    const now = performance.now()
    if (now - lastMatrixUiPushRef.current < MATRIX_UI_MS) return
    lastMatrixUiPushRef.current = now
    const snap = buildDataMatrixSnapshot(keypoints, poseScore)
    setMatrixSnapshot(snap)
    setMatrixFrameSize({ w: frameW, h: frameH })
    setKeypointCount(snap.visibleJoints)
  }, [])

  /** Draw skeleton bones + keypoints on overlay canvas */
  const drawSkeleton = useCallback(
    (keypoints, scaleX, scaleY) => {
      const canvas = overlayRef.current
      if (!canvas) return

      syncCanvasSize()
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const byName = Object.fromEntries(
        keypoints
          .filter((kp) => (kp.score ?? 0) > KEYPOINT_MIN_SCORE)
          .map((kp) => [kp.name, mapPoint(kp.x, kp.y, scaleX, scaleY)])
      )

      // Bones (cyan glow)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      POSE_BONES.forEach(([a, b]) => {
        const p1 = byName[a]
        const p2 = byName[b]
        if (!p1 || !p2) return

        ctx.save()
        ctx.strokeStyle = NEON_CYAN
        ctx.lineWidth = 3
        ctx.shadowColor = NEON_CYAN
        ctx.shadowBlur = 12
        ctx.globalAlpha = 0.85
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        ctx.restore()
      })

      // Keypoints (neon blue dots)
      keypoints.forEach((kp) => {
        const score = kp.score ?? 0
        if (score <= KEYPOINT_MIN_SCORE) return

        const { x, y } = mapPoint(kp.x, kp.y, scaleX, scaleY)
        ctx.save()
        ctx.fillStyle = NEON_BLUE
        ctx.shadowColor = NEON_BLUE
        ctx.shadowBlur = 8
        ctx.globalAlpha = Math.min(1, 0.5 + score * 0.5)
        ctx.beginPath()
        ctx.arc(x, y, 5 + score * 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#e0f2fe'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })
    },
    [syncCanvasSize, mapPoint]
  )

  const applyAudioToElement = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = Math.min(VOLUME_MAX, Math.max(0, smoothedVolumeRef.current))
    audio.playbackRate = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, smoothedTempoRef.current))
    setVolume(Math.round(smoothedVolumeRef.current * 100))
    setTempo(smoothedTempoRef.current)
  }, [])

  const decayTempoToIdle = useCallback(() => {
    smoothedTempoRef.current = lerp(smoothedTempoRef.current, TEMPO_IDLE, LERP_ALPHA)
    applyAudioToElement()
  }, [applyAudioToElement])

  const applyPoseAudioControls = useCallback(
    (keypoints, frameWidth, frameHeight) => {
      const audio = audioRef.current
      if (!audio) return

      const nose = getKeypoint(keypoints, 'nose')
      if (nose) {
        const squat = isSquatPose(nose.y, frameHeight)
        if (squat && !isSquatRef.current) {
          isSquatRef.current = true
          setSquatActive(true)
          audio.pause()
          setStatus('Paused')
        } else if (!squat && isSquatRef.current) {
          isSquatRef.current = false
          setSquatActive(false)
          if (!manualPausedRef.current && conductorActive) {
            audio.play().then(() => setStatus('Playing')).catch(() => {})
          }
        }
      }

      if (isSquatRef.current) {
        applyAudioToElement()
        return
      }

      const targetVol = computeTargetVolume(keypoints, frameHeight)
      if (targetVol != null) {
        smoothedVolumeRef.current = lerp(smoothedVolumeRef.current, targetVol, LERP_ALPHA)
      }

      const rightWrist = getKeypoint(keypoints, 'right_wrist')
      if (rightWrist) {
        rightWristHistoryRef.current = pushWristX(rightWristHistoryRef.current, rightWrist.x)
        const deltaNorm = wristDeltaXNorm(rightWristHistoryRef.current, frameWidth)
        const targetTempo = computeTargetTempoFromWave(deltaNorm)
        smoothedTempoRef.current = lerp(smoothedTempoRef.current, targetTempo, LERP_ALPHA)
      } else {
        smoothedTempoRef.current = lerp(smoothedTempoRef.current, TEMPO_IDLE, LERP_ALPHA * 0.6)
      }

      applyAudioToElement()
    },
    [conductorActive, applyAudioToElement]
  )

  const detectPose = useCallback(async () => {
    const video = webcamRef.current?.video
    const detector = detectorRef.current
    const mirrored = facingMode === 'user'

    if (!conductorActive || !video || video.readyState < 2 || !detector || !modelReady || !cameraReady) {
      rafRef.current = requestAnimationFrame(detectPose)
      return
    }

    if (detectingRef.current) {
      rafRef.current = requestAnimationFrame(detectPose)
      return
    }

    detectingRef.current = true
    try {
      const poses = await detector.estimatePoses(video, {
        flipHorizontal: mirrored,
      })

      const pose = poses?.[0]
      const vw = video.videoWidth || 1
      const vh = video.videoHeight || 1

      if (pose?.keypoints?.length) {
        const canvas = overlayRef.current
        const scaleX = (canvas?.width ?? vw) / vw
        const scaleY = (canvas?.height ?? vh) / vh
        drawSkeleton(pose.keypoints, scaleX, scaleY)
        applyPoseAudioControls(pose.keypoints, vw, vh)
        pushMatrixUi(pose.keypoints, pose.score, vw, vh)
      } else {
        const canvas = overlayRef.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        pushMatrixUi([], null, vw, vh)
        decayTempoToIdle()
      }
    } catch (err) {
      console.error('[AI Virtual Conductor] detectPose:', err)
    } finally {
      detectingRef.current = false
      rafRef.current = requestAnimationFrame(detectPose)
    }
  }, [
    conductorActive,
    cameraReady,
    modelReady,
    facingMode,
    drawSkeleton,
    applyPoseAudioControls,
    decayTempoToIdle,
    pushMatrixUi,
  ])

  // Initialize TF.js WebGL + MoveNet SINGLEPOSE_LIGHTNING
  useEffect(() => {
    let cancelled = false

    async function initPoseModel() {
      try {
        setModelStatus('Loading MoveNet…')
        await tf.setBackend('webgl')
        await tf.ready()

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        )

        if (cancelled) return
        detectorRef.current = detector
        setModelReady(true)
        setModelStatus('AI Model Loaded')
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setModelReady(false)
          setModelStatus('Model failed to load')
        }
      }
    }

    initPoseModel()
    return () => {
      cancelled = true
      detectorRef.current = null
      setModelReady(false)
    }
  }, [])

  // Pose detection loop while conducting
  useEffect(() => {
    if (!conductorActive || !modelReady || !cameraReady) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    rafRef.current = requestAnimationFrame(detectPose)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [conductorActive, modelReady, cameraReady, detectPose])

  useEffect(() => {
    if (!conductorActive) return
    const stage = stageRef.current
    if (!stage) return
    const ro = new ResizeObserver(() => syncCanvasSize())
    ro.observe(stage)
    return () => ro.disconnect()
  }, [conductorActive, syncCanvasSize])

  const startConductorMode = async () => {
    setAudioError(null)
    setConductorActive(true)
    manualPausedRef.current = false
    isSquatRef.current = false
    setSquatActive(false)
    rightWristHistoryRef.current = []
    smoothedVolumeRef.current = 0.7
    smoothedTempoRef.current = TEMPO_IDLE

    const audio = audioRef.current
    if (audio) {
      audio.volume = volume / 100
      audio.playbackRate = tempo
      try {
        await audio.play()
        setStatus('Playing')
      } catch (err) {
        console.error(err)
        setAudioError(
          'Could not play audio. Add public/band-music.mp3 or tap Start again after interacting with the page.'
        )
        setStatus('Paused')
      }
    }
  }

  const togglePause = () => {
    const audio = audioRef.current
    if (!audio || !conductorActive) return
    if (status === 'Playing') {
      manualPausedRef.current = true
      audio.pause()
      setStatus('Paused')
    } else {
      manualPausedRef.current = false
      if (!isSquatRef.current) {
        audio.play().then(() => setStatus('Playing')).catch(() => setAudioError('Playback blocked'))
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
    setCameraReady(false)
    setKeypointCount(0)
    rightWristHistoryRef.current = []
  }

  const statusPct = status === 'Playing' ? 100 : 0

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#070612] text-slate-100 flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.25), transparent), radial-gradient(ellipse 50% 30% at 80% 100%, rgba(245,158,11,0.12), transparent)',
        }}
      />

      <header className="relative shrink-0 border-b border-violet-500/20 bg-slate-950/90 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto w-full">
          <Link
            to="/lab"
            className="text-xs text-violet-400/90 hover:text-violet-300 font-medium min-h-[44px] inline-flex items-center mb-3 transition-colors"
          >
            ← AI Exploration Lab
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-1">
                Experiment 2 · Computer Vision
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-violet-200 via-white to-amber-200 bg-clip-text text-transparent">
                AI Virtual Conductor
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                MoveNet tracks your skeleton in real time — conduct with your arms and body.
              </p>
              <p
                className={`text-xs font-mono mt-2 transition-colors duration-300 ${
                  modelReady ? 'text-[#22d3ee]' : 'text-slate-500'
                }`}
              >
                {modelReady ? '● ' : '○ '}
                {modelStatus}
                {conductorActive && modelReady && keypointCount > 0 && (
                  <span className="text-slate-500"> · {keypointCount} joints visible</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-2xl shrink-0">
              <ConductorDial
                label="Volume"
                value={volume}
                displayValue={`${Math.round(volume)}%`}
                min={0}
                max={100}
                accent="violet"
                hint="Raise left hand above shoulder → louder"
              />
              <ConductorDial
                label="Tempo"
                value={tempo}
                displayValue={`${tempo.toFixed(1)}×`}
                min={TEMPO_MIN}
                max={TEMPO_MAX}
                unit="×"
                accent="amber"
                hint="Wave right hand → faster tempo"
              />
              <ConductorDial
                label="Status"
                value={statusPct}
                displayValue={status}
                min={0}
                max={100}
                unit=""
                accent="cyan"
                hint={squatActive ? '🧘 Squat = paused' : status === 'Playing' ? '🎵 Live' : '⏸ Paused'}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_minmax(300px,380px)] gap-4 lg:gap-6 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        <section className="flex flex-col min-w-0 order-2 lg:order-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold text-violet-200">Conductor stage</h2>
            {conductorActive && (
              <button
                type="button"
                onClick={toggleCamera}
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-violet-500/30 hover:border-violet-400/60 transition-all"
              >
                {facingMode === 'user' ? '🤳 Front' : '📷 Back'}
              </button>
            )}
          </div>

          <div
            ref={stageRef}
            className={`relative w-full aspect-[4/3] max-h-[min(68vh,560px)] mx-auto rounded-3xl overflow-hidden border-2 transition-all duration-500 ${
              conductorActive
                ? 'border-violet-400/40 shadow-[0_0_60px_rgba(139,92,246,0.25)]'
                : 'border-slate-700/60 bg-slate-900/50'
            }`}
          >
            {conductorActive ? (
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
                  aria-label="Pose skeleton overlay"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 text-sm text-violet-200/80 px-6 text-center">
                    Allow camera access to conduct…
                  </div>
                )}
                {cameraReady && !modelReady && (
                  <div className="absolute top-3 left-3 right-3 z-20 text-center text-xs font-mono text-violet-200/90 bg-black/50 rounded-xl py-2 px-3">
                    {modelStatus}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-gradient-to-b from-violet-950/80 to-slate-950">
                <span className="text-6xl" aria-hidden>
                  🎼
                </span>
                <p className="text-slate-400 text-sm max-w-xs">
                  Step on stage to wake the orchestra and camera.
                </p>
                {modelReady && (
                  <p className="text-xs text-[#22d3ee] font-mono">AI Model Loaded — ready when you are</p>
                )}
              </div>
            )}
          </div>

          {!conductorActive && (
            <button
              type="button"
              onClick={startConductorMode}
              disabled={!modelReady}
              className="mt-5 w-full sm:w-auto mx-auto sm:mx-0 min-h-[52px] px-8 py-3 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {modelReady ? 'Start Conductor Mode →' : 'Loading AI model…'}
            </button>
          )}

          {conductorActive && (
            <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start items-center">
              <button
                type="button"
                onClick={togglePause}
                className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-950/50 transition-all duration-300"
              >
                {status === 'Playing' ? '⏸ Manual pause' : '▶ Resume'}
              </button>
              <p className="text-xs text-slate-500 max-w-xs">
                Volume &amp; tempo follow your pose · Squat down to pause the orchestra
              </p>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 order-1 lg:order-2">
          <PoseDataMatrix
            snapshot={matrixSnapshot}
            frameSize={matrixFrameSize}
            active={conductorActive && cameraReady && modelReady}
          />

          <div className="rounded-2xl border border-violet-500/20 bg-slate-900/70 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">
              Orchestra
            </p>
            <audio ref={audioRef} src="/band-music.mp3" loop preload="auto" className="w-full h-10 rounded-lg" />
            {audioError && (
              <p className="text-xs text-amber-400/90 mt-2 leading-relaxed">{audioError}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-2">
              Place <code className="text-violet-300">public/band-music.mp3</code> for the loop track.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs leading-relaxed">
            <p className="font-semibold text-cyan-200 mb-2">🎓 Pose estimation</p>
            <p className="text-slate-400">
              <span className="text-violet-200">Left hand</span> height → volume ·{' '}
              <span className="text-amber-200">Right hand</span> wave → tempo ·{' '}
              <span className="text-cyan-200">Squat</span> (nose low) → pause. Values smooth with lerp so
              audio never jumps.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-4 text-xs transition-all duration-300 ${
              modelReady
                ? 'border-[#22d3ee]/40 bg-[#22d3ee]/10 text-cyan-100'
                : 'border-slate-700/60 bg-slate-900/50 text-slate-500'
            }`}
          >
            <p className="font-semibold mb-1">Vision engine</p>
            <p className="font-mono">{modelStatus}</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
