/** Marketing + narrative content for /about — stats from organizationFacts.js */

import {
  ORGANIZATION_FACTS,
  organizationCtaBody,
  organizationImpactHeadline,
  organizationStatsFootnote,
  organizationStatsItems,
} from './organizationFacts.js'
import { INDEPENDENT_PROVIDER_DISCLAIMER } from './trust/about.js'

export const ABOUT_PAGE_META = {
  title: 'About Bingo Academy | K–12 AI Education',
  description:
    'Learn how Bingo Academy helps K–12 students understand AI fundamentals, implement models in Python, and apply them through reproducible projects, labs, and competition preparation.',
}

export const ABOUT_PAGE_HERO = {
  eyebrow: 'K–12 AI Education',
  title: 'We teach students to understand and build AI—not just use it.',
  subtitle:
    'Bingo Academy helps K–12 students learn the principles behind machine learning, implement models in Python, and explain their results through reproducible labs, real projects, and competition-style problem solving.',
  primaryCta: { label: 'Try a Free AI Lab', href: '/exploration' },
  secondaryCta: { label: 'Find Your Learning Path', href: '#learning-paths' },
  image: {
    src: '/images/about-hero.png',
    alt: 'Student studying at a desk while using the Bingo Academy platform to train a machine learning classification model in a Jupyter notebook',
  },
  floatCards: [
    { label: 'Student Project', title: 'Chatbot for Elderly Care', tag: 'Capstone', tagClass: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lab Activity', title: 'Image Classifier in 30 min', tag: 'Live Lab', tagClass: 'bg-cyan-100 text-cyan-800' },
  ],
}

export const ABOUT_LEARNING = {
  eyebrow: 'Curriculum',
  title: 'What students actually learn',
  intro:
    'Students move from concepts to code to documented results — not prompt-only demos. Every pathway builds the same core competencies with age-appropriate scaffolding.',
  items: [
    {
      title: 'Machine learning principles',
      body: 'Loss functions, training vs. inference, bias-variance tradeoffs, and when a model is appropriate — explained in plain language before any library calls.',
    },
    {
      title: 'Python implementation',
      body: 'Students write real code in Jupyter notebooks: data loading, model training, evaluation loops, and reproducible experiment cells.',
    },
    {
      title: 'Reproducible labs',
      body: 'Fixed seeds, documented train/validation splits, checkpoint rubrics, and README-style lab reports — the same structure competition and research workflows expect.',
    },
    {
      title: 'Projects & portfolios',
      body: 'Capstone work in computer vision, NLP, and applied ML — with error analysis, limitations sections, and defence-ready documentation.',
    },
    {
      title: 'Competition-style problem solving',
      body: 'Timed written rounds, mock assessments, and structured defence practice aligned to publicly available IOAI task formats — preparation, not outcome guarantees.',
    },
  ],
}

export const ABOUT_EVIDENCE = {
  eyebrow: 'Evidence',
  title: 'Evidence & outcomes',
  intro:
    'We publish cohort metrics with sample sizes and methods — not vanity counters. Explore anonymized outcomes, assessment rubrics, and verifiable credentials.',
  footnote: organizationStatsFootnote(),
  links: [
    { label: 'Outcomes & case studies', href: '/outcomes', desc: 'Cohort metrics with sample sizes and measurement methods' },
    { label: 'First-party evidence hub', href: '/guides/evidence', desc: 'Citable primary sources and rubrics' },
    { label: 'Certification verification', href: '/cert', desc: 'Verify learner credentials online' },
  ],
}

export const ABOUT_SAFETY = {
  eyebrow: 'Safety',
  title: 'Child safety & data use',
  intro:
    'K–12 products require clear data boundaries. We document what we collect from learners, what we never use student content for, and how schools can configure generative features.',
  highlights: [
    'Parent/guardian consent flows for under-13 accounts',
    'Student notebook and forum content is not used to train public AI models',
    'School deployments can disable generative AI features entirely',
  ],
  href: '/safety-and-privacy',
  cta: 'Read safety & privacy details →',
}

export const ABOUT_INSTRUCTORS = {
  eyebrow: 'Faculty',
  title: 'Instructors & academic review',
  intro:
    'Named instructors design courses, publish responsibilities on public profiles, and peer-review guides against competition rubrics and K–12 standards.',
  profilesHref: '/instructors',
  profilesCta: 'View full instructor profiles →',
  reviewLinks: [
    { label: 'Teaching methodology', href: '/methodology' },
    { label: 'IOAI syllabus ↔ module mapping', href: '/guides/ioai/syllabus-module-mapping' },
    { label: 'Mock assessment rubric', href: '/guides/ioai/mock-assessment-rubric' },
    { label: 'K–12 standards alignment', href: '/guides/k12/standards-alignment' },
  ],
}

export const ABOUT_WHY_EXIST = {
  eyebrow: 'Why We Exist',
  title: 'Three problems we can\'t ignore.',
  intro:
    'AI is reshaping every industry. But K-12 education is missing the train. We built Bingo Academy to fix that.',
  pains: [
    {
      icon: '📚',
      title: 'Resource Gap',
      body: 'Many schools still lack classroom-ready AI curriculum and labs — no trained teachers, no structured pathways, and limited hands-on tools.',
      accent: 'cyan',
    },
    {
      icon: '🌍',
      title: 'Teacher Gap',
      body: 'AI experts are rare and expensive. Most students only learn theory — they never actually build an AI system with their own hands.',
      accent: 'emerald',
    },
    {
      icon: '⚡',
      title: 'Application Gap',
      body: 'Students retain concepts better when they apply and explain them. We teach kids to build, document, and defend real AI work — not memorize for exams.',
      accent: 'amber',
    },
  ],
}

export const ABOUT_STORY = {
  id: 'our-story',
  eyebrow: 'Our Story',
  title: 'From a simple idea to a global mission.',
  intro:
    `We started with one question: "Why aren't more kids learning AI?" What began in ${ORGANIZATION_FACTS.brandLaunchYear} is now reaching students on four continents.`,
  timeline: [
    {
      when: '2022 · Spring',
      title: 'The Spark',
      body: 'Our team gathered in Chengdu to ask a simple question: "Why is K-12 AI education still missing from most schools?" The answer led to Bingo Academy.',
      dot: 'primary',
    },
    {
      when: '2024 · Q1',
      title: 'K-12 School Edition',
      body: 'The complete K-12 curriculum — textbooks, video lessons, online labs, and offline kits — entered international schools.',
      dot: 'emerald',
    },
    {
      when: '2025 · Summer',
      title: 'First Cohort',
      body: 'Our IOAI training program launched. The first cohort of high school students completed competition-style projects and assessments.',
      dot: 'primary',
    },
    {
      when: 'Today · 2026',
      title: organizationImpactHeadline(),
      body: 'From a single idea to a global community. We\'re just getting started.',
      highlight: true,
    },
  ],
}

export const ABOUT_PRODUCTS = {
  id: 'learning-paths',
  eyebrow: 'Learning Paths',
  title: 'Choose your learning path.',
  intro: 'Family programs serve ages 13–18. School curriculum supports grades 4–12. Each path links to a detailed program page.',
  items: [
    {
      icon: '🎬',
      tag: 'Self-Paced',
      title: 'AI General Course',
      body: 'From zero to AI-literate. Video lessons, interactive labs, experiment kits mailed to your door.',
      audience: 'For: Adults · Career changers',
      href: '/courses/foundations',
      accent: 'cyan',
    },
    {
      icon: '🏆',
      tag: 'Competition',
      title: 'IOAI Training',
      body: 'Prepare for AI olympiads. Specialized training for the International Olympiad in AI and similar competitions.',
      audience: 'For: High schoolers · Coaches',
      href: '/courses/ioai',
      accent: 'amber',
    },
    {
      icon: '🏫',
      tag: 'For Schools',
      title: 'K-12 School Edition',
      body: 'Complete AI curriculum for schools: textbooks, video lessons, online + offline experiments and kits.',
      audience: 'For: K-12 schools · Districts',
      href: '/courses/k12',
      accent: 'violet',
    },
    {
      icon: '🧪',
      tag: 'Hands-On',
      title: 'AI Exploration Lab',
      body: '100% online. No installation. Build CV, NLP, and RL projects right in your browser with real-time feedback.',
      audience: 'For: Makers · Hobbyists',
      href: '/exploration',
      accent: 'emerald',
    },
  ],
}

export const ABOUT_METHODOLOGY = {
  eyebrow: 'How We Teach',
  headline: 'From first principles to working models.',
  tagline: 'Concept-first. Code-based. Evidence-driven.',
  flow: 'Understand → Implement → Experiment → Evaluate → Explain',
  steps: [
    { n: 1, title: 'Understand', body: 'Learn the mathematical and conceptual foundations.' },
    { n: 2, title: 'Implement', body: 'Translate algorithms into working Python code.' },
    { n: 3, title: 'Experiment', body: 'Train models, change variables, and reproduce results.' },
    { n: 4, title: 'Evaluate', body: 'Analyze metrics, errors, limitations, and model behavior.' },
    { n: 5, title: 'Explain', body: 'Document findings, defend decisions, and apply the work to projects or competitions.' },
  ],
  methodologyHref: '/methodology',
}

export const ABOUT_STATS = {
  eyebrow: 'By the Numbers',
  title: 'Real impact, real numbers.',
  intro: 'No fluff. Here\'s where we are today.',
  footnote: organizationStatsFootnote(),
  items: organizationStatsItems(),
}

export const ABOUT_TEAM = {
  eyebrow: 'Faculty',
  title: 'Core instructors',
  intro: 'Founding faculty who design curriculum and review assessment rubrics.',
  members: [
    {
      name: 'Dr. James Chen',
      role: 'Founder & CEO',
      bio: 'Professor · 20+ years AI research, curriculum design, and competition-grade vision pipelines for K–12 learners.',
      initials: 'JC',
      slug: 'james-chen',
      ring: 'ring-cyan-200 group-hover:ring-primary',
    },
    {
      name: 'Dr. Michelle Xu',
      role: 'Co-Founder',
      bio: 'AI scientist · Pedagogy, learning science, and age-appropriate AI lab design.',
      initials: 'MX',
      slug: 'michelle-xu',
      ring: 'ring-emerald-200 group-hover:ring-emerald-500',
    },
    {
      name: 'Dr. Shannon Wang',
      role: 'Co-Founder',
      bio: 'LLM & deep learning · Co-founder of ScholarOne LLC (USA). International competition mentorship.',
      initials: 'SW',
      slug: 'shannon-wang',
      ring: 'ring-violet-200 group-hover:ring-violet-500',
    },
  ],
  hiringNote: 'More team members joining soon.',
  hiringEmail: 'hello@bingoacademy.org',
}

export const ABOUT_PARTNERS = {
  eyebrow: 'References & Relationships',
  title: 'Curriculum references and institutional relationships.',
  intro: 'Our programs reference public competition syllabi and documented relationships with education institutions.',
  featured: {
    name: 'IOAI',
    subtitle: 'International Olympiad in Artificial Intelligence',
    href: 'https://ioai-official.org/',
    cta: 'IOAI official site →',
  },
  competitionReference: {
    title: 'Competition Curriculum Reference',
    body: 'Our competition preparation references the publicly available IOAI syllabus and task formats.',
  },
  disclaimer: INDEPENDENT_PROVIDER_DISCLAIMER,
  placeholders: ['Partner Logo', 'School Logo', 'Media Logo', 'More Coming'],
}

export const ABOUT_COMPETITION_DISCLAIMER = {
  title: 'Independent competition disclaimer',
  reference: {
    title: 'Competition Curriculum Reference',
    body: 'Our competition preparation references the publicly available IOAI syllabus and task formats.',
  },
  disclaimer: INDEPENDENT_PROVIDER_DISCLAIMER,
  ioai: {
    name: 'IOAI',
    subtitle: 'International Olympiad in Artificial Intelligence',
    href: 'https://ioai-official.org/',
    cta: 'IOAI official site →',
  },
}

export const ABOUT_AUDIENCE_CTA = {
  id: 'get-started',
  title: 'Find the right path for you',
  intro: 'Beginner and advanced pathways are available — choose the entry point that matches your role.',
  audiences: [
    {
      label: 'Families',
      desc: 'Self-paced courses and live programs for ages 13–18. Start with a free exploration lab or book a trial.',
      cta: 'Browse family courses',
      href: '/courses',
    },
    {
      label: 'Schools',
      desc: 'Classroom editions for grades 4–12 with teacher guides, rubrics, and procurement-ready privacy docs.',
      cta: 'Contact school partnerships',
      href: 'mailto:schools@bingoacademy.org?subject=School%20partnership%20inquiry',
      external: true,
    },
    {
      label: 'Competition teams',
      desc: 'Structured IOAI preparation with mock assessments and defence coaching — aligned to public syllabus formats.',
      cta: 'Explore IOAI training',
      href: '/courses/ioai',
    },
  ],
  footnote: `Used by verified learners in ${ORGANIZATION_FACTS.countriesWithActiveLearners} countries · ${organizationStatsFootnote()}`,
}

export const ABOUT_TESTIMONIALS = {
  eyebrow: 'Stories from Our Community',
  title: 'What families say.',
  intro: 'Real stories from students, parents, and teachers in our community.',
  placeholder:
    'Real student/parent story coming soon — this placeholder will be replaced with verified testimonials from our community.',
  shareEmail: 'hello@bingoacademy.org',
}

export const ABOUT_CTA = {
  id: 'get-started',
  title: 'Ready to start your AI journey?',
  body: organizationCtaBody(),
  primary: { label: 'Start Free Trial', href: '/courses' },
  secondary: {
    label: 'Talk to Our Team',
    href: 'mailto:hello@bingoacademy.org?subject=Talk%20to%20Team',
    external: true,
  },
  footnote: `No credit card required · Cancel anytime · Used by verified learners in ${ORGANIZATION_FACTS.countriesWithActiveLearners} countries`,
}
