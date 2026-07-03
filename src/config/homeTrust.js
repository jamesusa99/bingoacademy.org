/** Homepage trust & authority — academic pedigree + IOAI proof of work + social proof */

export const HOME_TRUST_AUTHORITY = {
  eyebrow: 'Trust & Authority',
  title: 'University-grade AI — not another kids’ coding class',
  body:
    'Bingo AI Academy is led by full-time professors and AI PhD researchers. Our IOAI curriculum draws on research traditions from leading university AI and engineering labs — the same rigor behind embodied intelligence and human–machine interaction, not weekend coding camps.',
  peerReview:
    'Curriculum design follows peer-reviewed standards from leading AI and STEM education research — structured hypotheses, reproducible experiments, and defence-ready documentation families and schools can audit.',
  academicLineage: {
    title: 'Research lineage · Embodied AI & VUA',
    body:
      'Course architecture is rooted in top-tier lab research on Embodied AI — agents that see, understand, and act in the physical world. Our pedagogical spine follows the Vision–Understanding–Action (VUA) framework: perception models, reasoning layers, and real-world actuation (browser labs, Jupyter notebooks, and BingoClaw hardware).',
    labs: [
      { name: 'MIT Media Lab tradition', focus: 'Human–machine symbiosis & creative robotics' },
      { name: 'University AI & engineering labs', focus: 'Computer vision, RL & deployable ML systems' },
      { name: 'IOAI competition R&D', focus: 'Selection-round lab reports & reproducible pipelines' },
    ],
    vuaSteps: [
      { label: 'Vision', desc: 'Cameras, pose models, object detection in-browser' },
      { label: 'Understanding', desc: 'Features, embeddings, reasoning & Python data stacks' },
      { label: 'Action', desc: 'Actuators, robotics, competition-ready deployment' },
    ],
  },
  credentials: [
    {
      icon: '🎓',
      title: 'Professor-led R&D',
      desc: 'Full-time faculty and doctoral researchers design courses, labs, and competition pathways — not generic script tutors.',
    },
    {
      icon: '🤖',
      title: 'Embodied AI specialists',
      desc: 'Deep expertise in vision-to-action pipelines — the same stack used in industrial robotics and IOAI lab defence.',
    },
    {
      icon: '🏛️',
      title: 'Institution-ready',
      desc: 'Audit-ready portfolios for schools and families — peer-review discipline, not badge-chasing workshops.',
    },
  ],
  proofTitle: 'Proof of work — IOAI training outcomes',
  proofSubtitle:
    'Real deliverables from competition trainees: datasets, notebooks, and defence-ready reports — not slide decks alone.',
  showcaseCta: 'View student showcase',
  ioaiCta: 'Explore IOAI training',
}

/** Industrial-grade stack — what students actually train on */
export const HOME_INDUSTRIAL_STACK = {
  eyebrow: 'Industrial Stack',
  title: 'Real tools. Not toy blocks.',
  subtitle:
    'Students train on the same Python, ML, and deployment stack used in industry and IOAI competition labs — PyTorch-grade workflows, browser TensorFlow.js, and production payment & streaming infrastructure.',
  categories: [
    {
      id: 'ml',
      label: 'Machine Learning',
      items: ['PyTorch', 'TensorFlow', 'TensorFlow.js', 'scikit-learn', 'K-NN / CNN pipelines'],
    },
    {
      id: 'data',
      label: 'Data & Python',
      items: ['Python 3', 'Pandas', 'NumPy', 'Jupyter / JupyterLite', 'Pyodide in-browser'],
    },
    {
      id: 'cv',
      label: 'Vision & Embodied AI',
      items: ['OpenCV', 'MoveNet', 'MediaPipe', 'MobileNet', 'Canvas / WebGL'],
    },
    {
      id: 'infra',
      label: 'Production infra',
      items: ['Stripe Checkout', 'Cloudflare Stream', 'Supabase', 'WebAssembly', 'Vercel edge'],
    },
  ],
}

/** Early seed-user feedback — authentic, specific */
export const HOME_SEED_TESTIMONIALS = {
  eyebrow: 'Seed Users',
  title: 'What early families & educators say',
  items: [
    {
      id: 'parent-us',
      quote:
        'My son thought AI was “magic.” After Cyber Tennis and the Python lab, he explained pose vectors at dinner. This is the first program that feels like real engineering — not Scratch with AI stickers.',
      name: 'Sarah M.',
      role: 'Parent · Grade 9 · California, USA',
      avatar: '👩‍💼',
    },
    {
      id: 'teacher',
      quote:
        'We evaluated six STEM vendors. Bingo was the only one with Jupyter autograding, IOAI-aligned rubrics, and COPPA-aware defaults. Our procurement team approved it in one review cycle.',
      name: 'Dr. James L.',
      role: 'STEM Director · K–12 charter network',
      avatar: '👨‍🏫',
    },
    {
      id: 'student-parent',
      quote:
        'The dual-pane lab reminded me of Kaggle Learn — but built for a 12-year-old preparing for IOAI. She shipped her first .ipynb report in week two.',
      name: 'Wei C.',
      role: 'Parent · IOAI trainee · Singapore',
      avatar: '🌏',
    },
  ],
}

/** Security & compliance badges for high-ticket conversion */
export const HOME_TRUST_BADGES = [
  {
    id: 'coppa',
    icon: '🛡️',
    label: 'COPPA Compliant',
    desc: '100% student privacy by design',
    href: '/privacy',
  },
  {
    id: 'stripe',
    icon: '🔐',
    label: 'Stripe Secure',
    desc: 'Bank-grade encrypted payments',
    href: '/privacy',
  },
  {
    id: 'gdpr',
    icon: '🇪🇺',
    label: 'GDPR Ready',
    desc: 'EU data protection standards',
    href: '/privacy',
  },
  {
    id: 'peer',
    icon: '📄',
    label: 'Peer-review aligned',
    desc: 'Evidence-based curriculum design',
    href: '/curriculum?line=ioai',
  },
]

export const HOME_PROOF_OF_WORK = [
  {
    id: 'jupyter-lab-report',
    icon: '📓',
    title: 'End-to-end Jupyter Notebook lab report',
    student: 'Grade 11 · IOAI competition trainee',
    desc: 'Trained a custom image dataset, documented every preprocessing step, and shipped a complete Jupyter Notebook with charts, error analysis, and a reproducible inference pipeline — ready for IOAI defence.',
    highlights: ['Custom dataset curation', 'Full .ipynb report', 'Defence-ready narrative'],
    tag: 'IOAI · Computer Vision',
    to: '/showcase/works',
  },
  {
    id: 'waste-sorting-vision',
    icon: '♻️',
    title: 'Campus vision model — 91% pilot accuracy',
    student: 'Grade 8 · IOAI provincial · 2nd prize',
    desc: 'Built and fine-tuned MobileNet on school-collected waste images; published methodology, ablation notes, and deployment plan in a structured research log.',
    highlights: ['MobileNet fine-tuning', '91% pilot accuracy', 'IOAI provincial award'],
    tag: 'IOAI · ML Project',
    to: '/showcase/works',
  },
  {
    id: 'multimodal-research',
    icon: '🧠',
    title: 'Multimodal companion — full research portfolio',
    student: 'Grade 10 · STEM comprehensive evaluation',
    desc: 'Voice + vision fusion prototype with weekly lab notes, ethics appendix, and recorded defence — the kind of depth admissions committees expect.',
    highlights: ['Multimodal fusion', 'Ethics appendix', 'Recorded defence'],
    tag: 'Research · Admissions',
    to: '/showcase/works',
  },
]
