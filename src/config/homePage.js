/** Homepage section content — IOAI program phase 1 layout */

import { CORE_INSTRUCTORS } from './trust/instructors'
import { INDEPENDENT_PROVIDER_DISCLAIMER } from './trust/about'

export const HOME_SECTION_IDS = {
  quickFacts: 'quick-facts',
  whyProgram: 'why-program',
  curriculum: 'curriculum',
  howItWorks: 'how-it-works',
  platform: 'platform',
  studentWork: 'student-work',
  audience: 'audience',
  instructors: 'instructors',
  tuition: 'tuition',
  faq: 'faq',
  finalCta: 'final-cta',
}

/** Hero-adjacent facts — help parents decide in ~5 seconds (no unverified stats) */
export const HOME_QUICK_FACTS = {
  items: [
    { icon: 'student', label: 'Ages', value: '12–18' },
    { icon: 'brain', label: 'Skills', value: 'Python + ML' },
    { icon: 'code', label: 'Labs', value: 'Jupyter' },
    { icon: 'assessment', label: 'Practice', value: 'Mock Assessments' },
  ],
}

export const HOME_WHY_PROGRAM = {
  eyebrow: 'Why this program',
  title: 'Competition preparation starts with understanding AI.',
  values: [
    {
      title: 'Principles',
      body:
        'Learn how data, features, training, inference, overfitting, generalization, and model evaluation actually work.',
    },
    {
      title: 'Python Implementation',
      body:
        'Translate concepts into Python, NumPy, scikit-learn, PyTorch, and Jupyter workflows.',
    },
    {
      title: 'Explain Results',
      body:
        'Interpret metrics, analyze errors, document experiments, and explain technical decisions clearly.',
    },
  ],
}

export const HOME_CURRICULUM_ROADMAP = {
  eyebrow: 'Curriculum roadmap',
  title: 'Curriculum Roadmap',
  flow: ['Explorer', 'Builder', 'Engineer', 'Olympian'],
  ctaPrompt: 'Not sure where to begin?',
  stages: [
    {
      stage: 1,
      title: 'AI Explorer',
      subtitle: 'Python, data, mathematical intuition, and core AI concepts.',
      topics: [
        'Python fundamentals',
        'data types and arrays',
        'basic statistics',
        'features and labels',
        'training and inference',
      ],
    },
    {
      stage: 2,
      title: 'AI Builder',
      subtitle: 'Build, train, and evaluate classical machine learning models.',
      topics: [
        'regression and classification',
        'decision trees',
        'KNN',
        'data preprocessing',
        'validation and metrics',
        'overfitting',
      ],
    },
    {
      stage: 3,
      title: 'AI Engineer',
      subtitle: 'Develop neural-network workflows in computer vision and NLP.',
      topics: [
        'neural-network foundations',
        'CNNs',
        'embeddings',
        'computer vision',
        'NLP',
        'model debugging',
      ],
    },
    {
      stage: 4,
      title: 'AI Olympiad',
      subtitle: 'Apply the full workflow to competition-style problems and assessments.',
      topics: [
        'time-limited problems',
        'dataset analysis',
        'experiment design',
        'notebook documentation',
        'model comparison',
        'mock assessments',
        'technical explanation or defence',
      ],
    },
  ],
}

export const HOME_HOW_LEARNING_WORKS = {
  eyebrow: 'How learning works',
  title: 'Every lesson follows the same five-step learning cycle',
  intro:
    'Bingo Academy teaches theory and experimentation first. IOAI-oriented competition preparation is where these steps come together — not a separate “compete and certify” shortcut.',
  steps: [
    {
      key: 'understand',
      title: 'Understand',
      desc: 'Learn the conceptual and mathematical foundations behind each method.',
    },
    {
      key: 'implement',
      title: 'Implement',
      desc: 'Turn the concept into working Python and Jupyter code.',
    },
    {
      key: 'experiment',
      title: 'Experiment',
      desc: 'Change data, parameters, and model design to observe what happens.',
    },
    {
      key: 'evaluate',
      title: 'Evaluate',
      desc: 'Read metrics, inspect errors, and compare alternative approaches.',
    },
    {
      key: 'explain',
      title: 'Explain',
      desc: 'Document the process and justify the final technical decisions.',
    },
  ],
  outcome:
    'Mock assessments and competition-style projects apply this full cycle — students defend notebooks and metrics, not just submit a final score.',
  methodologyLink: { label: 'Teaching methodology', href: '/methodology' },
}

export const HOME_PLATFORM = {
  eyebrow: 'Real platform experience',
  title: 'Theory, code, charts, and feedback in one workspace.',
  features: [
    {
      title: 'Theory',
      desc: 'Concept briefs set up each lab so students know why the next line of code matters.',
    },
    {
      title: 'Code',
      desc: 'Runnable Python and Jupyter cells with autograding and instructor-aligned checkpoints.',
    },
    {
      title: 'Charts',
      desc: 'Metrics, predictions, and visual results tied directly to the experiment students just ran.',
    },
    {
      title: 'Feedback',
      desc: 'Checkpoint comments, reflection prompts, and mock-assessment rubric feedback.',
    },
  ],
}

export const HOME_STUDENT_WORK = {
  eyebrow: 'What students produce',
  title: 'Notebook, report, project, and mock assessment — work students can explain.',
  deliverables: [
    {
      title: 'Notebook',
      desc: 'Code, charts, explanations, and reproducible results.',
    },
    {
      title: 'Report',
      desc: 'Metrics, error analysis, model comparison, and limitations.',
    },
    {
      title: 'Project',
      desc: 'A complete problem-solving workflow from data to final conclusion.',
    },
    {
      title: 'Mock Assessment',
      desc: 'Strengths, knowledge gaps, and recommended next steps.',
    },
  ],
  samples: [
    { label: 'View Sample Notebook', href: '/guides/ioai/sample-notebook-report' },
    { label: 'View Sample Assessment', href: '/guides/ioai/mock-assessment-rubric' },
    { label: 'View Student Portfolio', href: '/showcase/works' },
    { label: 'View Project Rubric', href: '/outcomes#rubric' },
  ],
}

export const HOME_AUDIENCE = {
  eyebrow: 'Who it is for',
  title: 'Who It Is For',
  goodFit: {
    heading: 'A Good Fit For',
    items: [
      'Students ages 12–18',
      'Students curious about AI competitions',
      'Students ready to learn Python and machine learning',
      'Students who want structured theory and hands-on practice',
      'Students willing to document and explain their work',
    ],
  },
  startingLevel: {
    heading: 'Starting Level',
    items: [
      'Foundation pathways are available for students new to AI.',
      'More advanced students can begin from a later stage after assessment.',
      'Competition experience is not required.',
    ],
  },
  whatStudentsNeed: {
    heading: 'What Students Need',
    items: [
      'A laptop or desktop computer',
      'Stable internet access',
      'Time for lessons, labs, and review',
      'Willingness to debug and revise work',
    ],
  },
}

const HOME_INSTRUCTOR_STAGES = {
  'james-chen': 'AI Engineer · AI Olympiad',
  'michelle-xu': 'AI Explorer · AI Builder',
  'shannon-wang': 'AI Builder · AI Engineer · AI Olympiad',
}

export const HOME_INSTRUCTORS = {
  eyebrow: 'Instructors & support',
  title: 'Built and reviewed by AI educators and practitioners.',
  instructors: CORE_INSTRUCTORS.slice(0, 3).map((i) => ({
    slug: i.slug,
    name: i.name,
    photo: i.photo,
    currentRole: i.currentRole,
    background: i.education?.[0] ?? i.title,
    stages: HOME_INSTRUCTOR_STAGES[i.slug] ?? '',
  })),
  supportHeading: 'Student & parent support',
  support: [
    {
      label: 'Instructor feedback',
      desc: 'Checkpoint comments and reflection prompts on labs and written work.',
    },
    {
      label: 'Mock assessment review',
      desc: 'Rubric-based feedback on timed mock rounds with recommended next steps.',
    },
    {
      label: 'Parent progress updates',
      desc: 'Lesson and lab completion visible in Profile and Study Center.',
    },
    {
      label: 'Community discussion',
      desc: 'Course Q&A and peer discussion in the AI-Spark Forum.',
    },
  ],
  cta: { label: 'Meet the Instructors', href: '/instructors' },
}

export const HOME_TUITION = {
  eyebrow: 'Tuition',
  title: "Choose the pathway that matches the student's current level.",
  completeTrack: {
    badge: 'Recommended',
    title: 'Complete IOAI Track',
    description:
      'Recommended for students who want a complete pathway from foundations to advanced competition preparation.',
    cta: { label: 'Enroll in the Complete Track', stageId: 'all' },
    detailLabels: {
      stages: 'Included stages',
      modules: 'Number of modules',
      access: 'Access period',
      feedback: 'Feedback included',
      price: 'Price',
      payment: 'Payment options',
    },
    includedStages: 'Explorer, Builder, Engineer & Olympiad',
    accessPeriod: 'Lifetime access in Study Center',
    feedbackIncluded: 'Lab checkpoint comments and mock-assessment rubric feedback',
    paymentOptions: 'One-time payment via Stripe (credit/debit card)',
  },
  stageBased: {
    title: 'Stage-Based Enrollment',
    description:
      'For students who already have relevant Python, machine learning, or competition experience.',
    cta: { label: 'Take the Assessment First', href: '/assessment/ioai' },
    placementNote:
      'The free readiness assessment recommends a starting stage — do not enroll by stage name alone.',
  },
  pricingPolicy: {
    heading: 'What is included in your purchase',
    items: [
      { q: 'Payment model', a: 'One-time purchase — not a subscription.' },
      { q: 'Course access', a: 'Lifetime access to purchased modules in Study Center.' },
      { q: 'Instructor feedback', a: 'Included — checkpoint comments on labs and written work.' },
      { q: 'Mock assessments', a: 'Included — timed mock rounds with rubric-based feedback.' },
      {
        q: 'Live classes',
        a: 'Not included in bundle price — self-paced video lessons and Jupyter labs. Optional live training camps are sold separately.',
      },
      {
        q: 'Certificate',
        a: 'Optional IOAI-track certificate upon successful completion — see sample rubrics and notebook formats in our guides.',
        href: '/guides/ioai/mock-assessment-rubric',
      },
      {
        q: 'Refund policy',
        a: 'Digital course refunds follow the policy shown at checkout. Contact support@bingoacademy.org for questions before enrolling.',
      },
      {
        q: 'Upgrade to Complete Track',
        a: 'Sign in at checkout. We automatically credit what you already paid for course units included in the Complete Track. If credits cover the bundle price, remaining units unlock at $0 — no extra payment. Guests see the full list price. For school invoices or exceptions, contact support@bingoacademy.org.',
      },
    ],
  },
}

export const HOME_FAQ = {
  eyebrow: 'FAQ',
  title: 'Questions from students and parents',
  items: [
    {
      q: 'What is IOAI-oriented training?',
      a:
        'IOAI-oriented training means our curriculum uses publicly available AI Olympiad skill areas and competition-style problem types as reference points for lessons, labs, and mock assessments. Students practice Python implementation, machine learning workflows, and defence-ready documentation similar to what selection rounds expect. This describes our preparation focus — not an official relationship with IOAI or its organizers.',
    },
    {
      q: 'Does my child need prior Python experience?',
      a:
        'Not always. AI Explorer starts from Python fundamentals for students new to coding. AI Builder assumes comfort with basic Python and data concepts. AI Engineer and AI Olympiad expect students to train, evaluate, and debug models with less hand-holding. Take the free readiness assessment — it recommends a starting stage so you do not have to guess from stage names alone.',
    },
    {
      q: 'What age group is the program designed for?',
      a:
        'This IOAI program is designed for students ages 12–18 (middle and high school). It assumes typed homework, middle-school reading level, and about 4–6 hours per week for video lessons, Jupyter labs, and review. Younger students may explore other Bingo Academy pathways outside this track.',
    },
    {
      q: 'Is this a coding course or an AI course?',
      a:
        'Both. Students learn AI concepts — training vs. inference, features and labels, model evaluation, overfitting — and implement them in Python using Jupyter notebooks. Each stage pairs theory with hands-on experiments, written analysis, and mock assessments. It is not a prompt-only tools class or a generic coding bootcamp.',
    },
    {
      q: 'What will students build?',
      a:
        'Jupyter notebooks with runnable code and charts; trained models with evaluation metrics; experiment reports with error analysis and limitations; and competition-style capstone projects with mock assessment feedback — work they can explain, not just scores they can display.',
    },
    {
      q: 'Are lessons self-paced or instructor-led?',
      a:
        'Core stage bundles are self-paced: on-demand video lessons and Jupyter labs completed on the student’s schedule, with checkpoint feedback and mock assessment review from course faculty. Optional live training camps are sold separately and are not required to finish a stage bundle.',
    },
    {
      q: 'How do we choose the right stage?',
      a:
        'Start with the free readiness assessment. It checks Python comfort, data literacy, and ML familiarity, then recommends Explorer, Builder, Engineer, or Olympiad. Review the curriculum roadmap together, then enroll in a stage bundle or the Complete IOAI Track once placement is clear.',
    },
    {
      q: 'Is Bingo Academy affiliated with IOAI?',
      a: INDEPENDENT_PROVIDER_DISCLAIMER,
    },
  ],
}

export const HOME_FINAL_CTA = {
  eyebrow: 'Next step',
  title: "Start with the student's current level.",
  body:
    'Complete the free readiness assessment to identify strengths, knowledge gaps, and the most appropriate starting stage.',
  assessmentOnly: true,
  footnotes: ['No competition experience required.'],
  /** Enable when assessment or checkout actually requires parent/guardian contact for minors. */
  parentGuardianFootnote: 'Parent or guardian contact is required for students under 18.',
}
