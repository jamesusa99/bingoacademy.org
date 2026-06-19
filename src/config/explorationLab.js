/** AI Exploration Lab — standalone gamified web experiments (not tied to course product lines) */

export const LAB_VALUE_PROPS = [
  {
    id: 'zero-setup',
    icon: '⚡',
    title: 'Zero setup',
    desc: 'Open in browser — no installs, GPUs, or Python environments.',
  },
  {
    id: 'cross-platform',
    icon: '📱',
    title: 'PC · Mac · iPad',
    desc: 'Touch-first on iPad; mouse and trackpad on desktop. One experience everywhere.',
  },
  {
    id: 'play-to-learn',
    icon: '🎮',
    title: 'Play to learn',
    desc: 'Game loops teach detection, embeddings, prompts, and RL — not slide decks.',
  },
]

export const LAB_UX_PRINCIPLES = [
  {
    icon: '👆',
    title: 'Touch-native controls',
    desc: 'Large sliders, drag-and-drop, and pinch-zoom — no keyboard combos required.',
  },
  {
    icon: '📊',
    title: 'Science dashboard',
    desc: 'See neurons light up, weights shift, and loss curves move as you play.',
  },
  {
    icon: '🏅',
    title: 'Levels & badges',
    desc: 'Beat a challenge, unlock a digital badge, and share to social in one tap.',
  },
]

export const LAB_TECH_STACK = [
  'Canvas',
  'WebGL',
  'TensorFlow.js',
  'MediaPipe Web',
  'Matter.js',
  'WebAssembly',
]

export const LAB_CATEGORIES = [
  { id: 'cv', label: 'Computer Vision', icon: '👁️', color: 'cyan' },
  { id: 'nlp', label: 'NLP & Large Models', icon: '💬', color: 'violet' },
  { id: 'ml', label: 'Machine Learning & RL', icon: '🧠', color: 'amber' },
]

export const EXPLORATION_EXPERIMENTS = [
  {
    id: 'hide-and-seek',
    category: 'cv',
    number: 1,
    emoji: '🎯',
    title: 'AI Hide & Seek',
    subtitle: 'Object Detection & Occlusion',
    gameplay:
      'Turn on your camera (front/back on iPad). Cartoon targets pop up — find real objects at home and align them in frame. Levels add distractors and tighter time limits.',
    concepts: ['Object Detection', 'Confidence Score', 'Bounding Box'],
    tech: 'Browser TensorFlow.js · MobileNet / COCO-SSD',
    techTags: ['tfjs', 'WebRTC', 'Canvas'],
    badge: { id: 'cv-detective', name: 'CV Detective', icon: '🔍' },
    difficulty: 'Beginner',
    duration: '10–15 min',
    status: 'live',
    playPath: '/exploration/hide-and-seek',
    dashboardMetrics: ['confidence', 'iou', 'fps'],
  },
  {
    id: 'statue-conductor',
    category: 'cv',
    number: 2,
    emoji: '🎵',
    title: 'AI Virtual Conductor',
    subtitle: 'Pose Estimation & Control',
    gameplay:
      'Stand in front of the camera and conduct a virtual band — raise your left hand for volume, wave the right for tempo, squat to pause. Haptic-style feedback on iPad.',
    concepts: ['Pose Estimation', 'Keypoints', 'Signal → Skeleton'],
    tech: 'MoveNet / MediaPipe Web · touch-optimized',
    techTags: ['MediaPipe', 'WebGL', 'gesture'],
    badge: { id: 'pose-maestro', name: 'Pose Maestro', icon: '🎼' },
    difficulty: 'Beginner',
    duration: '12–18 min',
    status: 'live',
    playPath: '/exploration/virtual-conductor',
    dashboardMetrics: ['keypoints', 'latency', 'joint-angle'],
  },
  {
    id: 'word-gravity',
    category: 'nlp',
    number: 3,
    emoji: '🌌',
    title: 'Word Gravity Field',
    subtitle: 'Word Embeddings & Vectors',
    gameplay:
      'A 2D gravity arena: a “black hole” target word pulls related words in — unrelated words drift away. Score by semantic closeness, not spelling.',
    concepts: ['Word Embeddings', 'Semantic Space', 'Cosine Similarity'],
    tech: 'WebGL particles · Word2Vec / t-SNE-style viz',
    techTags: ['WebGL', 'D3-style viz', 'vectors'],
    badge: { id: 'embedding-navigator', name: 'Embedding Navigator', icon: '🛸' },
    difficulty: 'Intermediate',
    duration: '8–12 min',
    status: 'live',
    playPath: '/exploration/word-gravity',
    dashboardMetrics: ['cosine-sim', 'vector-dim', 'pull-force'],
  },
  {
    id: 'jailbreak-adventure',
    category: 'nlp',
    number: 4,
    emoji: '🤖',
    title: 'AI Jailbreak Adventure',
    subtitle: 'Prompt Engineering Sandbox',
    gameplay:
      'Text puzzle levels: a guard bot must never reveal the password. Role-play, trap questions, and creative prompts — learn alignment and guardrails hands-on.',
    concepts: ['Prompt Engineering', 'Context Alignment', 'Guardrails & Hallucination'],
    tech: 'Safe mini-LLM API · iPad-friendly chat UI',
    techTags: ['LLM API', 'chat UI', 'sandbox'],
    badge: { id: 'prompt-strategist', name: 'Prompt Strategist', icon: '🗝️' },
    difficulty: 'Intermediate',
    duration: '15–20 min',
    status: 'live',
    playPath: '/exploration/jailbreak-adventure',
    dashboardMetrics: ['tokens', 'safety-score', 'turn-count'],
  },
  {
    id: 'evolve-car',
    category: 'ml',
    number: 5,
    emoji: '🏎️',
    title: 'Evolve! AI Car',
    subtitle: 'Reinforcement Learning',
    gameplay:
      'Draw tracks and obstacles with finger or mouse. Hit “Evolve” — the car crashes at first, then learns over generations. Tune reward: speed vs. safety and watch behavior shift.',
    concepts: ['Reinforcement Learning', 'Trial & Error', 'Reward Function'],
    tech: 'Matter.js physics · in-browser NN / Q-learning agent',
    techTags: ['Matter.js', 'genetic algo', 'Canvas'],
    badge: { id: 'rl-engineer', name: 'RL Engineer', icon: '🏁' },
    difficulty: 'Advanced',
    duration: '20–30 min',
    status: 'live',
    playPath: '/exploration/evolve-car',
    dashboardMetrics: ['reward', 'generation', 'crash-rate'],
  },
  {
    id: 'cyber-tennis',
    category: 'cv',
    number: 7,
    emoji: '🎾',
    title: 'AI Cyber Tennis',
    subtitle: 'Pose Estimation & Cyber Squash',
    gameplay:
      'Stand up and swing! Your webcam becomes a first-person cyber squash court — MoveNet tracks your skeleton while a neon ball ricochets off virtual walls. Learn vectors, collisions, and pose keypoints by moving.',
    concepts: ['Pose Estimation', 'Vector Math', 'Collision Detection', 'Real-time CV'],
    tech: 'MoveNet · Canvas overlay · react-webcam · browser physics (Phase 2)',
    techTags: ['MoveNet', 'Canvas', 'WebRTC', 'vectors'],
    badge: { id: 'cyber-athlete', name: 'Cyber Athlete', icon: '🎾' },
    difficulty: 'Beginner',
    duration: '10–15 min',
    status: 'live',
    playPath: '/exploration/cyber-tennis',
    dashboardMetrics: ['keypoints', 'wrist-vel', 'ball-vel', 'fps'],
  },
  {
    id: 'doodle-monsters',
    category: 'ml',
    number: 6,
    emoji: '✏️',
    title: 'Doodle Monster Classifier',
    subtitle: 'Supervised Learning & Overfitting',
    gameplay:
      'Draw two monster tribes (round vs. spiky), train on 4–5 sketches each, then test new doodles. Draw an “in-between” monster and watch the classifier hesitate.',
    concepts: ['Supervised Learning', 'Feature Extraction', 'Overfitting & Generalization'],
    tech: 'HTML5 Canvas input · K-NN / SVM in-browser',
    techTags: ['Canvas', 'K-NN', 'real-time'],
    badge: { id: 'ml-trainer', name: 'ML Trainer', icon: '🎨' },
    difficulty: 'Beginner',
    duration: '10–15 min',
    status: 'live',
    playPath: '/exploration/doodle-monsters',
    dashboardMetrics: ['accuracy', 'train-size', 'margin'],
  },
]

export const BADGE_STORAGE_KEY = 'bingo-lab-badges'

export function getExperimentsByCategory(categoryId) {
  return EXPLORATION_EXPERIMENTS.filter((e) => e.category === categoryId)
}

export function getExperimentById(id) {
  return EXPLORATION_EXPERIMENTS.find((e) => e.id === id)
}
