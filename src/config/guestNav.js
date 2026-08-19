/** Guest desktop navigation — IOAI program phase 1 */

import { HOME_SECTION_IDS } from './homePage'

export const HOME_ANCHORS = {
  howItWorks: HOME_SECTION_IDS.howItWorks,
  tuition: HOME_SECTION_IDS.tuition,
}

export const GUEST_DESKTOP_NAV = [
  { path: '/courses/ioai', label: 'Program' },
  { path: '/ioai/curriculum', label: 'Curriculum' },
  { path: '/', hash: HOME_ANCHORS.howItWorks, label: 'How It Works' },
  { path: '/', hash: HOME_ANCHORS.tuition, label: 'Tuition' },
  { path: '/about', label: 'About' },
]

/** Same items for mobile scroll nav */
export const GUEST_MOBILE_NAV = GUEST_DESKTOP_NAV

export function guestNavTo(item) {
  if (item.hash) return { pathname: item.path, hash: `#${item.hash}` }
  return item.path
}

export function isGuestNavActive(loc, item) {
  if (item.hash) {
    return loc.pathname === item.path && loc.hash === `#${item.hash}`
  }
  if (item.path === '/courses/ioai') {
    return loc.pathname === '/courses/ioai' || loc.pathname.startsWith('/courses/ioai/')
  }
  if (item.path === '/ioai/curriculum') {
    return loc.pathname === '/ioai/curriculum' || (loc.pathname === '/curriculum' && loc.search.includes('line=ioai'))
  }
  if (item.path === '/about') {
    return loc.pathname === '/about' || loc.pathname.startsWith('/about/')
  }
  return loc.pathname === item.path
}
