import { getSupabaseAdmin } from '../supabaseAdmin.mjs'

/** Fallback news slugs when DB is unavailable */
const FALLBACK_NEWS = [
  {
    slug: 'ai-classes-for-kids-guide-2026',
    title: "AI Classes for Kids: A Parent's Guide to Choosing the Right Program",
    excerpt:
      'What to look for in AI classes for kids — project-based learning, real Python, and pathways to competitions like IOAI and USAAIO.',
    body: `Parents searching for AI classes for kids often find programs that only teach how to use chatbots. BingoAcademy takes a different approach: students learn artificial intelligence for children through hands-on projects — building models, writing Python, and exploring computer vision in the browser.`,
    date: '2026-03-15',
    updatedAt: '2026-03-15',
    authorSlug: 'shuang-wang',
    keywords: ['AI classes for kids', 'AI course for teens', 'STEM Education'],
    og_image: null,
  },
  {
    slug: 'usaaio-prep-course-overview',
    title: 'USAAIO Prep Course: What Families Need to Know',
    excerpt:
      'How high school students prepare for the United States Artificial Intelligence Olympiad with structured curriculum and mock exams.',
    body: `The USAAIO prep course pathway at BingoAcademy aligns with the mathematical and algorithmic rigor of the United States Artificial Intelligence Olympiad.`,
    date: '2026-03-10',
    keywords: ['USAAIO prep course', 'AI Olympiad training for teens'],
    og_image: null,
  },
]

function mapNewsRow(row) {
  if (!row) return null
  const published = row.published_at || row.date
  const updated = row.updated_at || published
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    body: row.body || '',
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    date: typeof published === 'string' ? published.slice(0, 10) : published,
    updatedAt: typeof updated === 'string' ? updated.slice(0, 10) : updated,
    ogImage: row.og_image || null,
    authorSlug: row.author_slug || row.authorSlug || null,
    authorName: row.author_name || row.authorName || null,
  }
}

export async function fetchNewsArticle(slug) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    const fallback = FALLBACK_NEWS.find((a) => a.slug === slug)
    return fallback ? mapNewsRow(fallback) : null
  }

  const { data, error } = await admin
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .maybeSingle()

  if (error || !data) {
    const fallback = FALLBACK_NEWS.find((a) => a.slug === slug)
    return fallback ? mapNewsRow(fallback) : null
  }

  return mapNewsRow(data)
}

export async function fetchAllLiveNewsSlugs() {
  const admin = getSupabaseAdmin()
  if (!admin) return FALLBACK_NEWS.map((a) => a.slug)

  const { data, error } = await admin
    .from('news_articles')
    .select('slug')
    .eq('status', 'live')
    .order('published_at', { ascending: false })

  if (error || !data?.length) return FALLBACK_NEWS.map((a) => a.slug)
  return data.map((r) => r.slug)
}

function mapCatalogRow(row) {
  if (!row || row.status === 'hidden' || row.status === 'offline') return null
  return {
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en || row.nameEn || null,
    description: row.description || row.desc || '',
    line: row.line,
    sub: row.sub,
    thumbnail: row.thumbnail_url || row.thumbnail || null,
    outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
    deliveryType: row.delivery_type || row.deliveryType || null,
    price: row.price || null,
    priceCents: row.price_cents ?? null,
    currency: row.currency || 'usd',
  }
}

export async function fetchCourseBySlug(slug) {
  const admin = getSupabaseAdmin()
  if (!admin) return null

  const { data, error } = await admin
    .from('courses_catalog')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return mapCatalogRow(data)
}

export async function fetchAllLiveCourseSlugs() {
  const admin = getSupabaseAdmin()
  if (!admin) return []

  const { data, error } = await admin
    .from('courses_catalog')
    .select('slug, status, delivery_type')
    .neq('status', 'hidden')
    .neq('status', 'offline')
    .order('sort_order')

  if (error || !data?.length) return []
  return data
    .filter((r) => r.slug)
    .map((r) => r.slug)
}

export async function fetchCourseSitemapEntries() {
  const admin = getSupabaseAdmin()
  if (!admin) return []

  const { data, error } = await admin
    .from('courses_catalog')
    .select('slug, status, updated_at')
    .neq('status', 'hidden')
    .neq('status', 'offline')
    .order('sort_order')

  if (error || !data?.length) return []

  return data
    .filter((r) => r.slug)
    .map((r) => ({
      path: `/courses/detail/${r.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: r.updated_at ? String(r.updated_at).slice(0, 10) : undefined,
    }))
}

export async function fetchLabPackSitemapEntries() {
  const admin = getSupabaseAdmin()
  if (!admin) return []

  const { data, error } = await admin
    .from('lab_packs')
    .select('slug, status, updated_at')
    .eq('status', 'live')
    .order('sort_order')

  if (!error && data?.length) {
    return data
      .filter((r) => r.slug)
      .map((r) => ({
        path: `/labs/pack/${r.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: r.updated_at ? String(r.updated_at).slice(0, 10) : undefined,
      }))
  }

  const courseEntries = await fetchCourseSitemapEntries()
  return courseEntries
    .filter((e) => e.path.includes('lab') || e.path.includes('pack'))
    .map((e) => ({ ...e, path: e.path.replace('/courses/detail/', '/labs/pack/') }))
}

export async function fetchLabPackBySlug(slug) {
  const admin = getSupabaseAdmin()
  if (!admin) return null

  const { data: pack, error: packError } = await admin
    .from('lab_packs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (packError || !pack) {
    const catalog = await fetchCourseBySlug(slug)
    if (catalog) return { slug, name: catalog.name, description: catalog.description, experiments: [] }
    return null
  }

  const { data: experiments } = await admin
    .from('lab_experiments')
    .select('slug, title, summary, sort_order, status')
    .eq('pack_slug', slug)
    .eq('status', 'live')
    .order('sort_order')

  return {
    slug: pack.slug,
    name: pack.name || pack.title || slug,
    description: pack.description || pack.summary || '',
    thumbnail: pack.thumbnail_url || pack.thumbnail || null,
    price: pack.price || null,
    priceCents: pack.price_cents ?? null,
    currency: pack.currency || 'usd',
    experiments: (experiments || []).map((e) => ({
      slug: e.slug,
      title: e.title,
      summary: e.summary || '',
    })),
  }
}

export async function fetchLabExperiment(packSlug, experimentSlug) {
  const admin = getSupabaseAdmin()
  if (!admin) return null

  const { data, error } = await admin
    .from('lab_experiments')
    .select('*')
    .eq('pack_slug', packSlug)
    .eq('slug', experimentSlug)
    .eq('status', 'live')
    .maybeSingle()

  if (error || !data) return null

  const { data: steps } = await admin
    .from('lab_experiment_steps')
    .select('title, body, step_type, sort_order')
    .eq('experiment_id', data.id)
    .order('sort_order')

  return {
    slug: data.slug,
    packSlug,
    title: data.title,
    summary: data.summary || data.description || '',
    steps: (steps || []).map((s) => ({
      title: s.title,
      body: s.body || '',
      stepType: s.step_type,
    })),
  }
}

export async function fetchAllLiveLabPackSlugs() {
  const admin = getSupabaseAdmin()
  if (!admin) return []

  const { data, error } = await admin
    .from('lab_packs')
    .select('slug, status')
    .eq('status', 'live')
    .order('sort_order')

  if (error || !data?.length) {
    const catalogSlugs = await fetchAllLiveCourseSlugs()
    return catalogSlugs.filter((s) => s.includes('lab') || s.includes('pack'))
  }

  return data.map((r) => r.slug).filter(Boolean)
}
