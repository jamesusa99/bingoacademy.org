import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Matter from 'matter-js'
import { Crosshair, Orbit, RefreshCw, Sparkles, Target, Trophy } from 'lucide-react'
import {
  BLACK_HOLE_RADIUS,
  DEFAULT_TARGET_WORD,
  PARTICLE_RADIUS,
  WALL_THICKNESS,
} from '../../config/wordGravity'
import {
  buildVectorScan,
  formatWordLabel,
  pickAmmoWords,
  similarityToTarget,
} from '../../lib/wordEmbeddings'
import VectorScannerPanel from './VectorScannerPanel'
import {
  ABSORB_SIM_THRESHOLD,
  applySemanticGravityForce,
  computeAbsorbScore,
  shouldAbsorbWord,
} from '../../lib/semanticGravity'

const STAR_COUNT = 80

function createStars(width, height) {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.5 + Math.random() * 1.5,
    a: 0.2 + Math.random() * 0.6,
    twinkle: Math.random() * Math.PI * 2,
  }))
}

function similarityColor(sim) {
  if (sim >= 0.85) return { stroke: 'rgba(167, 139, 250, 0.95)', fill: 'rgba(139, 92, 246, 0.35)' }
  if (sim >= 0.55) return { stroke: 'rgba(34, 211, 238, 0.85)', fill: 'rgba(30, 41, 59, 0.85)' }
  if (sim >= 0.35) return { stroke: 'rgba(251, 191, 36, 0.85)', fill: 'rgba(30, 41, 59, 0.85)' }
  return { stroke: 'rgba(148, 163, 184, 0.7)', fill: 'rgba(30, 41, 59, 0.75)' }
}

/**
 * Word Gravity Field — Matter.js + mock embeddings & cosine similarity.
 */
export default function WordGravityField() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const runnerRef = useRef(null)
  const blackHoleRef = useRef(null)
  const wallsRef = useRef([])
  const starsRef = useRef([])
  const sizeRef = useRef({ width: 800, height: 600 })
  const rafRef = useRef(null)
  const pulseRef = useRef(0)
  const selectedAmmoRef = useRef(null)
  const absorbFlashesRef = useRef([])
  const addScoreRef = useRef(null)

  const targetWordRef = useRef(DEFAULT_TARGET_WORD)
  const [score, setScore] = useState(0)
  const [lastAbsorb, setLastAbsorb] = useState(null)
  const [vectorScan, setVectorScan] = useState(null)
  const [targetWord] = useState(DEFAULT_TARGET_WORD)
  const [spawnHint, setSpawnHint] = useState(true)
  const [ammoWords, setAmmoWords] = useState(() => pickAmmoWords(DEFAULT_TARGET_WORD))
  const [selectedAmmo, setSelectedAmmo] = useState(() => pickAmmoWords(DEFAULT_TARGET_WORD)[0])

  useEffect(() => {
    targetWordRef.current = targetWord
    selectedAmmoRef.current = selectedAmmo
    addScoreRef.current = (pts) => setScore((s) => s + pts)
  }, [targetWord, selectedAmmo])

  const ammoMeta = useMemo(
    () =>
      ammoWords.map((word) => ({
        word,
        label: formatWordLabel(word),
        similarity: similarityToTarget(word, targetWord),
      })),
    [ammoWords, targetWord]
  )

  const refreshAmmo = useCallback(() => {
    const next = pickAmmoWords(targetWord)
    setAmmoWords(next)
    setSelectedAmmo(next[0])
  }, [targetWord])

  const rebuildWalls = useCallback((world, width, height) => {
    wallsRef.current.forEach((w) => Matter.World.remove(world, w))
    const t = WALL_THICKNESS
    const walls = [
      Matter.Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, { isStatic: true, label: 'wall' }),
    ]
    Matter.World.add(world, walls)
    wallsRef.current = walls
  }, [])

  const placeBlackHole = useCallback((body, width, height) => {
    Matter.Body.setPosition(body, { x: width / 2, y: height / 2 })
  }, [])

  const spawnParticle = useCallback((world, x, y, word) => {
    const cosineSimilarity = similarityToTarget(word, targetWordRef.current)
    const body = Matter.Bodies.circle(x, y, PARTICLE_RADIUS, {
      restitution: 0.72,
      friction: 0.02,
      frictionAir: 0.008,
      density: 0.002,
      label: 'particle',
    })
    body.plugin = {
      word,
      cosineSimilarity,
    }
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 3
    Matter.Body.setVelocity(body, {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    })
    Matter.World.add(world, body)
    setVectorScan(buildVectorScan(word, targetWordRef.current))
    setSpawnHint(false)
  }, [])

  const handlePointer = useCallback(
    (clientX, clientY) => {
      const engine = engineRef.current
      const canvas = canvasRef.current
      const container = containerRef.current
      const word = selectedAmmoRef.current
      if (!engine || !canvas || !container || !word) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (clientX - rect.left) * scaleX
      const y = (clientY - rect.top) * scaleY
      const { width, height } = sizeRef.current
      const margin = PARTICLE_RADIUS + 8
      if (x < margin || y < margin || x > width - margin || y > height - margin) return

      const hole = blackHoleRef.current
      if (hole) {
        const dx = x - hole.position.x
        const dy = y - hole.position.y
        if (Math.hypot(dx, dy) < BLACK_HOLE_RADIUS + PARTICLE_RADIUS + 4) return
      }

      spawnParticle(engine.world, x, y, word)
    },
    [spawnParticle]
  )

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } })
    engineRef.current = engine
    const { world } = engine

    const getSize = () => {
      const { width, height } = container.getBoundingClientRect()
      const w = Math.max(320, Math.round(width))
      const h = Math.max(400, Math.round(height))
      return { width: w, height: h }
    }

    let { width, height } = getSize()
    sizeRef.current = { width, height }
    canvas.width = width
    canvas.height = height
    starsRef.current = createStars(width, height)

    const blackHole = Matter.Bodies.circle(width / 2, height / 2, BLACK_HOLE_RADIUS, {
      isStatic: true,
      label: 'blackhole',
      restitution: 0.3,
    })
    blackHole.plugin = { isBlackHole: true }
    blackHoleRef.current = blackHole
    Matter.World.add(world, blackHole)
    rebuildWalls(world, width, height)

    const applyBlackHoleGravity = () => {
      const hole = blackHoleRef.current
      if (!hole) return
      const targetPos = hole.position
      Matter.Composite.allBodies(world).forEach((body) => {
        if (body.label !== 'particle' || body.plugin?.pendingAbsorb) return
        const sim = body.plugin?.cosineSimilarity ?? 0
        applySemanticGravityForce(body, targetPos, sim)
      })
    }
    Matter.Events.on(engine, 'beforeUpdate', applyBlackHoleGravity)

    const handleCollision = (event) => {
      const hole = blackHoleRef.current
      if (!hole) return

      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label]
        if (!labels.includes('blackhole') || !labels.includes('particle')) continue

        const particle = pair.bodyA.label === 'particle' ? pair.bodyA : pair.bodyB
        if (particle.plugin?.pendingAbsorb) continue

        const sim = particle.plugin?.cosineSimilarity ?? 0
        if (!shouldAbsorbWord(sim)) continue

        particle.plugin.pendingAbsorb = true
        const pts = computeAbsorbScore(sim)
        const { x, y } = hole.position

        absorbFlashesRef.current.push({
          x,
          y,
          sim,
          start: performance.now(),
          until: performance.now() + 520,
        })
        if (absorbFlashesRef.current.length > 8) {
          absorbFlashesRef.current.shift()
        }

        Matter.World.remove(world, particle)
        addScoreRef.current?.(pts)
        setLastAbsorb({ word: particle.plugin?.word, pts, sim })
      }
    }
    Matter.Events.on(engine, 'collisionStart', handleCollision)

    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const draw = () => {
      const { width: w, height: h } = sizeRef.current
      pulseRef.current += 0.04
      const pulse = 0.5 + Math.sin(pulseRef.current) * 0.15

      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, '#030712')
      bg.addColorStop(0.5, '#0f0720')
      bg.addColorStop(1, '#020617')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const t = performance.now() * 0.001
      starsRef.current.forEach((star) => {
        const flicker = star.a + Math.sin(t * 2 + star.twinkle) * 0.12
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 210, 255, ${flicker})`
        ctx.fill()
      })

      const now = performance.now()
      absorbFlashesRef.current = absorbFlashesRef.current.filter((f) => f.until > now)
      absorbFlashesRef.current.forEach((flash) => {
        const age = (now - flash.start) / (flash.until - flash.start)
        const r = BLACK_HOLE_RADIUS + age * 95
        const alpha = (1 - age) * 0.85
        const ring = ctx.createRadialGradient(flash.x, flash.y, r * 0.6, flash.x, flash.y, r)
        ring.addColorStop(0, `rgba(250, 250, 255, ${alpha * 0.9})`)
        ring.addColorStop(0.4, `rgba(192, 132, 252, ${alpha * 0.55})`)
        ring.addColorStop(1, 'rgba(139, 92, 246, 0)')
        ctx.fillStyle = ring
        ctx.beginPath()
        ctx.arc(flash.x, flash.y, r, 0, Math.PI * 2)
        ctx.fill()
      })

      const hole = blackHoleRef.current
      if (hole) {
        const { x, y } = hole.position
        const glow = ctx.createRadialGradient(x, y, 0, x, y, BLACK_HOLE_RADIUS * 2.2)
        glow.addColorStop(0, `rgba(167, 139, 250, ${0.55 * pulse})`)
        glow.addColorStop(0.45, 'rgba(139, 92, 246, 0.25)')
        glow.addColorStop(1, 'rgba(15, 23, 42, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, BLACK_HOLE_RADIUS * 2.2, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 + pulse * 0.35})`
        ctx.lineWidth = 3
        ctx.shadowColor = '#a78bfa'
        ctx.shadowBlur = 24
        ctx.beginPath()
        ctx.arc(x, y, BLACK_HOLE_RADIUS, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.fillStyle = '#1e1b4b'
        ctx.beginPath()
        ctx.arc(x, y, BLACK_HOLE_RADIUS - 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#e9d5ff'
        ctx.font = 'bold 11px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const tw = targetWordRef.current
        const label = tw.length > 10 ? `${tw.slice(0, 9)}…` : tw
        ctx.fillText(label, x, y)
      }

      Matter.Composite.allBodies(world).forEach((body) => {
        if (body.label !== 'particle') return
        const { x, y } = body.position
        const word = body.plugin?.word ?? '?'
        const sim = body.plugin?.cosineSimilarity ?? 0
        const r = body.circleRadius ?? PARTICLE_RADIUS
        const colors = similarityColor(sim)

        ctx.fillStyle = colors.fill
        ctx.strokeStyle = colors.stroke
        ctx.lineWidth = 2
        ctx.shadowColor = colors.stroke
        ctx.shadowBlur = sim >= 0.85 ? 14 : 6
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.fillStyle = '#f0f9ff'
        ctx.font = '600 11px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(formatWordLabel(word), x, y - 5)

        ctx.fillStyle = sim >= 0.85 ? '#c4b5fd' : sim >= 0.55 ? '#67e8f9' : '#94a3b8'
        ctx.font = '500 9px ui-monospace, monospace'
        ctx.fillText(`${(sim * 100).toFixed(0)}%`, x, y + 9)
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      const next = getSize()
      const prev = sizeRef.current
      if (next.width === prev.width && next.height === prev.height) return

      sizeRef.current = next
      canvas.width = next.width
      canvas.height = next.height
      starsRef.current = createStars(next.width, next.height)

      rebuildWalls(world, next.width, next.height)
      if (blackHoleRef.current) {
        placeBlackHole(blackHoleRef.current, next.width, next.height)
      }

      Matter.Composite.allBodies(world).forEach((body) => {
        if (body.label !== 'particle') return
        const { x, y } = body.position
        Matter.Body.setPosition(body, {
          x: Math.max(PARTICLE_RADIUS, Math.min(next.width - PARTICLE_RADIUS, x)),
          y: Math.max(PARTICLE_RADIUS, Math.min(next.height - PARTICLE_RADIUS, y)),
        })
      })
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      Matter.Events.off(engine, 'beforeUpdate', applyBlackHoleGravity)
      Matter.Events.off(engine, 'collisionStart', handleCollision)
      absorbFlashesRef.current = []
      Matter.Runner.stop(runner)
      Matter.Engine.clear(engine)
      engineRef.current = null
      runnerRef.current = null
      blackHoleRef.current = null
      wallsRef.current = []
    }
  }, [rebuildWalls, placeBlackHole])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#020617] text-white overflow-hidden">
      <header className="relative z-20 shrink-0 border-b border-violet-500/20 bg-slate-950/90 backdrop-blur px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/lab"
              className="text-xs text-violet-400/90 hover:text-violet-300 font-medium inline-flex items-center gap-1 mb-1"
            >
              ← AI Exploration Lab
            </Link>
            <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              <Orbit className="w-5 h-5 text-violet-400" aria-hidden />
              Word Gravity Field
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" aria-hidden />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-amber-400/80">Score</p>
                <p className="text-xl font-bold tabular-nums text-amber-200">{score}</p>
                {lastAbsorb && (
                  <p className="text-[9px] text-emerald-400/90 tabular-nums animate-pulse">
                    +{lastAbsorb.pts} absorbed
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-950/40 px-4 py-2 min-w-[180px]">
              <Target className="w-4 h-4 text-violet-300 shrink-0" aria-hidden />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-violet-400/80">Target</p>
                <p className="text-sm sm:text-base font-bold text-violet-100">
                  Target: <span className="text-fuchsia-300">{targetWord}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex-1 min-h-0 min-w-0"
          role="application"
          aria-label="Word gravity physics arena"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              handlePointer(e.clientX, e.clientY)
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return
              handlePointer(e.clientX, e.clientY)
            }}
          />

          {spawnHint && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-950/80 px-4 py-2 text-xs text-cyan-200/90 backdrop-blur-sm max-w-[90%] text-center md:max-w-md">
              <Crosshair className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Pick ammo, tap the arena — watch the scanner on the right
            </div>
          )}
        </div>

        <VectorScannerPanel scan={vectorScan} targetWord={targetWord} />
      </div>

      <section
        className="relative z-30 shrink-0 border-t border-violet-500/25 bg-slate-950/95 backdrop-blur px-4 py-3 sm:py-4"
        aria-label="Word ammo bar"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" aria-hidden />
              Word Ammo
            </p>
            <button
              type="button"
              onClick={refreshAmmo}
              className="text-[10px] text-slate-500 hover:text-violet-300 flex items-center gap-1 transition-colors min-h-[32px] px-2"
            >
              <RefreshCw className="w-3 h-3" aria-hidden />
              Shuffle
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {ammoMeta.map(({ word, label, similarity }) => {
              const selected = selectedAmmo === word
              const pct = (similarity * 100).toFixed(0)
              const hot = similarity >= 0.85
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => setSelectedAmmo(word)}
                  className={`min-h-[56px] sm:min-h-[64px] rounded-xl border-2 px-2 py-2 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] ${
                    selected
                      ? hot
                        ? 'border-fuchsia-400 bg-fuchsia-950/50 shadow-[0_0_20px_rgba(192,132,252,0.35)]'
                        : 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                      : 'border-slate-700 bg-slate-900/80 hover:border-violet-500/50'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base text-white">{label}</span>
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      hot ? 'text-fuchsia-300' : similarity >= 0.55 ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  >
                    cos {pct}%
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2 leading-relaxed">
            Pull: strong if cos &gt; 70% · weak ~40% · repel if &lt; 20% · absorb into{' '}
            <span className="text-violet-300">{targetWord}</span> when cos &gt; {Math.round(ABSORB_SIM_THRESHOLD * 100)}%
          </p>
        </div>
      </section>
    </div>
  )
}
