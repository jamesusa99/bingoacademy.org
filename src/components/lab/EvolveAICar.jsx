import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Matter from 'matter-js'
import { Eraser, Pencil, Play, Ruler } from 'lucide-react'
import {
  ARENA_WALL_THICKNESS,
  CAR_LENGTH,
  COLLISION_CAR,
  COLLISION_WALL,
  GENERATION_MAX_MS,
  POPULATION_SIZE,
  REWARD_SAFETY,
  SPAWN_ANGLE,
  TRACK_BRUSH_SIZE,
  TRACK_BRUSH_SPACING,
  WORLD_GRAVITY,
} from '../../config/evolveCar'
import { PopulationManager } from '../../lib/evolveCar/PopulationManager'
import EvolveDashboard from './EvolveDashboard'
import EvolveRewardPanel from './EvolveRewardPanel'

const WALL_BODY_OPTS = {
  isStatic: true,
  collisionFilter: { category: COLLISION_WALL, mask: COLLISION_CAR },
}

function clientToCanvas(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function stampTrackSegment(world, trackBodies, x1, y1, x2, y2) {
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const steps = Math.max(1, Math.ceil(dist / TRACK_BRUSH_SPACING))
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps
    const x = x1 + (x2 - x1) * t
    const y = y1 + (y2 - y1) * t
    const body = Matter.Bodies.rectangle(x, y, TRACK_BRUSH_SIZE, TRACK_BRUSH_SIZE, {
      label: 'track',
      friction: 0.8,
      restitution: 0.2,
      chamfer: { radius: 3 },
      ...WALL_BODY_OPTS,
    })
    Matter.World.add(world, body)
    trackBodies.push(body)
  }
}

function buildArenaBounds(world, width, height, boundsRef) {
  boundsRef.current.forEach((b) => Matter.World.remove(world, b))
  const t = ARENA_WALL_THICKNESS
  const walls = [
    Matter.Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, { label: 'arena', ...WALL_BODY_OPTS }),
    Matter.Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { label: 'arena', ...WALL_BODY_OPTS }),
    Matter.Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, { label: 'arena', ...WALL_BODY_OPTS }),
    Matter.Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, { label: 'arena', ...WALL_BODY_OPTS }),
  ]
  Matter.World.add(world, walls)
  boundsRef.current = walls
}

function getWallBodies(trackBodies, arenaBounds) {
  return [...trackBodies, ...arenaBounds]
}

function drawBlueprintGrid(ctx, width, height) {
  ctx.fillStyle = '#0c1222'
  ctx.fillRect(0, 0, width, height)

  const minor = 24
  const major = 96
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
  ctx.lineWidth = 1
  for (let x = 0; x <= width; x += minor) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += minor) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)'
  for (let x = 0; x <= width; x += major) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += major) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, width - 2, height - 2)
}

function renderWallBodies(ctx, bodies) {
  bodies.forEach((body) => {
    if (body.label !== 'track' && body.label !== 'arena') return
    const verts = body.vertices
    if (!verts?.length) return

    ctx.beginPath()
    ctx.moveTo(verts[0].x, verts[0].y)
    for (let i = 1; i < verts.length; i += 1) {
      ctx.lineTo(verts[i].x, verts[i].y)
    }
    ctx.closePath()

    if (body.label === 'arena') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
      ctx.lineWidth = 1
    } else {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.35)'
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
      ctx.lineWidth = 1.5
      ctx.shadowColor = 'rgba(34, 211, 238, 0.4)'
      ctx.shadowBlur = 6
    }
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0
  })
}

function renderCarSensors(ctx, car, { fullDetail = false } = {}) {
  if (!car?.sensorReadings?.length || car.isDead) return

  car.sensorReadings.forEach((ray) => {
    ctx.beginPath()
    ctx.moveTo(ray.startX, ray.startY)
    ctx.lineTo(ray.endX, ray.endY)
    const alpha = fullDetail ? 1 : 0.35
    ctx.strokeStyle = ray.hit
      ? `rgba(248, 113, 113, ${0.95 * alpha})`
      : `rgba(74, 222, 128, ${0.85 * alpha})`
    ctx.lineWidth = fullDetail ? (ray.hit ? 2.5 : 1.5) : 0.8
    ctx.stroke()
    if (fullDetail && ray.hit) {
      ctx.beginPath()
      ctx.arc(ray.endX, ray.endY, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(248, 113, 113, 0.9)'
      ctx.fill()
    }
  })
}

function renderCarBody(ctx, car) {
  const body = car.body
  const verts = body.vertices
  if (!verts?.length) return

  ctx.beginPath()
  ctx.moveTo(verts[0].x, verts[0].y)
  for (let i = 1; i < verts.length; i += 1) {
    ctx.lineTo(verts[i].x, verts[i].y)
  }
  ctx.closePath()

  if (car.isChampion && !car.isDead) {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.92)'
    ctx.strokeStyle = 'rgba(253, 224, 71, 1)'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(251, 191, 36, 0.65)'
    ctx.shadowBlur = 16
  } else if (car.isDead) {
    ctx.fillStyle = 'rgba(51, 65, 85, 0.35)'
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)'
    ctx.lineWidth = 1
    ctx.shadowBlur = 0
  } else {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.22)'
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)'
    ctx.lineWidth = 1
    ctx.shadowBlur = 0
  }
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0

  if (car.isChampion && !car.isDead) {
    const { x, y } = body.position
    const noseX = x + Math.cos(body.angle) * (CAR_LENGTH * 0.35)
    const noseY = y + Math.sin(body.angle) * (CAR_LENGTH * 0.35)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(noseX, noseY)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function renderPopulation(ctx, population) {
  if (!population?.cars?.length) return
  population.cars.forEach((car) => {
    if (!car.isChampion) return
    renderCarBody(ctx, car)
  })
  population.cars.forEach((car) => {
    if (car.isChampion) return
    renderCarBody(ctx, car)
  })
  const champion = population.cars.find((c) => c.isChampion && !c.isDead)
  if (champion) {
    renderCarSensors(ctx, champion, { fullDetail: true })
  }
}

/**
 * Evolve! AI Car — track editor + neuroevolution population.
 */
export default function EvolveAICar() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const runnerRef = useRef(null)
  const trackBodiesRef = useRef([])
  const arenaBoundsRef = useRef([])
  const populationRef = useRef(null)
  const sizeRef = useRef({ width: 800, height: 500 })
  const rafRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const drawModeRef = useRef(true)
  const evolutionActiveRef = useRef(false)
  const generationStartRef = useRef(0)
  const advancingGenRef = useRef(false)
  const rewardModeRef = useRef(REWARD_SAFETY)

  const [drawMode, setDrawMode] = useState(true)
  const [rewardMode, setRewardMode] = useState(REWARD_SAFETY)
  const [fitnessHistory, setFitnessHistory] = useState([])
  const [trackCount, setTrackCount] = useState(0)
  const [evolutionHint, setEvolutionHint] = useState(null)
  const [evolving, setEvolving] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [livingCount, setLivingCount] = useState(0)
  const [bestFitness, setBestFitness] = useState(0)

  const stopEvolution = useCallback(() => {
    if (populationRef.current) {
      populationRef.current.clear()
      populationRef.current = null
    }
    evolutionActiveRef.current = false
    advancingGenRef.current = false
    setEvolving(false)
    setLivingCount(0)
    setGeneration(0)
    setBestFitness(0)
    setFitnessHistory([])
  }, [])

  const handleRewardModeChange = useCallback((mode) => {
    setRewardMode(mode)
    rewardModeRef.current = mode
    populationRef.current?.setRewardMode(mode)
  }, [])

  const clearTrack = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    stopEvolution()
    trackBodiesRef.current.forEach((b) => Matter.World.remove(engine.world, b))
    trackBodiesRef.current = []
    setTrackCount(0)
    setEvolutionHint(null)
  }, [stopEvolution])

  const syncPopulationUi = useCallback((pop) => {
    if (!pop) return
    setGeneration(pop.generation)
    setLivingCount(pop.livingCount)
    setBestFitness(Math.round(pop.bestFitness))
  }, [])

  const advanceGeneration = useCallback(() => {
    const pop = populationRef.current
    const engine = engineRef.current
    if (!pop || !engine || advancingGenRef.current) return

    advancingGenRef.current = true
    const endedGen = pop.generation
    const endedBest = pop.generationBestFitness()
    setFitnessHistory((prev) => [...prev, { gen: endedGen, best: endedBest }])

    pop.nextGeneration()
    generationStartRef.current = performance.now()
    syncPopulationUi(pop)
    setEvolutionHint(
      `Generation ${pop.generation} · reward guides who survives · gold car = last gen champion`
    )
    advancingGenRef.current = false
  }, [syncPopulationUi])

  const startEvolution = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return

    stopEvolution()
    const { width, height } = sizeRef.current
    const pop = new PopulationManager(engine.world, {
      x: width * 0.5,
      y: height * 0.72,
      angle: SPAWN_ANGLE,
    })
    pop.setRewardMode(rewardModeRef.current)
    pop.startEvolution()
    populationRef.current = pop
    setFitnessHistory([])
    evolutionActiveRef.current = true
    generationStartRef.current = performance.now()
    setEvolving(true)
    setDrawMode(false)
    syncPopulationUi(pop)
    setEvolutionHint(
      `Gen 1 · tune the reward function above · ${POPULATION_SIZE} cars learning by trial and error`
    )
  }, [stopEvolution, syncPopulationUi])

  const handleStartEvolution = () => {
    if (trackBodiesRef.current.length < 8) {
      setEvolutionHint('Draw more track walls first — then start evolution!')
      return
    }
    startEvolution()
  }

  const endStroke = useCallback(() => {
    drawingRef.current = false
    lastPointRef.current = null
  }, [])

  useEffect(() => {
    drawModeRef.current = drawMode
    if (!drawMode) endStroke()
  }, [drawMode, endStroke])

  const paintAt = useCallback((clientX, clientY) => {
    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas || !drawModeRef.current || evolutionActiveRef.current) return

    const { x, y } = clientToCanvas(canvas, clientX, clientY)
    const { width, height } = sizeRef.current
    const pad = TRACK_BRUSH_SIZE
    if (x < pad || y < pad || x > width - pad || y > height - pad) return

    const last = lastPointRef.current
    if (last) {
      stampTrackSegment(engine.world, trackBodiesRef.current, last.x, last.y, x, y)
    } else {
      stampTrackSegment(engine.world, trackBodiesRef.current, x, y, x, y)
    }
    lastPointRef.current = { x, y }
    setTrackCount(trackBodiesRef.current.length)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const engine = Matter.Engine.create({ gravity: WORLD_GRAVITY })
    engineRef.current = engine
    const { world } = engine

    const getSize = () => {
      const { width, height } = container.getBoundingClientRect()
      return {
        width: Math.max(320, Math.round(width)),
        height: Math.max(280, Math.round(height)),
      }
    }

    let { width, height } = getSize()
    sizeRef.current = { width, height }
    canvas.width = width
    canvas.height = height
    buildArenaBounds(world, width, height, arenaBoundsRef)

    const onBeforeUpdate = () => {
      const pop = populationRef.current
      if (!pop || !evolutionActiveRef.current) return

      const walls = getWallBodies(trackBodiesRef.current, arenaBoundsRef.current)

      pop.cars.forEach((car) => {
        if (car.isDead) return
        car.updateSensors(walls)
        if (car.brain) {
          const inputs = PopulationManager.sensorInputs(car)
          const { acceleration, steering } = car.brain.predictDrive(inputs)
          car.drive(acceleration, steering)
        }
        car.applyDriveForces()
      })

      pop.updateFitness()

      if (
        !advancingGenRef.current &&
        (pop.allDead() || performance.now() - generationStartRef.current > GENERATION_MAX_MS)
      ) {
        advanceGeneration()
      }
    }
    Matter.Events.on(engine, 'beforeUpdate', onBeforeUpdate)

    const onCollisionStart = (event) => {
      if (!evolutionActiveRef.current) return

      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair
        const carBody = bodyA.label === 'car' ? bodyA : bodyB.label === 'car' ? bodyB : null
        if (!carBody?.plugin?.car) continue
        const other = carBody === bodyA ? bodyB : bodyA
        if (other.label === 'track' || other.label === 'arena') {
          const car = carBody.plugin.car
          car.kill()
          populationRef.current?.finalizeCar(car)
        }
      }
    }
    Matter.Events.on(engine, 'collisionStart', onCollisionStart)

    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const draw = () => {
      const { width: w, height: h } = sizeRef.current
      drawBlueprintGrid(ctx, w, h)
      renderWallBodies(ctx, Matter.Composite.allBodies(world))

      if (populationRef.current) {
        renderPopulation(ctx, populationRef.current)
      }

      if (drawingRef.current && lastPointRef.current && drawModeRef.current) {
        ctx.beginPath()
        ctx.arc(lastPointRef.current.x, lastPointRef.current.y, TRACK_BRUSH_SIZE * 0.55, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)'
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'
        ctx.lineWidth = 2
        ctx.fill()
        ctx.stroke()
      }

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
      buildArenaBounds(world, next.width, next.height, arenaBoundsRef)
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      Matter.Events.off(engine, 'beforeUpdate', onBeforeUpdate)
      Matter.Events.off(engine, 'collisionStart', onCollisionStart)
      Matter.Runner.stop(runner)
      stopEvolution()
      Matter.Engine.clear(engine)
      engineRef.current = null
      trackBodiesRef.current = []
      arenaBoundsRef.current = []
    }
  }, [stopEvolution, advanceGeneration])

  useEffect(() => {
    if (!evolving || !populationRef.current) return
    const id = setInterval(() => {
      syncPopulationUi(populationRef.current)
    }, 200)
    return () => clearInterval(id)
  }, [evolving, syncPopulationUi])

  const canvasCursor = drawMode && !evolving ? 'crosshair' : 'default'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0f1a] text-sky-100 font-mono overflow-hidden">
      <header className="shrink-0 border-b border-sky-500/20 bg-[#0c1222]/95 backdrop-blur px-4 py-3">
        <Link
          to="/exploration"
          className="text-[10px] text-sky-500 hover:text-sky-300 inline-flex items-center gap-1 mb-2"
        >
          ← AI Exploration Lab
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-sky-100 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-cyan-400" aria-hidden />
              Evolve! AI Car
            </h1>
            <p className="text-[11px] text-sky-600 mt-0.5">
              Neuroevolution · 5 lidar inputs · genetic algorithm
            </p>
          </div>
          <p className="text-[10px] text-cyan-600/90 tabular-nums">
            Track segments: <span className="text-cyan-300 font-bold">{trackCount}</span>
          </p>
        </div>
      </header>

      <div className="shrink-0 flex flex-wrap items-stretch gap-2 sm:gap-3 px-4 py-3 border-b border-sky-800/50 bg-[#0c1222]/80">
        <EvolveRewardPanel
          rewardMode={rewardMode}
          onRewardModeChange={handleRewardModeChange}
        />
        <button
          type="button"
          onClick={() => {
            stopEvolution()
            setDrawMode(true)
            setEvolutionHint(null)
          }}
          className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
            drawMode
              ? 'border-amber-400/70 bg-amber-950/40 text-amber-200'
              : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-sky-600'
          }`}
        >
          <Pencil className="w-4 h-4" aria-hidden />
          Draw Track
        </button>
        <button
          type="button"
          onClick={clearTrack}
          className="min-h-[44px] px-4 rounded-xl border border-slate-600 bg-slate-900/60 text-slate-300 text-sm font-semibold flex items-center gap-2 hover:border-red-500/50 hover:text-red-300 transition-all"
        >
          <Eraser className="w-4 h-4" aria-hidden />
          Clear Track
        </button>
        <button
          type="button"
          onClick={handleStartEvolution}
          className="min-h-[48px] sm:min-h-[52px] flex-1 sm:flex-none sm:min-w-[200px] px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-sky-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden />
          Start Evolution
        </button>
      </div>

      {evolutionHint && (
        <p className="shrink-0 text-center text-xs text-amber-300/90 px-4 py-2 bg-amber-950/30 border-b border-amber-800/40">
          {evolutionHint}
        </p>
      )}

      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full touch-none"
        role="application"
        aria-label="Track and car simulation canvas"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: canvasCursor, touchAction: 'none' }}
          onPointerDown={(e) => {
            if (!drawMode || evolving) return
            e.currentTarget.setPointerCapture(e.pointerId)
            drawingRef.current = true
            lastPointRef.current = null
            paintAt(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => {
            if (!drawingRef.current || !drawMode || evolving) return
            paintAt(e.clientX, e.clientY)
          }}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onLostPointerCapture={endStroke}
        />
        <EvolveDashboard
          visible={evolving}
          generation={generation}
          livingCount={livingCount}
          bestFitness={bestFitness}
          rewardMode={rewardMode}
          fitnessHistory={fitnessHistory}
        />
        {drawMode && !evolving && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none rounded-full border border-cyan-500/30 bg-slate-950/80 px-4 py-2 text-[11px] text-cyan-300/90 backdrop-blur-sm">
            Drag to paint track walls · set reward · Start Evolution
          </div>
        )}
      </div>
    </div>
  )
}
