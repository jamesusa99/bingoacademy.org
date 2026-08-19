import { SITE_BRAND } from './siteSeo'

/** Public free sample — /ioai/sample-lab */
export const IOAI_SAMPLE_LAB = {
  path: '/ioai/sample-lab',
  seo: {
    title: `Free IOAI Sample Lab | Try Python for AI | ${SITE_BRAND}`,
    description:
      'Try a free IOAI-style coding lab in your browser — dual-pane tutorial, Python autograder, and sample notebook format. No account required.',
  },
  hero: {
    eyebrow: 'Free sample · No sign-up',
    headline: 'Try an IOAI-style lab before you enroll',
    subhead:
      'See how our dual-pane workspace works: tutorial on the left, runnable Python on the right, with instant feedback — the same format students use in the full program.',
  },
  ctas: {
    primary: { label: 'Take the Free Assessment', to: '/assessment/ioai' },
    secondary: { label: 'View Full Curriculum', to: '/ioai/curriculum' },
  },
  resources: [
    {
      label: 'Sample notebook & report format',
      desc: 'See how competition-style submissions are structured.',
      to: '/guides/ioai/sample-notebook-report',
    },
    {
      label: 'Mock assessment rubric',
      desc: 'Understand how readiness and progress are measured.',
      to: '/guides/ioai/mock-assessment-rubric',
    },
  ],
}
