/** @typedef {'announcement' | 'order' | 'course' | 'community' | 'system'} NotificationCategory */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {{
 *   userId: string
 *   category?: NotificationCategory
 *   title: string
 *   body?: string | null
 *   href?: string | null
 *   dedupeKey?: string | null
 *   metadata?: Record<string, unknown>
 * }} params
 */
export async function createUserNotification(admin, params) {
  if (!admin || !params.userId || !params.title?.trim()) return null

  const metadata = { ...(params.metadata || {}) }
  if (params.dedupeKey) metadata.dedupe_key = params.dedupeKey

  if (params.dedupeKey) {
    const { data: existing } = await admin
      .from('user_notifications')
      .select('id')
      .eq('user_id', params.userId)
      .eq('metadata->>dedupe_key', params.dedupeKey)
      .maybeSingle()
    if (existing) return existing
  }

  const { data, error } = await admin
    .from('user_notifications')
    .insert({
      user_id: params.userId,
      category: params.category || 'system',
      title: params.title.trim(),
      body: params.body?.trim() || null,
      href: params.href?.trim() || null,
      metadata,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') return null
    console.error('[userNotifications]', error.message)
    return null
  }

  return data
}

export async function listUserNotifications(admin, userId, { limit = 50 } = {}) {
  if (!admin || !userId) return []

  const { data, error } = await admin
    .from('user_notifications')
    .select('id, category, title, body, href, read_at, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Backfill notifications from paid orders, enrollments, certificates, and achievements.
 * Idempotent via dedupe_key on each notification type.
 */
export async function syncUserNotificationsFromActivity(admin, userId) {
  if (!admin || !userId) return

  const { data: orders } = await admin
    .from('orders')
    .select('id, status, product_name, amount_cents, currency, metadata')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(50)

  for (const order of orders || []) {
    const productName =
      order.product_name ||
      order.metadata?.product_name ||
      order.metadata?.course_slug ||
      null
    await notifyOrderPaid(admin, {
      userId,
      orderId: order.id,
      productName,
      amountCents: order.amount_cents,
      currency: order.currency,
    })
  }

  const { data: enrollments } = await admin
    .from('course_enrollments')
    .select('course_slug, order_id')
    .eq('user_id', userId)
    .limit(100)

  for (const row of enrollments || []) {
    if (!row.course_slug) continue
    await notifyCourseUnlocked(admin, {
      userId,
      courseSlug: row.course_slug,
      orderId: row.order_id,
    })
  }

  const { data: certificates } = await admin
    .from('user_certificates')
    .select('id, title, subtitle')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
    .limit(50)

  for (const cert of certificates || []) {
    await createUserNotification(admin, {
      userId,
      category: 'course',
      title: 'Certificate earned',
      body: cert.subtitle ? `${cert.title} · ${cert.subtitle}` : cert.title,
      href: '/profile#certificates',
      dedupeKey: `cert:${cert.id}`,
      metadata: { certificate_id: cert.id },
    })
  }

  const { data: achievements } = await admin
    .from('user_achievements')
    .select('id, title, description, category, href, metadata')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(50)

  for (const ach of achievements || []) {
    const dedupeKey = ach.metadata?.dedupe_key
    if (typeof dedupeKey === 'string') {
      if (dedupeKey.startsWith('purchase-achievement:')) continue
      if (dedupeKey.startsWith('lesson-complete:')) continue
    }
    if (ach.category === 'course' && ach.title === 'Purchase completed') continue
    if (!['lab', 'competition', 'community', 'assessment'].includes(ach.category)) continue

    await createUserNotification(admin, {
      userId,
      category: ach.category === 'community' ? 'community' : 'course',
      title: ach.title,
      body: ach.description || null,
      href: ach.href || '/profile#achievements',
      dedupeKey: `achievement:${ach.id}`,
      metadata: { achievement_id: ach.id },
    })
  }
}

function formatAmount(amountCents, currency = 'usd') {
  if (amountCents == null) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format(amountCents / 100)
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
export async function notifyOrderPaid(admin, { userId, orderId, productName, amountCents, currency }) {
  if (!userId) return null
  const amount = formatAmount(amountCents, currency)
  const label = productName?.trim() || 'Your purchase'
  return createUserNotification(admin, {
    userId,
    category: 'order',
    title: 'Payment confirmed',
    body: amount ? `${label} · ${amount}` : label,
    href: '/profile#orders',
    dedupeKey: orderId ? `order:${orderId}` : null,
    metadata: { order_id: orderId || null },
  })
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
export async function notifyCourseUnlocked(admin, { userId, courseSlug, productName, orderId }) {
  if (!userId) return null
  const label = productName?.trim() || courseSlug || 'Course'
  const href = courseSlug?.startsWith('ioai-') || courseSlug?.includes('module')
    ? `/courses/module/${courseSlug}`
    : courseSlug
      ? `/courses/detail/${courseSlug}`
      : '/profile/study'
  const dedupeKey = courseSlug
    ? orderId
      ? `course:${orderId}:${courseSlug}`
      : `course-enrollment:${courseSlug}`
    : null
  return createUserNotification(admin, {
    userId,
    category: 'course',
    title: 'Course unlocked',
    body: `${label} is ready in your Study Center.`,
    href,
    dedupeKey,
    metadata: { course_slug: courseSlug || null, order_id: orderId || null },
  })
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
export async function notifyCheckoutEntitlements(admin, { userId, orderId, productName, grantedSlugs = [] }) {
  if (!userId || !grantedSlugs.length) return
  for (const slug of grantedSlugs) {
    await notifyCourseUnlocked(admin, { userId, courseSlug: slug, productName, orderId })
  }
}
