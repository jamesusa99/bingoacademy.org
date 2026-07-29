import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_REWARDS,
  GENERATION_MAX_STEPS,
  POPULATION_SIZE,
  REWARD_SLIDERS,
} from '../../config/marsLander'
import {
  breedNextGeneration,
  buildTerrain,
  createInitialGeneration,
} from '../../lib/marsLander/core'
import {
  createLander,
  drawLander,
  drawTerrain,
  finalizeFitness,
  landerSensors,
  stepLander,
} from '../../lib/marsLander/lander'
import { BADGE_STORAGE_KEY } from '../../config/explorationLab'

const BADGE_ID = 'mars-evolutionist'
const SPAWN = { x: CANVAS_W * 0.22, y: 70 }

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
 * Mars Lander: RL Evolution — manual practice + God-mode reward tuning + neuroevolution.
 */
export default function AIMarsLander() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const keysRef = useRef({ left: false, right: false, up: false })
  const terrainRef = useRef(buildTerrain(42))
  const modeRef = useRef('idle')
  const manualRef = useRef(null)
  const swarmRef = useRef([])
  const rewardsRef = useRef({ ...DEFAULT_REWARDS })
  const genStepsRef = useRef(0)
  const generationRef = useRef(0)
  const bestFitRef = useRef(0)

  const [mode, setMode] = useState('idle')
  const [rewards, setRewards] = useState(() => ({ ...DEFAULT_REWARDS }))
  const [generation, setGeneration] = useState(0)
  const [aliveCount, setAliveCount] = useState(0)
  const [bestFitness, setBestFitness] = useState(0)
  const [lastResult, setLastResult] = useState('')
  const [status, setStatus] = useState('Try Manual first — then open God mode and Evolve')

  useEffect(() => {
    rewardsRef.current = rewards
  }, [rewards])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const terrain = terrainRef.current

    // Mars sky
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    sky.addColorStop(0, '#0c0a09')
    sky.addColorStop(0.55, '#1c1917')
    sky.addColorStop(1, '#292524')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    for (let i = 0; i < 40; i += 1) {
      const sx = (i * 97) % CANVAS_W
      const sy = (i * 53) % (CANVAS_H * 0.45)
      ctx.fillRect(sx, sy, 1.5, 1.5)
    }

    drawTerrain(ctx, terrain)

    if (modeRef.current === 'manual' && manualRef.current) {
      drawLander(ctx, manualRef.current, { alpha: 1 })
    }

    if (modeRef.current === 'evolve') {
      swarmRef.current.forEach((lander) => {
        const alpha = lander.isChampion ? 1 : lander.alive ? 0.35 : 0.12
        drawLander(ctx, lander, { alpha })
      })
    }
  }, [])

  const spawnSwarm = useCallback((genomes) => {
    genStepsRef.current = 0
    swarmRef.current = genomes.map((g, i) => {
      const jitter = (i - genomes.length / 2) * 2.2
      return createLander({
        x: SPAWN.x + jitter,
        y: SPAWN.y + (i % 5) * 2,
        brain: g.brain,
        isChampion: g.isChampion,
        ghost: !g.isChampion,
      })
    })
    setAliveCount(swarmRef.current.length)
  }, [])

  const spawnSwarmRef = useRef(spawnSwarm)
  useEffect(() => {
    spawnSwarmRef.current = spawnSwarm
  }, [spawnSwarm])

  const tickRef = useRef(() => {})

  useEffect(() => {
    tickRef.current = () => {
      const terrain = terrainRef.current
      const rw = rewardsRef.current

      if (modeRef.current === 'manual' && manualRef.current?.alive) {
        const keys = keysRef.current
        stepLander(
          manualRef.current,
          terrain,
          {
            thrust: keys.up,
            rotate: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
          },
          rw
        )
        if (!manualRef.current.alive) {
          finalizeFitness(manualRef.current)
          const msg = manualRef.current.landed
            ? `Soft landing! Score ${manualRef.current.fitness.toFixed(0)}`
            : `Crashed — score ${manualRef.current.fitness.toFixed(0)}. Try God mode → Evolve.`
          setLastResult(msg)
          setStatus(msg)
          setMode('idle')
        }
      }

      if (modeRef.current === 'evolve') {
        genStepsRef.current += 1
        let alive = 0
        let best = bestFitRef.current

        swarmRef.current.forEach((lander) => {
          if (!lander.alive) return
          const sensors = landerSensors(lander, terrain)
          const decision = lander.brain.decide(sensors)
          stepLander(lander, terrain, decision, rw)
          if (!lander.alive) finalizeFitness(lander)
          else alive += 1
          best = Math.max(best, lander.fitness || lander.score)
        })

        setAliveCount(alive)
        if (best > bestFitRef.current) {
          bestFitRef.current = best
          setBestFitness(best)
        }

        const timedOut = genStepsRef.current >= GENERATION_MAX_STEPS
        if ((alive === 0 || timedOut) && swarmRef.current.length) {
          swarmRef.current.forEach((l) => finalizeFitness(l))
          const ranked = swarmRef.current.map((l) => ({
            brain: l.brain,
            fitness: l.fitness,
          }))
          const champ = Math.max(...ranked.map((r) => r.fitness))
          bestFitRef.current = Math.max(bestFitRef.current, champ)
          setBestFitness(bestFitRef.current)
          if (champ >= (rw.softLanding ?? 100) * 0.7) unlockBadge()

          const genomes = breedNextGeneration(ranked)
          spawnSwarmRef.current(genomes)
          generationRef.current += 1
          setGeneration(generationRef.current)
          setStatus(
            `Gen ${generationRef.current}: champion fitness ${champ.toFixed(0)} · mutating elites…`
          )
        }
      }

      paint()
      rafRef.current = requestAnimationFrame(() => tickRef.current())
    }
  }, [paint])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => tickRef.current())
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const down = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        keysRef.current.up = true
        e.preventDefault()
      }
    }
    const up = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keysRef.current.up = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const startManual = () => {
    swarmRef.current = []
    manualRef.current = createLander({ x: SPAWN.x, y: SPAWN.y })
    setMode('manual')
    setStatus('Manual: ← → rotate · ↑ / W / Space thrust · land softly on the green PAD')
    setLastResult('')
  }

  const startEvolve = () => {
    manualRef.current = null
    generationRef.current = 0
    bestFitRef.current = 0
    setBestFitness(0)
    setGeneration(0)
    spawnSwarm(createInitialGeneration())
    generationRef.current = 1
    setGeneration(1)
    setMode('evolve')
    setStatus(
      `Evolving ${POPULATION_SIZE} landers with your reward weights — watch crashes become landings`
    )
    setLastResult('')
  }

  const stopEvolve = () => {
    setMode('idle')
    swarmRef.current = []
    setAliveCount(0)
    setStatus('Evolution paused — tweak rewards and Evolve again')
  }

  const reshuffleTerrain = () => {
    terrainRef.current = buildTerrain(Math.floor(Math.random() * 10000))
    setStatus('New canyon generated')
    paint()
  }

  const updateReward = (key, value) => {
    setRewards((prev) => ({ ...prev, [key]: Number(value) }))
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-1">
            Game 9 · Reinforcement Learning
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Mars Lander: RL Evolution</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manual landing is brutal. Switch to God mode, tune the reward function, then watch a swarm of AI
            landers crash, mutate, and evolve a soft landing.
          </p>
        </div>
        <Link
          to="/exploration"
          className="text-xs text-slate-400 hover:text-orange-300 transition min-h-[44px] inline-flex items-center"
        >
          ← All experiments
        </Link>
      </header>

      <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950/40 p-4 sm:p-5 shadow-[0_0_40px_rgba(251,146,60,0.12)]">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={startManual}
            disabled={mode === 'evolve'}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-stone-900 hover:bg-white disabled:opacity-40 transition"
          >
            Manual practice
          </button>
          {mode === 'evolve' ? (
            <button
              type="button"
              onClick={stopEvolve}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold border border-slate-600 text-slate-200 hover:bg-slate-800 transition"
            >
              Stop evolve
            </button>
          ) : (
            <button
              type="button"
              onClick={startEvolve}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold bg-orange-500 text-stone-950 hover:bg-orange-400 transition"
            >
              Evolve ({POPULATION_SIZE} landers)
            </button>
          )}
          <button
            type="button"
            onClick={reshuffleTerrain}
            disabled={mode === 'evolve'}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold border border-stone-600 text-stone-300 hover:bg-stone-800 disabled:opacity-40 transition"
          >
            New canyon
          </button>
        </div>

        <p className="text-xs text-stone-400 mb-3">{status}</p>
        {lastResult ? (
          <p className="text-xs text-emerald-300/90 mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            {lastResult}
          </p>
        ) : null}

        <div className="relative rounded-xl overflow-hidden border border-stone-700 mb-4 bg-black">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-auto block touch-none"
            aria-label="Mars lander canyon simulation"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 text-xs">
          <Stat label="Mode" value={mode === 'evolve' ? 'God / Evolve' : mode === 'manual' ? 'Manual' : 'Idle'} />
          <Stat label="Generation" value={generation || '—'} />
          <Stat label="Alive" value={mode === 'evolve' ? aliveCount : '—'} />
          <Stat label="Best fitness" value={bestFitness ? bestFitness.toFixed(0) : '—'} />
        </div>

        <section
          className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4"
          aria-label="Reward function God mode"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300 mb-1">
            God mode · Reward Function
          </p>
          <p className="text-[11px] text-stone-400 mb-4">
            AI does not get hand-written flight rules — it learns by maximizing these rewards over generations.
            Change weights, then hit Evolve and watch behaviour shift.
          </p>
          <div className="space-y-4">
            {REWARD_SLIDERS.map((slider) => (
              <label key={slider.key} className="block">
                <div className="flex justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold text-stone-200">{slider.label}</span>
                  <span className="font-mono text-violet-300">{rewards[slider.key]}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={rewards[slider.key]}
                  disabled={mode === 'evolve'}
                  onChange={(e) => updateReward(slider.key, e.target.value)}
                  className="w-full accent-violet-400 disabled:opacity-50"
                />
                <p className="text-[10px] text-stone-500 mt-0.5">{slider.hint}</p>
              </label>
            ))}
          </div>
        </section>

        <p className="mt-4 text-[11px] text-stone-500 leading-relaxed">
          Under the hood: each lander has a tiny neural net (altitude, velocity, angle, fuel → thrust & rotate).
          Top performers are cloned and mutated — a classic genetic algorithm / neuroevolution loop, the cousin of
          reinforcement learning.
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-stone-700 bg-stone-950/70 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-stone-500">{label}</p>
      <p className="font-mono text-stone-100 mt-0.5">{value}</p>
    </div>
  )
}
