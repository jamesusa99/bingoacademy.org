/** Stage-based lesson flow: intro → video → checkpoint → summary */

export const LESSON_SEGMENT_IDS = ['intro', 'video', 'checkpoint', 'summary']

export const LESSON_SEGMENTS = [
  {
    id: 'intro',
    label: 'Overview',
    shortLabel: 'Intro',
    icon: '📋',
    type: 'intro',
    desc: 'Objectives and lesson outline',
  },
  {
    id: 'video',
    label: 'Watch',
    shortLabel: 'Video',
    icon: '▶️',
    type: 'video',
    desc: 'Guided video lesson',
  },
  {
    id: 'checkpoint',
    label: 'Checkpoint',
    shortLabel: 'Quiz',
    icon: '✅',
    type: 'checkpoint',
    desc: 'Quick knowledge check',
  },
  {
    id: 'summary',
    label: 'Summary',
    shortLabel: 'Wrap-up',
    icon: '🎯',
    type: 'summary',
    desc: 'Key takeaways and next steps',
  },
]

export function segmentIndex(segmentId) {
  return LESSON_SEGMENT_IDS.indexOf(segmentId)
}

export function getCheckpointQuestion(course) {
  const topic = course?.nameEn || course?.name || 'this topic'
  return {
    prompt: `Which best describes the focus of "${topic}"?`,
    options: [
      { id: 'a', text: 'Core concepts and practical application for IOAI competition prep' },
      { id: 'b', text: 'Unrelated general knowledge with no exam relevance' },
      { id: 'c', text: 'Optional entertainment content only' },
    ],
    correctId: 'a',
  }
}
