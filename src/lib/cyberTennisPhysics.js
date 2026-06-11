import {
  BALL_GRAVITY,
  BALL_HIT_EXTRA,
  BALL_MAX_RADIUS,
  BALL_MIN_RADIUS,
  BALL_TRAIL_LEN,
  BALL_Z_FAR,
  BALL_Z_HIT_WINDOW,
  BALL_Z_NEAR,
  RACKET_RADIUS,
  SWING_BOOST_DIVISOR,
  SWING_BOOST_MAX,
  SWING_VX_SCALE,
  SWING_VY_SCALE,
} from '../config/cyberTennis'

/**
 * Per-frame swing vector from consecutive racket positions (px/frame).
 * @param {{ x: number, y: number } | null} prev
 * @param {{ x: number, y: number }} curr
 * @returns {import('../config/cyberTennis').SwingVector}
 */
export function computeSwingVector(prev, curr) {
  if (!prev) return { dx: 0, dy: 0, magnitude: 0 }
  const dx = curr.x - prev.x
  const dy = curr.y - prev.y
  return { dx, dy, magnitude: Math.hypot(dx, dy) }
}

/** Faster swing → stronger return along swing direction + depth boost */
export function applySwingReturn(ball, swing, racket, proj) {
  const m = swing?.magnitude ?? 0
  const boost = 1 + Math.min(m / SWING_BOOST_DIVISOR, SWING_BOOST_MAX)
  ball.vz = Math.abs(ball.vz) * boost

  if (m > 0.5) {
    const nx = swing.dx / m
    const ny = swing.dy / m
    ball.vx += nx * m * SWING_VX_SCALE
    ball.vy += ny * m * SWING_VY_SCALE - 0.6
  } else {
    ball.vy -= 1.8
    ball.vx += (proj.sx - racket.x) * 0.008
  }
}

/** @returns {import('../config/cyberTennis').CyberBall} */
export function createCyberBall() {
  return {
    x: 0.5 + (Math.random() - 0.5) * 0.15,
    y: 0.38 + (Math.random() - 0.5) * 0.08,
    z: BALL_Z_FAR,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -0.15,
    vz: -48,
    resolvedNear: false,
    trail: [],
  }
}

/** Map depth ball to screen pixels (z=100 small/far, z=0 large/near) */
export function projectBall(ball, w, h) {
  const depth = Math.max(0, Math.min(1, 1 - ball.z / BALL_Z_FAR))
  const cx = w * 0.5
  const cy = h * 0.4
  const spreadX = w * 0.42 * depth
  const spreadY = h * 0.4 * depth
  const sx = cx + (ball.x - 0.5) * spreadX * 2
  const sy = cy + (ball.y - 0.5) * spreadY * 2
  const radius = BALL_MIN_RADIUS + (BALL_MAX_RADIUS - BALL_MIN_RADIUS) * depth
  return { sx, sy, radius, depth }
}

/**
 * Advance ball physics. Returns event: 'hit' | 'miss' | 'wall' | null
 * @param {import('../config/cyberTennis').CyberBall} ball
 * @param {{ x: number, y: number, active: boolean }} racket
 * @param {import('../config/cyberTennis').SwingVector} swing
 * @param {number} w canvas width
 * @param {number} h canvas height
 * @param {number} dt seconds
 */
export function stepCyberBall(ball, racket, swing, w, h, dt) {
  ball.vy += BALL_GRAVITY * dt
  ball.x += ball.vx * dt
  ball.y += ball.vy * dt
  ball.z += ball.vz * dt

  ball.x = Math.max(0.12, Math.min(0.88, ball.x))

  if (ball.z > BALL_Z_FAR) {
    ball.z = BALL_Z_FAR
    ball.vz = -Math.abs(ball.vz) * 0.98
    ball.resolvedNear = false
    return { type: 'wall', proj: projectBall(ball, w, h) }
  }

  const proj = projectBall(ball, w, h)

  if (ball.z < BALL_Z_HIT_WINDOW && ball.vz < 0 && !ball.resolvedNear) {
    let hit = false
    if (racket.active) {
      const dist = Math.hypot(proj.sx - racket.x, proj.sy - racket.y)
      const hitRadius = proj.radius + RACKET_RADIUS + BALL_HIT_EXTRA
      if (dist < hitRadius) {
        applySwingReturn(ball, swing, racket, proj)
        ball.resolvedNear = true
        hit = true
        return { type: 'hit', proj, swingMagnitude: swing.magnitude }
      }
    }
    if (!hit && ball.z < BALL_Z_NEAR) {
      return { type: 'miss', proj }
    }
  }

  if (ball.z > BALL_Z_HIT_WINDOW && ball.vz > 0) {
    ball.resolvedNear = false
  }

  return { type: null, proj }
}

export function pushTrail(ball, sx, sy) {
  ball.trail.push({ sx, sy })
  if (ball.trail.length > BALL_TRAIL_LEN) ball.trail.shift()
}

export function clearTrail(ball) {
  ball.trail = []
}
