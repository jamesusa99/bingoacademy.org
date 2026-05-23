import Matter from 'matter-js'
import { BLACK_HOLE_RADIUS, GRAVITY_STRENGTH } from '../config/wordGravity'

/** Similarity required to absorb into the black hole on collision */
export const ABSORB_SIM_THRESHOLD = 0.6

export const SIM_STRONG = 0.7
export const SIM_WEAK = 0.4
export const SIM_REPEL = 0.2

/**
 * Force multiplier from cosine similarity (game-tuned tiers).
 * >0 = pull toward target · <0 = repel away
 */
export function computeSemanticForceScale(similarity) {
  const sim = Math.max(0, Math.min(1, similarity))

  if (sim < SIM_REPEL) {
    const t = (SIM_REPEL - sim) / SIM_REPEL
    return -0.22 * (0.4 + t * 0.85)
  }

  if (sim < SIM_STRONG) {
    const t = (sim - SIM_REPEL) / (SIM_STRONG - SIM_REPEL)
    const eased = t * t * (3 - 2 * t)
    const weak = 0.14
    const mid = 0.42
    if (sim <= SIM_WEAK) {
      const local = (sim - SIM_REPEL) / (SIM_WEAK - SIM_REPEL)
      return weak + (mid - weak) * local * local
    }
    return mid + (0.72 - mid) * eased
  }

  const t = Math.min(1, (sim - SIM_STRONG) / 0.28)
  return 0.72 + 0.55 * t + 0.2 * t * t
}

/**
 * Apply custom gravity toward targetPos; magnitude ∝ similarity tier.
 */
export function applySemanticGravityForce(body, targetPos, similarity) {
  const dx = targetPos.x - body.position.x
  const dy = targetPos.y - body.position.y
  const dist = Math.hypot(dx, dy)
  if (dist < 2) return

  const dirX = dx / dist
  const dirY = dy / dist
  const scale = computeSemanticForceScale(similarity)

  const nearBoost = dist < BLACK_HOLE_RADIUS * 2.2 ? 1.35 : 1
  const distFalloff = 1 / Math.max(dist * 0.48, BLACK_HOLE_RADIUS * 0.42)
  const magnitude =
    GRAVITY_STRENGTH * body.mass * scale * distFalloff * nearBoost * 14000

  Matter.Body.applyForce(body, body.position, {
    x: dirX * magnitude,
    y: dirY * magnitude,
  })
}

export function computeAbsorbScore(similarity) {
  return Math.round(similarity * 250)
}

export function shouldAbsorbWord(similarity) {
  return similarity > ABSORB_SIM_THRESHOLD
}
