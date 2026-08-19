/** Marketing + narrative content for /about — honest stats; TBD where unverified */

export const ABOUT_PAGE_HERO = {
  eyebrow: 'AI Education for the Next Generation',
  title: 'We teach kids to build AI, not just use it.',
  subtitle:
    'BingoAcademy.org helps K-12 students learn artificial intelligence by building real projects, winning real competitions, and solving real problems.',
  primaryCta: { label: 'Get Started for Free', href: '/courses' },
  secondaryCta: { label: 'See Our Story', href: '#our-story' },
  image: {
    src: '/images/about-hero.png',
    alt: 'Student training a neural network in a Jupyter notebook with PyTorch on a laptop',
  },
  floatCards: [
    { label: 'Student Project', title: 'Chatbot for Elderly Care', tag: 'Won 1st', tagClass: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lab Activity', title: 'Image Classifier in 30 min', tag: 'Live Lab', tagClass: 'bg-cyan-100 text-cyan-800' },
  ],
}

export const ABOUT_WHY_EXIST = {
  eyebrow: 'Why We Exist',
  title: 'Three problems we can\'t ignore.',
  intro:
    'AI is reshaping every industry. But K-12 education is missing the train. We built BingoAcademy.org to fix that.',
  pains: [
    {
      icon: '📚',
      title: 'Resource Gap',
      body: 'Most schools can\'t teach AI — no trained teachers, no curriculum, no tools. Students graduate having never written a line of code.',
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
      body: '95% of students forget what they learn in 30 days. AI isn\'t a test subject — it\'s a tool. We teach kids to ship real projects, not pass exams.',
      accent: 'amber',
    },
  ],
}

export const ABOUT_STORY = {
  id: 'our-story',
  eyebrow: 'Our Story',
  title: 'From a simple idea to a global mission.',
  intro:
    'We started with one question: "Why aren\'t more kids learning AI?" What began in 2022 is now reaching students on four continents.',
  timeline: [
    {
      when: '2022 · Spring',
      title: 'The Spark',
      body: 'Our team gathered in Chengdu to ask a simple question: "Why is K-12 AI education still missing from most schools?" The answer led to BingoAcademy.org.',
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
      body: 'Our IOAI training program launched. The first batch of high school students joined — many went on to win regional competitions.',
      dot: 'primary',
    },
    {
      when: 'Today · 2026',
      title: '20,000+ students · 1,000+ schools · 4 countries',
      body: 'From a single idea to a global community. We\'re just getting started.',
      highlight: true,
    },
  ],
}

export const ABOUT_PRODUCTS = {
  eyebrow: 'What We Teach',
  title: 'Four ways to learn AI.',
  intro: 'Whether you\'re a curious beginner, a competition student, or a school — we have a path for you.',
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
      body: 'Win AI olympiads. Specialized training for the International Olympiad in AI and similar competitions.',
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
  title: 'Project-based. Competition-driven.',
  intro: 'Forget lectures. Every student builds, ships, and competes.',
  steps: [
    { n: 1, title: 'Spark', body: 'Real-world problems spark curiosity.' },
    { n: 2, title: 'Explore', body: 'Guided experiments unlock concepts.' },
    { n: 3, title: 'Build', body: 'Students ship real AI projects.' },
    { n: 4, title: 'Compete', body: 'They enter IOAI and global competitions.' },
    { n: 5, title: 'Reflect', body: 'We debrief, document, and share.' },
  ],
  methodologyHref: '/methodology',
}

export const ABOUT_STATS = {
  eyebrow: 'By the Numbers',
  title: 'Real impact, real numbers.',
  intro: 'No fluff. Here\'s where we are today.',
  footnote: 'Numbers reflect verified data as of 2026. Updated quarterly.',
  items: [
    { value: '20,000+', label: 'Students' },
    { value: '4', label: 'Countries' },
    { value: '1,000+', label: 'Schools' },
  ],
}

export const ABOUT_TEAM = {
  eyebrow: 'Meet the Team',
  title: 'The humans behind the mission.',
  intro: 'A global team of educators, engineers, and parents on a shared mission.',
  members: [
    {
      name: 'Dr. James Chen',
      role: 'Founder & CEO',
      bio: 'Professor · 20+ years AI research, curriculum design, and competition-grade vision pipelines for K–12 learners.',
      initials: 'JC',
      ring: 'ring-cyan-200 group-hover:ring-primary',
    },
    {
      name: 'Dr. Michelle Xu',
      role: 'Co-Founder',
      bio: 'AI scientist · Pedagogy, learning science, and age-appropriate AI lab design.',
      initials: 'MX',
      ring: 'ring-emerald-200 group-hover:ring-emerald-500',
    },
    {
      name: 'Dr. Shannon Wang',
      role: 'Co-Founder',
      bio: 'LLM & deep learning · Co-founder of ScholarOne LLC (USA). International competition mentorship.',
      initials: 'SW',
      ring: 'ring-violet-200 group-hover:ring-violet-500',
    },
  ],
  hiringNote: 'More team members joining soon.',
  hiringEmail: 'hello@bingoacademy.org',
}

export const ABOUT_PARTNERS = {
  eyebrow: 'Trusted By & Backed By',
  title: 'Working with the best.',
  intro: 'We\'re proud to partner with leading institutions in AI education.',
  featured: {
    name: 'IOAI',
    subtitle: 'International Olympiad in Artificial Intelligence',
    href: 'https://ioai-official.org/',
    cta: 'Official Partner →',
  },
  placeholders: ['Partner Logo', 'School Logo', 'Media Logo', 'More Coming'],
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
  body: 'Join 20,000+ students across 1,000+ schools and 4 countries who are building the future with AI. No prior experience needed.',
  primary: { label: 'Start Free Trial', href: '/courses' },
  secondary: {
    label: 'Talk to Our Team',
    href: 'mailto:hello@bingoacademy.org?subject=Talk%20to%20Team',
    external: true,
  },
  footnote: 'No credit card required · Cancel anytime · Trusted by families in 1,000+ schools worldwide',
}
