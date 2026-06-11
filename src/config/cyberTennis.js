/** AI Cyber Tennis — cyber squash MVP constants & telemetry labels */

export const CYBER_TENNIS_VIDEO = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
}

export const CYBER_TENNIS_NEON = {
  skeleton: '#60a5fa',
  cyan: '#22d3ee',
  green: '#34d399',
  magenta: '#f472b6',
  ball: '#fde047',
  wall: '#6366f1',
  hitFlash: '#ffffff',
}

/** MoveNet keypoint confidence threshold (Phase 2) */
export const POSE_CONFIDENCE_MIN = 0.4

/** Upper-body arm chain for cyber squash swings */
export const TENNIS_ARM_BONES = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
]

export const TENNIS_ARM_JOINTS = [
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
]

export const RACKET_RADIUS = 28

/** Phase 3 — pseudo-3D ball physics (z-depth court) */
export const BALL_Z_FAR = 100
export const BALL_Z_NEAR = 0
export const BALL_Z_HIT_WINDOW = 5
export const BALL_GRAVITY = 9.5
export const BALL_HIT_EXTRA = 36
export const BALL_MIN_RADIUS = 5
export const BALL_MAX_RADIUS = 24
export const BALL_TRAIL_LEN = 14
export const HIT_FLASH_MS = 280

/** Phase 4 — swing velocity → return speed */
export const SWING_BOOST_DIVISOR = 35
export const SWING_BOOST_MAX = 2.2
export const SWING_VX_SCALE = 0.015
export const SWING_VY_SCALE = 0.02

export const CYBER_TENNIS_EDUCATION =
  'AI Vision converts your body into X/Y coordinates. By measuring the distance your wrist moves between video frames, we calculate your Swing Velocity to hit the ball!'

/** @typedef {{ dx: number, dy: number, magnitude: number }} SwingVector */

/** @typedef {{ x: number, y: number, z: number, vx: number, vy: number, vz: number, resolvedNear: boolean, trail: { sx: number, sy: number }[] }} CyberBall */

export const CYBER_TENNIS_TELEMETRY = [
  { id: 'racketCoords', label: 'Racket coordinates (X, Y)', unit: 'px', placeholder: '—', featured: true },
  { id: 'swingSpeed', label: 'Swing velocity', unit: 'px/frame', placeholder: '—', featured: true },
  { id: 'aiConfidence', label: 'AI confidence score', unit: '%', placeholder: '—', featured: true },
  { id: 'fps', label: 'Pose FPS', unit: 'Hz', placeholder: '—' },
  { id: 'keypoints', label: 'Keypoints', unit: 'joints', placeholder: '—' },
  { id: 'ballVel', label: 'Ball speed', unit: 'z/s', placeholder: '—' },
  { id: 'latency', label: 'Model latency', unit: 'ms', placeholder: '—' },
  { id: 'collisions', label: 'Rally hits', unit: 'count', placeholder: '0' },
  { id: 'ballZ', label: 'Ball depth', unit: 'z', placeholder: '—' },
]

export const CYBER_TENNIS_CONCEPTS = [
  'Pose Estimation',
  'Vector Math',
  'Collision Detection',
  'Real-time CV',
]

export const DEMO_BALL = {
  radius: BALL_MAX_RADIUS,
  speed: 48,
}
