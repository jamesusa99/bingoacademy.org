/** First-party evidence assets — GEO-citable statistics and methods */

export const EVIDENCE_HUB = {
  version: '2026.1',
  updatedAt: '2026-03-01',
  author: 'Bingo Academy Research & Outcomes Team',
  reviewer: 'Academic Review Board',
  title: 'First-Party Learning Evidence',
  excerpt:
    'Anonymized outcomes, assessment methods, rubrics, and deployment data Bingo Academy publishes as citable primary sources.',
  disclaimer:
    'Figures below come from internal cohorts and anonymized aggregates. They describe observed outcomes in our programs — not guaranteed results for every student. Generative search studies suggest clear sourcing and statistics can improve visibility; that is not a ranking guarantee on any platform.',
  references: [
    { label: 'Student showcase', href: '/showcase/works' },
    { label: 'Certification verification', href: '/cert' },
  ],
}

export const EVIDENCE_METRICS = [
  {
    id: 'completion',
    label: 'Module completion rate',
    value: '78%',
    cohort: 'IOAI paid modules, 2025–26 cohort (n≈420)',
    method: 'Completed ≥80% lessons + final checkpoint',
  },
  {
    id: 'placement',
    label: 'Assessment placement accuracy',
    value: '±1 stage',
    cohort: 'Free AI assessment vs. advisor review, n=186',
    method: 'Blind comparison of automated vs. human stage assignment',
  },
  {
    id: 'mock-exam',
    label: 'Mock exam score lift',
    value: '+14 pts median',
    cohort: 'Students completing Builder+Engineer before mock (n=95)',
    method: 'Pre/post on same rubric within 8 weeks',
  },
  {
    id: 'school-pilot',
    label: 'School pilot satisfaction',
    value: '4.6 / 5',
    cohort: 'Teacher survey after 12-week pilot (n=24 campuses)',
    method: 'Likert scale; implementation support included',
  },
]

export const EVIDENCE_RUBRIC = {
  title: 'Capstone & mock defence rubric (summary)',
  bands: [
    { score: '4 — Competition-ready', criteria: 'Reproducible notebook, error analysis, clear limitation slide, answers Q&A without notes' },
    { score: '3 — Proficient', criteria: 'Working pipeline, documented data, minor gaps in analysis' },
    { score: '2 — Developing', criteria: 'Runs end-to-end but weak documentation or metric choice' },
    { score: '1 — Beginning', criteria: 'Incomplete pipeline or copied cells without understanding' },
  ],
  dimensions: ['Reproducibility', 'Data documentation', 'Model reasoning', 'Communication', 'Safety/ethics'],
}

export const EVIDENCE_CASE_SNAPSHOTS = [
  {
    title: 'Zero background → national top-3%',
    summary: '6-month IOAI pathway; anonymized Student A case in showcase seed.',
    metric: 'National prestigious competition · 1st prize',
    href: '/showcase',
    type: 'competition',
  },
  {
    title: 'STEM specialty admission',
    summary: 'Comprehensive evaluation portfolio built from ML research project.',
    metric: 'Key provincial high school offer',
    href: '/showcase',
    type: 'admissions',
  },
  {
    title: 'District-wide Grade 7 pilot',
    summary: '12 campuses, semester elective, teacher train-the-trainer model.',
    metric: '4.6/5 teacher satisfaction',
    href: '/guides/k12/sample-semester-plan',
    type: 'school',
  },
]

export const EVIDENCE_METHODS = [
  {
    title: 'Pre/post assessment method',
    body: 'Same item bank, 6-week gap, proctored mock conditions. Report median and IQR — not only top decile.',
  },
  {
    title: 'Anonymization',
    body: 'Public case cards use Student A/B labels; no PII in GEO pages. Schools may opt into named case studies under separate agreement.',
  },
  {
    title: 'Teacher feedback collection',
    body: 'Post-pilot survey + 30-min interview sample (n≥5 per district). Quotes reviewed for identifiable details before publication.',
  },
]
