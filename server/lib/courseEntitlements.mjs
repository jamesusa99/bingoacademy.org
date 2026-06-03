export const IOAI_FULL_TRACK_SLUG = 'ioai-competition-system'

export const CHECKOUT_PRICING = {
  lesson: { amountCents: 2900, currency: 'usd', label: 'Single IOAI lesson' },
  ioai_track: {
    amountCents: 299000,
    currency: 'usd',
    label: 'IOAI Full Track (110 lessons)',
    slug: IOAI_FULL_TRACK_SLUG,
  },
}

/** Grant enrollment rows after successful payment (purchaseType: lesson | course | ioai_track) */
export async function grantCourseEntitlements(admin, { userId, purchaseType, courseSlug, orderId = null }) {
  if (!admin || !userId) return { granted: [] }

  const slugs =
    purchaseType === 'ioai_track'
      ? [IOAI_FULL_TRACK_SLUG]
      : purchaseType === 'course' || purchaseType === 'lesson'
        ? courseSlug
          ? [courseSlug]
          : []
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

export async function listEnrollmentSlugs(admin, userId) {
  if (!admin || !userId) return []
  const { data, error } = await admin
    .from('course_enrollments')
    .select('course_slug')
    .eq('user_id', userId)
  if (error) return []
  return data.map((r) => r.course_slug)
}
