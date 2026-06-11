/** Lab pack → experiment → step copy and constants */

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
  labCenter: '实验中心',
  experimentCount: (n) => `${n} 个实验`,
  stepCountTotal: (n) => `${n}+ 个步骤`,
  stepCount: (n) => `${n} 个步骤`,
  durationLabel: (label) => label || '约 16 小时',
  trackBadge: 'IOAI 赛道适配',
  outcomesTitle: '完成后你将掌握',
  materialsTitle: '所需材料清单',
  materialsRequired: '必需',
  materialsOptional: '可选',
  experimentsListTitle: '实验列表',
  experimentPurpose: '实验目的',
  experimentContent: '实验内容',
  stepsTitle: '实验步骤',
  purchaseToUnlockSteps: '购买实验包后可查看完整步骤内容。',
  openExperiment: '进入实验',
  backToPack: '返回实验包',
  backToLabs: '返回实验中心',
  noExperiments: '实验内容筹备中，敬请期待。',
  noSteps: '暂无步骤。',
  openLink: '打开链接',
  downloadFile: '下载',
  openSlides: '打开幻灯片',
  startProgramming: '开始编程实验',
  loading: '加载中…',
  notFound: '未找到该实验包',
  ownedBanner: '你已购买此实验包 · 全部实验已解锁',
  purchaseOnce: '一次付费 · 永久访问',
  buyPack: '购买实验包',
  continueLearning: '继续学习',
  packIncludes: '本包包含',
  includeExperiments: (n) => `${n} 个完整实验`,
  includeSteps: (n) => `${n}+ 个指导步骤`,
  includePermanent: '永久访问权限（含后续更新）',
  includeMaterials: (n) => `${n} 项配套材料`,
  includeAudience: (text) => `适用：${text}`,
  lockedHint: '购买后解锁全部实验与步骤内容。',
  lockedDemoNote: (nums) =>
    `以上第 ${nums} 个实验展示锁定状态（未购买效果）。购买后全部解锁。`,
  priceUnavailable: '—',
  journeyTitle: '开启你的实验旅程',
  progressLabel: (done, total) => `进度 ${done}/${total}`,
  visitedCount: (visited, total) => `已浏览 ${visited}/${total} 个实验`,
  statusNotStarted: '未开始',
  statusInProgress: '进行中',
  statusCompleted: '已完成',
  instructionsTitle: '实验说明',
  closeInstructions: '关闭说明',
  noInstructions: '暂无实验说明内容。',
  watchInWorkspace: '请在下方操作区观看视频并完成操作',
  codeInWorkspace: '请在下方操作区进行编程实验',
  experimentHeading: (n, title) => `实验 ${String(n).padStart(2, '0')}：${title}`,
  stepTab: (n, title) => (title ? `步骤 ${n}` : `步骤 ${n}`),
  prevStep: '上一步',
  nextStep: '下一步',
  openInstructionsHint: '点击右上角「实验说明」查看目的与步骤指引。',
  previewIntroOnly: '购买实验包后可使用完整操作区与步骤内容。',
  runtimeLocked: '购买实验包后可使用实验操作区。',
  runtimeProgramming: '编程实验环境',
  runtimeDownload: '下载实验安装包',
  openRuntimeLink: '打开实验链接',
  runtimeIframeTitle: '实验操作区',
  runtimeNotConfigured: '实验操作区尚未配置，请查看右上角「实验说明」。',
  runtimeWorkspaceHint: '步骤说明见右上角「实验说明」，请在本区域完成操作。',
  hardwareTitle: '本实验涉及到的硬件',
  learningTitle: '本实验学习内容',
  notesTitle: '我的实验心得',
  notesHint: '记录实验过程中的发现、问题与总结，可随时保存。',
  notesPlaceholder: '记录实验心得，可保存笔记…',
  notesLocked: '购买实验包后可保存实验心得',
  saveNotes: '保存笔记',
  savingNotes: '保存中…',
  notesSaved: '已保存',
  notesSavedAt: (when) => `上次保存：${when}`,
  markComplete: '标记实验完成',
  experimentNotFound: '未找到该实验',
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
