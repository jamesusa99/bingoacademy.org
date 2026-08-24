import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import {
  assertChannelMember,
  buildAdminCommissionDashboard,
  commissionMembershipsForAccount,
  findChannelById,
  listMembershipsForUser,
  loadChannelCommissions,
  loadPersonalChannelPolicy,
  normalizeChannelCode,
  publicChannel,
  requestChannelPayout,
  savePersonalChannelPolicy,
  settlePayout,
  slugifyChannel,
  summarizeCommissions,
  syncAccountChannelMode,
} from '../lib/channels.mjs'

function parseChannelPayload(body = {}) {
  const name = String(body.name || '').trim()
  const code = normalizeChannelCode(body.code)
  const slug = slugifyChannel(body.slug || name || code)
  const kind = body.kind === 'official' ? 'official' : body.kind === 'personal' ? 'personal' : 'partner'
  const status = ['draft', 'active', 'paused'].includes(body.status) ? body.status : 'draft'
  const percent = Number(body.commissionPercent)
  const bpsFromPercent = Number.isFinite(percent) ? Math.round(percent * 100) : null
  const commissionBps = Number.isFinite(Number(body.commissionBps))
    ? Math.round(Number(body.commissionBps))
    : bpsFromPercent
  const minPayout = Number(body.minPayoutCents ?? (body.minPayoutDollars != null ? Number(body.minPayoutDollars) * 100 : null))
  const holdDays = Number(body.holdDays)

  return {
    name,
    slug,
    code,
    kind,
    status,
    description: body.description?.trim() || null,
    contact_name: body.contactName?.trim() || null,
    contact_email: body.contactEmail?.trim() || null,
    commission_bps: commissionBps,
    min_payout_cents: Number.isFinite(minPayout) ? Math.round(minPayout) : undefined,
    hold_days: Number.isFinite(holdDays) ? Math.round(holdDays) : undefined,
    notes: body.notes?.trim() || null,
    updated_at: new Date().toISOString(),
  }
}

export function registerChannelRoutes(app, { verifyAdminUser }) {
  app.get('/api/admin/channels', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { data: channels, error } = await admin.from('sales_channels').select('*').order('created_at', { ascending: true })
    if (error) return res.status(502).json({ error: error.message })

    const ids = (channels || []).map((row) => row.id)
    const [{ data: members }, { data: commissions }] = await Promise.all([
      ids.length
        ? admin.from('channel_members').select('id, channel_id, user_id, member_role, created_at').in('channel_id', ids)
        : { data: [] },
      ids.length
        ? admin.from('channel_commissions').select('channel_id, sale_cents, commission_cents, status').in('channel_id', ids)
        : { data: [] },
    ])

    const memberUserIds = [...new Set((members || []).map((row) => row.user_id))]
    const { data: profiles } = memberUserIds.length
      ? await admin.from('profiles').select('id, email, full_name').in('id', memberUserIds)
      : { data: [] }
    const profileMap = Object.fromEntries((profiles || []).map((row) => [row.id, row]))

    const list = (channels || []).map((channel) => {
      const channelMembers = (members || []).filter((row) => row.channel_id === channel.id)
      const channelCommissions = (commissions || []).filter((row) => row.channel_id === channel.id)
      return {
        ...publicChannel(channel),
        members: channelMembers.map((row) => ({
          id: row.id,
          userId: row.user_id,
          role: row.member_role,
          email: profileMap[row.user_id]?.email || null,
          fullName: profileMap[row.user_id]?.full_name || null,
        })),
        stats: summarizeCommissions(channelCommissions),
      }
    })

    return res.json({ channels: list })
  })

  app.get('/api/admin/channel-policy', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })
    try {
      const policy = await loadPersonalChannelPolicy(admin)
      return res.json({ policy })
    } catch (err) {
      return res.status(502).json({ error: err.message || 'Failed to load channel policy' })
    }
  })

  app.patch('/api/admin/channel-policy', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })
    try {
      const result = await savePersonalChannelPolicy(admin, req.body || {})
      return res.json(result)
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Failed to save channel policy' })
    }
  })

  app.post('/api/admin/channels', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const payload = parseChannelPayload(req.body)
    if (!payload.name) return res.status(400).json({ error: 'Channel name is required' })
    if (!payload.code) return res.status(400).json({ error: 'Referral code is required' })
    if (!payload.slug) return res.status(400).json({ error: 'Slug is required' })
    if (payload.commission_bps == null) payload.commission_bps = 0
    if (payload.min_payout_cents == null) payload.min_payout_cents = 10000
    if (payload.hold_days == null) payload.hold_days = 7

    const { data, error } = await admin.from('sales_channels').insert(payload).select('*').maybeSingle()
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ channel: publicChannel(data) })
  })

  app.patch('/api/admin/channels/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const payload = parseChannelPayload(req.body)
    const cleaned = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''))
    if (!cleaned.name) delete cleaned.name
    if (!cleaned.code) delete cleaned.code
    if (!cleaned.slug) delete cleaned.slug

    const { data, error } = await admin
      .from('sales_channels')
      .update(cleaned)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle()
    if (error) return res.status(400).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Channel not found' })
    return res.json({ channel: publicChannel(data) })
  })

  app.delete('/api/admin/channels/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const channel = await findChannelById(admin, req.params.id)
    if (!channel) return res.status(404).json({ error: 'Channel not found' })
    if (channel.kind === 'official' && channel.slug === 'official') {
      return res.status(400).json({ error: 'The official channel cannot be deleted' })
    }

    const { error } = await admin.from('sales_channels').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.post('/api/admin/channels/:id/members', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const email = String(req.body?.email || '').trim().toLowerCase()
    const memberRole = req.body?.role === 'owner' ? 'owner' : 'manager'
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const channel = await findChannelById(admin, req.params.id)
    if (!channel) return res.status(404).json({ error: 'Channel not found' })

    const { data: profile } = await admin.from('profiles').select('id, email, full_name').ilike('email', email).maybeSingle()
    if (!profile) {
      return res.status(404).json({ error: 'No account with that email. Ask them to register on the site first.' })
    }

    const { data, error } = await admin
      .from('channel_members')
      .upsert(
        { channel_id: channel.id, user_id: profile.id, member_role: memberRole },
        { onConflict: 'channel_id,user_id' }
      )
      .select('id, channel_id, user_id, member_role')
      .maybeSingle()
    if (error) return res.status(400).json({ error: error.message })
    await syncAccountChannelMode(admin, {
      id: profile.id,
      email: profile.email,
      user_metadata: { full_name: profile.full_name },
    })
    return res.json({
      member: {
        id: data.id,
        userId: profile.id,
        role: data.member_role,
        email: profile.email,
        fullName: profile.full_name,
      },
    })
  })

  app.delete('/api/admin/channels/:id/members/:userId', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin
      .from('channel_members')
      .delete()
      .eq('channel_id', req.params.id)
      .eq('user_id', req.params.userId)
    if (error) return res.status(400).json({ error: error.message })
    const { data: profile } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', req.params.userId)
      .maybeSingle()
    await syncAccountChannelMode(admin, {
      id: req.params.userId,
      email: profile?.email,
      user_metadata: { full_name: profile?.full_name },
    })
    return res.json({ ok: true })
  })

  app.get('/api/admin/commissions/dashboard', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const dashboard = await buildAdminCommissionDashboard(admin)
      return res.json(dashboard)
    } catch (err) {
      console.error('[admin/commissions]', err)
      return res.status(502).json({ error: err.message || 'Failed to load commission dashboard' })
    }
  })

  app.post('/api/admin/payouts/:id/:action', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const action = req.params.action
    if (!['approve', 'reject', 'paid'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve, reject, or paid' })
    }

    try {
      const result = await settlePayout(admin, {
        payoutId: req.params.id,
        action,
        adminNotes: req.body?.adminNotes,
      })
      if (result.error) return res.status(result.status || 400).json({ error: result.error })
      return res.json(result)
    } catch (err) {
      return res.status(502).json({ error: err.message || 'Failed to update payout' })
    }
  })

  app.get('/api/channel/me', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const policy = await loadPersonalChannelPolicy(admin)
      const result = await syncAccountChannelMode(admin, auth.user)
      const raw = result.error
        ? await listMembershipsForUser(admin, auth.user.id)
        : result.memberships || []
      const memberships = result.error ? commissionMembershipsForAccount(raw) : raw
      return res.json({
        created: Boolean(result.created),
        mode: result.mode || (memberships.some((row) => row.channel?.kind === 'personal') ? 'personal' : 'partner'),
        policy,
        memberships: memberships.map((row) => ({
          role: row.role,
          channel: publicChannel(row.channel),
        })),
        ...(result.error ? { personalError: result.error } : {}),
      })
    } catch (err) {
      return res.status(502).json({ error: err.message })
    }
  })

  app.post('/api/channel/enroll', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const result = await syncAccountChannelMode(admin, auth.user)
      if (result.error) return res.status(result.status || 400).json({ error: result.error })
      const policy = await loadPersonalChannelPolicy(admin)
      return res.json({
        created: result.created,
        mode: result.mode,
        policy,
        memberships: (result.memberships || []).map((row) => ({
          role: row.role,
          channel: publicChannel(row.channel),
        })),
      })
    } catch (err) {
      return res.status(502).json({ error: err.message || 'Could not create channel' })
    }
  })

  app.get('/api/channel/dashboard', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const channelId = req.query.channelId?.trim()
    const synced = await syncAccountChannelMode(admin, auth.user)
    const memberships = synced.error
      ? commissionMembershipsForAccount(await listMembershipsForUser(admin, auth.user.id))
      : synced.memberships || []
    const membership = channelId
      ? memberships.find((row) => row.channel.id === channelId)
      : memberships[0]
    if (!membership) return res.status(403).json({ error: 'No channel access' })

    try {
      const commissions = await loadChannelCommissions(admin, membership.channel.id, { limit: 80 })
      const { data: payouts } = await admin
        .from('channel_payouts')
        .select('*')
        .eq('channel_id', membership.channel.id)
        .order('requested_at', { ascending: false })
        .limit(30)

      return res.json({
        channel: publicChannel(membership.channel),
        role: membership.role,
        stats: summarizeCommissions(commissions),
        commissions,
        payouts: payouts || [],
      })
    } catch (err) {
      return res.status(502).json({ error: err.message })
    }
  })

  app.post('/api/channel/payouts', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const channelId = req.body?.channelId
    if (!channelId) return res.status(400).json({ error: 'channelId is required' })
    const member = await assertChannelMember(admin, auth.user.id, channelId)
    if (!member.ok) return res.status(member.status).json({ error: member.error })

    const channel = await findChannelById(admin, channelId)
    if (!channel || channel.status !== 'active') {
      return res.status(400).json({ error: 'Channel is not active' })
    }

    try {
      const result = await requestChannelPayout(admin, {
        channel,
        userId: auth.user.id,
        notes: req.body?.notes,
      })
      if (result.error) return res.status(400).json(result)
      return res.json(result)
    } catch (err) {
      return res.status(502).json({ error: err.message })
    }
  })
}
