/** Storefront bundle cover crops — keep in sync with card aspect ratios. */
export const BUNDLE_COVER_PRESETS = {
  home: {
    id: 'home',
    aspectRatio: 4 / 3,
    maxWidth: 800,
    maxHeight: 600,
    aspectClass: 'aspect-[4/3]',
  },
  courses: {
    id: 'courses',
    aspectRatio: 2 / 1,
    maxWidth: 1200,
    maxHeight: 600,
    aspectClass: 'aspect-[2/1]',
  },
}

export function resolveBundleHomeCoverUrl(bundle) {
  const home = typeof bundle?.coverUrlHome === 'string' ? bundle.coverUrlHome.trim() : ''
  if (home) return home
  const legacy = typeof bundle?.coverUrl === 'string' ? bundle.coverUrl.trim() : ''
  return legacy
}

export function resolveBundleCoursesCoverUrl(bundle) {
  return typeof bundle?.coverUrl === 'string' ? bundle.coverUrl.trim() : ''
}
