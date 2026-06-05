import { clearPurchasedSlugs } from './courseAccess'
import { resetFreeTrial } from './freeTrial'
import { clearLearningProgress } from './learningProgress'
import { AuthRequiredError, resetMyEnrollments } from './checkout'

/** Clear browser unlocks, trial flag, and lesson progress. */
export function resetLocalCourseAccess() {
  clearPurchasedSlugs()
  resetFreeTrial()
  clearLearningProgress()
}

/** Local + server enrollments (when signed in). */
export async function resetMyCourseAccess({ includeServer = true } = {}) {
  resetLocalCourseAccess()

  if (!includeServer) {
    return { ok: true, local: true, server: null }
  }

  try {
    const body = await resetMyEnrollments()
    return { ok: true, local: true, server: body }
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return { ok: true, local: true, server: { skipped: true, reason: 'not_signed_in' } }
    }
    throw err
  }
}
