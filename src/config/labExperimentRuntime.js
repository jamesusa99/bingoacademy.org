/** L3 experiment runtime / hosting types (admin + frontend) */

export const LAB_RUNTIME_TYPES = [
  { id: 'steps_only', label: 'Steps only (default)', labelZh: '仅步骤内容（默认）' },
  { id: 'external_link', label: 'External link', labelZh: '外链' },
  { id: 'iframe', label: 'Iframe embed', labelZh: 'iframe 嵌入' },
  { id: 'html_page', label: 'HTML page', labelZh: 'HTML 网页' },
  { id: 'programming', label: 'Programming lab', labelZh: '编程实验' },
  { id: 'interactive', label: 'Interactive / Exploration', labelZh: '交互 / Exploration Lab' },
  { id: 'install_package', label: 'Install / download package', labelZh: '安装包 / 下载包' },
]

export function emptyRuntimeConfig() {
  return {
    type: 'steps_only',
    url: '',
    internalPath: '',
    labId: '',
    downloadLabel: '',
    embedHeight: 520,
    openInNewTab: false,
  }
}

export function normalizeRuntimeConfig(raw) {
  const base = emptyRuntimeConfig()
  if (!raw || typeof raw !== 'object') return base
  const type = LAB_RUNTIME_TYPES.some((t) => t.id === raw.type) ? raw.type : base.type
  return {
    type,
    url: String(raw.url || '').trim(),
    internalPath: String(raw.internalPath || raw.internal_path || '').trim(),
    labId: String(raw.labId || raw.lab_id || '').trim(),
    downloadLabel: String(raw.downloadLabel || raw.download_label || '').trim(),
    embedHeight: Math.max(280, parseInt(raw.embedHeight ?? raw.embed_height, 10) || base.embedHeight),
    openInNewTab: Boolean(raw.openInNewTab ?? raw.open_in_new_tab),
  }
}

export function hasExperimentRuntime(config) {
  const c = normalizeRuntimeConfig(config)
  if (c.type === 'steps_only') return false
  if (c.type === 'programming') return Boolean(c.labId)
  if (c.type === 'interactive') return Boolean(c.internalPath || c.url)
  if (c.type === 'install_package') return Boolean(c.url)
  return Boolean(c.url)
}

export function runtimeTypeLabel(type, locale = 'en') {
  const row = LAB_RUNTIME_TYPES.find((t) => t.id === type)
  if (!row) return type
  return locale === 'zh' ? row.labelZh : row.label
}
