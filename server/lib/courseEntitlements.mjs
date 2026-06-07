import {
  IOAI_FULL_BUNDLE_SLUG,
  grantBundleEntitlement,
  grantModuleEntitlement,
} from './ioaiCommerce.mjs'

export { IOAI_FULL_BUNDLE_SLUG }

export const CHECKOUT_PRICING = {
  /** @deprecated Phase 1 — IOAI sells L3 modules only */
  lesson: { amountCents: 2900, currency: 'usd', label: 'Single IOAI lesson' },
  ioai_track: {
    amountCents: 299000,
    currency: 'usd',
    label: 'IOAI Full Track (all modules)',
    slug: IOAI_FULL_BUNDLE_SLUG,
  },
}

/** Grant enrollment rows after successful payment */
export async function grantCourseEntitlements(admin, { userId, purchaseType, courseSlug, addonSlugs = [], orderId = null }) {
  if (!admin || !userId) return { granted: [] }

  if (purchaseType === 'module') {
    return grantModuleEntitlement(admin, {
      userId,
      moduleCatalogSlug: courseSlug,
      addonSlugs,
      orderId,
    })
  }

  if (purchaseType === 'bundle' || purchaseType === 'ioai_track') {
    const bundleSlug = purchaseType === 'ioai_track' ? IOAI_FULL_BUNDLE_SLUG : courseSlug
    return grantBundleEntitlement(admin, { userId, bundleSlug, orderId })
  }

  // Generic catalog course (non-IOAI module)
  const slugs =
    purchaseType === 'course' && courseSlug
      ? [courseSlug]
      : purchaseType === 'lesson' && courseSlug
        ? [courseSlug]
        : courseSlug
          ? [courseSlug]
          : []

  const granted = []
  for (const slug of slugs) {
    const { error } = await admin.from('course_enrollments').upsert(
      {
        user_id: userId,
        course_slug: slug,
        source: 'stripe',
        order_id: orderId,
      },
      { onConflict: 'user_id,course_slug' }
    )
    if (!error) granted.push(slug)
  }

  return { granted }
}

export async function grantIOAIMasterclassAccess(admin, userId, source = 'stripe') {
  if (!admin || !userId) return false
  const { error } = await admin.from('user_course_access').upsert(
    {
      user_id: userId,
      access_scope: 'ioai_masterclass',
      source,
      granted_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,access_scope' }
  )
  return !error
}

export async function userHasIOAIAccess(admin, userId) {
  if (!admin || !userId) return false

  const { data: access } = await admin
    .from('user_course_access')
    .select('access_scope')
    .eq('user_id', userId)
    .eq('access_scope', 'ioai_masterclass')
    .maybeSingle()

  if (access) return true

  const slugs = await listEnrollmentSlugs(admin, userId)
  return slugs.includes(IOAI_FULL_BUNDLE_SLUG) || slugs.includes('ioai-track')
}

export async function listEnrollmentSlugs(admin, userId) {
  if (!admin || !userId) return []
  const { data, error } = await admin
    .from('course_enrollments')
    .select('course_slug')
    .eq('user_id', userId)
  if (error) return []
  return data.map((r) => r.course_slug)
}

/** Remove all course unlocks for one user (testing / account reset). */
export async function revokeUserEnrollments(admin, userId) {
  if (!admin || !userId) return { enrollments: 0, access: 0 }

  const { count: enrollmentCount, error: countErr } = await admin
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (countErr) throw new Error(countErr.message)

  const { count: accessCount, error: accessCountErr } = await admin
    .from('user_course_access')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (accessCountErr) throw new Error(accessCountErr.message)

  const { error: enrollErr } = await admin.from('course_enrollments').delete().eq('user_id', userId)
  if (enrollErr) throw new Error(enrollErr.message)

  const { error: accessErr } = await admin.from('user_course_access').delete().eq('user_id', userId)
  if (accessErr) throw new Error(accessErr.message)

  return {
    enrollments: enrollmentCount ?? 0,
    access: accessCount ?? 0,
  }
}
