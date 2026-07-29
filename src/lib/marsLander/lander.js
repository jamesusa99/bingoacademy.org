import {
  CANVAS_W,
  FUEL_BURN,
  FUEL_MAX,
  GRAVITY,
  LANDER_H,
  LANDER_W,
  ROTATE_SPEED,
  SAFE_ANGLE,
  SAFE_VX,
  SAFE_VY,
  THRUST,
} from '../../config/marsLander.js'
import { distanceToPad, groundYAt } from './core.js'

export function createLander({ x, y, brain = null, isChampion = false, ghost = false } = {}) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    angle: 0,
    av: 0,
    fuel: FUEL_MAX,
    alive: true,
    landed: false,
    crashed: false,
    thrusting: false,
    brain,
    isChampion,
    ghost,
    fitness: 0,
    score: 0,
    steps: 0,
    minPadDist: Infinity,
  }
}

export function landerSensors(lander, terrain) {
  const ground = groundYAt(terrain, lander.x)
  const altitude = Math.max(0, ground - lander.y - LANDER_H / 2)
  const padDist = distanceToPad(lander, terrain.pad)
  lander.minPadDist = Math.min(lander.minPadDist, padDist)

  return [
    Math.min(1, altitude / 280),
    Math.max(-1, Math.min(1, lander.vx / 6)),
    Math.max(-1, Math.min(1, lander.vy / 8)),
    Math.max(-1, Math.min(1, lander.angle / Math.PI)),
    Math.max(-1, Math.min(1, lander.av / 0.2)),
    lander.fuel / FUEL_MAX,
  ]
}

/**
 * Apply one physics step.
 * @param {{ thrust?: boolean, rotate?: number }} controls rotate in [-1,1]
 */
export function stepLander(lander, terrain, controls, rewards) {
  if (!lander.alive) return

  lander.steps += 1
  let thrust = Boolean(controls.thrust)
  const rotate = Math.max(-1, Math.min(1, controls.rotate ?? 0))

  if (thrust && lander.fuel <= 0) thrust = false
  lander.thrusting = thrust

  lander.av += rotate * ROTATE_SPEED * 0.15
  lander.av *= 0.92
  lander.angle += lander.av
  if (lander.angle > Math.PI) lander.angle -= Math.PI * 2
  if (lander.angle < -Math.PI) lander.angle += Math.PI * 2

  lander.vy += GRAVITY

  if (thrust) {
    lander.vx += Math.sin(lander.angle) * THRUST
    lander.vy -= Math.cos(lander.angle) * THRUST
    lander.fuel = Math.max(0, lander.fuel - FUEL_BURN)
    lander.score -= (rewards.fuelWaste ?? 0) * 0.02
  }

  lander.vx *= 0.999
  lander.x += lander.vx
  lander.y += lander.vy

  // Ongoing shaping rewards
  const upright = 1 - Math.min(1, Math.abs(lander.angle) / SAFE_ANGLE)
  lander.score += (rewards.uprightBonus ?? 0) * upright * 0.004

  const padDist = distanceToPad(lander, terrain.pad)
  const prox = 1 - Math.min(1, padDist / 420)
  lander.score += (rewards.padProximity ?? 0) * prox * 0.008

  // Bounds
  if (lander.x < 8 || lander.x > CANVAS_W - 8 || lander.y < 8) {
    finishCrash(lander, rewards)
    return
  }

  const ground = groundYAt(terrain, lander.x)
  const belly = lander.y + LANDER_H / 2
  if (belly >= ground) {
    lander.y = ground - LANDER_H / 2
    evaluateTouchdown(lander, terrain, rewards)
  }
}

function evaluateTouchdown(lander, terrain, rewards) {
  const onPad = lander.x >= terrain.pad.left && lander.x <= terrain.pad.right
  const soft =
    onPad &&
    Math.abs(lander.vy) <= SAFE_VY &&
    Math.abs(lander.vx) <= SAFE_VX &&
    Math.abs(lander.angle) <= SAFE_ANGLE

  if (soft) {
    lander.alive = false
    lander.landed = true
    lander.vx = 0
    lander.vy = 0
    lander.av = 0
    lander.score += rewards.softLanding ?? 100
    lander.score += (lander.fuel / FUEL_MAX) * (rewards.fuelWaste ?? 10) * 0.5
    lander.fitness = lander.score
    return
  }

  finishCrash(lander, rewards)
}

function finishCrash(lander, rewards) {
  lander.alive = false
  lander.crashed = true
  lander.thrusting = false
  lander.score -= rewards.crash ?? 50
  // Consolation for getting near the pad before crashing
  const prox = 1 - Math.min(1, lander.minPadDist / 420)
  lander.score += prox * (rewards.padProximity ?? 20) * 0.35
  lander.fitness = lander.score
}

export function finalizeFitness(lander) {
  if (lander.alive) {
    lander.alive = false
    lander.fitness = lander.score - 25
  } else if (lander.fitness == null || Number.isNaN(lander.fitness)) {
    lander.fitness = lander.score
  }
  return lander.fitness
}

export function drawLander(ctx, lander, { alpha = 1 } = {}) {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  ctx.globalAlpha = alpha

  if (lander.thrusting && lander.alive) {
    ctx.fillStyle = lander.isChampion ? '#fbbf24' : '#fb923c'
    ctx.beginPath()
    ctx.moveTo(-5, LANDER_H / 2)
    ctx.lineTo(0, LANDER_H / 2 + 10 + Math.random() * 6)
    ctx.lineTo(5, LANDER_H / 2)
    ctx.fill()
  }

  const body = lander.isChampion ? '#fde68a' : lander.ghost ? '#67e8f9' : '#e2e8f0'
  ctx.fillStyle = body
  ctx.strokeStyle = lander.crashed ? '#f43f5e' : lander.landed ? '#34d399' : '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, -LANDER_H / 2)
  ctx.lineTo(LANDER_W / 2, LANDER_H / 2)
  ctx.lineTo(-LANDER_W / 2, LANDER_H / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Legs
  ctx.beginPath()
  ctx.moveTo(-LANDER_W / 2, LANDER_H / 2)
  ctx.lineTo(-LANDER_W / 2 - 4, LANDER_H / 2 + 6)
  ctx.moveTo(LANDER_W / 2, LANDER_H / 2)
  ctx.lineTo(LANDER_W / 2 + 4, LANDER_H / 2 + 6)
  ctx.stroke()

  ctx.restore()
}

export function drawTerrain(ctx, terrain) {
  const { points, pad } = terrain
  const g = ctx.createLinearGradient(0, 0, 0, 520)
  g.addColorStop(0, '#1c1917')
  g.addColorStop(1, '#431407')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#fb923c'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(points[1].x, points[1].y)
  for (let i = 2; i < points.length - 2; i += 1) ctx.lineTo(points[i].x, points[i].y)
  ctx.stroke()

  // Landing pad highlight
  ctx.fillStyle = 'rgba(52, 211, 153, 0.35)'
  ctx.fillRect(pad.left, pad.y - 3, pad.right - pad.left, 6)
  ctx.strokeStyle = '#34d399'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pad.left, pad.y)
  ctx.lineTo(pad.right, pad.y)
  ctx.stroke()
  ctx.fillStyle = '#6ee7b7'
  ctx.font = '10px ui-monospace, monospace'
  ctx.fillText('PAD', pad.center - 10, pad.y - 8)
}
