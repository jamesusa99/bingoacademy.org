/** Common COCO-SSD objects for AI Hide & Seek (kid-friendly labels) */
export const HIDE_AND_SEEK_TARGETS = [
  { label: 'Cup', className: 'cup', emoji: '☕' },
  { label: 'Book', className: 'book', emoji: '📖' },
  { label: 'Bottle', className: 'bottle', emoji: '🍶' },
  { label: 'Cell Phone', className: 'cell phone', emoji: '📱' },
  { label: 'Person', className: 'person', emoji: '👤' },
  { label: 'Banana', className: 'banana', emoji: '🍌' },
  { label: 'Apple', className: 'apple', emoji: '🍎' },
  { label: 'Laptop', className: 'laptop', emoji: '💻' },
  { label: 'Teddy Bear', className: 'teddy bear', emoji: '🧸' },
  { label: 'Chair', className: 'chair', emoji: '🪑' },
  { label: 'Scissors', className: 'scissors', emoji: '✂️' },
  { label: 'Bowl', className: 'bowl', emoji: '🥣' },
  { label: 'Clock', className: 'clock', emoji: '⏰' },
]

/** Win when target confidence exceeds this (Phase 3) */
export const DETECTION_THRESHOLD = 0.65

export const SUCCESS_DISPLAY_MS = 2000

export const AI_EDUCATION_BLURB =
  'AI uses Bounding Boxes to locate objects and Confidence Scores to express how sure it is.'

export function pickRandomTarget(excludeClassName = null) {
  const pool = excludeClassName
    ? HIDE_AND_SEEK_TARGETS.filter((t) => t.className !== excludeClassName)
    : HIDE_AND_SEEK_TARGETS
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Highest confidence for the current target class, or 0 if not in frame */
export function getTargetConfidence(predictions, className) {
  const key = className.toLowerCase()
  let best = 0
  for (const p of predictions) {
    if (p.class.toLowerCase() === key && p.score > best) {
      best = p.score
    }
  }
  return best
}
