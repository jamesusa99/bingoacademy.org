/** Admin console i18n — default 中文 for operations team */

import { adminPagesEn, adminPagesZh } from './adminPagesI18n.js'

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
      ioaiCurriculum: 'IOAI · 课程管理',
      generalCurriculum: 'Foundations · 课程管理',
      k12Curriculum: 'K12 · 课程管理',
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
      confirm: '确定',
    },
    video: {
      title: '视频库（Cloudflare Stream）',
      description:
        '上传到 Cloudflare Stream，转码完成后同步并关联课程。课程页在播放器内播放 HLS（请勿在新标签页直接打开 .m3u8 链接）。',
      uploadHeading: '上传到 Stream',
      helpSize:
        '大小：Cloudflare 单文件最多 {{maxGb}} GB；本后台浏览器上传建议不超过约 {{recGb}} GB，更大文件可能因网络超时失败，请导出较小 MP4 或使用有线网络。',
      helpDuration: '时长：单条视频最多 {{maxHours}} 小时。',
      helpQuality:
        '清晰度：请上传至少 1080p 源文件；播放会先自适应起播，数秒后升至高清。状态为「就绪」后再关联课程。',
      placeholderTitle: '标题 *',
      placeholderDescription: '描述（选填）',
      assignCourseOptional: '关联课程（选填）',
      chooseFileUpload: '选择文件并上传',
      uploadingPct: '上传中… {{pct}}%',
      working: '处理中…',
      loadingList: '加载中…',
      emptyList: '暂无视频资源。',
      colTitle: '标题',
      colStatus: '状态',
      colPlayback: '播放',
      colCourse: '课程',
      colActions: '操作',
      statusReady: '就绪',
      statusProcessing: '转码中',
      statusError: '失败',
      previewPlayer: '预览播放',
      previewBack: '返回视频库',
      hlsReadyHint: 'HLS 已就绪（用于课程页）',
      encodingHint: '转码中…请先 Sync，再预览',
      encodeFailedHint: '上传/转码失败 — 请删除后重试',
      selectCourse: '选择课程…',
      sync: '同步',
      syncAndAssign: '同步并关联',
      syncAndAssignHint: '将同步播放地址并保存所选课程关联',
      assign: '关联',
      assignWaitReady: '请等待状态变为「就绪」',
      delete: '删除',
      deleteConfirm: '删除此视频记录？（不会从 Cloudflare 删除源文件）',
      errTitleRequired: '请先填写标题再上传',
      errSelectCourse: '请选择要关联的课程。',
      errFileTooLarge:
        '文件 {{size}}，超过 Cloudflare 上限 {{max}}（30 GB）。',
      confirmLargeFile:
        '文件大小 {{size}}。浏览器上传建议在 {{max}}（约 4 GB）以内，是否仍继续？',
      infoUploading: '正在上传 {{name}}（{{size}}）…',
      infoUploadDoneEncoding: '上传完成 — 等待 Cloudflare 转码（可能需要数分钟）…',
      infoSyncStillEncoding: 'Cloudflare 仍在转码 — 约 1 分钟后再次点击「同步」。',
      infoSyncSuccess: '已从 Cloudflare Stream 同步播放地址。',
      infoAssignPending:
        '已关联到 {{slug}}，但视频仍在转码。就绪后请再次「同步」。',
      infoAssignSuccess: '已关联到 {{slug}}，课程页将播放此视频。',
      infoUploadPendingAssign:
        '上传完成，转码进行中 — 约 1–3 分钟后在本行点击「同步」，再关联课程。',
      infoUploadReadyAssigned: '视频已就绪并关联到 {{slug}}。',
      infoUploadReady: '视频已就绪，请在下方关联课程。',
      noCoursesHint:
        '课程目录为空 — 请先在「IOAI · 课程管理」或「课程管理」中添加 IOAI 课程，再在此关联视频。',
    },
    ...adminPagesZh,
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
      ioaiCurriculum: 'IOAI · Courses',
      generalCurriculum: 'Foundations · Courses',
      k12Curriculum: 'K12 · Courses',
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
      confirm: 'OK',
    },
    video: {
      title: 'Video library (Cloudflare Stream)',
      description:
        'Upload to Cloudflare Stream, sync when encoding completes, assign to courses. Course pages play HLS in the video player (not by opening the .m3u8 link in a new tab).',
      uploadHeading: 'Upload to Stream',
      helpSize:
        'Size: Cloudflare allows up to {{maxGb}} GB per file; this admin uploader works reliably up to ~{{recGb}} GB in the browser. Larger files may fail due to network timeouts — export a smaller MP4 or use a wired connection.',
      helpDuration: 'Duration: up to {{maxHours}} hours per video.',
      helpQuality:
        'Quality: upload at least 1080p source; playback starts at adaptive quality and ramps up after a few seconds. Wait until status is ready before assigning to a course.',
      placeholderTitle: 'Title *',
      placeholderDescription: 'Description (optional)',
      assignCourseOptional: 'Assign to course (optional)',
      chooseFileUpload: 'Choose file & upload',
      uploadingPct: 'Uploading… {{pct}}%',
      working: 'Working…',
      loadingList: 'Loading…',
      emptyList: 'No video assets yet.',
      colTitle: 'Title',
      colStatus: 'Status',
      colPlayback: 'Playback',
      colCourse: 'Course',
      colActions: 'Actions',
      statusReady: 'Ready',
      statusProcessing: 'Processing',
      statusError: 'Error',
      previewPlayer: 'Preview player',
      previewBack: 'Back to library',
      hlsReadyHint: 'HLS ready (used on course page)',
      encodingHint: 'Encoding… use Sync, then Preview',
      encodeFailedHint: 'Upload/encode failed — delete and retry',
      selectCourse: 'Select course…',
      sync: 'Sync',
      syncAndAssign: 'Sync & link',
      syncAndAssignHint: 'Sync playback URLs and save the selected course link',
      assign: 'Assign',
      assignWaitReady: 'Wait until status is ready',
      delete: 'Delete',
      deleteConfirm: 'Delete this video record? (Does not remove from Cloudflare.)',
      errTitleRequired: 'Enter a title before uploading',
      errSelectCourse: 'Select a course slug to assign this video.',
      errFileTooLarge:
        'File is {{size}} — Cloudflare Stream maximum is {{max}} (30 GB).',
      confirmLargeFile:
        'This file is {{size}}. Browser uploads work best under {{max}} (~4 GB). Continue anyway?',
      infoUploading: 'Uploading {{name}} ({{size}})…',
      infoUploadDoneEncoding:
        'Upload complete — waiting for Cloudflare to encode (may take several minutes)…',
      infoSyncStillEncoding: 'Still encoding on Cloudflare — click Sync again in a minute.',
      infoSyncSuccess: 'Playback URLs synced from Cloudflare Stream.',
      infoAssignPending:
        'Assigned to {{slug}}, but video is still encoding. Sync again when status is ready.',
      infoAssignSuccess: 'Assigned to {{slug}}. Course page will play this video.',
      infoUploadPendingAssign:
        'Upload finished. Encoding still in progress — click Sync on this row in 1–3 minutes, then assign to the course.',
      infoUploadReadyAssigned: 'Video ready and assigned to {{slug}}.',
      infoUploadReady: 'Video ready. Assign to a course below.',
      noCoursesHint:
        'Course catalog is empty — add IOAI courses in IOAI · Course Management or Courses first, then link videos here.',
    },
    ...adminPagesEn,
  },
}

/** Map DB status → i18n key suffix */
export function adminVideoStatusKey(status) {
  if (status === 'ready') return 'video.statusReady'
  if (status === 'error') return 'video.statusError'
  return 'video.statusProcessing'
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
