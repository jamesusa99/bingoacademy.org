/** Roles allowed to sign in to /admin and mutate CMS data (when RLS migration 009 is applied). */
export const STAFF_ROLES = ['admin', 'editor']

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role)
}
