/** Default copy & layout for /mall — stored in platform_settings.mall_page */

export const MALL_PAGE_SETTING_KEY = 'mall_page'

const tabHeader = (icon, title, desc, cardClass) => ({
  title: `${icon} ${title}`,
  desc,
  cardClass,
})

export const MALL_PAGE_DEFAULT = {
  intro: {
    text: 'Books, courses, kits, labs, and certification products for families and learners.',
    showPoints: true,
  },
  stats: [
    { value: '10,000+', label: 'Products Sold' },
    { value: '3,500+', label: 'Satisfied Families' },
    { value: '1,000+', label: 'Certified Learners' },
    { value: '50+', label: 'IOAI Programs' },
  ],
  tabs: {
    home: {
      flashDeals: { title: '🔥 Flash Deals', subtitle: 'Updated daily', limit: 6 },
      trust: {
        title: 'Why Buy from Bingo Mall',
        items: [
          { icon: '🔒', title: 'Verified Quality', desc: 'All courses and products reviewed by our curriculum team' },
          { icon: '🏅', title: 'Authoritative Certs', desc: 'Issuing-centre endorsed, nationally verifiable' },
          { icon: '📦', title: 'Fast Delivery', desc: 'Digital instant access · Physical 3–5 days' },
          { icon: '💬', title: 'After-sales Support', desc: '7×12h online support for orders and access' },
        ],
      },
    },
    ioai: {
      header: tabHeader('🏆', 'IOAI Competition Training', 'Video courses and training camps for whitelist competition preparation.', 'bg-amber-50/30 border-amber-200/60'),
      footerLink: { text: 'View IOAI courses →', href: '/courses?line=ioai' },
    },
    general: {
      header: tabHeader('🌐', 'Foundations of AI Program', 'AI literacy courses, online experiments, and home materials packs.', 'bg-cyan-50/50 border-cyan-200/60'),
      footerLink: { text: 'View all general courses →', href: '/courses?line=general' },
      materialPreviewCount: 2,
    },
    k12: {
      header: tabHeader('🏫', 'K12 Classroom School Edition', 'Books, classroom courses, online/offline labs, and school experiment kits.', 'bg-violet-50/30 border-violet-200/60'),
      footerLink: { text: 'View K12 classroom products →', href: '/courses?line=k12' },
    },
    cert: {
      header: tabHeader('📜', 'Certification Products', 'Learner and teacher certification products. Dual-endorsed, nationally verifiable. Admissions-referenced at top tiers.', 'bg-primary/5 border-primary/20'),
      cta: {
        text: 'View full certification system and requirements',
        buttonText: 'Certification Centre →',
        href: '/cert',
      },
    },
    materials: {
      header: tabHeader('📚', 'Books, Kits & Teaching Materials', 'Digital textbooks, physical hardware kits, and teaching bundles. Matched to Bingo curriculum stages.', 'bg-primary/5 border-primary/20'),
      filterLabels: ['All', 'Digital Textbooks', 'Hardware Kits', 'Lab Equipment', 'Course Bundles'],
    },
    lab: {
      header: tabHeader('🔬', 'AI Digital Laboratory', 'Cloud-based virtual AI lab with guided experiments, AI coaching, and progress tracking for families and independent learners.', 'bg-violet-50/30 border-violet-200/60'),
      features: [
        { icon: '🧪', title: 'Guided Experiments', desc: '50+ curated AI experiments with step-by-step guidance' },
        { icon: '🤖', title: 'AI Coach', desc: 'In-lab AI tutor answers questions and adapts to student level' },
        { icon: '📊', title: 'Progress Dashboard', desc: 'Parents and teachers see real-time learning progress and milestones' },
      ],
      bookingButton: 'Book a Free Lab Demo Session →',
      bookingTitle: 'AI Digital Lab — Free Demo Booking',
    },
  },
  bottomCta: {
    title: 'Earn while you learn',
    desc: 'Every purchase earns points · Share products to earn commission · Redeem for courses and lab access',
    buttons: [
      { label: 'Foundations of AI', action: 'tab:general', style: 'primary' },
      { label: 'K12 school', action: 'tab:k12', style: 'amber' },
      { label: 'My Profile', action: 'link:/profile', style: 'outline' },
    ],
  },
  productModal: {
    sellingPoints: ['✓ Verified quality', '✓ Instant access', '✓ Money-back guarantee'],
  },
}

function mergeArray(defaultArr, storedArr) {
  if (!Array.isArray(storedArr) || !storedArr.length) return defaultArr
  return storedArr.map((item, i) => ({ ...(defaultArr[i] || {}), ...item }))
}

function mergeObject(defaultObj, storedObj) {
  if (!storedObj || typeof storedObj !== 'object') return defaultObj
  const out = { ...defaultObj }
  for (const key of Object.keys(storedObj)) {
    const stored = storedObj[key]
    const base = defaultObj[key]
    if (Array.isArray(stored)) {
      out[key] = Array.isArray(base) ? mergeArray(base, stored) : stored
    } else if (stored && typeof stored === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
      out[key] = mergeObject(base, stored)
    } else if (stored !== undefined && stored !== null) {
      out[key] = stored
    }
  }
  return out
}

/** Merge stored platform_settings value with defaults */
export function mergeMallPageContent(stored) {
  if (!stored || typeof stored !== 'object') return structuredClone(MALL_PAGE_DEFAULT)
  const tabs = { ...MALL_PAGE_DEFAULT.tabs }
  for (const tabId of Object.keys(MALL_PAGE_DEFAULT.tabs)) {
    tabs[tabId] = mergeObject(MALL_PAGE_DEFAULT.tabs[tabId], stored.tabs?.[tabId])
  }
  return {
    intro: mergeObject(MALL_PAGE_DEFAULT.intro, stored.intro),
    stats: mergeArray(MALL_PAGE_DEFAULT.stats, stored.stats),
    tabs,
    bottomCta: mergeObject(MALL_PAGE_DEFAULT.bottomCta, stored.bottomCta),
    productModal: mergeObject(MALL_PAGE_DEFAULT.productModal, stored.productModal),
  }
}

export function getMallTabContent(content, tabId) {
  return content?.tabs?.[tabId] ?? MALL_PAGE_DEFAULT.tabs[tabId] ?? null
}
