/** Channel-specific landing pages — TikTok/Meta vs Google/YouTube */

export const TRY_AI_LANDING = {
  channel: 'try-ai',
  seo: {
    title: 'Try AI — Play Cyber Tennis in Your Browser',
    description:
      'No sign-up. Turn on your camera and play AI Cyber Tennis — pose tracking, real-time physics, zero install. Free browser AI lab.',
  },
  eyebrow: 'Free · No sign-up · Browser AI',
  headline: 'Play AI. Feel the magic.',
  subhead: 'Your webcam becomes a cyber squash court — MoveNet tracks every swing in real time.',
  curiosityDelayMs: 30_000,
  curiosityModal: {
    title: 'Want to know how this works?',
    subtitle: 'Build your first AI model from zero — no prior coding experience required.',
    cta: 'Claim free intro lab lesson',
    dismiss: 'Keep playing',
  },
}

export const IOAI_MASTERCLASS_LANDING = {
  channel: 'ioai-masterclass',
  seo: {
    title: 'IOAI Masterclass — Competition-Ready AI Training',
    description:
      'Professor-led IOAI curriculum: Python → Machine Learning → Neural Networks. Dual-pane Jupyter labs, competition outcomes, Stripe checkout.',
  },
  eyebrow: 'IOAI Competition System',
  headline: 'The systematic path to IOAI — from Python to neural nets',
  subhead:
    'University-grade curriculum with Kaggle-style dual-pane labs, written-exam prep, and defence-ready project portfolios — built for families who care about outcomes, not hype.',
  whitepaper: {
    title: 'IOAI Prep Whitepaper',
    subtitle: 'Exam format, scoring rubrics, module map, and a 12-week study planner — free PDF via email.',
    cta: 'Get the whitepaper',
    success: 'Check your inbox — your IOAI prep guide is on the way.',
  },
  curriculumPath: [
    {
      stage: 'Python Foundations',
      icon: '🐍',
      topics: ['Lists, OOP & clean scripts', 'NumPy & Pandas for IOAI datasets', 'Error handling under exam pressure'],
    },
    {
      stage: 'Machine Learning',
      icon: '📊',
      topics: ['Supervised learning workflows', 'Feature engineering & validation', 'Competition-grade ablation notes'],
    },
    {
      stage: 'Neural Networks',
      icon: '🧠',
      topics: ['PyTorch tensors & autograd', 'CNNs & vision pipelines', 'Defence-ready Jupyter reports'],
    },
  ],
  outcomes: [
    { icon: '🏆', label: 'IOAI competition track', desc: 'Structured L1→L4 progression aligned to selection rounds' },
    { icon: '📓', label: 'Dual-pane Jupyter labs', desc: 'Tutorial left, live Python right — zero CUDA setup' },
    { icon: '🎓', label: 'Professor-led R&D', desc: 'Peer-review discipline, not generic script tutors' },
  ],
  purchase: {
    title: 'Start with the foundation module',
    desc: 'Unlock the intro IOAI unit — video lessons, GoLab Python workspace, and hands-on labs.',
    cta: 'Buy foundation module',
    fullTrackCta: 'Or unlock the full IOAI Masterclass →',
  },
}

/** Default module slug for Google/YouTube intent traffic (intro Python unit). */
export const IOAI_LANDING_STARTER_MODULE = 'ioai-intro-python-level-0-basics'
