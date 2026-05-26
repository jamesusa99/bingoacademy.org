import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'

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

function mergeUser(profile, authUser, orderCount = 0) {
  return {
    ...profile,
    order_count: orderCount,
    auth: authMeta(authUser),
  }
}

export function registerUserAdminRoutes(app, { verifyAdminUser }) {
  app.get('/api/admin/users', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    const q = (req.query.q || '').trim()
    const role = (req.query.role || '').trim()
    const status = (req.query.status || '').trim()
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const perPage = Math.min(100, Math.max(10, parseInt(req.query.perPage || '25', 10)))
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = admin.from('profiles').select(PROFILE_FIELDS.join(','), { count: 'exact' })

    if (q) {
      const safe = q.replace(/%/g, '').replace(/,/g, '')
      query = query.or(
        `email.ilike.%${safe}%,full_name.ilike.%${safe}%,phone.ilike.%${safe}%,school.ilike.%${safe}%`
      )
    }
    if (role) query = query.eq('role', role)
    if (status) query = query.eq('status', status)

    const { data: profiles, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return res.status(500).json({ error: error.message })

    const rows = profiles || []
    const enriched = await Promise.all(
      rows.map(async (profile) => {
        const [{ data: authData }, { count: orderCount }] = await Promise.all([
          admin.auth.admin.getUserById(profile.id),
          admin.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        ])
        return mergeUser(profile, authData?.user, orderCount ?? 0)
      })
    )

    res.json({
      users: enriched,
      pagination: { page, perPage, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / perPage) },
    })
  })

  app.get('/api/admin/users/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    const id = req.params.id
    const [{ data: profile, error: profileErr }, { data: authData }, { data: orders }] = await Promise.all([
      admin.from('profiles').select(PROFILE_FIELDS.join(',')).eq('id', id).maybeSingle(),
      admin.auth.admin.getUserById(id),
      admin
        .from('orders')
        .select('id, status, amount_cents, currency, product_name, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (profileErr) return res.status(500).json({ error: profileErr.message })
    if (!profile && !authData?.user) return res.status(404).json({ error: 'User not found' })

    res.json({
      user: mergeUser(
        profile || { id, email: authData.user?.email, role: 'user', status: 'active', member_tier: 'free' },
        authData?.user,
        orders?.length ?? 0
      ),
      orders: orders || [],
    })
  })

  app.patch('/api/admin/users/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    const id = req.params.id
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

    const { data: authData } = await admin.auth.admin.getUserById(id)
    res.json({ user: mergeUser(data, authData?.user) })
  })
}
