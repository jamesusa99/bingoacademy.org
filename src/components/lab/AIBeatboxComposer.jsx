import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BEATBOX_BPM,
  BEATBOX_PADS,
  BEATBOX_STEPS,
  FFT_SIZE,
  ONSET_COOLDOWN_MS,
  RMS_ONSET_THRESHOLD,
  classifyBeatboxSpectrum,
  cloneLoopPattern,
  emptyLoopPattern,
  rmsFromTimeDomain,
} from '../../config/beatboxComposer'
import { createBeatboxAudio } from '../../lib/beatboxAudio'
import { BADGE_STORAGE_KEY } from '../../config/explorationLab'

const BADGE_ID = 'beatbox-classifier'

function unlockBadge() {
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!list.includes(BADGE_ID)) {
      localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify([...list, BADGE_ID]))
    }
  } catch {
    /* ignore */
  }
}

/**
 * AI Beatbox Composer — mic → spectrogram features → Kick / Snare / Hi-hat classification.
 */
export default function AIBeatboxComposer() {
  const audioEngineRef = useRef(null)
  const streamRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const rafRef = useRef(null)
  const lastOnsetRef = useRef(0)
  const flashTimersRef = useRef({})
  const patternRef = useRef(emptyLoopPattern())
  const loopRafRef = useRef(null)
  const loopStartRef = useRef(0)
  const lastLoopStepRef = useRef(-1)
  const waveCanvasRef = useRef(null)
  const specCanvasRef = useRef(null)
  const freqHistoryRef = useRef([])

  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState(null)
  const [status, setStatus] = useState('Tap Start mic, then make short beatbox sounds')
  const [litPad, setLitPad] = useState(null)
  const [hitCounts, setHitCounts] = useState({ kick: 0, snare: 0, hihat: 0 })
  const [showScience, setShowScience] = useState(true)
  const [rmsLevel, setRmsLevel] = useState(0)
  const [lastClass, setLastClass] = useState(null)
  const [centroidHz, setCentroidHz] = useState(0)
  const [looping, setLooping] = useState(false)
  const [loopStep, setLoopStep] = useState(0)
  const [pattern, setPattern] = useState(() => emptyLoopPattern())
  const [recording, setRecording] = useState(true)

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  useEffect(() => {
    audioEngineRef.current = createBeatboxAudio()
    return () => {
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(loopRafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioEngineRef.current?.dispose()
    }
  }, [])

  const flashPad = useCallback((padId) => {
    setLitPad(padId)
    clearTimeout(flashTimersRef.current[padId])
    flashTimersRef.current[padId] = setTimeout(() => {
      setLitPad((cur) => (cur === padId ? null : cur))
    }, 180)
  }, [])

  const recordHit = useCallback(
    (padId) => {
      if (!recording) return
      const stepMs = (60_000 / BEATBOX_BPM) * (4 / BEATBOX_STEPS)
      let step = 0
      if (looping && loopStartRef.current) {
        const elapsed = performance.now() - loopStartRef.current
        const loopMs = stepMs * BEATBOX_STEPS
        step = Math.floor((elapsed % loopMs) / stepMs)
      } else {
        step = loopStep
      }
      setPattern((prev) => {
        const next = cloneLoopPattern(prev)
        next[padId][step] = true
        return next
      })
    },
    [recording, looping, loopStep]
  )

  const triggerPad = useCallback(
    (padId, { fromMic = false } = {}) => {
      audioEngineRef.current?.playPad(padId)
      flashPad(padId)
      setLastClass(padId)
      setHitCounts((c) => {
        const next = { ...c, [padId]: c[padId] + 1 }
        if (next.kick + next.snare + next.hihat >= 8) unlockBadge()
        return next
      })
      recordHit(padId)
      if (fromMic) {
        const pad = BEATBOX_PADS.find((p) => p.id === padId)
        setStatus(`Heard ${pad?.phonetic || ''} → classified as ${pad?.label}`)
      }
    },
    [flashPad, recordHit]
  )

  const drawScience = useCallback((analyser, timeData, freqData) => {
    const wave = waveCanvasRef.current
    const spec = specCanvasRef.current
    if (wave) {
      const w = wave.width
      const h = wave.height
      const ctx = wave.getContext('2d')
      ctx.fillStyle = '#020617'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 2
      ctx.beginPath()
      const slice = w / timeData.length
      for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 255
        const y = v * h
        if (i === 0) ctx.moveTo(0, y)
        else ctx.lineTo(i * slice, y)
      }
      ctx.stroke()
    }

    if (spec) {
      const w = spec.width
      const h = spec.height
      const ctx = spec.getContext('2d')
      const row = new Uint8ClampedArray(freqData.length)
      for (let i = 0; i < freqData.length; i++) row[i] = freqData[i]
      freqHistoryRef.current.push(row)
      if (freqHistoryRef.current.length > w) freqHistoryRef.current.shift()

      const image = ctx.createImageData(w, h)
      const history = freqHistoryRef.current
      for (let x = 0; x < history.length; x++) {
        const col = history[x]
        for (let y = 0; y < h; y++) {
          const bin = Math.floor((1 - y / h) * (col.length - 1))
          const v = col[bin]
          const idx = (y * w + x) * 4
          image.data[idx] = Math.min(255, v * 1.2)
          image.data[idx + 1] = Math.min(255, v * 0.4 + 40)
          image.data[idx + 2] = Math.min(255, 80 + v)
          image.data[idx + 3] = 255
        }
      }
      ctx.putImageData(image, 0, 0)
    }
  }, [])

  const analyseFrame = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const timeData = new Uint8Array(analyser.fftSize)
    const freqData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(timeData)
    analyser.getByteFrequencyData(freqData)

    const rms = rmsFromTimeDomain(timeData)
    setRmsLevel(rms)

    let weighted = 0
    let magSum = 0
    const sr = analyser.context.sampleRate
    const binHz = sr / (freqData.length * 2)
    for (let i = 0; i < freqData.length; i++) {
      const mag = freqData[i] / 255
      if (mag < 0.02) continue
      magSum += mag
      weighted += mag * i * binHz
    }
    if (magSum > 0) setCentroidHz(Math.round(weighted / magSum))

    if (showScience) drawScience(analyser, timeData, freqData)

    const now = performance.now()
    if (rms > RMS_ONSET_THRESHOLD && now - lastOnsetRef.current > ONSET_COOLDOWN_MS) {
      const padId = classifyBeatboxSpectrum(freqData, sr)
      if (padId) {
        lastOnsetRef.current = now
        triggerPad(padId, { fromMic: true })
      }
    }

    rafRef.current = requestAnimationFrame(analyseFrame)
  }, [drawScience, showScience, triggerPad])

  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    try {
      sourceRef.current?.disconnect()
    } catch {
      /* ignore */
    }
    sourceRef.current = null
    analyserRef.current = null
    setListening(false)
    setStatus('Mic stopped — tap a pad or Start mic again')
  }, [])

  const startMic = useCallback(async () => {
    setMicError(null)
    try {
      const engine = audioEngineRef.current
      const audioCtx = engine?.getContext()
      if (!audioCtx) throw new Error('Web Audio not supported in this browser')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
        video: false,
      })
      streamRef.current = stream

      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0.55
      source.connect(analyser)
      sourceRef.current = source
      analyserRef.current = analyser

      setListening(true)
      setStatus('Listening… try “动 / 打 / 次” or Kick · Snare · Hi-hat mouth sounds')
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(analyseFrame)
    } catch (err) {
      setMicError(err?.message || 'Microphone permission denied')
      setListening(false)
      setStatus('Allow microphone access to classify beatbox sounds')
    }
  }, [analyseFrame])

  useEffect(() => {
    if (!listening) return undefined
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(analyseFrame)
    return undefined
  }, [analyseFrame, listening])

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(loopRafRef.current)
    loopRafRef.current = null
    setLooping(false)
    lastLoopStepRef.current = -1
  }, [])

  const startLoop = useCallback(() => {
    stopLoop()
    loopStartRef.current = performance.now()
    lastLoopStepRef.current = -1
    setLooping(true)

    const tick = () => {
      const stepMs = (60_000 / BEATBOX_BPM) * (4 / BEATBOX_STEPS)
      const loopMs = stepMs * BEATBOX_STEPS
      const elapsed = performance.now() - loopStartRef.current
      const step = Math.floor((elapsed % loopMs) / stepMs)
      if (step !== lastLoopStepRef.current) {
        lastLoopStepRef.current = step
        setLoopStep(step)
        const pat = patternRef.current
        for (const pad of BEATBOX_PADS) {
          if (pat[pad.id][step]) {
            audioEngineRef.current?.playPad(pad.id)
            flashPad(pad.id)
          }
        }
      }
      loopRafRef.current = requestAnimationFrame(tick)
    }
    loopRafRef.current = requestAnimationFrame(tick)
  }, [flashPad, stopLoop])

  const clearLoop = () => {
    setPattern(emptyLoopPattern())
    setHitCounts({ kick: 0, snare: 0, hihat: 0 })
    setStatus('Loop cleared — build a new pattern')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400 mb-1">
            Game 8 · Audio ML
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">AI Beatbox Composer</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Speak Kick · Snare · Hi-hat into the mic — AI classifies sounds via spectrogram features and lights neon
            drum pads, then stitches them into an electronic loop.
          </p>
        </div>
        <Link
          to="/exploration"
          className="text-xs text-slate-400 hover:text-cyan-400 transition min-h-[44px] inline-flex items-center"
        >
          ← All experiments
        </Link>
      </header>

      <div className="rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-900 via-slate-950 to-fuchsia-950/40 p-4 sm:p-6 shadow-[0_0_40px_rgba(244,114,182,0.12)]">
        <div className="flex flex-wrap gap-2 mb-5">
          {!listening ? (
            <button
              type="button"
              onClick={startMic}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold bg-fuchsia-500 text-slate-900 hover:bg-fuchsia-400 transition"
            >
              Start mic
            </button>
          ) : (
            <button
              type="button"
              onClick={stopMic}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold border border-slate-600 text-slate-200 hover:bg-slate-800 transition"
            >
              Stop mic
            </button>
          )}
          <button
            type="button"
            onClick={() => (looping ? stopLoop() : startLoop())}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition ${
              looping
                ? 'bg-cyan-500 text-slate-900'
                : 'border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10'
            }`}
          >
            {looping ? 'Stop loop' : 'Play loop'}
          </button>
          <button
            type="button"
            onClick={clearLoop}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            Clear pattern
          </button>
          <label className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 inline-flex items-center gap-2 cursor-pointer hover:bg-slate-800/80">
            <input
              type="checkbox"
              checked={showScience}
              onChange={(e) => setShowScience(e.target.checked)}
              className="accent-fuchsia-400"
            />
            Science view
          </label>
          <label className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 inline-flex items-center gap-2 cursor-pointer hover:bg-slate-800/80">
            <input
              type="checkbox"
              checked={recording}
              onChange={(e) => setRecording(e.target.checked)}
              className="accent-cyan-400"
            />
            Record hits to loop
          </label>
        </div>

        {micError ? (
          <p className="text-sm text-rose-400 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
            {micError}
          </p>
        ) : null}

        <p className="text-xs text-slate-400 mb-4">{status}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {BEATBOX_PADS.map((pad) => {
            const lit = litPad === pad.id
            return (
              <button
                key={pad.id}
                type="button"
                onClick={() => triggerPad(pad.id)}
                className="relative aspect-[4/3] sm:aspect-square rounded-2xl border-2 transition active:scale-[0.98] min-h-[120px]"
                style={{
                  borderColor: lit ? pad.color : `${pad.color}55`,
                  background: lit
                    ? `radial-gradient(circle at 50% 40%, ${pad.glow}, #0f172a 70%)`
                    : `linear-gradient(160deg, #0f172a, #020617)`,
                  boxShadow: lit ? `0 0 28px ${pad.glow}` : `inset 0 0 24px ${pad.color}22`,
                }}
              >
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {pad.phonetic}
                </span>
                <span className="text-2xl sm:text-3xl font-black" style={{ color: pad.color }}>
                  {pad.label}
                </span>
                <span className="absolute bottom-3 left-3 right-3 text-[11px] text-slate-400">{pad.hint}</span>
                <span className="absolute top-3 right-3 text-xs font-mono text-slate-500">{hitCounts[pad.id]}</span>
              </button>
            )
          })}
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              16-step loop · {BEATBOX_BPM} BPM
            </p>
            <p className="text-[10px] text-slate-500">Step {loopStep + 1}/{BEATBOX_STEPS}</p>
          </div>
          <div className="space-y-1.5">
            {BEATBOX_PADS.map((pad) => (
              <div key={pad.id} className="flex items-center gap-2">
                <span className="w-12 text-[10px] font-bold shrink-0" style={{ color: pad.color }}>
                  {pad.label}
                </span>
                <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${BEATBOX_STEPS}, minmax(0, 1fr))` }}>
                  {pattern[pad.id].map((on, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${pad.label} step ${i + 1}`}
                      onClick={() =>
                        setPattern((prev) => {
                          const next = cloneLoopPattern(prev)
                          next[pad.id][i] = !next[pad.id][i]
                          return next
                        })
                      }
                      className={`h-5 sm:h-6 rounded-sm border transition ${
                        loopStep === i && looping ? 'ring-1 ring-white/70' : ''
                      }`}
                      style={{
                        background: on ? pad.color : '#0f172a',
                        borderColor: on ? pad.color : '#1e293b',
                        opacity: on ? 1 : 0.85,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showScience ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2">
                Waveform · time domain
              </p>
              <canvas ref={waveCanvasRef} width={480} height={120} className="w-full h-[100px] rounded-lg bg-slate-950" />
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 mb-2">
                Spectrogram · frequency
              </p>
              <canvas ref={specCanvasRef} width={480} height={120} className="w-full h-[100px] rounded-lg bg-slate-950" />
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <Metric label="Mic RMS" value={rmsLevel.toFixed(3)} hot={rmsLevel > RMS_ONSET_THRESHOLD} />
              <Metric label="Centroid" value={centroidHz ? `${centroidHz} Hz` : '—'} />
              <Metric label="Last class" value={lastClass || '—'} />
              <Metric label="Listening" value={listening ? 'ON' : 'OFF'} hot={listening} />
            </div>
            <p className="sm:col-span-2 text-[11px] text-slate-500 leading-relaxed">
              AI “hears” by turning audio into a spectrogram (energy over frequency), then comparing low / mid / high
              bands — Kick ≈ bass boom, Snare ≈ mid crack, Hi-hat ≈ bright hiss. Same idea as speech classifiers, just
              with three drum buckets.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Metric({ label, value, hot }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${hot ? 'border-fuchsia-500/40 bg-fuchsia-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-mono text-slate-100 mt-0.5">{value}</p>
    </div>
  )
}
