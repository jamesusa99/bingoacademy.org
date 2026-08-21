/** Guest footer links — IOAI program phase 1 */

import { ABOUT_ORG, FACEBOOK_PAGE_URL } from './trust/about'

export const GUEST_FOOTER_NAV = [
  { label: 'Program', path: '/courses/ioai' },
  { label: 'Curriculum', path: '/ioai/curriculum' },
  { label: 'Free Assessment', path: '/assessment/ioai' },
  { label: 'Sample Work', path: '/showcase/works' },
  { label: 'About', path: '/about' },
  { label: 'Contact', href: `mailto:${ABOUT_ORG.contact.support}`, external: true },
  { label: 'Facebook', href: FACEBOOK_PAGE_URL, external: true },
  { label: 'Safety & Privacy', path: '/safety-and-privacy' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms', path: '/privacy#terms-of-use' },
  { label: 'Log In', path: '/login' },
]

export function guestFooterTo(item) {
  if (item.external) return item.href
  if (item.path?.includes('#')) {
    const [pathname, hash] = item.path.split('#')
    return { pathname, hash: `#${hash}` }
  }
  return item.path
}
