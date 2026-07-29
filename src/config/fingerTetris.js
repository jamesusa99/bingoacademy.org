/** AI Finger Tetris — board, gestures, neon theme */

export const COLS = 10
export const ROWS = 20
export const CELL = 30
export const CANVAS_W = COLS * CELL
export const CANVAS_H = ROWS * CELL

export const DROP_MS = 750
export const LOCK_DELAY_MS = 200

/** Pinch: index tip (8) ↔ thumb tip (4) in video pixels (also scaled by width) */
export const PINCH_THRESHOLD_PX = 55
/** Extra pinch tolerance as fraction of video width */
export const PINCH_THRESHOLD_RATIO = 0.09
/** Prevents uncontrolled spin on sustained pinch */
export const ROTATE_COOLDOWN_MS = 350
/** Index tip downward velocity (px / ms) to trigger hard drop */
export const HARD_DROP_VY = 0.45
export const HARD_DROP_COOLDOWN_MS = 450

export const HAND_CONFIDENCE_MIN = 0.35

export const HOW_TO_PLAY_STEPS = [
  'Allow camera access when the browser asks.',
  'Wait until the status shows “MediaPipe Hands ready”.',
  'Click Start Arena (button unlocks when camera + model are ready).',
  'Hold one hand in frame — green skeleton + red fingertip should appear.',
  'Move your index finger left/right to steer the falling piece.',
  'Pinch thumb + index tip together to rotate (watch Pinch Distance drop).',
  'Flick your index finger downward quickly to hard-drop.',
]

export const HAND_DETECTOR_TFJS_FALLBACK = {
  runtime: 'tfjs',
  modelType: 'lite',
  maxHands: 1,
}

export const FINGER_TETRIS_VIDEO = {
  width: { ideal: 640 },
  height: { ideal: 480 },
}

export const FINGER_TETRIS_NEON = {
  green: '#39ff14',
  cyan: '#22d3ee',
  magenta: '#f0abfc',
  red: '#ff2d55',
  grid: 'rgba(34, 211, 238, 0.12)',
  ghost: 'rgba(255,255,255,0.18)',
}

/** 7 standard tetrominoes — neon cyber colors */
export const TETROMINO_COLORS = {
  I: '#22d3ee',
  O: '#fde047',
  T: '#c084fc',
  S: '#4ade80',
  Z: '#fb7185',
  J: '#60a5fa',
  L: '#fb923c',
}

/** Shape matrices (rotation 0); each cell is 1 = filled */
export const TETROMINO_SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

export const TETROMINO_TYPES = Object.keys(TETROMINO_SHAPES)

/** MediaPipe Hands bone pairs (keypoint indices) */
export const HAND_BONES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
]

export const INDEX_TIP = 8
export const THUMB_TIP = 4

export const SCORE_TABLE = [0, 100, 300, 500, 800]

export const FINGER_TETRIS_EDUCATION =
  'AI maps your index finger to grid columns and calculates thumb distance for rotation.'

export const HAND_DETECTOR_CONFIG = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240',
  modelType: 'lite',
  maxHands: 1,
}

export function pinchThresholdForVideo(videoWidth) {
  const w = videoWidth || 640
  return Math.max(PINCH_THRESHOLD_PX, w * PINCH_THRESHOLD_RATIO)
}
