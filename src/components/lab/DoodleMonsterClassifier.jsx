import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Brain,
  Eraser,
  Loader2,
  Plus,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react'
import DoodleLabNotesPanel from './DoodleLabNotesPanel'
import {
  CLASS_ROUND,
  CLASS_SPIKY,
  DOODLE_CLASS_LABELS,
  MIN_EXAMPLES_PER_CLASS,
} from '../../config/doodleMonsters'
import { parseMonsterPrediction, PREDICT_INTERVAL_MS } from '../../lib/doodleMonsters/predict'
import { useDoodleCanvas } from '../../hooks/useDoodleCanvas'
import { useDoodleClassifier } from '../../hooks/useDoodleClassifier'
import DoodleConfidenceMeter from './DoodleConfidenceMeter'

const CLASS_A = {
  id: CLASS_ROUND,
  title: 'Class A: Round Monsters',
  emoji: '🔵',
  accent: 'violet',
  hint: 'Circles, blobs, and smooth curves',
}

const CLASS_B = {
  id: CLASS_SPIKY,
  title: 'Class B: Spiky Monsters',
  emoji: '⚡',
  accent: 'rose',
  hint: 'Zig-zags, stars, and pointy teeth',
}

const IDLE_PREDICTION = parseMonsterPrediction(null)

function ExampleBucket({ bucket, examples, onAddExample, disabled, minRequired }) {
  const isViolet = bucket.accent === 'violet'
  const border = isViolet ? 'border-violet-300' : 'border-rose-300'
  const bg = isViolet ? 'bg-violet-50' : 'bg-rose-50'
  const btn = isViolet
    ? 'bg-violet-500 hover:bg-violet-600 shadow-violet-200'
    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
  const ready = examples.length >= minRequired

  return (
    <section
      className={`rounded-2xl border-2 ${border} ${bg} p-4 flex flex-col min-h-0`}
      aria-label={bucket.title}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xl" aria-hidden>
          {bucket.emoji}
        </span>
        <div className="flex-1">
          <h2 className="text-base font-black text-slate-800 leading-tight">{bucket.title}</h2>
          <p className="text-xs text-slate-600 mt-0.5">{bucket.hint}</p>
        </div>
        {ready && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
            Ready
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onAddExample}
        disabled={disabled}
        className={`mt-2 w-full min-h-[44px] rounded-xl ${btn} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none`}
      >
        <Plus className="w-4 h-4" aria-hidden />
        Add Example
      </button>

      <p className="text-[10px] text-slate-500 mt-2 tabular-nums">
        {examples.length} / {minRequired}+ training example{examples.length === 1 ? '' : 's'}
      </p>

      <div className="mt-3 flex-1 min-h-[120px] overflow-y-auto">
        {examples.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8 px-2 rounded-lg border-2 border-dashed border-slate-200 bg-white/60">
            No examples yet — draw on the board, then tap Add Example!
          </p>
        ) : (
          <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {examples.map((src, i) => (
              <li key={`${bucket.id}-${i}-${src.slice(0, 24)}`}>
                <img
                  src={src}
                  alt={`${bucket.title} example ${i + 1}`}
                  className="w-full aspect-square object-contain rounded-lg border-2 border-white bg-white shadow-sm"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/**
 * Doodle Monster Classifier — train with KNN + live Test Mode guesses.
 */
export default function DoodleMonsterClassifier() {
  const [examplesA, setExamplesA] = useState([])
  const [examplesB, setExamplesB] = useState([])
  const [message, setMessage] = useState(null)
  const [testMode, setTestMode] = useState(false)
  const [adding, setAdding] = useState(false)
  const [prediction, setPrediction] = useState(IDLE_PREDICTION)
  const [guessing, setGuessing] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

  const predictingRef = useRef(false)

  const { aiStatus, aiError, isReady, addExample, predictMonster } = useDoodleClassifier()
  const { containerRef, canvasRef, clearCanvas, exportSnapshot, isBlank, pointerHandlers } =
    useDoodleCanvas({ lineWidth: 8 })

  const canTest = useMemo(
    () =>
      examplesA.length >= MIN_EXAMPLES_PER_CLASS &&
      examplesB.length >= MIN_EXAMPLES_PER_CLASS,
    [examplesA.length, examplesB.length]
  )

  const predictMonsterFromBoard = useCallback(async () => {
    if (!testMode || !isReady) return

    const canvas = canvasRef.current
    if (!canvas?.width || isBlank()) {
      setPrediction(IDLE_PREDICTION)
      return
    }

    if (predictingRef.current) return
    predictingRef.current = true
    setGuessing(true)
    try {
      const result = await predictMonster(canvas)
      setPrediction(parseMonsterPrediction(result))
    } catch (err) {
      console.error('predictMonster failed:', err)
    } finally {
      predictingRef.current = false
      setGuessing(false)
    }
  }, [canvasRef, isBlank, isReady, predictMonster, testMode])

  useEffect(() => {
    if (!testMode || !isReady) return undefined

    const tick = () => {
      predictMonsterFromBoard()
    }

    tick()
    const id = setInterval(tick, PREDICT_INTERVAL_MS)
    return () => clearInterval(id)
  }, [testMode, isReady, predictMonsterFromBoard])

  const addExampleToClass = useCallback(
    async (classId, setter, bucket) => {
      if (!isReady) {
        setMessage('AI is still initializing — hang tight!')
        return
      }
      if (isBlank()) {
        setMessage('Draw something on the white board first!')
        return
      }

      const canvas = canvasRef.current
      const dataUrl = exportSnapshot()
      if (!canvas || !dataUrl) {
        setMessage('Could not save drawing — try again.')
        return
      }

      setAdding(true)
      try {
        await addExample(canvas, classId)
        setter((prev) => [...prev, dataUrl])
        clearCanvas()
        setMessage(`AI learned a ${bucket.title} example! Draw another monster.`)
      } catch (err) {
        setMessage(err?.message ?? 'Could not train on this doodle.')
      } finally {
        setAdding(false)
      }
    },
    [addExample, canvasRef, clearCanvas, exportSnapshot, isBlank, isReady]
  )

  const enterTestMode = useCallback(() => {
    setTestMode(true)
    clearCanvas()
    setPrediction(IDLE_PREDICTION)
    setMessage(
      `Test Mode! Draw a brand-new monster — the AI guesses Round vs Spiky every ${PREDICT_INTERVAL_MS / 1000}s.`
    )
  }, [clearCanvas])

  const exitTestMode = useCallback(() => {
    setTestMode(false)
    setPrediction(IDLE_PREDICTION)
    setMessage('Back to training — add more examples anytime.')
  }, [])

  const aiLoading = aiStatus === 'loading'
  const controlsDisabled = aiLoading || adding || !isReady
  const trainingDisabled = controlsDisabled || testMode

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-amber-50 via-violet-50 to-sky-50 text-slate-800">
      <header className="shrink-0 border-b border-violet-200/80 bg-white/90 backdrop-blur px-4 py-3 shadow-sm">
        <Link
          to="/exploration"
          className="text-xs font-semibold text-violet-600 hover:text-violet-800 inline-flex items-center gap-1"
        >
          ← AI Exploration Lab
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <Sparkles className="w-6 h-6 text-amber-500" aria-hidden />
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Doodle Monster Classifier
            </h1>
            <p className="text-sm text-slate-600">Teach the computer two kinds of monsters!</p>
          </div>
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className="xl:hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden />
            Lab Notes
          </button>
          <div
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
              isReady
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : aiStatus === 'error'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                AI Initializing…
              </>
            ) : isReady ? (
              <>
                <Brain className="w-3.5 h-3.5" aria-hidden />
                AI Ready
              </>
            ) : (
              'AI Error'
            )}
          </div>
        </div>
        {aiError && <p className="text-xs text-red-600 mt-2">{aiError}</p>}
      </header>

      {message && (
        <p
          className="shrink-0 text-center text-sm font-medium text-violet-800 bg-violet-100/80 px-4 py-2 border-b border-violet-200"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex-1 flex flex-col xl:flex-row min-h-0 gap-4 p-4 max-w-[90rem] mx-auto w-full">
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 min-w-0">
        <section className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg p-4 flex flex-col flex-1 min-h-[280px] relative">
            {aiLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" aria-hidden />
                <p className="text-base font-black text-violet-800">AI Initializing…</p>
                <p className="text-xs text-slate-600 mt-1 px-6 text-center">
                  Loading MobileNet feature extractor and KNN classifier
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h2 className="text-lg font-black text-slate-800">Drawing Board</h2>
              {testMode && (
                <span className="text-xs font-bold uppercase tracking-wide text-sky-700 bg-sky-100 px-2 py-1 rounded-full">
                  Test Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {testMode
                ? 'Draw a new monster — watch the AI confidence meter update live!'
                : 'Use your finger or mouse — black ink on white paper'}
            </p>

            <div
              ref={containerRef}
              className={`relative flex-1 min-h-[220px] rounded-xl border-2 bg-white overflow-hidden touch-none ${
                testMode ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-300'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                aria-label="Monster drawing canvas"
                {...pointerHandlers}
              />
            </div>

            <DoodleConfidenceMeter
              visible={testMode}
              roundPct={prediction.roundPct}
              spikyPct={prediction.spikyPct}
              mood={prediction.mood}
              topName={prediction.topName}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  clearCanvas()
                  setPrediction(IDLE_PREDICTION)
                  setMessage('Canvas cleared — start a fresh doodle!')
                }}
                disabled={controlsDisabled}
                className="min-h-[44px] px-5 rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Eraser className="w-4 h-4" aria-hidden />
                Clear Canvas
              </button>

              {testMode ? (
                <>
                  <button
                    type="button"
                    onClick={predictMonsterFromBoard}
                    disabled={controlsDisabled || guessing}
                    className="min-h-[44px] flex-1 sm:flex-none px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all"
                  >
                    {guessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    ) : (
                      <Wand2 className="w-4 h-4" aria-hidden />
                    )}
                    Guess!
                  </button>
                  <button
                    type="button"
                    onClick={exitTestMode}
                    className="min-h-[44px] px-4 rounded-xl border-2 border-slate-400 text-slate-700 font-bold text-sm hover:bg-slate-50"
                  >
                    Train More
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!canTest || controlsDisabled}
                  onClick={enterTestMode}
                  className="min-h-[44px] flex-1 sm:flex-none px-6 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-400 hover:to-violet-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:from-slate-400 disabled:to-slate-400 transition-all"
                  title={
                    canTest
                      ? 'Try classifying new doodles'
                      : `Add at least ${MIN_EXAMPLES_PER_CLASS} examples to each class`
                  }
                >
                  <Zap className="w-4 h-4" aria-hidden />
                  Test Mode
                </button>
              )}
            </div>

            {!canTest && isReady && !testMode && (
              <p className="text-[11px] text-amber-700 mt-2">
                Add at least {MIN_EXAMPLES_PER_CLASS} examples to{' '}
                <strong>both</strong> classes to unlock Test Mode (
                {examplesA.length}/{MIN_EXAMPLES_PER_CLASS} round ·{' '}
                {examplesB.length}/{MIN_EXAMPLES_PER_CLASS} spiky).
              </p>
            )}
          </div>
        </section>

        <aside className="w-full lg:w-[min(100%,380px)] shrink-0 flex flex-col gap-4 min-h-0">
          <div className="rounded-xl bg-white/70 border border-violet-200 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
              {testMode ? 'Testing' : 'Training Data'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {testMode
                ? 'Training buckets are locked while you test new doodles on the board.'
                : 'Each doodle becomes MobileNet features stored in the KNN brain.'}
            </p>
          </div>

          <ExampleBucket
            bucket={CLASS_A}
            examples={examplesA}
            minRequired={MIN_EXAMPLES_PER_CLASS}
            disabled={trainingDisabled}
            onAddExample={() => addExampleToClass(CLASS_ROUND, setExamplesA, CLASS_A)}
          />
          <ExampleBucket
            bucket={CLASS_B}
            examples={examplesB}
            minRequired={MIN_EXAMPLES_PER_CLASS}
            disabled={trainingDisabled}
            onAddExample={() => addExampleToClass(CLASS_SPIKY, setExamplesB, CLASS_B)}
          />
        </aside>
        </div>

        <DoodleLabNotesPanel
          mobileOpen={notesOpen}
          onMobileClose={() => setNotesOpen(false)}
        />
      </div>
    </div>
  )
}
