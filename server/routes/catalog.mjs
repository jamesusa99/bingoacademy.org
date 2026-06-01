import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'

function pickCatalogPayload(body) {
  const p = body || {}
  return {
    slug: p.slug?.trim(),
    line: p.line,
    sub: p.sub || null,
    status: p.status || 'live',
    delivery_type: p.delivery_type || p.deliveryType || null,
    featured: !!p.featured,
    name: p.name?.trim(),
    name_en: p.name_en || p.nameEn || null,
    description: p.description || p.desc || null,
    price: p.price || null,
    hours: p.hours || null,
    badge: p.badge || null,
    audience: p.audience || null,
    outcomes: Array.isArray(p.outcomes) ? p.outcomes : [],
    syllabus: Array.isArray(p.syllabus) ? p.syllabus : [],
    lab_slugs: Array.isArray(p.lab_slugs) ? p.lab_slugs : Array.isArray(p.labSlugs) ? p.labSlugs : [],
    sort_order: parseInt(p.sort_order, 10) || 0,
    category: p.category || 'ai-fundamentals',
    level: p.level || 'beginner',
    lessons: parseInt(p.lessons, 10) || 12,
    rating: p.rating != null ? Number(p.rating) : 4.8,
    students: parseInt(p.students, 10) || 0,
    thumbnail_url: p.thumbnail_url || p.thumbnail || null,
    video_url: p.video_url || p.videoUrl || null,
    video_poster: p.video_poster || p.videoPoster || null,
    preview_seconds:
      p.preview_seconds != null
        ? parseInt(p.preview_seconds, 10) || 90
        : p.previewSeconds != null
          ? parseInt(p.previewSeconds, 10) || 90
          : 90,
    cloudflare_uid: p.cloudflare_uid || p.cloudflareUid || null,
    updated_at: new Date().toISOString(),
  }
}

export function registerCatalogRoutes(app, { verifyAdminUser }) {
  app.post('/api/admin/courses-catalog', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) {
      return res.status(503).json({ error: 'Supabase service role not configured' })
    }

    const row = pickCatalogPayload(req.body)
    if (!row.slug) return res.status(400).json({ error: 'slug is required' })
    if (!row.line) return res.status(400).json({ error: 'line is required' })
    if (!row.name) return res.status(400).json({ error: 'name is required' })

    const { data, error } = await admin.from('courses_catalog').upsert(row, { onConflict: 'slug' }).select()
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ row: data?.[0] })
  })

  app.delete('/api/admin/courses-catalog/:slug', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    const slug = req.params.slug
    const { data, error } = await admin.from('courses_catalog').delete().eq('slug', slug).select()
    if (error) return res.status(400).json({ error: error.message })
    if (!data?.length) return res.status(404).json({ error: 'Course not found' })
    return res.json({ row: data[0] })
  })
}
