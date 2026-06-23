/**
 * Server-side user certificates & achievements (service role inserts).
 */

function verifyCodeFromDedupe(dedupeKey) {
  const hash = dedupeKey.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()
  return `BINGO-${hash || 'CERT'}`
}

export async function createUserCertificate(admin, params) {
  if (!admin || !params.userId || !params.title?.trim()) return null

  const metadata = { ...(params.metadata || {}) }
  if (params.dedupeKey) metadata.dedupe_key = params.dedupeKey

  if (params.dedupeKey) {
    const { data: existing } = await admin
      .from('user_certificates')
      .select('id')
      .eq('user_id', params.userId)
      .eq('metadata->>dedupe_key', params.dedupeKey)
      .maybeSingle()
    if (existing) return existing
  }

  const { data, error } = await admin
    .from('user_certificates')
    .insert({
      user_id: params.userId,
      source: params.source || 'purchase',
      title: params.title.trim(),
      subtitle: params.subtitle || null,
      level_label: params.levelLabel || null,
      issuer: params.issuer || 'Bingo AI Academy',
      issued_at: params.issuedAt || new Date().toISOString(),
      verify_code: params.verifyCode || verifyCodeFromDedupe(params.dedupeKey || params.title),
      href: params.href || '/profile#certificates',
      metadata,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') return null
    console.error('[userAccomplishments]', error.message)
    return null
  }

  return data
}

export async function createUserAchievement(admin, params) {
  if (!admin || !params.userId || !params.title?.trim()) return null

  const metadata = { ...(params.metadata || {}) }
  if (params.dedupeKey) metadata.dedupe_key = params.dedupeKey

  if (params.dedupeKey) {
    const { data: existing } = await admin
      .from('user_achievements')
      .select('id')
      .eq('user_id', params.userId)
      .eq('metadata->>dedupe_key', params.dedupeKey)
      .maybeSingle()
    if (existing) return existing
  }

  const { data, error } = await admin
    .from('user_achievements')
    .insert({
      user_id: params.userId,
      category: params.category || 'course',
      icon: params.icon || '🏅',
      title: params.title.trim(),
      description: params.description || null,
      earned_at: params.earnedAt || new Date().toISOString(),
      href: params.href || '/profile#achievements',
      metadata,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') return null
    console.error('[userAccomplishments]', error.message)
    return null
  }

  return data
}

export async function notifyPurchaseAccomplishments(admin, { userId, orderId, productName, purchaseType, courseSlug }) {
  if (!userId) return

  const label = productName?.trim() || 'Purchase'
  const isCert = purchaseType === 'cert' || /cert/i.test(label)

  if (isCert) {
    await createUserCertificate(admin, {
      userId,
      source: 'purchase',
      title: label.includes('Certificate') ? label : `${label} Certificate`,
      subtitle: 'Verified Bingo AI Academy credential',
      dedupeKey: orderId ? `purchase-cert:${orderId}` : null,
      href: '/profile#certificates',
      metadata: { order_id: orderId },
    })
  }

  await createUserAchievement(admin, {
    userId,
    category: isCert ? 'course' : purchaseType === 'module' ? 'competition' : 'course',
    icon: isCert ? '📜' : '🎉',
    title: isCert ? 'Certification purchased' : 'Purchase completed',
    description: label,
    dedupeKey: orderId ? `purchase-achievement:${orderId}` : null,
    href: courseSlug ? `/courses/detail/${courseSlug}` : '/profile#orders',
    metadata: { order_id: orderId, course_slug: courseSlug || null },
  })

  if (courseSlug && !isCert) {
    await createUserAchievement(admin, {
      userId,
      category: 'course',
      icon: '📚',
      title: 'Course access unlocked',
      description: label,
      dedupeKey: orderId ? `course-access:${orderId}:${courseSlug}` : `course-access:${courseSlug}`,
      href: `/courses/detail/${courseSlug}`,
      metadata: { order_id: orderId, course_slug: courseSlug },
    })
  }
}
