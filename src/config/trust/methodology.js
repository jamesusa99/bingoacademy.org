/**
 * Teaching methodology — research-inspired, not institutional endorsement
 */

export const METHODOLOGY = {
  version: '2026.1',
  updatedAt: '2026-03-01',
  title: 'Teaching methodology & research basis',
  excerpt:
    'How Bingo Academy designs projects, assesses learning, and maps to IOAI and school standards — with cited public research and clear separation of third-party vs. proprietary methods.',
  disclaimer:
    'Bingo Academy is an independent education provider. References to university lab traditions describe pedagogical inspiration from published research — not formal affiliation, endorsement, or partnership unless explicitly stated on this page.',
  framework: {
    title: 'Vision–Understanding–Action (VUA)',
    body:
      'Our proprietary spine sequences perception (cameras, pose, detection), reasoning (features, embeddings, Python data stacks), and action (deployment, robotics, competition defence). Each stage has explicit learning objectives and checkpoint rubrics.',
    steps: [
      { label: 'Vision', desc: 'Browser TensorFlow.js labs, OpenCV concepts, dataset curation' },
      { label: 'Understanding', desc: 'Pandas/NumPy analysis, model selection, error analysis' },
      { label: 'Action', desc: 'Inference pipelines, written reports, mock defence' },
    ],
  },
  projectDesign: {
    title: 'How we design projects',
    items: [
      'Start from a falsifiable hypothesis — not a demo script',
      'Require documented train/validation splits before reporting accuracy',
      'Pair every model with an error-analysis section (confusion cases, failure modes)',
      'Capstone outputs must be reproducible: fixed seeds, pinned dependencies, README',
      'Age-band scaffolds: Explorer (guided cells) → Builder (partial templates) → Engineer (open brief)',
    ],
  },
  assessment: {
    title: 'How we assess',
    items: [
      'Lesson quizzes — formative, unlimited retries in self-paced modules',
      'Lab checkpoints — autograded cells plus human rubric on documentation quality',
      'Mock IOAI rounds — timed written + defence simulation with published rubric bands',
      'School pilots — teacher observation protocol + student portfolio review (not ads metrics)',
    ],
    rubricHref: '/outcomes#rubric',
  },
  alignment: {
    title: 'Competition & school alignment',
    items: [
      { label: 'IOAI selection formats', href: 'https://ioai-official.org', external: true },
      { label: 'Bingo ↔ IOAI syllabus mapping', href: '/guides/ioai/syllabus-module-mapping' },
      { label: 'K–12 standards alignment guide', href: '/guides/k12/standards-alignment' },
      { label: 'Sample semester plan', href: '/guides/k12/sample-semester-plan' },
    ],
  },
  researchInspiration: {
    title: 'Public research that informs our design (not endorsements)',
    intro:
      'The following published lines of work inspire our lab sequencing and assessment language. Bingo Academy does not claim MIT Media Lab, university, or competition body endorsement.',
    items: [
      {
        tradition: 'Embodied & creative robotics pedagogy',
        inspiredBy:
          'Human–machine symbiosis and constructionist learning traditions described in MIT Media Lab publications (e.g., Papert, Resnick) — we adapt the *pedagogical pattern* (build → reflect → iterate), not institutional branding.',
        papers: [
          { label: 'Resnick et al. — Lifelong Kindergarten (book)', href: 'https://www.media.mit.edu/publications/lifelong-kindergarten/', external: true },
        ],
      },
      {
        tradition: 'Reproducible ML education',
        inspiredBy:
          'Competition-style notebooks emphasizing documented pipelines, ablation notes, and defence Q&A — aligned to IOAI public formats.',
        papers: [
          { label: 'IOAI official competition materials', href: 'https://ioai-official.org', external: true },
        ],
      },
      {
        tradition: 'K–12 AI literacy frameworks',
        inspiredBy:
          'Structured progression from data literacy to ethical use — mapped in our K–12 guides and teacher implementation docs.',
        papers: [
          { label: 'AI4K12 Five Big Ideas', href: 'https://ai4k12.org', external: true },
        ],
      },
    ],
  },
  proprietary: {
    title: 'Bingo Academy–specific methods',
    items: [
      'VUA stage gates and Explorer → Builder → Engineer module graph',
      'Dual-pane Jupyter + video lesson UX with checkpoint autograding',
      'Mock assessment item banks and defence rubric (published at /outcomes)',
      'Browser-first exploration labs with crawlable knowledge panels per experiment',
      'Anonymized outcomes reporting with cohort metadata (see /outcomes)',
    ],
  },
  peerReview: {
    title: 'Peer-review discipline (what we mean)',
    body:
      '“Peer-review aligned” means curriculum changes go through internal faculty review against published rubrics and competition formats — hypothesis, methods, results, limitations — not that every lesson is published in an academic journal. Reviewer names and version dates appear on knowledge guides.',
    reviewersHref: '/instructors',
  },
}
