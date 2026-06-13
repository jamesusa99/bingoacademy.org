/** Lab pack → experiment → step copy and constants (public site — English) */

export const LAB_STEP_TYPES = [
  { id: 'text', label: 'Text', icon: '📝' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'ppt', label: 'PPT / Slides', icon: '📊' },
  { id: 'link', label: 'External link', icon: '🔗' },
  { id: 'programming', label: 'Programming', icon: '💻' },
  { id: 'download', label: 'Download', icon: '📥' },
]

export const LAB_EXPERIMENTS_PORTAL = {
  packEyebrow: 'Lab pack',
  labCenter: 'Lab Center',
  experimentCount: (n) => `${n} experiment${n === 1 ? '' : 's'}`,
  stepCountTotal: (n) => `${n}+ steps`,
  stepCount: (n) => `${n} step${n === 1 ? '' : 's'}`,
  durationLabel: (label) => label || '~16 hours',
  trackBadge: 'IOAI track ready',
  outcomesTitle: 'What you will master',
  materialsTitle: 'Materials checklist',
  materialsRequired: 'Required',
  materialsOptional: 'Optional',
  experimentsListTitle: 'Experiments',
  experimentPurpose: 'Purpose',
  experimentContent: 'Overview',
  stepsTitle: 'Steps',
  purchaseToUnlockSteps: 'Purchase this lab pack to view full step content.',
  openExperiment: 'Open experiment',
  backToPack: 'Back to lab pack',
  backToLabs: 'Back to Lab Center',
  noExperiments: 'Experiments are coming soon.',
  noSteps: 'No steps yet.',
  openLink: 'Open link',
  downloadFile: 'Download',
  openSlides: 'Open slides',
  startProgramming: 'Start coding lab',
  loading: 'Loading…',
  notFound: 'Lab pack not found',
  ownedBanner: 'You own this lab pack · all experiments unlocked',
  purchaseOnce: 'One-time purchase · lifetime access',
  buyPack: 'Buy lab pack',
  continueLearning: 'Continue learning',
  packIncludes: 'This pack includes',
  includeExperiments: (n) => `${n} full experiment${n === 1 ? '' : 's'}`,
  includeSteps: (n) => `${n} guided step${n === 1 ? '' : 's'}`,
  includePermanent: 'Lifetime access (including future updates)',
  includeMaterials: (n) => `${n} kit item${n === 1 ? '' : 's'}`,
  includeAudience: (text) => `For: ${text}`,
  lockedHint: 'Purchase to unlock all experiments and steps.',
  lockedDemoNote: (nums) =>
    `Experiments ${nums} above show the locked preview (before purchase). All unlock after purchase.`,
  priceUnavailable: '—',
  journeyTitle: 'Start your lab journey',
  progressLabel: (done, total) => `Progress ${done}/${total}`,
  visitedCount: (visited, total) => `Viewed ${visited}/${total} experiments`,
  statusNotStarted: 'Not started',
  statusInProgress: 'In progress',
  statusCompleted: 'Completed',
  instructionsTitle: 'Instructions',
  closeInstructions: 'Close',
  noInstructions: 'No instructions yet.',
  watchInWorkspace: 'Watch the video and follow along in the workspace below.',
  codeInWorkspace: 'Complete the coding exercise in the workspace below.',
  experimentHeading: (n, title) => `Experiment ${String(n).padStart(2, '0')}: ${title}`,
  stepTab: (n, title) => (title ? `Step ${n}: ${title}` : `Step ${n}`),
  prevStep: 'Previous',
  nextStep: 'Next',
  openInstructionsHint: 'Tap “Instructions” (top right) for purpose, overview, and step-by-step guidance.',
  instructionsDrawerHint: 'The workspace stays active while you read instructions.',
  workspacePlaceholder: 'Follow the steps in Instructions while you work in this area.',
  showStepInWorkspace: 'Show in workspace',
  stepActiveInWorkspace: 'Active in workspace',
  previewIntroOnly: 'Purchase the lab pack to use the full workspace and step content.',
  runtimeLocked: 'Purchase the lab pack to use the experiment workspace.',
  runtimeProgramming: 'Programming lab environment',
  runtimeDownload: 'Download lab package',
  openRuntimeLink: 'Open lab link',
  runtimeIframeTitle: 'Experiment workspace',
  runtimeNotConfigured: 'Workspace not configured yet — see Instructions (top right).',
  runtimeWorkspaceHint: 'Step details are in Instructions (top right). Complete the task in this area.',
  hardwareTitle: 'Hardware for this experiment',
  learningTitle: 'What you will learn',
  notesTitle: 'My lab notes',
  notesHint: 'Capture discoveries, questions, and takeaways as you work.',
  notesPlaceholder: 'Write your lab notes…',
  notesLocked: 'Purchase the lab pack to save notes',
  saveNotes: 'Save notes',
  savingNotes: 'Saving…',
  notesSaved: 'Saved',
  notesSavedAt: (when) => `Last saved: ${when}`,
  markComplete: 'Mark experiment complete',
  experimentNotFound: 'Experiment not found',
}

export function isKitSub(sub) {
  return sub === 'online-lab-kit' || sub === 'offline-lab-kit'
}

/** Preview: all but last two experiments are browsable before purchase */
export function isLabExperimentUnlocked({ owned, index, total }) {
  if (owned) return true
  const previewCount = Math.max(0, total - 2)
  return index < previewCount
}

export function parseMaterialsList(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter((row) => row?.name?.trim())
}
