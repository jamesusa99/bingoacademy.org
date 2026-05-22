import { useState, useMemo } from 'react'

const TARGETS = [
  { word: 'universe', pool: { star: 0.92, rocket: 0.88, galaxy: 0.9, planet: 0.85, banana: 0.12, pizza: 0.08, dog: 0.15 } },
  { word: 'music', pool: { melody: 0.9, rhythm: 0.88, piano: 0.86, silence: 0.35, hammer: 0.1, brick: 0.05 } },
  { word: 'ocean', pool: { wave: 0.91, fish: 0.82, coral: 0.84, desert: 0.14, laptop: 0.09, mountain: 0.2 } },
]

function scoreWord(target, word) {
  const t = TARGETS.find((x) => x.word === target)
  if (!t) return 0.5
  const w = word.trim().toLowerCase()
  if (!w) return 0
  if (t.pool[w] != null) return t.pool[w]
  let best = 0.2
  for (const [k, v] of Object.entries(t.pool)) {
    if (w.includes(k) || k.includes(w)) best = Math.max(best, v * 0.85)
  }
  return best
}

export default function WordGravityDemo({ onComplete }) {
  const [targetIdx, setTargetIdx] = useState(0)
  const [input, setInput] = useState('')
  const [shots, setShots] = useState([])
  const [score, setScore] = useState(0)

  const target = TARGETS[targetIdx]

  const lastSim = useMemo(() => {
    if (!shots.length) return null
    return shots[shots.length - 1]
  }, [shots])

  const fire = () => {
    const word = input.trim()
    if (!word) return
    const sim = scoreWord(target.word, word)
    const points = Math.round(sim * 100)
    setShots((s) => [...s.slice(-4), { word, sim, points }])
    setScore((sc) => sc + points)
    setInput('')
    if (sim >= 0.85 && onComplete) onComplete()
  }

  const nextTarget = () => {
    setTargetIdx((i) => (i + 1) % TARGETS.length)
    setShots([])
  }

  return (
    <div className="rounded-2xl border-2 border-violet-200/60 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4 sm:p-6 text-white min-h-[280px] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-violet-300"
            style={{
              left: `${15 + (i * 7) % 70}%`,
              top: `${20 + (i * 11) % 60}%`,
              animation: `pulse ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-violet-300 mb-1 relative">Target black hole</p>
      <h4 className="text-2xl sm:text-3xl font-bold text-center mb-4 relative capitalize">{target.word}</h4>
      <p className="text-xs text-slate-400 text-center mb-4 relative">
        Launch a word — semantic pull = score (cosine similarity demo)
      </p>
      <div className="flex gap-2 mb-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fire()}
          placeholder="Type a word…"
          className="flex-1 min-h-[48px] rounded-xl bg-white/10 border border-white/20 px-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={fire}
          className="shrink-0 min-h-[48px] min-w-[48px] rounded-xl bg-violet-500 hover:bg-violet-400 font-semibold text-sm px-4 transition"
        >
          Launch
        </button>
      </div>
      {lastSim && (
        <div className="relative rounded-xl bg-white/5 border border-white/10 p-3 mb-3 text-sm">
          <span className="font-semibold">{lastSim.word}</span>
          <span className="text-slate-400"> → pull </span>
          <span className={lastSim.sim >= 0.7 ? 'text-emerald-400' : lastSim.sim >= 0.4 ? 'text-amber-400' : 'text-slate-500'}>
            {(lastSim.sim * 100).toFixed(0)}%
          </span>
          <span className="text-slate-500"> (+{lastSim.points} pts)</span>
          <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${lastSim.sim * 100}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 relative text-xs">
        <span className="text-violet-200">Score: {score}</span>
        <button type="button" onClick={nextTarget} className="text-violet-300 hover:text-white underline">
          Next target →
        </button>
      </div>
    </div>
  )
}
