/**
 * Outcomes & case studies — every metric must declare cohort, method, and evidence links
 */

export const OUTCOMES_HUB = {
  version: '2026.1',
  updatedAt: '2026-03-01',
  title: 'Outcomes & case studies',
  excerpt:
    'Anonymized learning outcomes with sample sizes, time windows, measurement methods, and links to student work — primary evidence Bingo Academy publishes for families, schools, and search systems.',
  disclaimer:
    'Figures describe observed cohorts in our programs. They are not guaranteed results for every student. Where noted, metrics come from real learning assessments — not training-set accuracy reported as student outcomes.',
}

export const OUTCOME_METRICS = [
  {
    id: 'completion',
    label: 'Module completion rate',
    value: '78%',
    sampleSize: 'n ≈ 420',
    period: '2025–26 IOAI paid-module cohort',
    method: 'Completed ≥80% video lessons plus final lab checkpoint',
    metricDefinition: 'Binary completion per purchased module; refunds excluded',
    dataType: 'Real learning assessment (progress + checkpoint), not model training accuracy',
    evidenceHref: '/cert',
  },
  {
    id: 'placement',
    label: 'Assessment placement accuracy',
    value: '±1 stage',
    sampleSize: 'n = 186',
    period: 'Q3 2025 – Q1 2026',
    method: 'Blind comparison: automated placement vs. human advisor stage assignment',
    metricDefinition: 'Agreement within one VUA stage (Explorer/Builder/Engineer)',
    dataType: 'Real pre-enrollment assessment vs. expert review',
    evidenceHref: '/assessment',
  },
  {
    id: 'mock-lift',
    label: 'Mock exam score lift',
    value: '+14 pts median',
    sampleSize: 'n = 95',
    period: '8-week window, 2025 competition season',
    method: 'Same rubric item bank, proctored mock, pre vs. post',
    metricDefinition: 'Total rubric score out of 100 on published mock bank',
    dataType: 'Real learning assessment (held-out mock items), not training-set reuse',
    evidenceHref: '/guides/ioai/mock-assessment-rubric',
  },
  {
    id: 'school-sat',
    label: 'School pilot teacher satisfaction',
    value: '4.6 / 5',
    sampleSize: 'n = 24 campuses',
    period: '12-week pilots, 2025–26',
    method: 'Post-pilot Likert survey + interview sample (n ≥ 5 per district)',
    metricDefinition: 'Mean satisfaction across implementation support, materials, and student engagement',
    dataType: 'Educator survey — not student model accuracy',
    evidenceHref: '/guides/k12/sample-semester-plan',
  },
]

export const OUTCOME_RUBRIC = {
  id: 'rubric',
  title: 'Capstone & mock defence rubric (summary)',
  dimensions: ['Reproducibility', 'Data documentation', 'Model reasoning', 'Communication', 'Safety/ethics'],
  bands: [
    { score: '4 — Competition-ready', criteria: 'Reproducible notebook, error analysis, limitation slide, Q&A without notes' },
    { score: '3 — Proficient', criteria: 'Working pipeline, documented data, minor gaps in analysis' },
    { score: '2 — Developing', criteria: 'Runs end-to-end but weak documentation or metric choice' },
    { score: '1 — Beginning', criteria: 'Incomplete pipeline or copied cells without understanding' },
  ],
  fullHref: '/guides/ioai/mock-assessment-rubric',
}

export const CASE_STUDIES = [
  {
    id: 'zero-to-podium',
    title: 'Zero background → national top-3%',
    summary:
      'Student A (anonymized) entered with no Python. Six-month IOAI pathway: Explorer → Builder → mock rounds → regional then national competition.',
    sampleSize: 'n = 1 longitudinal case (representative of 12 similar placements in cohort)',
    period: 'Apr – Oct 2025',
    method: 'Portfolio review + competition results verification',
    metricDefinition: 'National prestigious competition placement — top 3% of entrants in category',
    dataType: 'External competition outcome linked to internal progress logs',
    metric: 'National competition · 1st prize category',
    evidenceHref: '/showcase/works',
    workType: 'Jupyter lab report + defence recording',
  },
  {
    id: 'waste-vision',
    title: 'Campus waste-sorting vision model — 91% pilot accuracy',
    summary:
      'Grade 8 team fine-tuned MobileNet on school-collected images; documented ablation and deployment plan.',
    sampleSize: 'n = 4 students, 1,200 labeled images',
    period: '10-week project, 2025',
    method: 'Held-out validation set (20% stratified split); pilot deployment on 200 live bins',
    metricDefinition: 'Top-1 accuracy on held-out validation — reported separately from pilot live accuracy (87%)',
    dataType: 'Validation-set ML metric — not conflated with competition score',
    metric: '91% val accuracy · IOAI provincial 2nd prize',
    evidenceHref: '/showcase/works',
    workType: 'Structured research log + .ipynb',
  },
  {
    id: 'district-pilot',
    title: 'District-wide Grade 7 elective pilot',
    summary:
      '12 campuses adopted semester elective; train-the-trainer model with Bingo teacher implementation guide.',
    sampleSize: 'n = 24 campuses, ~1,800 students',
    period: 'Fall 2025 semester',
    method: 'Teacher survey + admin interview + sample portfolio audit (10% stratified)',
    metricDefinition: 'Teacher satisfaction mean on 5-point Likert; student portfolio rubric mean ≥ 2.5',
    dataType: 'Educator and portfolio assessment — not ML training metric',
    metric: '4.6/5 teacher satisfaction · 78% portfolio proficient+',
    evidenceHref: '/guides/k12/sample-semester-plan',
    workType: 'Semester plan + anonymized portfolio samples',
  },
]

export const OUTCOME_METHODS = [
  {
    title: 'What we publish vs. withhold',
    body:
      'Public pages show anonymized aggregates and representative case cards. Named school or student stories require separate media consent. We never publish training-set accuracy as if it were a student outcome.',
  },
  {
    title: 'Cohort labeling',
    body:
      'Every metric card lists n, date range, and whether the number is a learning assessment, survey, or model validation metric.',
  },
  {
    title: 'Replication',
    body:
      'Schools may request the anonymized rubric and survey instrument used in pilots. Raw student PII is never exported.',
  },
]

export function getAllOutcomesPaths() {
  return [{ path: '/outcomes', changefreq: 'monthly', priority: '0.8', lastmod: OUTCOMES_HUB.updatedAt }]
}
