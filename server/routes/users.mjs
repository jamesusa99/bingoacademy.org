import { getSupabaseAdmin, getSupabaseConfig } from '../lib/supabaseAdmin.mjs'

function adminNotConfigured(res) {
  const cfg = getSupabaseConfig()
  const missing = []
  if (!cfg.url) missing.push('SUPABASE_URL (or VITE_SUPABASE_URL)')
  if (!cfg.hasServiceRole) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  return res.status(503).json({
    error: `Supabase admin not configured (missing: ${missing.join(', ')}). Add to .env.local and restart npm run dev.`,
  })
}

const PROFILE_FIELDS = [
  'id',
  'email',
  'full_name',
  'avatar_url',
  'role',
  'phone',
  'status',
  'member_tier',
  'locale',
  'country',
  'school',
  'grade',
  'parent_email',
  'internal_notes',
  'tags',
  'last_active_at',
  'created_at',
  'updated_at',
]

function authMeta(user) {
  if (!user) return null
  return {
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
    last_sign_in_at: user.last_sign_in_at,
    created_at: user.created_at,
    phone: user.phone,
    providers: user.app_metadata?.providers || [],
  }
}

function profileFromAuth(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
    role: 'user',
    status: 'active',
    member_tier: 'free',
  }
}

function mergeUser(profile, authUser, orderCount = 0) {
  const base = profile || profileFromAuth(authUser)
  return {
    ...base,
    email: base.email || authUser?.email,
    order_count: orderCount,
    auth: authMeta(authUser),
  }
}

export async function ensureProfile(admin, authUser) {
  const row = {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await admin
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select(PROFILE_FIELDS.join(','))
    .single()
  if (error) throw error
  return data
}

export async function syncAllAuthUsersToProfiles(admin) {
  let page = 1
  let synced = 0
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const batch = data?.users || []
    if (!batch.length) break
    for (const user of batch) {
      await ensureProfile(admin, user)
      synced += 1
    }
    if (batch.length < 100) break
    page += 1
  }
  return synced
}

function matchesQuery(user, q) {
  if (!q) return true
  const needle = q.toLowerCase()
  const hay = [
    user.email,
    user.full_name,
    user.phone,
    user.school,
    user.auth?.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

export function registerUserAdminRoutes(app, { verifyAdminUser }) {
  app.post('/api/admin/users/sync', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return adminNotConfigured(res)

    try {
      const synced = await syncAllAuthUsersToProfiles(admin)
      res.json({ ok: true, synced })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/admin/users', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return adminNotConfigured(res)

    const q = (req.query.q || '').trim().toLowerCase()
    const role = (req.query.role || '').trim()
    const status = (req.query.status || '').trim()
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const perPage = Math.min(100, Math.max(10, parseInt(req.query.perPage || '25', 10)))

    try {
      // Source of truth: all Supabase Auth users; ensure each has a profiles row
      let authPage = 1
      let allMerged = []

      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page: authPage, perPage: 100 })
        if (error) return res.status(500).json({ error: error.message })

        const authUsers = data?.users || []
        if (!authUsers.length) break

        const ids = authUsers.map((u) => u.id)
        const { data: profiles } = await admin.from('profiles').select(PROFILE_FIELDS.join(',')).in('id', ids)
        const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))

        for (const authUser of authUsers) {
          let profile = profileMap[authUser.id]
          if (!profile) {
            profile = await ensureProfile(admin, authUser)
          }
          const merged = mergeUser(profile, authUser, 0)
          if (role && merged.role !== role) continue
          if (status && (merged.status || 'active') !== status) continue
          if (q && !matchesQuery(merged, q)) continue
          allMerged.push(merged)
        }

        if (authUsers.length < 100) break
        authPage += 1
      }

      // Sort newest registrations first
      allMerged.sort((a, b) => {
        const ta = new Date(a.auth?.created_at || a.created_at || 0).getTime()
        const tb = new Date(b.auth?.created_at || b.created_at || 0).getTime()
        return tb - ta
      })

      const total = allMerged.length
      const start = (page - 1) * perPage
      const pageUsers = allMerged.slice(start, start + perPage)

      // Attach order counts for current page only
      const enriched = await Promise.all(
        pageUsers.map(async (user) => {
          const { count } = await admin
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
          return { ...user, order_count: count ?? 0 }
        })
      )

      res.json({
        users: enriched,
        pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/admin/users/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return adminNotConfigured(res)

    const id = req.params.id
    const [{ data: authData, error: authErr }, { data: orders }] = await Promise.all([
      admin.auth.admin.getUserById(id),
      admin
        .from('orders')
        .select('id, status, amount_cents, currency, product_name, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (authErr) return res.status(500).json({ error: authErr.message })
    if (!authData?.user) return res.status(404).json({ error: 'User not found' })

    let profile = (
      await admin.from('profiles').select(PROFILE_FIELDS.join(',')).eq('id', id).maybeSingle()
    ).data
    if (!profile) profile = await ensureProfile(admin, authData.user)

    res.json({
      user: mergeUser(profile, authData.user, orders?.length ?? 0),
      orders: orders || [],
    })
  })

  app.patch('/api/admin/users/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return adminNotConfigured(res)

    const id = req.params.id
    const { data: authData, error: authErr } = await admin.auth.admin.getUserById(id)
    if (authErr) return res.status(500).json({ error: authErr.message })
    if (!authData?.user) return res.status(404).json({ error: 'User not found' })

    await ensureProfile(admin, authData.user)

    const body = req.body || {}
    const allowed = {}
    for (const key of [
      'full_name',
      'avatar_url',
      'role',
      'phone',
      'status',
      'member_tier',
      'locale',
      'country',
      'school',
      'grade',
      'parent_email',
      'internal_notes',
      'tags',
      'last_active_at',
    ]) {
      if (body[key] !== undefined) allowed[key] = body[key]
    }
    allowed.updated_at = new Date().toISOString()

    const { data, error } = await admin.from('profiles').update(allowed).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })

    res.json({ user: mergeUser(data, authData.user) })
  })
}
