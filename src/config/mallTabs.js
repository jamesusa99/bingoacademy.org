/** Storefront + admin tab config for /mall (mirrors public tab bar order) */

export const MALL_STOREFRONT_TABS = [
  { id: 'home', icon: '🏠', label: 'Mall Home' },
  { id: 'ioai', icon: '🏆', label: 'IOAI · Training' },
  { id: 'general', icon: '🌐', label: 'Foundations of AI' },
  { id: 'k12', icon: '🏫', label: 'K12 · School' },
  { id: 'cert', icon: '📜', label: 'Certification' },
  { id: 'materials', icon: '📚', label: 'Books & Kits' },
  { id: 'lab', icon: '🧪', label: 'Online Labs' },
]

/** Admin sections — storefront tabs including home */
export const MALL_ADMIN_TAB_CONFIG = {
  home: {
    sources: [],
    productTypes: [],
    defaultProductType: null,
    settingsOnly: true,
  },
  ioai: {
    sources: ['courses', 'products'],
    productTypes: ['event'],
    defaultProductType: 'event',
  },
  general: {
    sources: ['courses'],
    productTypes: [],
    defaultProductType: null,
  },
  k12: {
    sources: ['products'],
    productTypes: ['material', 'training'],
    defaultProductType: 'material',
  },
  cert: {
    sources: ['products'],
    productTypes: ['cert'],
    defaultProductType: 'cert',
  },
  materials: {
    sources: ['products'],
    productTypes: ['material'],
    defaultProductType: 'material',
  },
  lab: {
    sources: ['products'],
    productTypes: ['lab'],
    defaultProductType: 'lab',
  },
}

export const MALL_ADMIN_TAB_IDS = Object.keys(MALL_ADMIN_TAB_CONFIG)

export function getMallAdminTabConfig(tabId) {
  return MALL_ADMIN_TAB_CONFIG[tabId] ?? null
}

export function isMallAdminTabId(tabId) {
  return tabId != null && tabId in MALL_ADMIN_TAB_CONFIG
}

export function isMallStorefrontTabId(tabId) {
  return MALL_STOREFRONT_TABS.some((t) => t.id === tabId)
}
