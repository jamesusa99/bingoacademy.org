export function normalizeChannelCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function slugifyChannel(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function commissionCentsFromSale(saleCents, bps) {
  const sale = Math.max(0, parseInt(saleCents, 10) || 0)
  const rate = Math.max(0, parseInt(bps, 10) || 0)
  return Math.round((sale * rate) / 10000)
}

function metaObject(metadata) {
  return metadata && typeof metadata === 'object' ? metadata : {}
}

export async function findChannelByCode(admin, code) {
  const normalized = normalizeChannelCode(code)
  if (!admin || !normalized) return null
  const { data } = await admin.from('sales_channels').select('*').ilike('code', normalized).maybeSingle()
  return data || null
}

export async function findChannelById(admin, id) {
  if (!admin || !id) return null
  const { data } = await admin.from('sales_channels').select('*').eq('id', id).maybeSingle()
  return data || null
}

/**
 * Resolve which channel should earn commission for this checkout.
 * Prefer explicit channel code, then promo → channel link, then promo code matching a channel code.
 */
export async function resolveCheckoutChannel(admin, { channelCode, promoCode, promoId, metadata } = {}) {
  if (!admin) return null
  const meta = metaObject(metadata)

  const explicitCode = normalizeChannelCode(channelCode || meta.channel_code)
  if (explicitCode) {
    const byCode = await findChannelByCode(admin, explicitCode)
    if (byCode?.status === 'active') return byCode
  }

  const channelId = meta.channel_id || null
  if (channelId) {
    const byId = await findChannelById(admin, channelId)
    if (byId?.status === 'active') return byId
  }

  const promoLookupId = promoId || meta.promo_code_id
  if (promoLookupId) {
    const { data: promo } = await admin
      .from('promo_codes')
      .select('id, code, channel_id')
      .eq('id', promoLookupId)
      .maybeSingle()
    if (promo?.channel_id) {
      const linked = await findChannelById(admin, promo.channel_id)
      if (linked?.status === 'active') return linked
    }
    if (promo?.code) {
      const byPromoCode = await findChannelByCode(admin, promo.code)
      if (byPromoCode?.status === 'active') return byPromoCode
    }
  }

  const fallbackCode = normalizeChannelCode(promoCode || meta.promo_code)
  if (fallbackCode) {
    const byPromoAsChannel = await findChannelByCode(admin, fallbackCode)
    if (byPromoAsChannel?.status === 'active') return byPromoAsChannel
  }

  return null
}

export function channelCheckoutMeta(channel) {
  if (!channel) return {}
  return {
    channel_id: String(channel.id),
    channel_code: String(channel.code || ''),
    channel_kind: String(channel.kind || ''),
  }
}

export async function releaseMaturedCommissions(admin, channelId = null) {
  if (!admin) return 0
  const now = new Date().toISOString()
  let query = admin
    .from('channel_commissions')
    .update({ status: 'available' })
    .eq('status', 'pending')
    .lte('available_at', now)
  if (channelId) query = query.eq('channel_id', channelId)
  const { data, error } = await query.select('id')
  if (error) {
    console.error('[channels] release matured', error.message)
    return 0
  }
  return data?.length || 0
}

export async function recordChannelCommission(admin, { orderId, amountCents, currency, productName, userId, metadata, channelCode, promoCode }) {
  if (!admin || !orderId) return { recorded: false }

  const channel = await resolveCheckoutChannel(admin, {
    channelCode,
    promoCode,
    promoId: metadata?.promo_code_id,
    metadata,
  })
  if (!channel) return { recorded: false, reason: 'no_channel' }

  const saleCents = Math.max(0, parseInt(amountCents, 10) || 0)
  const commissionCents = commissionCentsFromSale(saleCents, channel.commission_bps)
  const holdDays = Math.max(0, parseInt(channel.hold_days, 10) || 0)
  const availableAt = new Date(Date.now() + holdDays * 24 * 60 * 60 * 1000).toISOString()
  const status = holdDays === 0 ? 'available' : 'pending'

  const row = {
    channel_id: channel.id,
    order_id: orderId,
    buyer_user_id: userId || null,
    product_name: productName || null,
    sale_cents: saleCents,
    commission_cents: commissionCents,
    commission_bps: channel.commission_bps,
    currency: (currency || channel.currency || 'usd').toLowerCase(),
    status,
    available_at: availableAt,
    attribution_code: channel.code,
  }

  const { data, error } = await admin
    .from('channel_commissions')
    .upsert(row, { onConflict: 'order_id,channel_id' })
    .select('id')
    .maybeSingle()

  if (error) {
    // Partial unique index may not be a named conflict target — fall back to insert-ignore.
    const { data: existing } = await admin
      .from('channel_commissions')
      .select('id')
      .eq('order_id', orderId)
      .eq('channel_id', channel.id)
      .maybeSingle()
    if (existing) return { recorded: false, reason: 'duplicate', channelId: channel.id }
    const inserted = await admin.from('channel_commissions').insert(row).select('id').maybeSingle()
    if (inserted.error) {
      console.error('[channels] record commission', inserted.error.message)
      return { recorded: false, error: inserted.error.message }
    }
    return { recorded: true, channelId: channel.id, commissionId: inserted.data?.id, commissionCents }
  }

  return { recorded: true, channelId: channel.id, commissionId: data?.id, commissionCents }
}

export function isPersonalOwnedChannel(channel) {
  if (!channel) return false
  if (channel.kind === 'personal') return true
  return String(channel.slug || '').toLowerCase().startsWith('user-')
}

export function isInstitutionalChannel(channel) {
  if (!channel || isPersonalOwnedChannel(channel)) return false
  return channel.kind === 'partner' || channel.kind === 'official'
}

/** One account, one commission mode: partner/official membership upgrades off personal. */
export function commissionMembershipsForAccount(memberships) {
  const list = memberships || []
  const institutional = list.filter((row) => isInstitutionalChannel(row.channel))
  if (institutional.length) return institutional
  return list.filter((row) => isPersonalOwnedChannel(row.channel))
}

export async function listMembershipsForUser(admin, userId) {
  if (!admin || !userId) return []
  const { data, error } = await admin
    .from('channel_members')
    .select('id, member_role, channel_id, sales_channels (*)')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const kindRank = (kind) => (kind === 'official' ? 0 : kind === 'partner' ? 1 : 2)
  return (data || [])
    .map((row) => ({
      membershipId: row.id,
      role: row.member_role,
      channel: row.sales_channels,
    }))
    .filter((row) => row.channel)
    .sort((a, b) => {
      const rank = kindRank(a.channel.kind) - kindRank(b.channel.kind)
      if (rank !== 0) return rank
      return String(a.channel.name || '').localeCompare(String(b.channel.name || ''))
    })
}

export async function assertChannelMember(admin, userId, channelId) {
  const { data } = await admin
    .from('channel_members')
    .select('id, member_role')
    .eq('user_id', userId)
    .eq('channel_id', channelId)
    .maybeSingle()
  if (!data) return { ok: false, status: 403, error: 'Not a member of this channel' }
  return { ok: true, role: data.member_role }
}

function sumCents(rows, key) {
  return (rows || []).reduce((sum, row) => sum + (parseInt(row[key], 10) || 0), 0)
}

export function summarizeCommissions(rows) {
  const list = rows || []
  const available = list.filter((row) => row.status === 'available')
  const pending = list.filter((row) => row.status === 'pending')
  const reserved = list.filter((row) => row.status === 'reserved')
  const paid = list.filter((row) => row.status === 'paid')
  return {
    orderCount: list.length,
    saleCents: sumCents(list, 'sale_cents'),
    commissionCents: sumCents(list, 'commission_cents'),
    availableCents: sumCents(available, 'commission_cents'),
    pendingCents: sumCents(pending, 'commission_cents'),
    reservedCents: sumCents(reserved, 'commission_cents'),
    paidCents: sumCents(paid, 'commission_cents'),
  }
}

export async function loadChannelCommissions(admin, channelId, { limit = 100 } = {}) {
  await releaseMaturedCommissions(admin, channelId)
  const { data, error } = await admin
    .from('channel_commissions')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data || []
}

export async function requestChannelPayout(admin, { channel, userId, notes }) {
  await releaseMaturedCommissions(admin, channel.id)
  const { data: available, error } = await admin
    .from('channel_commissions')
    .select('id, commission_cents')
    .eq('channel_id', channel.id)
    .eq('status', 'available')
  if (error) throw new Error(error.message)

  const amountCents = sumCents(available, 'commission_cents')
  const min = parseInt(channel.min_payout_cents, 10) || 0
  if (amountCents < min) {
    return {
      error: `Minimum payout is ${(min / 100).toFixed(2)}. Available: ${(amountCents / 100).toFixed(2)}.`,
      availableCents: amountCents,
      minPayoutCents: min,
    }
  }
  if (amountCents <= 0) {
    return { error: 'No available commission to withdraw' }
  }

  const { data: payout, error: payoutErr } = await admin
    .from('channel_payouts')
    .insert({
      channel_id: channel.id,
      amount_cents: amountCents,
      currency: channel.currency || 'usd',
      status: 'requested',
      requested_by: userId,
      notes: notes || null,
    })
    .select('*')
    .maybeSingle()
  if (payoutErr) throw new Error(payoutErr.message)

  const ids = (available || []).map((row) => row.id)
  if (ids.length) {
    await admin
      .from('channel_commissions')
      .update({ status: 'reserved', payout_id: payout.id })
      .in('id', ids)
  }

  return { payout, amountCents }
}

export async function settlePayout(admin, { payoutId, action, adminNotes }) {
  const { data: payout, error } = await admin.from('channel_payouts').select('*').eq('id', payoutId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!payout) return { error: 'Payout not found', status: 404 }
  if (payout.status === 'paid' || payout.status === 'rejected') {
    return { error: `Payout already ${payout.status}`, status: 400 }
  }

  if (action === 'approve') {
    if (payout.status !== 'requested') return { error: 'Only requested payouts can be approved', status: 400 }
    const { data, error: upd } = await admin
      .from('channel_payouts')
      .update({
        status: 'approved',
        admin_notes: adminNotes || payout.admin_notes,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutId)
      .select('*')
      .maybeSingle()
    if (upd) throw new Error(upd.message)
    return { payout: data }
  }

  if (action === 'paid') {
    const { data, error: upd } = await admin
      .from('channel_payouts')
      .update({
        status: 'paid',
        admin_notes: adminNotes || payout.admin_notes,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutId)
      .select('*')
      .maybeSingle()
    if (upd) throw new Error(upd.message)
    await admin.from('channel_commissions').update({ status: 'paid' }).eq('payout_id', payoutId).eq('status', 'reserved')
    return { payout: data }
  }

  if (action === 'reject') {
    const { data, error: upd } = await admin
      .from('channel_payouts')
      .update({
        status: 'rejected',
        admin_notes: adminNotes || payout.admin_notes,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutId)
      .select('*')
      .maybeSingle()
    if (upd) throw new Error(upd.message)
    await admin
      .from('channel_commissions')
      .update({ status: 'available', payout_id: null })
      .eq('payout_id', payoutId)
      .eq('status', 'reserved')
    return { payout: data }
  }

  return { error: 'Unknown payout action', status: 400 }
}

function inRange(iso, start, end) {
  const t = new Date(iso).getTime()
  return t >= start && t < end
}

export async function buildAdminCommissionDashboard(admin) {
  await releaseMaturedCommissions(admin)

  const [{ data: channels }, { data: commissions }, { data: payouts }] = await Promise.all([
    admin.from('sales_channels').select('*').order('created_at', { ascending: true }),
    admin
      .from('channel_commissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000),
    admin.from('channel_payouts').select('*').order('requested_at', { ascending: false }).limit(200),
  ])

  const channelList = channels || []
  const rows = commissions || []
  const payoutList = payouts || []

  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000
  const thisStart = now - week
  const prevStart = now - 2 * week

  const thisWeek = rows.filter((row) => inRange(row.created_at, thisStart, now + 1))
  const prevWeek = rows.filter((row) => inRange(row.created_at, prevStart, thisStart))

  const firstOrderByBuyer = new Map()
  const chronological = [...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  for (const row of chronological) {
    if (row.buyer_user_id && !firstOrderByBuyer.has(row.buyer_user_id)) {
      firstOrderByBuyer.set(row.buyer_user_id, row.order_id || row.id)
    }
  }
  const thisWeekNew = thisWeek.filter(
    (row) => row.buyer_user_id && firstOrderByBuyer.get(row.buyer_user_id) === (row.order_id || row.id)
  )
  const thisWeekReturning = thisWeek.filter(
    (row) => row.buyer_user_id && firstOrderByBuyer.get(row.buyer_user_id) !== (row.order_id || row.id)
  )

  const byChannel = channelList.map((channel) => {
    const channelRows = rows.filter((row) => row.channel_id === channel.id)
    return {
      channel,
      ...summarizeCommissions(channelRows),
    }
  })

  const officialRows = rows.filter((row) => {
    const channel = channelList.find((item) => item.id === row.channel_id)
    return channel?.kind === 'official'
  })
  const partnerRows = rows.filter((row) => {
    const channel = channelList.find((item) => item.id === row.channel_id)
    return channel?.kind === 'partner'
  })

  return {
    totals: summarizeCommissions(rows),
    byChannel,
    recent: rows.slice(0, 40).map((row) => ({
      ...row,
      channelName: channelList.find((item) => item.id === row.channel_id)?.name || row.attribution_code,
      channelKind: channelList.find((item) => item.id === row.channel_id)?.kind || null,
    })),
    cohorts: {
      thisWeek: summarizeCommissions(thisWeek),
      prevWeek: summarizeCommissions(prevWeek),
      official: summarizeCommissions(officialRows),
      partner: summarizeCommissions(partnerRows),
      newBuyers: summarizeCommissions(thisWeekNew),
      returningBuyers: summarizeCommissions(thisWeekReturning),
    },
    payouts: payoutList.slice(0, 50).map((row) => ({
      ...row,
      channelName: channelList.find((item) => item.id === row.channel_id)?.name || null,
    })),
    payoutRequestedCents: sumCents(
      payoutList.filter((row) => row.status === 'requested' || row.status === 'approved'),
      'amount_cents'
    ),
  }
}

export function publicChannel(channel) {
  if (!channel) return null
  return {
    id: channel.id,
    slug: channel.slug,
    name: channel.name,
    kind: channel.kind,
    status: channel.status,
    code: channel.code,
    description: channel.description,
    contactName: channel.contact_name,
    contactEmail: channel.contact_email,
    commissionBps: channel.commission_bps,
    commissionPercent: (channel.commission_bps || 0) / 100,
    minPayoutCents: channel.min_payout_cents,
    holdDays: channel.hold_days,
    currency: channel.currency,
    notes: channel.notes,
    createdAt: channel.created_at,
  }
}

export const PERSONAL_CHANNEL_POLICY_KEY = 'personal_channel_policy'

export const FALLBACK_PERSONAL_CHANNEL_POLICY = {
  commissionPercent: 10,
  holdDays: 7,
  minPayoutDollars: 100,
}

export function normalizePersonalChannelPolicy(raw) {
  const percent = Number(raw?.commissionPercent ?? raw?.commission_percent)
  const holdDays = Number(raw?.holdDays ?? raw?.hold_days)
  const minPayoutDollars = Number(raw?.minPayoutDollars ?? raw?.min_payout_dollars)
  return {
    commissionPercent: Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : FALLBACK_PERSONAL_CHANNEL_POLICY.commissionPercent,
    holdDays: Number.isFinite(holdDays)
      ? Math.min(365, Math.max(0, Math.round(holdDays)))
      : FALLBACK_PERSONAL_CHANNEL_POLICY.holdDays,
    minPayoutDollars: Number.isFinite(minPayoutDollars)
      ? Math.max(0, minPayoutDollars)
      : FALLBACK_PERSONAL_CHANNEL_POLICY.minPayoutDollars,
  }
}

export function personalPolicyToChannelFields(policy) {
  const normalized = normalizePersonalChannelPolicy(policy)
  return {
    commission_bps: Math.round(normalized.commissionPercent * 100),
    hold_days: normalized.holdDays,
    min_payout_cents: Math.round(normalized.minPayoutDollars * 100),
  }
}

export async function loadPersonalChannelPolicy(admin) {
  if (!admin) return normalizePersonalChannelPolicy(null)
  const { data } = await admin
    .from('platform_settings')
    .select('value')
    .eq('key', PERSONAL_CHANNEL_POLICY_KEY)
    .maybeSingle()
  return normalizePersonalChannelPolicy(data?.value)
}

export async function savePersonalChannelPolicy(admin, raw, { applyToExisting = true } = {}) {
  const policy = normalizePersonalChannelPolicy(raw)
  const { error } = await admin.from('platform_settings').upsert(
    {
      key: PERSONAL_CHANNEL_POLICY_KEY,
      value: policy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )
  if (error) throw new Error(error.message)

  let updated = 0
  if (applyToExisting) {
    const fields = {
      ...personalPolicyToChannelFields(policy),
      updated_at: new Date().toISOString(),
    }
    const personal = await admin.from('sales_channels').update(fields).eq('kind', 'personal').select('id')
    if (personal.error) throw new Error(personal.error.message)
    updated += personal.data?.length || 0

    const fallback = await admin
      .from('sales_channels')
      .update(fields)
      .eq('kind', 'partner')
      .like('slug', 'user-%')
      .select('id')
    if (!fallback.error) updated += fallback.data?.length || 0
  }

  return { policy, updated }
}

export function personalChannelSlug(userId) {
  return slugifyChannel(`user-${userId}`)
}

/**
 * Short shareable code derived from the account UUID.
 * UUID is unique; we start with 8 hex chars (U + 8 = 9 chars) and lengthen on collision
 * so two users never share a code. The durable unique key is still slug user-{uuid}.
 */
export async function allocateUniquePersonalCode(admin, userId) {
  const hex = String(userId || '').replace(/-/g, '').replace(/[^A-F0-9]/gi, '').toUpperCase()
  const slug = personalChannelSlug(userId)
  const lengths = [8, 10, 12, 16, 32].filter((n) => n <= hex.length || n === 8)
  for (const n of lengths) {
    const stem = (hex.slice(0, n) || hex || Date.now().toString(16)).padEnd(Math.min(n, 8), '0')
    const code = normalizeChannelCode(`U${stem}`)
    const { data } = await admin.from('sales_channels').select('id, slug').ilike('code', code).maybeSingle()
    if (!data) return code
    if (data.slug === slug) return code
  }
  return normalizeChannelCode(`U${(hex.slice(0, 8) || 'USER')}${Date.now().toString(36).toUpperCase()}`)
}

async function pausePersonalChannel(admin, userId) {
  const slug = personalChannelSlug(userId)
  const { data } = await admin.from('sales_channels').select('id, status').ilike('slug', slug).maybeSingle()
  if (!data || data.status === 'paused') return
  await admin
    .from('sales_channels')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', data.id)
}

async function activateExistingPersonalChannel(admin, channel) {
  const policy = await loadPersonalChannelPolicy(admin)
  const { error } = await admin
    .from('sales_channels')
    .update({
      status: 'active',
      ...personalPolicyToChannelFields(policy),
      updated_at: new Date().toISOString(),
    })
    .eq('id', channel.id)
  if (error) return { error: error.message, status: 400 }
  return { error: null }
}

export async function syncAccountChannelMode(admin, user) {
  if (!admin || !user?.id) {
    return { error: 'Sign in required', status: 401 }
  }

  const existing = await listMembershipsForUser(admin, user.id)
  if (existing.some((row) => isInstitutionalChannel(row.channel))) {
    await pausePersonalChannel(admin, user.id)
    const memberships = commissionMembershipsForAccount(await listMembershipsForUser(admin, user.id))
    return { memberships, created: false, mode: 'partner' }
  }

  return ensurePersonalChannelRecord(admin, user)
}

export async function ensurePersonalChannel(admin, user) {
  return syncAccountChannelMode(admin, user)
}

async function ensurePersonalChannelRecord(admin, user) {
  const slug = personalChannelSlug(user.id)
  const { data: bySlug } = await admin.from('sales_channels').select('*').ilike('slug', slug).maybeSingle()
  if (bySlug) {
    if (bySlug.status !== 'active') {
      const activated = await activateExistingPersonalChannel(admin, bySlug)
      if (activated.error) return activated
    }
    await admin.from('channel_members').upsert(
      { channel_id: bySlug.id, user_id: user.id, member_role: 'owner' },
      { onConflict: 'channel_id,user_id' }
    )
    const memberships = commissionMembershipsForAccount(await listMembershipsForUser(admin, user.id))
    return { memberships, created: false, mode: 'personal' }
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()
  const display =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Member'

  const policy = await loadPersonalChannelPolicy(admin)
  const code = await allocateUniquePersonalCode(admin, user.id)
  const row = {
    name: `${display}'s channel`,
    slug,
    code,
    kind: 'personal',
    status: 'active',
    contact_email: user.email || profile?.email || null,
    contact_name: display,
    ...personalPolicyToChannelFields(policy),
    description: 'Default personal referral channel',
  }

  let inserted = await admin.from('sales_channels').insert(row).select('*').maybeSingle()
  if (inserted.error && /kind|check/i.test(inserted.error.message || '')) {
    inserted = await admin.from('sales_channels').insert({ ...row, kind: 'partner' }).select('*').maybeSingle()
  }
  if (inserted.error && /duplicate|unique/i.test(inserted.error.message || '')) {
    const { data: raced } = await admin.from('sales_channels').select('*').ilike('slug', slug).maybeSingle()
    if (raced) {
      inserted = { data: raced, error: null }
    } else {
      const retryCode = await allocateUniquePersonalCode(admin, user.id)
      inserted = await admin.from('sales_channels').insert({ ...row, code: retryCode }).select('*').maybeSingle()
    }
  }
  if (inserted.error) {
    return { error: inserted.error.message, status: 400 }
  }

  const { error: memberErr } = await admin.from('channel_members').upsert(
    { channel_id: inserted.data.id, user_id: user.id, member_role: 'owner' },
    { onConflict: 'channel_id,user_id' }
  )
  if (memberErr) return { error: memberErr.message, status: 400 }

  const memberships = commissionMembershipsForAccount(await listMembershipsForUser(admin, user.id))
  return { memberships, created: true, mode: 'personal' }
}

/** @deprecated use syncAccountChannelMode */
export async function enrollPersonalChannel(admin, user) {
  return syncAccountChannelMode(admin, user)
}
