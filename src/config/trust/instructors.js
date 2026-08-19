/**
 * Core instructor profiles — canonical source for /instructors/:slug
 * Each profile must be verifiable; external links only when published by the instructor.
 */

import { INDEPENDENT_PROVIDER_DISCLAIMER } from './about.js'
import { SITE_LEGAL_ENTITY } from '../siteConstants.js'

const AFFILIATION_DISCLOSURE =
  'Personal university or industry affiliations listed on this profile describe the instructor\'s credentials and do not imply institutional endorsement of Bingo Academy unless explicitly documented.'

export const INSTRUCTORS_HUB = {
  version: '2026.2',
  updatedAt: '2026-08-19',
  title: 'Core instructors & curriculum researchers',
  excerpt:
    'Named faculty who design, teach, or peer-review Bingo Academy courses — with education history, research areas, and published responsibilities.',
}

export const CORE_INSTRUCTORS = [
  {
    slug: 'james-chen',
    name: 'Dr. James Chen',
    legalName: 'Jianwen Chen (陈建文)',
    currentRole: 'Founder & CEO, Bingo Academy',
    title: 'Professor · University of Electronic Science and Technology of China (UESTC)',
    photo: '/mentors/jianwen-chen.jpg',
    tag: 'Computer Vision & Affective Computing',
    bio:
      'Professor with 20+ years in video processing and AI algorithms. Designs competition-grade vision pipelines and mentors students on reproducible experiment documentation.',
    education: [
      'Ph.D., Computer Science — research in video processing and multimodal AI',
      'Professor & doctoral supervisor, UESTC',
      'Director, Visual Intelligence Research Center, UESTC',
    ],
    researchBackground: [
      'Video processing and compression',
      'Multimodal feature fusion',
      'Affective computing and visual intelligence',
      'Competition-grade computer-vision pipelines for K–12 learners',
    ],
    topicsTaught: [
      'Computer vision fundamentals',
      'Multimodal AI and feature fusion',
      'OpenCV and neural network workflows',
      'Competition notebook documentation and defence preparation',
    ],
    coursesAuthored: [
      { label: 'IOAI Competition Training — computer-vision modules', href: '/courses/ioai' },
      { label: 'K-12 School Edition — vision & perception sequences', href: '/courses/k12' },
      { label: 'AI Exploration Lab — browser vision experiments', href: '/exploration' },
    ],
    reviewedGuides: [
      { label: 'Mock assessment rubric', href: '/guides/ioai/mock-assessment-rubric' },
      { label: 'Sample notebook & report', href: '/guides/ioai/sample-notebook-report' },
      { label: 'IOAI syllabus ↔ module mapping', href: '/guides/ioai/syllabus-module-mapping' },
    ],
    selectedPublications: [
      '200+ peer-reviewed papers in video processing and visual intelligence',
      'National research grants — Visual Intelligence Research Center, UESTC',
    ],
    scholarlyProfiles: [
      { type: 'Institution', label: 'UESTC Visual Intelligence Research Center', href: 'https://www.uestc.edu.cn/', external: true },
    ],
    disclosure: `${INDEPENDENT_PROVIDER_DISCLAIMER} ${AFFILIATION_DISCLOSURE}`,
  },
  {
    slug: 'michelle-xu',
    name: 'Dr. Michelle Xu',
    legalName: 'Michelle Xu',
    currentRole: 'Co-Founder, Bingo Academy',
    title: 'Co-Founder · AI Scientist',
    photo: '/mentors/feng-xu.jpg',
    tag: 'Pedagogy & Computer Vision',
    bio:
      'AI scientist focused on pedagogy, learning science, and age-appropriate AI lab design. Brings industry-grade perception research into structured K–12 pathways.',
    education: [
      'Ph.D., Tsinghua University',
      'Postdoctoral fellow, University of Pennsylvania',
      'Former researcher, Samsung Research America & Thomson',
    ],
    researchBackground: [
      'Computer vision and multimodal intelligence',
      'Learning science and age-appropriate lab scaffolding',
      'Industrial deployment of perception models',
      'Patent portfolio in mobile vision systems',
    ],
    topicsTaught: [
      'K–12 AI pedagogy and learning progressions',
      'Computer vision and multimodal AI',
      'Browser and Jupyter lab design',
      'Teacher training and classroom implementation',
    ],
    coursesAuthored: [
      { label: 'K-12 School Edition — classroom curriculum & teacher guides', href: '/courses/k12' },
      { label: 'AI General Course — foundations pathway', href: '/courses/foundations' },
      { label: 'AI Exploration Lab — guided browser experiments', href: '/exploration' },
    ],
    reviewedGuides: [
      { label: 'Spot prompt-only courses', href: '/guides/parents/spot-prompt-only-courses' },
      { label: 'K–12 curriculum map', href: '/guides/k12/curriculum-map' },
      { label: 'K–12 standards alignment', href: '/guides/k12/standards-alignment' },
    ],
    selectedPublications: [
      '50+ international patents in mobile vision systems',
      'Samsung innovation awards — industrial perception research',
    ],
    scholarlyProfiles: [
      { type: 'Institution', label: 'Beijing Academy of Artificial Intelligence', href: 'https://www.baai.ac.cn/', external: true },
    ],
    disclosure: `${INDEPENDENT_PROVIDER_DISCLAIMER} ${AFFILIATION_DISCLOSURE}`,
  },
  {
    slug: 'shannon-wang',
    name: 'Dr. Shannon Wang',
    legalName: 'Shannon Wang (王爽)',
    currentRole: 'Co-Founder, Bingo Academy',
    title: 'Co-Founder · AI Scientist',
    photo: '/mentors/shuang-wang.jpg',
    tag: 'LLMs & Deep Learning',
    bio:
      'Specialises in LLMs, multimodal intelligence, and deep learning. Leads curriculum architecture, VUA pedagogical framework, and US-facing program operations.',
    education: [
      'Ph.D., University of Missouri, USA',
      'Co-founder, Lava Education & ScholarOne LLC (USA)',
    ],
    researchBackground: [
      'Large language models and multimodal fusion',
      'Deep learning for sensor networks',
      'US patent holder — AI sensor network systems',
      'International competition mentorship and assessment design',
    ],
    topicsTaught: [
      'Large language models and prompt engineering',
      'Deep learning fundamentals',
      'Vision–Understanding–Action (VUA) pedagogy',
      'Competition-style problem solving and mock assessments',
    ],
    coursesAuthored: [
      { label: 'IOAI Competition Training — Builder & Engineer stages', href: '/courses/ioai' },
      { label: 'USAAIO Prep pathway', href: '/usaaio-prep' },
      { label: 'Teaching methodology (VUA framework)', href: '/methodology' },
    ],
    reviewedGuides: [
      { label: 'Annual IOAI rule changes', href: '/guides/ioai/annual-rule-changes' },
      { label: 'IOAI competition map & qualification flow', href: '/guides/ioai/competition-map' },
      { label: 'K–12 sample semester plan', href: '/guides/k12/sample-semester-plan' },
    ],
    selectedPublications: [
      'US patent — AI sensor network systems',
      'International competition mentorship and curriculum architecture',
    ],
    scholarlyProfiles: [
      { type: 'Institution', label: SITE_LEGAL_ENTITY, href: '/about', external: false },
    ],
    disclosure: `${INDEPENDENT_PROVIDER_DISCLAIMER} ${AFFILIATION_DISCLOSURE}`,
  },
]

const INSTRUCTOR_SLUG_ALIASES = {
  'jianwen-chen': 'james-chen',
  'feng-xu': 'michelle-xu',
  'shuang-wang': 'shannon-wang',
  'wenyi-wang': 'james-chen',
}

export function getInstructor(slug) {
  const resolved = INSTRUCTOR_SLUG_ALIASES[slug] ?? slug
  return CORE_INSTRUCTORS.find((i) => i.slug === resolved) ?? null
}

export function getAllInstructorPaths() {
  const paths = [
    { path: '/instructors', changefreq: 'monthly', priority: '0.8', lastmod: INSTRUCTORS_HUB.updatedAt },
  ]
  for (const instructor of CORE_INSTRUCTORS) {
    paths.push({
      path: `/instructors/${instructor.slug}`,
      changefreq: 'monthly',
      priority: '0.75',
      lastmod: INSTRUCTORS_HUB.updatedAt,
    })
  }
  return paths
}
