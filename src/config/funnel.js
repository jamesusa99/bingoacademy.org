/** Conversion funnel — lazy auth, exit intent, promo codes */

export const EXIT_INTENT_STORAGE_KEY = 'bingo-exit-intent-seen'
export const PENDING_AUTH_ACTION_KEY = 'bingo-pending-auth-action'
export const PROMO_CODE_STORAGE_KEY = 'bingo-promo-code'

export const EARLY_BIRD_PROMO = {
  code: 'BINGO2026',
  percentOff: 15,
  label: '15% launch early-bird discount',
}

export const LAZY_AUTH_COPY = {
  saveProgress: {
    title: 'Save your progress',
    subtitle: 'Sign in with Google to sync lab completion across devices — takes one tap.',
    googleLabel: 'Continue with Google to save',
  },
  downloadReport: {
    title: 'Download your lab report',
    subtitle: 'Create a free account to export your checkpoint report as a downloadable file.',
    googleLabel: 'Continue with Google to download',
  },
  saveCode: {
    title: 'Save your code to your account',
    subtitle: 'Your notebook is saved locally. Sign in to back it up to your Bingo profile.',
    googleLabel: 'Continue with Google to save',
  },
}

export const EXIT_INTENT_COPY = {
  title: 'Wait — take 15% off before you go!',
  subtitle: 'Join now and use this launch code at checkout:',
  dismiss: 'No thanks, keep exploring',
  cta: 'Copy code & keep learning',
}

/** Paths where exit-intent is suppressed */
export const EXIT_INTENT_EXCLUDED_PREFIXES = [
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/',
]
