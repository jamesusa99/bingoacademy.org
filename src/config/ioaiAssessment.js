/** IOAI Readiness Assessment V1 — copy, gates, dimensions. Prices come from the store, not this file. */

import { INDEPENDENT_PROVIDER_DISCLAIMER } from './trust/about.js'
import { ioaiStagePackageHref } from './ioaiStagePackages.js'

function stageComboBundleSlug(levelSlug) {
  return `ioai-stage-${levelSlug}`
}

export const IOAI_ASSESSMENT_ID = 'ioai-readiness-v1'
export const IOAI_ASSESSMENT_QUESTION_COUNT = 15
export const IOAI_ASSESSMENT_GATE_SIZE = 5
export const IOAI_ASSESSMENT_GATE_PASS = 3
export const IOAI_ASSESSMENT_STORAGE_KEY = 'bingo-ioai-readiness-v1'

export const IOAI_DIMENSIONS = [
  {
    id: 'programming_data',
    label: 'Programming & Data',
    labelZh: '编程与数据',
    officialTopics: 'Python, NumPy, Pandas, Matplotlib, scikit-learn, tensors, data handling',
  },
  {
    id: 'classical_ml',
    label: 'Classical ML',
    labelZh: '经典机器学习',
    officialTopics: 'Supervised & unsupervised learning, features, metrics, cross-validation, regularization',
  },
  {
    id: 'deep_learning',
    label: 'Deep Learning',
    labelZh: '神经网络与深度学习',
    officialTopics: 'Perceptrons, loss, backprop, optimization, MLP, attention, Transformer, fine-tuning',
  },
  {
    id: 'computer_vision',
    label: 'Computer Vision',
    labelZh: '计算机视觉',
    officialTopics: 'CNN, classification, detection, segmentation, pretrained encoders, CLIP, diffusion',
  },
  {
    id: 'nlp_audio',
    label: 'NLP & Audio',
    labelZh: '自然语言与音频',
    officialTopics: 'Tokenization, BERT, language modeling, encoder-decoder, Whisper and related audio models',
  },
]

export const IOAI_GATES = [
  {
    id: 'gate_1',
    label: 'Foundations',
    skipStage: 'ai-explorer',
    hint: 'Python, data, and core ML concepts needed to skip AI Explorer',
  },
  {
    id: 'gate_2',
    label: 'Classical ML',
    skipStage: 'ai-builder',
    hint: 'Classical ML workflows and PyTorch basics needed to skip AI Builder',
  },
  {
    id: 'gate_3',
    label: 'Deep Learning & Apps',
    skipStage: 'ai-engineer',
    hint: 'Training loops, CV, and NLP needed to skip AI Engineer',
  },
]

export const IOAI_STAGES = {
  'ai-explorer': {
    id: 'ai-explorer',
    name: 'AI Explorer',
    title: 'Foundation Explorer',
    bundleSlug: stageComboBundleSlug('ai-explorer'),
    outcome: 'Build Python, data, and first-machine-learning foundations so later modules make sense.',
  },
  'ai-builder': {
    id: 'ai-builder',
    name: 'AI Builder',
    title: 'Model Builder',
    bundleSlug: stageComboBundleSlug('ai-builder'),
    outcome: 'Complete classical ML workflows, evaluation, and PyTorch starter skills.',
  },
  'ai-engineer': {
    id: 'ai-engineer',
    name: 'AI Engineer',
    title: 'Deep Learning Engineer',
    bundleSlug: stageComboBundleSlug('ai-engineer'),
    outcome: 'Train, debug, and apply deep models across vision and language tasks.',
  },
  'ai-olympian': {
    id: 'ai-olympian',
    name: 'AI Olympiad',
    title: 'Olympiad Challenger',
    bundleSlug: stageComboBundleSlug('ai-olympian'),
    outcome: 'Go deeper on Transformer internals and modern-model competition practice.',
  },
}

export const IOAI_ASSESSMENT_COPY = {
  seoTitle: 'Free IOAI Readiness Assessment | Bingo Academy',
  seoDescription:
    'An 8-minute IOAI readiness snapshot aligned with the public IOAI syllabus. Find the recommended starting stage for Bingo Academy IOAI training.',
  landing: {
    eyebrow: '8-minute IOAI Readiness Assessment',
    title: 'Find your recommended IOAI starting stage',
    subtitle:
      'Fifteen short, auto-scored questions. This is an IOAI readiness snapshot aligned with the public IOAI syllabus — not an official IOAI exam, certified level, or competition-score prediction.',
    bullets: [
      'About 8 minutes · no countdown clock',
      '15 objective questions · one per page',
      'Recommends one real course stage, plus a few weak modules',
    ],
    startCta: 'Start the assessment',
    skipProfile: 'Skip and start questions',
    disclaimer: INDEPENDENT_PROVIDER_DISCLAIMER,
  },
  profile: {
    title: 'Optional background (helps us explain results)',
    subtitle: 'You can skip this. We never require a phone number or email before you see your result.',
    ageLabel: 'Age / grade',
    pythonLabel: 'Python experience',
    competitionLabel: 'Have you entered an AI competition?',
    continueCta: 'Continue to questions',
    ageOptions: [
      { id: 'under-12', label: 'Under 12' },
      { id: '12-14', label: '12–14' },
      { id: '15-16', label: '15–16' },
      { id: '17-18', label: '17–18' },
      { id: 'prefer-not', label: 'Prefer not to say' },
    ],
    pythonOptions: [
      { id: 'none', label: 'None yet' },
      { id: 'basics', label: 'Loops, lists, functions' },
      { id: 'numpy', label: 'NumPy / Pandas' },
      { id: 'pytorch', label: 'PyTorch or similar' },
    ],
    competitionOptions: [
      { id: 'no', label: 'Not yet' },
      { id: 'school', label: 'School / club contest' },
      { id: 'national', label: 'National or olympiad-style' },
    ],
  },
  quiz: {
    progressLabel: (current, total) => `Question ${current} of ${total}`,
    next: 'Next',
    seeResults: 'See results',
    incomplete: 'Finish all 15 questions to get a recommended starting stage.',
    matchingHintDesktop: 'Drag a left item onto a right item, or tap both to pair.',
    matchingHintMobile: 'Tap a left item, then tap its matching right item.',
    selectCount: (n) => `Select ${n} answers`,
  },
  results: {
    radarTitle: 'IOAI Syllabus Coverage Snapshot',
    heroKicker: 'Your Recommended Starting Stage',
    basedOn: 'Based on this short assessment',
    questionsAnswered: (n, total) => `${n}/${total} questions answered`,
    timeLabel: (seconds) => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return m > 0 ? `${m} min ${s}s` : `${s}s`
    },
    gateHighlight:
      'The earliest unfinished prerequisite is highlighted — that is why this stage is recommended.',
    nonMonotonic:
      'You show promising advanced-topic awareness, but the earliest prerequisite gap is in classical machine learning. Strengthening this layer will make later deep-learning work more reliable.',
    audioGap:
      'Audio processing appears on the public IOAI syllabus. Bingo Academy does not currently offer a dedicated audio course unit, so this gap is noted without a purchase recommendation.',
    roadmapCaption: 'Your recommended starting point',
    primaryCta: (stageName) => `Start ${stageName}`,
    secondaryCta: 'Explore Full IOAI Track',
    emailTitle: 'Email me my full report and a 7-day IOAI study plan',
    emailSubtitle: 'We will send a recap of this snapshot plus a short study sequence. No spam.',
    emailCta: 'Send my plan',
    emailSuccess: 'Thanks — check your inbox for the study-plan recap.',
    retake: 'Retake assessment',
    coverageCardHint: (correct, total) => `${correct}/${total} questions`,
  },
}

export const IOAI_GATE_STATUS = {
  passed: { label: 'Passed', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  developing: { label: 'Developing', className: 'text-cyan-800 bg-cyan-50 border-cyan-200' },
  needs_work: { label: 'Needs Work', className: 'text-amber-800 bg-amber-50 border-amber-200' },
}

/** Weak-tag → preferred live module titles (matched against store, not hardcoded SKUs). */
export const WEAK_TAG_MODULE_TITLES = {
  python_basics: ['Python Creator Quest'],
  numpy_data: ['Data Power Quest'],
  ml_concepts: ['Machine Learning'],
  math_prerequisite: ['Vector Hero Quest', 'Prediction Master Quest', 'AI Calculus Quest'],
  pandas_sklearn: ['Python Developer Quest'],
  pytorch_basics: ['PyTorch Starter Quest'],
  supervised_ml: ['Supervised Learning Quest'],
  unsupervised_ml: ['Unsupervised Quest'],
  metrics_overfitting: ['Model Thinking Quest'],
  optimization: ['Optimizer Quest'],
  neural_network_basics: ['Neuron Builder Quest', 'Deep Math Quest'],
  training_loop: ['MLP in PyTorch', 'Key Network Layers', 'Full Training Loop'],
  cv: ['Generative Master'],
  nlp: ['NLP Starter Quest', 'Transformer Builder', 'Fine-tuning Master'],
  modern_model_concepts: ['Modern AI Quest'],
  competition_python: ['Modern Model Quest'],
  attention: ['Attention Architect'],
  transformer_internals: ['Transformer Engineer'],
  vit_llm: ['LLM Applied Quest'],
}

export const WEAK_TAGS_WITHOUT_SKU = new Set(['audio'])

export const STAGE_WEAK_TAG_PRIORITY = {
  'ai-explorer': ['python_basics', 'numpy_data', 'ml_concepts', 'math_prerequisite'],
  'ai-builder': [
    'pandas_sklearn',
    'pytorch_basics',
    'supervised_ml',
    'unsupervised_ml',
    'metrics_overfitting',
    'optimization',
    'neural_network_basics',
  ],
  'ai-engineer': ['training_loop', 'cv', 'nlp', 'modern_model_concepts'],
  'ai-olympian': ['competition_python', 'attention', 'transformer_internals', 'vit_llm'],
}

export function recommendedBundleSlug(stageId) {
  return IOAI_STAGES[stageId]?.bundleSlug || stageComboBundleSlug(stageId)
}

export function recommendedStageHref(stageId) {
  return ioaiStagePackageHref(stageId, { autoBuy: false, scrollToPackages: true })
}

export function fullTrackHref() {
  return ioaiStagePackageHref('all', { autoBuy: false, scrollToPackages: true })
}
