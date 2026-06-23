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
  return createUserNotification(admin, {
    userId,
    category: 'course',
    title: 'Course unlocked',
    body: `${label} is ready in your Study Center.`,
    href,
    dedupeKey: orderId && courseSlug ? `course:${orderId}:${courseSlug}` : null,
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
