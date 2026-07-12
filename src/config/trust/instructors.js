/**
 * Core instructor profiles — canonical source for /instructors/:slug
 * Each profile must be verifiable; external links only when published by the instructor.
 */

export const INSTRUCTORS_HUB = {
  version: '2026.1',
  updatedAt: '2026-03-01',
  title: 'Core instructors & curriculum researchers',
  excerpt:
    'Named faculty who design, teach, or peer-review Bingo Academy courses — with education history, research areas, and published responsibilities.',
}

export const CORE_INSTRUCTORS = [
  {
    slug: 'jianwen-chen',
    name: 'Jianwen Chen',
    nameLocal: '陈建文',
    title: 'Professor · University of Electronic Science and Technology of China (UESTC)',
    photo: '/mentors/jianwen-chen.jpg',
    tag: 'Computer Vision & Affective Computing',
    education: [
      'Ph.D., Computer Science — research in video processing and multimodal AI',
      'Professor & doctoral supervisor, UESTC',
      'Director, Visual Intelligence Research Center, UESTC',
    ],
    researchAreas: [
      'Video processing and compression',
      'Multimodal feature fusion',
      'Affective computing and visual intelligence',
    ],
    courseRoles: [
      'IOAI computer-vision module architecture',
      'Peer review of capstone rubrics and defence standards',
      'Faculty advisor on embodied-AI lab sequences',
    ],
    publications: '200+ peer-reviewed papers; national research grants in visual intelligence',
    profiles: [
      { type: 'Institution', label: 'UESTC Visual Intelligence Research Center', href: 'https://www.uestc.edu.cn/', external: true },
    ],
    reviewedGuides: [
      { label: 'Mock assessment rubric', href: '/guides/ioai/mock-assessment-rubric' },
      { label: 'Sample notebook & report', href: '/guides/ioai/sample-notebook-report' },
    ],
    bio:
      'Over 20 years in video processing and AI algorithms. Designs competition-grade vision pipelines and mentors students on reproducible experiment documentation.',
  },
  {
    slug: 'wenyi-wang',
    name: 'Wenyi Wang',
    nameLocal: '王文艺',
    title: 'Associate Professor · UESTC',
    photo: '/mentors/wenyi-wang.jpg',
    tag: 'Data Mining & Machine Learning',
    education: [
      'Ph.D., University of Ottawa, Canada',
      'M.Sc., University of Ottawa, Canada',
    ],
    researchAreas: ['Data mining', 'Machine learning optimisation', 'AI systems for education analytics'],
    courseRoles: [
      'IOAI Builder stage — supervised learning & evaluation metrics',
      'Assessment item design for placement tests',
      'Data-literacy modules in Foundations program',
    ],
    publications: 'Best-paper awards; industry AI advisory panels',
    profiles: [
      { type: 'Institution', label: 'UESTC', href: 'https://www.uestc.edu.cn/', external: true },
    ],
    reviewedGuides: [
      { label: 'Math & coding readiness', href: '/guides/parents/math-and-coding-readiness' },
      { label: 'Preparation routes by background', href: '/guides/ioai/preparation-routes' },
    ],
    bio:
      'UESTC AI faculty spanning data mining and algorithm optimisation. Focuses on measurable learning outcomes and error-analysis discipline in student notebooks.',
  },
  {
    slug: 'feng-xu',
    name: 'Feng Xu',
    nameLocal: '徐峰',
    title: 'AI Scientist · Beijing Academy of Artificial Intelligence (BAAI)',
    photo: '/mentors/feng-xu.jpg',
    tag: 'Computer Vision & Multimodal AI',
    education: [
      'Ph.D., Tsinghua University',
      'Postdoctoral fellow, University of Pennsylvania',
      'Former researcher, Samsung Research America & Thomson',
    ],
    researchAreas: [
      'Computer vision and multimodal intelligence',
      'Industrial deployment of perception models',
      'Patent portfolio in mobile vision systems',
    ],
    courseRoles: [
      'IOAI Engineer stage — CNN workflows and deployment',
      'Browser lab stack (TensorFlow.js, pose models)',
      'Competition notebook quality standards',
    ],
    publications: '50+ international patents; Samsung innovation awards',
    profiles: [
      { type: 'Institution', label: 'Beijing Academy of Artificial Intelligence', href: 'https://www.baai.ac.cn/', external: true },
    ],
    reviewedGuides: [
      { label: 'IOAI syllabus ↔ module mapping', href: '/guides/ioai/syllabus-module-mapping' },
      { label: 'Spot prompt-only courses', href: '/guides/parents/spot-prompt-only-courses' },
    ],
    bio:
      'BAAI researcher and Beijing High-Level Overseas Talent. Brings industry-grade vision pipelines into age-appropriate browser and Jupyter labs.',
  },
  {
    slug: 'shuang-wang',
    name: 'Shuang Wang',
    nameLocal: '王爽',
    title: 'Ph.D. · AI Scientist & Curriculum Co-founder',
    photo: '/mentors/shuang-wang.jpg',
    tag: 'LLMs & Deep Learning',
    education: [
      'Ph.D., University of Missouri, USA',
      'Co-founder, Lava Education & ScholarOne LLC (USA)',
    ],
    researchAreas: [
      'Large language models and multimodal fusion',
      'Deep learning for sensor networks',
      'US patent holder — AI sensor network systems',
    ],
    courseRoles: [
      'Vision–Understanding–Action (VUA) pedagogical framework',
      'LLM safety modules and teacher training',
      'International competition mentorship',
    ],
    publications: 'US patent holder; international competition mentor',
    profiles: [
      { type: 'Institution', label: 'ScholarOne LLC', href: 'https://www.bingoacademy.org/about', external: false },
    ],
    reviewedGuides: [
      { label: 'Annual IOAI rule changes', href: '/guides/ioai/annual-rule-changes' },
      { label: 'K–12 curriculum map', href: '/guides/k12/curriculum-map' },
      { label: 'Teaching methodology', href: '/methodology' },
    ],
    bio:
      'Specialises in LLMs, multimodal intelligence, and deep learning. Leads curriculum architecture and US-facing program operations.',
  },
]

export function getInstructor(slug) {
  return CORE_INSTRUCTORS.find((i) => i.slug === slug) ?? null
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
