/** IOAI L1 stage packages — homepage tabs, mall, and deep links to checkout. */
export const IOAI_STAGE_PACKAGES = [
  { id: 'all', title: 'All stages', mallTitle: 'IOAI Full Track', emoji: '🏆' },
  { id: 'ai-explorer', title: 'AI Explorer', mallTitle: 'AI Explorer — All units', emoji: '🧭' },
  { id: 'ai-builder', title: 'AI Builder', mallTitle: 'AI Builder — All units', emoji: '🛠️' },
  { id: 'ai-engineer', title: 'AI Engineer', mallTitle: 'AI Engineer — All units', emoji: '⚙️' },
  { id: 'ai-olympian', title: 'AI Olympiad', mallTitle: 'AI Olympiad — All units', emoji: '🥇' },
]

export function ioaiStagePackageHref(stageId, { autoBuy = true } = {}) {
  const params = new URLSearchParams({ line: 'ioai', stage: stageId })
  if (autoBuy) params.set('buy', '1')
  return `/courses?${params.toString()}`
}
