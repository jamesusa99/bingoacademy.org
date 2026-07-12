/** Static page SEO — mirrors src/config/programs.js PAGE_SEO + landing configs */

import { SITE_BRAND, SITE_DEFAULT_SEO, ORG_JSON_LD } from './constants.mjs'
import { coursesSeoForPathname } from './courseSeo.mjs'

export { ORG_JSON_LD }

const BRAND = SITE_BRAND

export const PAGE_SEO = {
  home: SITE_DEFAULT_SEO,
  compare: {
    title: `Compare AI Programs — Foundations, IOAI & K12 | ${BRAND}`,
    description: `See which ${BRAND} program fits your goal: self-study, competition training, or school deployment.`,
  },
  exploration: {
    title: `AI Exploration Lab — Free Hands-On AI Experiments | ${BRAND}`,
    description:
      'Try AI hands-on in the browser — free experiments in computer vision, NLP, and generative AI. No sign-up required.',
  },
  foundations: {
    title: `Foundations of AI Program — Self-Paced AI Learning | ${BRAND}`,
    description:
      'Self-paced AI literacy courses, online labs, and home experiment kits for independent learners.',
  },
  ioai: {
    title: `IOAI Competition Training — AI Olympiad Prep | ${BRAND}`,
    description:
      'IOAI whitelist competition training — video courses, training camps, and mock assessments.',
  },
  k12: {
    title: `K12 AI Classroom Edition — Complete School Solution | ${BRAND}`,
    description:
      'Textbooks, classroom video courses, online/offline labs, and school kits for K12 institutions.',
  },
  courses: {
    title: `AI Courses for Kids & Teens — IOAI, Foundations & K12 | ${BRAND}`,
    description:
      'Browse AI video courses, training labs, and classroom programs across IOAI competition, Foundations, and K12 school editions.',
  },
  labs: {
    title: `AI Labs & Experiment Kits — Hands-On Learning | ${BRAND}`,
    description:
      'Gamified in-browser AI experiments and structured lab packs — learn machine learning by doing.',
  },
  news: {
    title: `AI Education News & Insights | ${BRAND}`,
    description:
      'Latest articles on AI classes for kids, USAAIO prep, K-12 AI curriculum, and IOAI competition training.',
  },
  curriculum: {
    title: `IOAI Curriculum — Structured AI Learning Path | ${BRAND}`,
    description:
      'Structured IOAI curriculum from Python foundations through machine learning and neural networks.',
  },
  cert: {
    title: `AI Certification Programs | ${BRAND}`,
    description:
      'Earn AI literacy and competition certifications through structured learning paths at Bingo Academy.',
  },
  privacy: {
    title: `Privacy Policy | ${BRAND}`,
    description: `How ${BRAND} collects, uses, and protects student and family data.`,
  },
  about: {
    title: `About ${BRAND} — Mission, Team & Contact`,
    description: `Legal identity, mission, service areas, and contact for ${BRAND} K–12 AI education.`,
  },
  instructors: {
    title: `Core Instructors & Researchers | ${BRAND}`,
    description: `Named faculty profiles with education, research areas, course roles, and reviewed guides.`,
  },
  methodology: {
    title: `Teaching Methodology & Research Basis | ${BRAND}`,
    description: `VUA framework, assessment design, competition alignment, and cited public research — not institutional endorsements.`,
  },
  outcomes: {
    title: `Outcomes & Case Studies | ${BRAND}`,
    description: `Anonymized learning outcomes with sample sizes, measurement methods, and links to student work.`,
  },
  safetyPrivacy: {
    title: `Child Safety & Data Privacy | ${BRAND}`,
    description: `What child data we collect, camera use, third parties, retention, deletion, and AI training policy.`,
  },
}

export const PROGRAMS = [
  {
    slug: 'ioai',
    icon: '🏆',
    heroHeadline: 'Competition-ready AI training',
    heroBody:
      'Video courses and intensive training camps aligned to IOAI whitelist formats — from first concepts to mock assessments.',
    audience: 'For students & competition teams',
  },
  {
    slug: 'foundations',
    icon: '🎓',
    heroHeadline: 'Learn AI at your own pace',
    heroBody:
      'Structured video courses, cloud labs, and home experiment kits — build literacy from curiosity to certified outcomes.',
    audience: 'For self-learners & career changers',
  },
  {
    slug: 'k12',
    icon: '🏫',
    heroHeadline: 'Complete AI classroom for schools',
    heroBody:
      'Textbooks, teacher packs, online and offline labs, and bulk kits — one partner for campus rollout.',
    audience: 'For schools & educators',
  },
]

export const LANDING_SEO = {
  '/ai-classes-for-kids': {
    title: `AI Classes for Kids | Free Trial | ${BRAND}`,
    keywords:
      'AI Classes for Kids, AI Course for Kids, Artificial Intelligence for Children, AI Camp, AI Learning, STEM Education, AI Coding, AI for Teens',
    description: `Learn AI through fun, hands-on projects designed for kids ages 13–18. Book a free AI class today and help your child build future-ready skills with ${BRAND}.`,
    ogTitle: `AI Classes for Kids — Free Trial | ${BRAND}`,
    ogDescription:
      'Project-based AI classes for teens. No coding experience required. Book a free trial class today.',
    h1: 'Give Your Child an AI Superpower.',
    body: 'Fun, project-based AI classes that help kids create, explore, and innovate with Artificial Intelligence. Designed for ages 13–18. No coding experience required.',
  },
  '/usaaio-prep': {
    title: `USAAIO Prep Course | AI Olympiad Training for Teens | ${BRAND}`,
    keywords:
      'USAAIO prep course, AI Olympiad training for teens, USAAIO curriculum, High school AI competition prep, Machine learning course for high school, Deep learning for teens, Computer vision classes for students',
    description:
      'Stop using AI as a black box. Rigorous USAAIO prep course for grades 7–12 — Python, math for AI, machine learning, and Olympiad training. Book a free assessment.',
    ogTitle: 'USAAIO Prep Course — Elite AI Olympiad Training',
    ogDescription:
      'Competition-focused AI training for USAAIO, IAIO & IOAI. No prior coding required. Grades 7–12.',
    h1: 'Build the AI Skills That Top Universities Notice',
    body: `Competition Training for USAAIO, IAIO & IOAI. ${BRAND} helps motivated middle and high school students master Artificial Intelligence through competition-focused training, real-world projects, and university-level AI foundations.`,
  },
  '/try-ai': {
    title: `Try AI — Play Cyber Tennis in Your Browser | ${BRAND}`,
    description:
      'No sign-up. Turn on your camera and play AI Cyber Tennis — pose tracking, real-time physics, zero install. Free browser AI lab.',
    h1: 'Play AI. Feel the magic.',
    body: 'Your webcam becomes a cyber squash court — MoveNet tracks every swing in real time. Free browser AI lab, no sign-up required.',
  },
  '/ioai-masterclass': {
    title: `IOAI Masterclass — Competition-Ready AI Training | ${BRAND}`,
    description:
      'Professor-led IOAI curriculum: Python → Machine Learning → Neural Networks. Dual-pane Jupyter labs, competition outcomes, Stripe checkout.',
    h1: 'The systematic path to IOAI — from Python to neural nets',
    body: 'University-grade curriculum with Kaggle-style dual-pane labs, written-exam prep, and defence-ready project portfolios — built for families who care about outcomes, not hype.',
  },
}

export function getProgram(slug) {
  return PROGRAMS.find((p) => p.slug === slug) ?? null
}

export function getStaticSeoForPath(pathname) {
  const courseSeo = coursesSeoForPathname(pathname)
  if (courseSeo) {
    return { ...courseSeo, path: courseSeo.canonical || pathname }
  }

  if (pathname === '/') return { ...PAGE_SEO.home, path: '/' }

  const landing = LANDING_SEO[pathname]
  if (landing) return { ...landing, path: pathname }

  const staticMap = {
    '/compare': PAGE_SEO.compare,
    '/exploration': PAGE_SEO.exploration,
    '/labs': PAGE_SEO.labs,
    '/news': PAGE_SEO.news,
    '/curriculum': PAGE_SEO.curriculum,
    '/privacy': PAGE_SEO.privacy,
    '/about': PAGE_SEO.about,
    '/instructors': PAGE_SEO.instructors,
    '/methodology': PAGE_SEO.methodology,
    '/outcomes': PAGE_SEO.outcomes,
    '/safety-and-privacy': PAGE_SEO.safetyPrivacy,
    '/cert': PAGE_SEO.cert,
    '/showcase': {
      title: `Student Showcase — AI Projects & Awards | ${BRAND}`,
      description: `Explore student AI projects, competition awards, and venture showcases from ${BRAND} learners.`,
    },
    '/mall': {
      title: `IOAI Course Store | ${BRAND}`,
      description: 'Browse and purchase IOAI competition training modules, lab packs, and course bundles.',
    },
    '/community': {
      title: `AI Learning Community | ${BRAND}`,
      description: `Connect with mentors, scholars, and fellow AI learners in the ${BRAND} community.`,
    },
    '/assessment': {
      title: `Free AI Assessment | ${BRAND}`,
      description: 'Book a free AI competition assessment to find the right learning path for your student.',
    },
  }

  const entry = staticMap[pathname]
  if (entry) return { ...entry, path: pathname }

  const programMatch = pathname.match(/^\/programs\/([^/]+)$/)
  if (programMatch) {
    const slug = programMatch[1]
    const program = getProgram(slug)
    const seo = PAGE_SEO[slug]
    if (program && seo) {
      return {
        ...seo,
        path: pathname,
        h1: program.heroHeadline,
        body: program.heroBody,
        audience: program.audience,
      }
    }
  }

  return null
}
