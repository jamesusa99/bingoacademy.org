/** Homepage golden hero — copy, CTAs, and optional background video (admin-configurable). */

export const HOME_HERO_VIDEO_KEY = 'home_hero_video'

export const HOME_HERO = {
  eyebrow: 'Bingo AI Academy',
  headline: 'Empowering Future Innovators.',
  headlineAccent: 'From Code to Real-World AI.',
  subtitle:
    'Write code in the browser — watch Cyber Tennis, vision models, and BingoClaw hardware respond in the physical world. Embodied AI, not slide decks.',
  ctaPrimary: {
    label: 'Start Building for Free',
    to: '/try-ai',
  },
  ctaSecondary: {
    label: 'Explore IOAI Curriculum',
    to: '/curriculum?line=ioai',
  },
  ctaHint: 'No sign-up · Browser lab · Code that moves the real world',
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
