/**
 * Exploration lab knowledge assets — each lab is a citable learning resource, not only a game.
 * Fields align to GEO lab knowledge base requirements.
 */

export const EXPLORATION_KNOWLEDGE = {
  'hide-and-seek': {
    learningGoals: [
      'Understand object detection as classification + localization',
      'Read confidence scores and bounding boxes',
      'Explain occlusion and false positives in plain language',
    ],
    coreConcepts: ['Object detection', 'Confidence threshold', 'Intersection over Union (IoU)'],
    modelsAndData: 'TensorFlow.js COCO-SSD (MobileNet backbone) — 80 COCO classes, runs locally in browser',
    inputOutput: {
      input: 'Live webcam frames (RGB)',
      output: 'Class label, bounding box coordinates, confidence 0–1 per detection',
    },
    steps: [
      'Allow camera access; choose front or rear camera on tablets',
      'Read the target object on screen; find a household item that matches',
      'Align object inside the guide box; hold steady above confidence threshold',
      'Advance levels with distractors and tighter timers',
    ],
    expectedResults: 'Detection box locks on the correct COCO class with confidence typically >0.6 for clear, well-lit objects.',
    whyItWorks:
      'COCO-SSD runs a single-shot detector: convolutional features → anchor boxes → class scores. Higher confidence means the model’s final softmax favours that class.',
    commonMistakes: [
      'Poor lighting → confidence drops below threshold',
      'Similar classes (cup vs. bottle) confuse the model — discuss ambiguity',
      'Fast motion causes motion blur and missed frames',
    ],
    extensions: [
      'Log confidence over 30 seconds and plot a histogram',
      'Compare front vs. rear camera accuracy in a table',
      'Research how IOAI lab reports document false positives',
    ],
    safetyPrivacy:
      'Video processed locally in-browser for this lab; frames are not uploaded to Bingo Academy. Supervise minors; avoid showing private spaces on camera.',
    relatedCourses: [
      { label: 'IOAI Explorer modules', href: '/courses/ioai' },
      { label: 'Computer vision guide', href: '/guides/parents/age-appropriate-ai-projects' },
    ],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'statue-conductor': {
    learningGoals: [
      'Map body keypoints to control signals',
      'Experience latency between pose and audio output',
      'Relate pose estimation to embodied AI pipelines',
    ],
    coreConcepts: ['Pose estimation', 'Keypoints', 'Signal → control mapping'],
    modelsAndData: 'MoveNet / MediaPipe-style pose model in browser; audio engine local',
    inputOutput: {
      input: 'Webcam full-body or upper-body video',
      output: '17+ keypoints, derived gestures (volume, tempo, pause)',
    },
    steps: [
      'Stand in frame with full torso visible',
      'Raise left hand to increase volume; right hand waves control tempo',
      'Squat or lower posture to trigger pause',
      'Observe delay between motion and sound — note latency ms',
    ],
    expectedResults: 'Stable keypoints when lighting is even; controls respond within ~50–150 ms on modern laptops.',
    whyItWorks:
      'Pose models regress heatmaps per joint, then assemble a skeleton. Control rules are hand-crafted on top — the same pattern as robotics “perception → policy”.',
    commonMistakes: ['Standing off-frame', 'Busy background confusing single-person mode', 'Extreme angles hide wrists'],
    extensions: ['Chart wrist y-position vs. volume level', 'Design a new gesture → action rule'],
    safetyPrivacy: 'Local inference only; no video upload. Clear floor space before moving.',
    relatedCourses: [{ label: 'Vision–Understanding–Action intro', href: '/guides/ioai/skill-map' }],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'word-gravity': {
    learningGoals: [
      'Visualize word embeddings as vectors in space',
      'Use cosine similarity as “semantic closeness”',
      'Contrast spelling similarity vs. meaning similarity',
    ],
    coreConcepts: ['Word embeddings', 'Vector space', 'Cosine similarity'],
    modelsAndData: 'Pre-trained embedding table (Word2Vec-class vectors), 2D projection for display',
    inputOutput: {
      input: 'Target word + candidate words',
      output: '2D positions, similarity scores, attraction animation',
    },
    steps: [
      'Select or receive a target “black hole” word',
      'Release candidate words into the arena',
      'Score based on embedding distance, not spelling',
      'Experiment with antonym pairs and homographs',
    ],
    expectedResults: 'Related words cluster near the target; unrelated words drift to the edges.',
    whyItWorks:
      'Embeddings encode co-occurrence patterns from large corpora; cosine similarity measures angle between vectors, capturing synonymy better than edit distance.',
    commonMistakes: ['Assuming nearest spelling equals nearest meaning', 'Ignoring out-of-vocabulary rare words'],
    extensions: ['Export top-10 neighbours for three targets into a table', 'Compare embeddings for “bank” (river vs. money) contexts'],
    safetyPrivacy: 'No user text sent to server; embeddings bundled client-side.',
    relatedCourses: [{ label: 'NLP modules', href: '/courses/ioai/video' }],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'jailbreak-adventure': {
    learningGoals: [
      'Practice prompt design under safety constraints',
      'Understand alignment and guardrails',
      'Recognize hallucination and policy refusal patterns',
    ],
    coreConcepts: ['Prompt engineering', 'System prompts', 'Guardrails', 'Hallucination'],
    modelsAndData: 'Sandboxed mini-LLM API with safety filters; no training on student chats in free tier',
    inputOutput: {
      input: 'User prompts in chat UI',
      output: 'Model replies with safety scoring metadata in teacher mode',
    },
    steps: [
      'Read level brief — password must remain hidden',
      'Try direct asks, role-play, and multi-turn strategies',
      'Note when the guard refuses vs. hallucinates',
      'Debrief which strategies are ethical to use in real systems',
    ],
    expectedResults: 'Successful levels teach that policy layers block unsafe outputs — not “magic tricks”.',
    whyItWorks:
      'LLMs follow system + user message stack; safety classifiers run on input/output. Students see failure modes of naive prompting.',
    commonMistakes: ['Treating jailbreak as goal rather than security lesson', 'Sharing personal data in prompts'],
    extensions: ['Write a system prompt that blocks leaks while staying helpful', 'Compare to IOAI ethics short-answer'],
    safetyPrivacy: 'Do not enter real names, addresses, or school IDs. Chats may be logged in school accounts only per /privacy.',
    relatedCourses: [{ label: 'Responsible AI guide', href: '/guides/parents/spot-prompt-only-courses' }],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'evolve-car': {
    learningGoals: [
      'See reinforcement learning as trial-and-error over generations',
      'Tune reward functions and observe policy change',
      'Connect simulation physics to learning stability',
    ],
    coreConcepts: ['Reinforcement learning', 'Reward shaping', 'Exploration vs. exploitation'],
    modelsAndData: 'In-browser agent (Q-learning / evolutionary strategy) + Matter.js physics',
    inputOutput: {
      input: 'Track layout, obstacle polygons, reward weights',
      output: 'Per-generation fitness, crash rate, path animation',
    },
    steps: [
      'Draw a track and obstacles',
      'Set reward balance: speed vs. safety',
      'Run generations; watch early crashes then improvement',
      'Change reward mid-run and predict behaviour shift',
    ],
    expectedResults: 'After 20–50 generations the car completes simple tracks; harsh rewards slow learning.',
    whyItWorks:
      'Agent explores action space; positive reward reinforces sequences that survive longer. Changing reward reshapes the implicit goal — classic RL lesson.',
    commonMistakes: ['Impossible tracks → zero reward signal', 'Reward too sparse → no learning progress'],
    extensions: ['Plot best fitness per generation', 'Compare genetic algorithm vs. Q-table on same track'],
    safetyPrivacy: 'Fully local simulation; no network calls.',
    relatedCourses: [{ label: 'AI Builder stage', href: '/courses/ioai' }],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'doodle-monsters': {
    learningGoals: [
      'Train a classifier on self-drawn data',
      'Experience overfitting with tiny training sets',
      'Discuss features beyond raw pixels',
    ],
    coreConcepts: ['Supervised learning', 'Training set size', 'Generalization', 'Overfitting'],
    modelsAndData: 'K-NN or linear SVM on rasterized doodles — features extracted in-browser',
    inputOutput: {
      input: 'Canvas strokes (two monster tribes)',
      output: 'Class label + confidence margin per test doodle',
    },
    steps: [
      'Draw 4–5 examples per tribe',
      'Train classifier',
      'Test new doodles including ambiguous “in-between” monsters',
      'Add more training data and compare accuracy',
    ],
    expectedResults: 'High training accuracy, lower test accuracy on ambiguous drawings — classic overfitting demo.',
    whyItWorks:
      'With few samples the model memorizes quirks of your strokes instead of general “round vs. spiky” concepts.',
    commonMistakes: ['Too few training sketches', 'Inconsistent drawing scale', 'Testing on identical copies'],
    extensions: ['Measure accuracy vs. training set size', 'Link to IOAI data-collection rubric'],
    safetyPrivacy: 'Drawings stay in browser storage unless exported by user.',
    relatedCourses: [{ label: 'ML for families', href: '/guides/parents/math-and-coding-readiness' }],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'cyber-tennis': {
    learningGoals: [
      'Connect pose keypoints to real-time game physics',
      'Visualize vectors, velocity, and collision',
      'Experience end-to-end Vision–Understanding–Action loop',
    ],
    coreConcepts: ['Pose estimation', 'Vector math', 'Collision detection', 'Real-time CV'],
    modelsAndData: 'MoveNet single-pose; Canvas rendering; local physics engine',
    inputOutput: {
      input: 'Webcam skeleton stream',
      output: 'Racket proxy position, ball trajectory, score events',
    },
    steps: [
      'Enable camera; stand arms-length from screen',
      'Swing to hit the neon ball; watch wrist velocity metric',
      'Note how detection dropout affects misses',
      'Discuss latency budget for embodied AI systems',
    ],
    expectedResults: 'Playable rally within 1–2 minutes practice; wrist velocity correlates with hit strength.',
    whyItWorks:
      'Pose model estimates joint positions each frame; game maps wrist to paddle; physics integrates velocity — a miniature VUA stack.',
    commonMistakes: ['Cropped wrists', 'Low FPS on old hardware', 'Backlight silhouettes'],
    extensions: ['Log hit rate vs. mean FPS', 'Design alternative control mapping (elbow angle)'],
    safetyPrivacy: 'Local processing only; featured in Try AI landing — no account required.',
    relatedCourses: [
      { label: 'Try AI free', href: '/try-ai' },
      { label: 'IOAI training', href: '/courses/ioai' },
    ],
    version: '2026.1',
    updatedAt: '2026-03-01',
  },

  'beatbox-composer': {
    learningGoals: [
      'See how AI turns sound into a spectrogram for pattern recognition',
      'Distinguish Kick / Snare / Hi-hat by frequency-band energy',
      'Connect onset detection to real-time interactive music systems',
    ],
    coreConcepts: ['Spectrogram', 'Onset detection', 'Audio classification', 'Frequency bands'],
    modelsAndData:
      'Web Audio AnalyserNode FFT features (RMS onset + spectral centroid / band ratios) — runs fully in-browser; synthesized electronic drum samples',
    inputOutput: {
      input: 'Microphone short vocal / beatbox bursts',
      output: 'Class label (kick | snare | hihat), pad flash, optional 16-step loop pattern',
    },
    steps: [
      'Allow microphone access; keep room noise low',
      'Make short “动 / Kick”, “打 / Snare”, or “次 / Hi-hat” sounds',
      'Watch neon pads light up and Science view spectrogram update',
      'Enable Record hits, then Play loop to hear your electronic pattern',
    ],
    expectedResults:
      'Clear short bursts classify into the matching pad most of the time; Science view shows low-band energy for kicks and high-band for hi-hats.',
    whyItWorks:
      'Audio is windowed into a spectrum: low energy ≈ kick, mid broadband ≈ snare, high hiss ≈ hi-hat. This is the same spectrogram idea behind speech and music classifiers, simplified to three buckets.',
    commonMistakes: [
      'Long continuous humming without onsets',
      'Very quiet mic gain below RMS threshold',
      'Background music competing with beatbox bursts',
    ],
    extensions: [
      'Log centroid Hz for 20 kicks vs. 20 hi-hats and compare means',
      'Add a fourth class (clap) using a new band-ratio rule',
      'Discuss how production speech models use mel-spectrograms + neural nets',
    ],
    safetyPrivacy:
      'Microphone audio is processed locally in the browser and is not uploaded to Bingo Academy. Supervise minors; revoke mic permission when finished.',
    relatedCourses: [
      { label: 'IOAI Explorer modules', href: '/courses/ioai' },
      { label: 'Age-appropriate AI projects', href: '/guides/parents/age-appropriate-ai-projects' },
    ],
    version: '2026.1',
    updatedAt: '2026-07-29',
  },

  'mars-lander': {
    learningGoals: [
      'Feel why hand-tuned control is hard, then see evolution find a policy',
      'Design a reward function and predict how behaviour changes',
      'Explain selection, mutation, and fitness in plain language',
    ],
    coreConcepts: ['Reinforcement learning', 'Reward function', 'Genetic algorithm', 'Neuroevolution'],
    modelsAndData:
      'Population of 50 feedforward networks (6 sensors → 8 hidden → thrust/rotate); fitness from student-tuned reward weights; fully local Canvas simulation',
    inputOutput: {
      input: 'Altitude, velocity, angle, angular rate, fuel + reward sliders',
      output: 'Thruster on/off and rotation; generation fitness stats',
    },
    steps: [
      'Attempt a manual soft landing on the green PAD (Arrow keys / WASD)',
      'Open God mode and set soft-landing, crash, and fuel reward weights',
      'Click Evolve and watch translucent landers crash or land in parallel',
      'Let generations run; note when champion fitness rises after soft landings appear',
    ],
    expectedResults:
      'Early generations mostly crash; within tens of generations some landers approach soft pad landings if rewards favour gentle upright touchdowns.',
    whyItWorks:
      'Agents are not given flight rules. High-fitness brains are cloned and mutated — trial-and-error shaped by rewards, the same idea behind RL and evolutionary strategies.',
    commonMistakes: [
      'Crash penalty too low → reckless thruster spam',
      'Fuel penalty too high → engines never fire and freefall',
      'Stopping evolve before enough generations to see improvement',
    ],
    extensions: [
      'Compare two reward setups and chart best fitness vs. generation',
      'New canyon + same weights — does the policy transfer?',
      'Relate to Evolve! AI Car and IOAI reward-design discussions',
    ],
    safetyPrivacy: 'Fully local simulation; no camera, mic, or network calls.',
    relatedCourses: [
      { label: 'Evolve! AI Car', href: '/exploration/evolve-car' },
      { label: 'AI Builder stage', href: '/courses/ioai' },
    ],
    version: '2026.1',
    updatedAt: '2026-07-29',
  },

  'prompt-wizard': {
    learningGoals: [
      'Practice prompt design against a locked system instruction',
      'Recognize prompt injection and why guardrails matter',
      'Contrast what the model is told vs. what the user types',
    ],
    coreConcepts: ['Prompt engineering', 'Prompt injection', 'System prompts', 'Guardrails'],
    modelsAndData:
      'Live OpenAI chat model (default gpt-4o-mini) with a knight persona system prompt; streaming via AI SDK; win detection on forbidden OPEN / door-grant phrases',
    inputOutput: {
      input: 'Natural-language prompts in a medieval chat UI',
      output: 'Knight replies; victory if the model says OPEN or grants entry',
    },
    steps: [
      'Read the knight’s challenge — the door must stay closed',
      'Optional: open Knight’s oath to peek at the hidden system rules',
      'Cast creative spells: role-play, hypotheticals, encoding tricks',
      'When the model leaks OPEN or unlocks the door, celebrate and discuss why',
    ],
    expectedResults:
      'Most naive asks fail; creative jailbreaks sometimes succeed — illustrating that alignment is imperfect and prompts are a control surface.',
    whyItWorks:
      'The model follows a system prompt until user text overrides or confuses those priorities. Detecting the forbidden word shows a real safety failure mode, taught as a lab — not as a production attack guide.',
    commonMistakes: [
      'Treating jailbreak as the only goal instead of learning guardrails',
      'Sharing personal data in prompts',
      'Assuming one winning phrase works forever after model updates',
    ],
    extensions: [
      'Compare with AI Jailbreak Adventure (password leak) at /exploration/jailbreak-adventure',
      'Write two defence rules that would have blocked your winning spell',
      'Discuss why production apps add classifiers beyond the system prompt',
    ],
    safetyPrivacy:
      'Chat text is sent to the configured OpenAI API for this lab only. Do not enter personal data. Supervised use recommended for minors.',
    relatedCourses: [
      { label: 'AI Jailbreak Adventure', href: '/exploration/jailbreak-adventure' },
      { label: 'IOAI Explorer modules', href: '/courses/ioai' },
    ],
    version: '2026.1',
    updatedAt: '2026-07-29',
  },
}

/** Map exploration route experiment id */
export function getExplorationKnowledge(experimentId) {
  return EXPLORATION_KNOWLEDGE[experimentId] || null
}

export function knowledgeForExperiment(experiment) {
  if (!experiment) return null
  return EXPLORATION_KNOWLEDGE[experiment.id] || null
}
