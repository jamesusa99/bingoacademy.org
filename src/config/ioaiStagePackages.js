/** IOAI L1 stage packages — homepage tabs, mall, and deep links to checkout. */

/** Hash target on /courses/ioai — stage bundle purchase cards (below hero). */
export const IOAI_STAGE_PACKAGES_ANCHOR = 'stage-packages'

export const IOAI_STAGE_PACKAGES = [
  { id: 'all', title: 'All stages', mallTitle: 'IOAI Full Track', emoji: '🏆' },
  { id: 'ai-explorer', title: 'AI Explorer', mallTitle: 'AI Explorer — All units', emoji: '🧭' },
  { id: 'ai-builder', title: 'AI Builder', mallTitle: 'AI Builder — All units', emoji: '🛠️' },
  { id: 'ai-engineer', title: 'AI Engineer', mallTitle: 'AI Engineer — All units', emoji: '⚙️' },
  { id: 'ai-olympian', title: 'AI Olympiad', mallTitle: 'AI Olympiad — All units', emoji: '🥇' },
]

export function ioaiStagePackageHref(stageId, { autoBuy = false, scrollToPackages = true } = {}) {
  const params = new URLSearchParams({ stage: stageId })
  if (autoBuy) params.set('buy', '1')
  const q = params.toString()
  const base = q ? `/courses/ioai?${q}` : '/courses/ioai'
  if (scrollToPackages && stageId) {
    return `${base}#${IOAI_STAGE_PACKAGES_ANCHOR}`
  }
  return base
}
