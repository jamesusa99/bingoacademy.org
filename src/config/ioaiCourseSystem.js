/**
 * IOAI Competition Course System — 4 stages · 11 modules · 110 lessons
 * Generates courses_catalog entries for /courses?line=ioai&sub=video
 */

export const IOAI_COURSE_SYSTEM = {
  title: 'IOAI Competition Course System',
  summary: '4 stages · 11 modules · 110 lessons',
  stages: [
    { id: 'foundation', emoji: '🟢', label: 'Foundation Stage', modules: 3, lessons: 24, level: 'beginner' },
    { id: 'core', emoji: '🟡', label: 'Core Skills Stage', modules: 3, lessons: 36, level: 'intermediate' },
    { id: 'competition', emoji: '🔴', label: 'Competition Stage', modules: 3, lessons: 34, level: 'advanced' },
    { id: 'sprint', emoji: '🏆', label: 'Sprint Stage', modules: 2, lessons: 16, level: 'advanced' },
  ],
  modules: [
    {
      number: 1,
      stage: 'foundation',
      title: 'Data Structures',
      category: 'ai-fundamentals',
      lessons: [
        'Arrays & Strings',
        'Linked Lists: Principles & Implementation',
        'Stacks & Queues: Applications',
        'Hash Tables & Sets',
        'Trees & Binary Trees',
        'Graph Representation & Traversal',
        'Heaps & Priority Queues',
        'Comprehensive Practice & Summary',
      ],
    },
    {
      number: 2,
      stage: 'foundation',
      title: 'Python for Competitions',
      category: 'ai-fundamentals',
      lessons: [
        'Efficient Python Programming',
        'I/O & Data Processing',
        'Recursion & Divide-and-Conquer',
        'Advanced Sorting Algorithms',
        'Search Algorithms (BFS/DFS)',
        'Greedy Algorithms',
        'Introduction to Dynamic Programming',
        'Comprehensive Programming Practice',
      ],
    },
    {
      number: 3,
      stage: 'foundation',
      title: 'Mathematics for AI',
      category: 'ai-fundamentals',
      lessons: [
        'Linear Algebra Core (Vectors & Matrices)',
        'Matrix Decomposition & Eigenvalues',
        'Probability Fundamentals',
        'Statistical Inference & Hypothesis Testing',
        'Calculus & Gradients',
        'Optimization Theory',
        'Information Theory',
        'Math Tools in Practice (NumPy/SciPy)',
      ],
    },
    {
      number: 4,
      stage: 'core',
      title: 'Machine Learning Fundamentals',
      category: 'machine-learning',
      lessons: [
        'ML Overview & Workflow',
        'Linear Regression & Regularization',
        'Logistic Regression & Classification',
        'Decision Trees & Random Forests',
        'Support Vector Machines (SVM)',
        'Clustering Algorithms (K-Means/DBSCAN)',
        'Dimensionality Reduction (PCA/t-SNE)',
        'Model Evaluation & Cross-Validation',
        'Ensemble Methods (Bagging/Boosting)',
        'Feature Selection & Engineering',
        'Hyperparameter Tuning',
        'Comprehensive Project',
      ],
    },
    {
      number: 5,
      stage: 'core',
      title: 'Deep Learning in Practice',
      category: 'deep-learning',
      lessons: [
        'Neural Networks & Backpropagation',
        'PyTorch Fundamentals',
        'Convolutional Neural Networks (CNN)',
        'Classic CNN Architectures (ResNet/VGG)',
        'Recurrent Neural Networks (RNN/LSTM)',
        'Sequence Models in Practice',
        'Attention Mechanism Principles',
        'Transformer Architecture Deep Dive',
        'Pre-trained Models (BERT/GPT)',
        'Transfer Learning & Fine-tuning',
        'Data Augmentation Techniques',
        'Regularization & Overfitting Prevention',
        'Learning Rate Scheduling & Optimizers',
        'Model Compression & Acceleration',
        'Distributed Training',
        'Deep Learning Project',
      ],
    },
    {
      number: 6,
      stage: 'core',
      title: 'Data Processing & Feature Engineering',
      category: 'machine-learning',
      lessons: [
        'Data Cleaning & Preprocessing',
        'Missing Value Handling Strategies',
        'Outlier Detection & Treatment',
        'Feature Scaling & Encoding',
        'Time Series Feature Engineering',
        'Text Feature Extraction (TF-IDF/Word2Vec)',
        'Image Data Preprocessing',
        'Competition Data Pipeline Construction',
      ],
    },
    {
      number: 7,
      stage: 'competition',
      title: 'Computer Vision Competitions',
      category: 'computer-vision',
      lessons: [
        'Image Classification Competition Strategy',
        'Object Detection (YOLO/RCNN)',
        'Image Segmentation (U-Net/MaskRCNN)',
        'Advanced Data Augmentation (Mixup/CutMix)',
        'Model Ensembling & Test-Time Augmentation (TTA)',
        'CV Competition Case Studies (Kaggle)',
        'OCR & Document Analysis',
        'Video Understanding Fundamentals',
        'Introduction to 3D Vision',
        'Medical Image Analysis',
        'Remote Sensing Image Processing',
        'CV Comprehensive Competition Simulation',
      ],
    },
    {
      number: 8,
      stage: 'competition',
      title: 'NLP Competitions',
      category: 'nlp',
      lessons: [
        'Text Classification Competition Strategy',
        'Sentiment Analysis in Practice',
        'Named Entity Recognition (NER)',
        'Machine Translation Evaluation',
        'Text Generation Quality Control',
        'Pre-trained Model Fine-tuning Techniques',
        'Prompt Engineering',
        'Large Language Model Applications',
        'Multilingual NLP Processing',
        'Information Extraction & Relation Extraction',
        'Dialogue System Evaluation',
        'NLP Comprehensive Competition Simulation',
      ],
    },
    {
      number: 9,
      stage: 'competition',
      title: 'Reinforcement Learning & Decision Making',
      category: 'deep-learning',
      lessons: [
        'RL Fundamentals',
        'Q-Learning & DQN',
        'Policy Gradient Methods',
        'Actor-Critic Architecture',
        'Multi-Agent Reinforcement Learning',
        'Imitation Learning',
        'Offline Reinforcement Learning',
        'RL Applications in Gaming',
        'RL Applications in Robotics',
        'RL Competition Simulation',
      ],
    },
    {
      number: 10,
      stage: 'sprint',
      title: 'Competition Strategy & Mock Contests',
      category: 'ai-fundamentals',
      lessons: [
        'IOAI Competition Rules & Format',
        'Time Management Strategies',
        'Problem Analysis & Solution Frameworks',
        'Rapid Prototyping Techniques',
        'Model Debugging & Troubleshooting',
        'Competition Report Writing',
        'Mock Contest 1 (CV Track)',
        'Mock Contest 2 (NLP Track)',
        'Mock Contest 3 (Mixed Track)',
        'Post-Competition Review Methodology',
      ],
    },
    {
      number: 11,
      stage: 'sprint',
      title: 'National Team Selection',
      category: 'ai-fundamentals',
      lessons: [
        'Advanced Model Design & Innovation',
        'Paper Reading & Reproduction Skills',
        'Algorithm Innovation & Improvement',
        'Complete Project Report Writing',
        'Presentation & Defense Skills',
        'National Team Selection Mock Interview',
      ],
    },
  ],
}

const STAGE_BY_ID = Object.fromEntries(IOAI_COURSE_SYSTEM.stages.map((s) => [s.id, s]))

function lessonSlug(moduleNumber, lessonIndex) {
  return `ioai-${moduleNumber}-${lessonIndex + 1}`
}

function stageForModule(module) {
  return STAGE_BY_ID[module.stage]
}

export function buildIOAIVideoCatalogEntries() {
  const { modules, title } = IOAI_COURSE_SYSTEM
  const entries = []

  const fullSyllabus = modules.map((mod) => {
    const stage = stageForModule(mod)
    return `Module ${mod.number}: ${mod.title} (${mod.lessons.length} lessons) — ${stage.label}`
  })

  entries.push({
    id: 'ioai-competition-system',
    line: 'ioai',
    sub: 'video',
    status: 'live',
    deliveryType: 'video',
    featured: true,
    name: `${title} — 110 Lessons`,
    nameEn: title,
    desc: 'Complete IOAI competition training path: data structures & Python foundations, ML/DL core skills, CV/NLP/RL competition tracks, and national-team sprint prep with mock contests.',
    price: 'From $2,990',
    hours: '110 lessons · 11 modules',
    badge: 'IOAI Full Track',
    category: 'ai-fundamentals',
    level: 'intermediate',
    lessons: 110,
    rating: 4.9,
    students: 3200,
    outcomes: [
      'Master the full IOAI written-exam and lab-report skill stack',
      'Complete CV, NLP, and RL competition simulations',
      'Finish mock contests and national-team selection prep',
    ],
    audience: 'Grades 7–12 · Python basics recommended · IOAI & whitelist competition candidates',
    syllabus: fullSyllabus,
    labSlugs: [],
    sortOrder: 0,
  })

  let sortOrder = 1
  for (const mod of modules) {
    const stage = stageForModule(mod)
    mod.lessons.forEach((lessonTitle, idx) => {
      const lessonNum = `${mod.number}.${idx + 1}`
      entries.push({
        id: lessonSlug(mod.number, idx),
        line: 'ioai',
        sub: 'video',
        status: 'live',
        deliveryType: 'video',
        featured: false,
        name: `${lessonNum} ${lessonTitle}`,
        nameEn: lessonTitle,
        desc: `${stage.emoji} ${stage.label} · Module ${mod.number}: ${mod.title} — lesson ${idx + 1} of ${mod.lessons.length}.`,
        price: 'Included in IOAI Track',
        hours: '1 lesson · ~45 min',
        badge: `${stage.emoji} M${mod.number}`,
        category: mod.category,
        level: stage.level,
        lessons: 1,
        rating: 4.85,
        students: 400 + mod.number * 40 + idx * 5,
        outcomes: [`Complete ${lessonTitle} with guided video and checkpoints`],
        audience: 'IOAI competition trainees',
        syllabus: [lessonTitle, `Module ${mod.number}: ${mod.title}`, stage.label],
        labSlugs: [],
        sortOrder: sortOrder++,
      })
    })
  }

  return entries
}

export function buildIOAICourseListMeta() {
  const meta = {
    'ioai-competition-system': {
      category: 'ai-fundamentals',
      level: 'intermediate',
      lessons: 110,
      rating: 4.9,
      students: 3200,
    },
  }
  for (const mod of IOAI_COURSE_SYSTEM.modules) {
    const stage = stageForModule(mod)
    mod.lessons.forEach((_, idx) => {
      const id = lessonSlug(mod.number, idx)
      meta[id] = {
        category: mod.category,
        level: stage.level,
        lessons: 1,
        rating: 4.85,
        students: 400 + mod.number * 40 + idx * 5,
      }
    })
  }
  return meta
}
