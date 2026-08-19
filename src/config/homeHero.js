/** Homepage golden hero — IOAI-oriented training for ages 12–18 */

export const HOME_HERO_VIDEO_KEY = 'home_hero_video'

export const HOME_HERO = {
  eyebrow: 'IOAI-Oriented AI Olympiad Training',
  headlineLines: ['Understand AI. Build Real Models.', 'Prepare for IOAI.'],
  /** Full headline for SEO / structured data */
  headline: 'Understand AI. Build Real Models. Prepare for IOAI.',
  subtitle: 'Structured theory + Python + Jupyter labs + projects',
  disclaimer:
    'Bingo Academy is an independent education provider and is not affiliated with or endorsed by IOAI or its organizers.',
}

export function defaultHomeHeroVideo() {
  return { videoUrl: '', posterUrl: '' }
}

export function mergeHomeHeroVideo(value) {
  const defaults = defaultHomeHeroVideo()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  return {
    videoUrl: typeof value.videoUrl === 'string' ? value.videoUrl.trim() : '',
    posterUrl: typeof value.posterUrl === 'string' ? value.posterUrl.trim() : '',
  }
}
