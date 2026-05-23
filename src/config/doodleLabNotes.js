/** AI Lab Notes — Doodle Monster Classifier educational copy */

export const DOODLE_LAB_NOTES_TITLE = 'AI Lab Notes'

export const SUPERVISED_LEARNING = {
  title: 'Supervised Learning',
  icon: 'labels',
  body:
    'You just used Supervised Learning! You gave the AI examples (data) and told it the answers (labels). It learned the rules on its own.',
}

export const GENERALIZATION_OVERFITTING = {
  title: 'Generalization & Overfitting',
  icon: 'tip',
  body:
    'Try drawing 5 identical perfect circles. The AI will OVERFIT—it memorizes the exact shape. If you then draw a messy oval, it might fail! To make the AI smarter, provide varied examples (big, small, messy) so it learns to GENERALIZE.',
}

export const UNCERTAINTY = {
  title: 'Uncertainty',
  icon: 'meter',
  body:
    "When you drew a monster that was both round and spiky, the Confidence Meter split 50/50. AI doesn't know what a monster is; it only compares math features to your training set!",
}

export const DOODLE_LAB_NOTES_SECTIONS = [
  SUPERVISED_LEARNING,
  GENERALIZATION_OVERFITTING,
  UNCERTAINTY,
]
