/** IOAI Training Lab — Zero-Setup, Learn by Doing (Kaggle Learn–style) */

export const IOAI_LAB_QUERY = { line: 'ioai', sub: 'online-lab' }
export const IOAI_LAB_HREF = '/labs?line=ioai&sub=online-lab'
export const IOAI_LAB_SESSION_BASE = '/labs/ioai/training-lab'

export const PROGRESS_STORAGE_KEY = 'bingo-ioai-lab-progress'
export const GPU_HOURS_STORAGE_KEY = 'bingo-ioai-gpu-hours'

export const IOAI_LAB_TAGLINE = 'Zero-Setup, Learn by Doing'
export const IOAI_LAB_SUBTITLE =
  'No CUDA installs. No dependency hell. Open the page, read the tutorial, run cells in the cloud notebook — built for IOAI written exams and national-team lab reports.'

/** @typedef {'cpu' | 'gpu-lite' | 'gpu'} ComputeTier */

export const IOAI_MODULES = [
  {
    id: 'module-a',
    letter: 'A',
    title: 'Survival Guide',
    subtitle: 'Basic Survival Guide',
    goal: 'Pass the written exam — data & Python, CPU-only, instant open.',
    icon: '🏆',
    compute: 'cpu',
    unlockRequirement: null,
    color: 'amber',
  },
  {
    id: 'module-b',
    letter: 'B',
    title: 'Deep Learning Core',
    subtitle: 'Deep Learning Core',
    goal: 'PyTorch tensors, autograd, CNNs & sequence models — lightweight GPU.',
    icon: '🚀',
    compute: 'gpu-lite',
    unlockRequirement: 'Complete Module A with 80%+ checkpoint score',
    color: 'cyan',
  },
  {
    id: 'module-c',
    letter: 'C',
    title: 'IOAI Selection Sim',
    subtitle: 'Selection Round Simulation',
    goal: 'Full experiment reports — methodology, training logs, PDF export.',
    icon: '⚔️',
    compute: 'gpu',
    unlockRequirement: 'Module A complete + GPU bounty unlocked',
    color: 'violet',
  },
]

export const IOAI_LABS = [
  {
    id: 'lab-1',
    moduleId: 'module-a',
    number: 1,
    title: 'Python for AI',
    subtitle: 'List comprehensions, OOP, exceptions',
    duration: '45 min',
    compute: 'cpu',
    runtime: 'jupyterlite',
    objectives: ['Write clean Python for competition scripts', 'Handle errors without crashing notebooks'],
    skills: ['python', 'debugging'],
  },
  {
    id: 'lab-2',
    moduleId: 'module-a',
    number: 2,
    title: 'Data Scalpel',
    subtitle: 'NumPy broadcasting & Pandas slicing',
    duration: '60 min',
    compute: 'cpu',
    runtime: 'jupyterlite',
    objectives: ['Clean IOAI-style tabular data', 'Slice and aggregate with Pandas'],
    skills: ['data', 'numpy'],
  },
  {
    id: 'lab-3',
    moduleId: 'module-a',
    number: 3,
    title: 'Data Lens',
    subtitle: 'Matplotlib & Seaborn distributions',
    duration: '50 min',
    compute: 'cpu',
    runtime: 'jupyterlite',
    objectives: ['Plot distributions required in written exams', 'Choose the right chart for skewed data'],
    skills: ['viz', 'data'],
  },
  {
    id: 'lab-4',
    moduleId: 'module-b',
    number: 4,
    title: 'Tensor World',
    subtitle: 'Tensor ops & Autograd',
    duration: '75 min',
    compute: 'gpu-lite',
    runtime: 'cloud',
    objectives: ['Understand shape & dtype', 'Trace gradients through a tiny graph'],
    skills: ['pytorch', 'math'],
  },
  {
    id: 'lab-5',
    moduleId: 'module-b',
    number: 5,
    title: 'First Neural Net',
    subtitle: 'FC layers, loss, backprop by hand',
    duration: '90 min',
    compute: 'gpu-lite',
    runtime: 'cloud',
    objectives: ['Build MLP from scratch in PyTorch', 'Explain activation & loss choices'],
    skills: ['pytorch', 'networks'],
  },
  {
    id: 'lab-6',
    moduleId: 'module-b',
    number: 6,
    title: 'Vision & Sequence',
    subtitle: 'CNN image clf · RNN/Transformer intro',
    duration: '120 min',
    compute: 'gpu-lite',
    runtime: 'cloud',
    objectives: ['Train a small CNN on CIFAR-style data', 'Compare RNN vs attention on a toy sequence'],
    skills: ['cnn', 'sequence'],
  },
  {
    id: 'lab-7',
    moduleId: 'module-c',
    number: 7,
    title: 'GPU Mastery',
    subtitle: '.to(device) & memory hygiene',
    duration: '60 min',
    compute: 'gpu',
    runtime: 'cloud',
    objectives: ['Move models & batches to GPU safely', 'Avoid OOM during IOAI-style training'],
    skills: ['gpu', 'pytorch'],
  },
  {
    id: 'lab-8',
    moduleId: 'module-c',
    number: 8,
    title: 'Hyperparams & Logs',
    subtitle: 'LR sweeps & mini W&B board',
    duration: '90 min',
    compute: 'gpu',
    runtime: 'cloud',
    objectives: ['Log loss curves for multiple LRs', 'Pick hyperparams with evidence'],
    skills: ['tuning', 'viz'],
  },
  {
    id: 'lab-9',
    moduleId: 'module-c',
    number: 9,
    title: 'Final Project',
    subtitle: 'IOAI mock — plant disease classification',
    duration: '3–4 hrs',
    compute: 'gpu',
    runtime: 'cloud',
    objectives: ['End-to-end pipeline + Markdown report', 'Export PDF for submission'],
    skills: ['data', 'pytorch', 'viz', 'tuning', 'report'],
  },
]

export const SKILL_AXES = [
  { id: 'data', label: 'Data processing' },
  { id: 'python', label: 'Python' },
  { id: 'viz', label: 'Visualization' },
  { id: 'pytorch', label: 'PyTorch' },
  { id: 'networks', label: 'Model building' },
  { id: 'tuning', label: 'Hyperparams' },
]

export function getLabById(labId) {
  return IOAI_LABS.find((l) => l.id === labId)
}

export function labsForModule(moduleId) {
  return IOAI_LABS.filter((l) => l.moduleId === moduleId)
}

export function getModule(moduleId) {
  return IOAI_MODULES.find((m) => m.id === moduleId)
}

export function labSessionPath(labId) {
  return `${IOAI_LAB_SESSION_BASE}/${labId}`
}

export function computeLabel(tier) {
  if (tier === 'cpu') return 'CPU · JupyterLite (browser)'
  if (tier === 'gpu-lite') return 'GPU T4 · Cloud notebook'
  return 'GPU T4 · Extended session'
}

export function defaultProgress() {
  return {
    completedLabs: [],
    checkpointScores: {},
    gpuHoursRemaining: 0,
    moduleAComplete: false,
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    return raw ? { ...defaultProgress(), ...JSON.parse(raw) } : defaultProgress()
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress) {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

/** Module B unlocked after Module A labs done with avg checkpoint ≥ 0.8 */
export function isModuleUnlocked(moduleId, progress) {
  if (moduleId === 'module-a') return true
  if (moduleId === 'module-b') return progress.moduleAComplete || progress.gpuHoursRemaining > 0
  if (moduleId === 'module-c') return progress.gpuHoursRemaining > 0 && progress.moduleAComplete
  return false
}

export function moduleAProgress(progress) {
  const labs = labsForModule('module-a')
  const done = labs.filter((l) => progress.completedLabs.includes(l.id)).length
  const scores = labs.map((l) => progress.checkpointScores[l.id] ?? 0)
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  return { done, total: labs.length, avg }
}

export function skillRadarValues(progress) {
  const counts = Object.fromEntries(SKILL_AXES.map((s) => [s.id, 0]))
  for (const labId of progress.completedLabs) {
    const lab = getLabById(labId)
    if (!lab) continue
    for (const skill of lab.skills) {
      counts[skill] = (counts[skill] || 0) + 1
    }
  }
  const max = Math.max(3, ...Object.values(counts))
  return SKILL_AXES.map((axis) => ({
    ...axis,
    value: Math.round(((counts[axis.id] || 0) / max) * 100),
  }))
}

/** Sample tutorial + notebook for Lab 1 (others reuse template in session page) */
export const LAB_CONTENT = {
  'lab-1': {
    tutorialMarkdown: null, // uses DEFAULT_PYTHON_LISTS_MD via sections fallback in session
    tutorial: [
      {
        title: 'Why Python matters for IOAI',
        body: 'Written rounds and lab reports both expect readable, defensive Python. You will use list comprehensions for compact transforms, small classes to wrap datasets, and try/except so one bad row does not kill a 2-hour exam block.',
      },
      {
        title: 'List comprehensions',
        body: 'Replace noisy loops with expressions. IOAI data pipelines often map, filter, and normalize in one line.',
        code: `# Square evens only\nevens_sq = [x * x for x in range(20) if x % 2 == 0]\nprint(evens_sq[:5])`,
      },
      {
        title: 'Checkpoint',
        body: 'Create a list called ioai_topics containing the strings "Math", "Python", and "DL".',
        code: `ioai_topics = ["Math", "Python", "DL"]\nprint(ioai_topics)`,
      },
    ],
    starterCode: `# Challenge: Create a list called ioai_topics\n# containing "Math", "Python", and "DL".\n\nioai_topics = [\n    # your strings here\n]\n\nprint(ioai_topics)`,
    grader: {
      type: 'pyodide',
      testCode:
        "type(ioai_topics) == list and len(ioai_topics) == 3 and 'DL' in ioai_topics",
      successMessage: '✅ Correct! You have mastered Python lists.',
      hintMessage:
        '💡 Hint: Make sure your list is exactly named ioai_topics and contains the 3 required strings.',
    },
  },
}

export function getLabContent(labId) {
  return LAB_CONTENT[labId] || {
    tutorial: [
      {
        title: 'Coming soon',
        body: 'This lab notebook is being prepared. The shell below shows the final dual-pane experience — tutorial left, cloud notebook right, auto-grader dock below.',
      },
    ],
    starterCode: '# IOAI Training Lab\n# Tutorial content loading...\nprint("Zero-Setup · Learn by Doing")',
    grader: { mustInclude: ['print'], runExpect: 'Zero-Setup' },
  }
}
