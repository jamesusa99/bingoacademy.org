/** Admin console i18n — default 中文 for operations team */

export const ADMIN_LOCALE_STORAGE_KEY = 'bingo-admin-locale'
export const DEFAULT_ADMIN_LOCALE = 'zh'
export const ADMIN_LOCALES = ['zh', 'en']

const messages = {
  zh: {
    lang: { zh: '中文', en: 'English', switch: '语言' },
    layout: {
      title: '管理后台',
      checking: '检测中…',
      dbConnected: 'Supabase 已连接',
      dbDisconnected: 'Supabase 未连接',
      backToSite: '← 返回网站',
      signOut: '退出登录',
    },
    login: {
      brand: '缤果 AI 学院 · 管理后台',
      title: '登录',
      subtitle: '仅限管理员或编辑账号',
      email: '邮箱',
      password: '密码',
      submit: '登录管理后台',
      submitting: '登录中…',
      notConfiguredTitle: '管理后台不可用',
      notConfiguredBody: '请先配置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。',
      needAccess:
        '需要权限？在 Supabase 将 profiles.role 设为 admin，或将邮箱加入 VITE_ADMIN_EMAILS。',
      noAdminAccess:
        '已登录，但此账号无管理权限。请管理员在「用户管理」中将角色设为 admin 或 editor 后重新登录。',
      backToSite: '← 返回网站',
    },
    guard: {
      verifying: '正在验证管理权限…',
      unavailableTitle: '管理后台不可用',
      unavailableBody: '请配置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 以启用管理后台。',
      deniedTitle: '无权访问',
      deniedBody:
        '当前登录：{{email}}。需要 profiles.role 为 admin 或 editor（由现有管理员在「用户管理」中设置，或在 Supabase SQL 中修改）。也可临时使用 VITE_ADMIN_EMAILS 引导。',
      backToSite: '← 返回网站',
    },
    nav: {
      group: {
        overview: '概览',
        content: '内容',
        commerce: '交易',
        users: '用户',
        media: '媒体',
      },
      dashboard: '控制台',
      platform: '平台设置',
      homePortal: '首页门户',
      courses: '课程管理',
      achievements: '学员成果',
      aiCamp: 'AI 营地',
      events: '赛事活动',
      instructors: '导师库',
      careers: '职业发展',
      certification: '认证体系',
      charity: '荣誉公益',
      forum: '论坛',
      mall: '商城课程',
      mallProducts: '商城商品',
      payments: '支付订单',
      userManagement: '用户管理',
      video: '视频 (Stream)',
    },
    dashboard: {
      title: '运营控制台',
      loading: '加载统计中…',
      manage: '管理 →',
      quickLinks: '快捷入口',
      viewSite: '查看网站',
      cards: {
        homePortal: '首页门户',
        achievements: '学员成果',
        courses: '课程',
        aiCamp: 'AI 营地',
        events: '赛事中心',
        community: 'AI 社区',
        careers: '智能职业',
        certification: '认证',
        mallProducts: '商城商品',
        charity: '荣誉公益',
        forum: '论坛',
        videos: '视频资源',
        orders: '订单',
        users: '用户',
        platform: '平台设置',
      },
    },
    common: {
      loading: '加载中…',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
    },
  },
  en: {
    lang: { zh: '中文', en: 'English', switch: 'Language' },
    layout: {
      title: 'Admin',
      checking: 'Checking…',
      dbConnected: 'Supabase connected',
      dbDisconnected: 'Supabase disconnected',
      backToSite: '← Back to site',
      signOut: 'Sign out',
    },
    login: {
      brand: 'Bingo Academy Admin',
      title: 'Sign in',
      subtitle: 'Admin or editor accounts only',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in to admin',
      submitting: 'Signing in…',
      notConfiguredTitle: 'Admin unavailable',
      notConfiguredBody: 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      needAccess:
        'Need access? Set profiles.role = admin in Supabase, or add your email to VITE_ADMIN_EMAILS.',
      noAdminAccess:
        'Signed in, but this account does not have admin access. Ask an administrator to set profiles.role to admin or editor, then sign in again.',
      backToSite: '← Back to site',
    },
    guard: {
      verifying: 'Verifying admin access…',
      unavailableTitle: 'Admin unavailable',
      unavailableBody: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable the admin console.',
      deniedTitle: 'Access denied',
      deniedBody:
        'Signed in as {{email}}. Admin access requires profiles.role to be admin or editor (set in User management or via Supabase SQL). Optional bootstrap: VITE_ADMIN_EMAILS.',
      backToSite: '← Back to site',
    },
    nav: {
      group: {
        overview: 'Overview',
        content: 'Content',
        commerce: 'Commerce',
        users: 'Users',
        media: 'Media',
      },
      dashboard: 'Dashboard',
      platform: 'Platform',
      homePortal: 'Home Portal',
      courses: 'Courses',
      achievements: 'Achievements',
      aiCamp: 'AI Camp',
      events: 'Events',
      instructors: 'Instructors',
      careers: 'Careers',
      certification: 'Certification',
      charity: 'Honors & Charity',
      forum: 'Forum',
      mall: 'Mall',
      mallProducts: 'Mall Products',
      payments: 'Payments',
      userManagement: 'User management',
      video: 'Video (Stream)',
    },
    dashboard: {
      title: 'Operations Dashboard',
      loading: 'Loading stats…',
      manage: 'Manage →',
      quickLinks: 'Quick Links',
      viewSite: 'View Site',
      cards: {
        homePortal: 'Home Portal',
        achievements: 'Achievements',
        courses: 'Courses',
        aiCamp: 'AI Camp',
        events: 'Events Center',
        community: 'AI Community',
        careers: 'Smart Careers',
        certification: 'Certification',
        mallProducts: 'AI Mall Products',
        charity: 'Honors & Charity',
        forum: 'Forum',
        videos: 'Video assets',
        orders: 'Orders',
        users: 'Users',
        platform: 'Platform',
      },
    },
    common: {
      loading: 'Loading…',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
    },
  },
}

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj)
}

/** @param {'zh'|'en'} locale @param {string} key @param {Record<string,string>} [params] */
export function translateAdmin(locale, key, params) {
  const loc = locale === 'en' ? 'en' : 'zh'
  let text = getNested(messages[loc], key) ?? getNested(messages.en, key) ?? key
  if (params && typeof text === 'string') {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    }
  }
  return text
}

export function readStoredAdminLocale() {
  try {
    const saved = localStorage.getItem(ADMIN_LOCALE_STORAGE_KEY)
    if (ADMIN_LOCALES.includes(saved)) return saved
  } catch {
    /* ignore */
  }
  return DEFAULT_ADMIN_LOCALE
}

export function storeAdminLocale(locale) {
  try {
    localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}
