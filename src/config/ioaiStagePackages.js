/** IOAI L1 stage packages — homepage tabs and deep links to checkout. */
export const IOAI_STAGE_PACKAGES = [
  { id: 'all', title: 'All stages', emoji: '🏆' },
  { id: 'ai-explorer', title: 'AI Explorer', emoji: '🧭' },
  { id: 'ai-builder', title: 'AI Builder', emoji: '🛠️' },
  { id: 'ai-engineer', title: 'AI Engineer', emoji: '⚙️' },
  { id: 'ai-olympian', title: 'AI Olympiad', emoji: '🥇' },
]

export function ioaiStagePackageHref(stageId, { autoBuy = true } = {}) {
  const params = new URLSearchParams({ line: 'ioai', stage: stageId })
  if (autoBuy) params.set('buy', '1')
  return `/courses?${params.toString()}`
}
