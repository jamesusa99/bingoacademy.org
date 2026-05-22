/** MoveNet / COCO-style skeleton + pose → audio mapping for AI Virtual Conductor */

export const KEYPOINT_MIN_SCORE = 0.3

export const VOLUME_MIN = 0.1
export const VOLUME_MAX = 1.0
export const TEMPO_MIN = 0.5
export const TEMPO_MAX = 2.0
export const TEMPO_IDLE = 1.0

/** Nose below this fraction of frame height = squat */
export const SQUAT_NOSE_RATIO = 0.7

/** Per-frame smoothing (0–1); lower = smoother */
export const LERP_ALPHA = 0.14

export const WRIST_HISTORY_LEN = 6

/** Scales horizontal wrist speed → tempo boost */
export const TEMPO_WAVE_SCALE = 28

export const POSE_BONES = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  ['nose', 'left_shoulder'],
  ['nose', 'right_shoulder'],
]

export function lerp(current, target, alpha) {
  return current + (target - current) * alpha
}

export function getKeypoint(keypoints, name) {
  const kp = keypoints.find((k) => k.name === name && (k.score ?? 0) > KEYPOINT_MIN_SCORE)
  if (!kp) return null
  return { x: kp.x, y: kp.y, score: kp.score ?? 0 }
}

export function computeTargetVolume(keypoints, frameHeight) {
  const wrist = getKeypoint(keypoints, 'left_wrist')
  const shoulder = getKeypoint(keypoints, 'left_shoulder')
  const hip = getKeypoint(keypoints, 'left_hip')
  if (!wrist || !shoulder || frameHeight <= 0) return null

  const chestY = hip
    ? (shoulder.y + hip.y) / 2
    : shoulder.y + frameHeight * 0.18

  if (wrist.y >= chestY) {
    return VOLUME_MIN
  }

  if (wrist.y < shoulder.y) {
    const lift = shoulder.y - wrist.y
    const maxLift = Math.max(shoulder.y * 0.5, frameHeight * 0.25)
    const t = Math.min(1, lift / maxLift)
    return VOLUME_MIN + t * (VOLUME_MAX - VOLUME_MIN)
  }

  const span = Math.max(chestY - shoulder.y, 1)
  const t = (wrist.y - shoulder.y) / span
  return lerp(VOLUME_MAX, VOLUME_MIN, Math.min(1, Math.max(0, t)))
}

export function computeTargetTempoFromWave(deltaXPerFrameNorm) {
  const speed = Math.min(1, deltaXPerFrameNorm * TEMPO_WAVE_SCALE)
  return TEMPO_IDLE + speed * (TEMPO_MAX - TEMPO_IDLE)
}

export function pushWristX(history, x, maxLen = WRIST_HISTORY_LEN) {
  const next = [...history, x]
  if (next.length > maxLen) next.shift()
  return next
}

export function wristDeltaXNorm(history, frameWidth) {
  if (history.length < 2 || frameWidth <= 0) return 0
  let sum = 0
  for (let i = 1; i < history.length; i += 1) {
    sum += Math.abs(history[i] - history[i - 1])
  }
  return sum / (history.length - 1) / frameWidth
}

export function isSquatPose(noseY, frameHeight) {
  return noseY > frameHeight * SQUAT_NOSE_RATIO
}

/** Educational copy for pose data panel */
export const POSE_DATA_EDUCATION =
  "AI doesn't see pictures; it sees numbers. Pose Estimation turns your body into 17 mathematical points in an X/Y grid. Your movements change these coordinates, which we use to code the music rules!"

export const DATA_MATRIX_JOINTS = [
  { name: 'left_wrist', label: 'Left Wrist' },
  { name: 'right_wrist', label: 'Right Wrist' },
  { name: 'nose', label: 'Nose' },
]

export function buildDataMatrixSnapshot(keypoints, poseScore) {
  const rows = DATA_MATRIX_JOINTS.map(({ name, label }) => {
    const kp = keypoints?.find((k) => k.name === name)
    if (!kp) {
      return { label, name, x: null, y: null, jointScore: null }
    }
    const jointScore = kp.score ?? null
    const visible = jointScore != null && jointScore > KEYPOINT_MIN_SCORE
    return {
      label,
      name,
      x: visible ? Math.round(kp.x) : null,
      y: visible ? Math.round(kp.y) : null,
      jointScore,
    }
  })
  return {
    rows,
    poseScore: poseScore ?? null,
    visibleJoints: keypoints?.filter((k) => (k.score ?? 0) > KEYPOINT_MIN_SCORE).length ?? 0,
  }
}
