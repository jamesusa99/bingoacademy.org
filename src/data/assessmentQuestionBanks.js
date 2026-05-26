export const QUESTION_BANKS = {
  basic: [
    {
      q: 'What does "AI" stand for?',
      options: ['Automated Interface', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Input'],
      answer: 1,
    },
    {
      q: 'Which of the following is an example of supervised learning?',
      options: [
        'Grouping similar photos without labels',
        'Teaching a model to recognise spam using labelled emails',
        'A robot exploring a maze on its own',
        'Generating random text',
      ],
      answer: 1,
    },
    {
      q: 'What is a neural network inspired by?',
      options: ['Computer circuits', 'The human brain', 'DNA sequences', 'Mathematical equations'],
      answer: 1,
    },
    {
      q: 'Which statement best describes "machine learning"?',
      options: [
        'Machines that can physically move',
        'Software that follows only hard-coded rules',
        'Systems that learn from data without explicit programming',
        'Hardware that processes data faster',
      ],
      answer: 2,
    },
    {
      q: 'Which of the following raises an AI ethics concern?',
      options: [
        'Using AI to recommend music',
        'Using AI to automate document filing',
        'Using biased training data in hiring decisions',
        'Using AI to translate text',
      ],
      answer: 2,
    },
    {
      q: 'What is "training data" in machine learning?',
      options: [
        'Data used to test a model after deployment',
        'Data shown to humans for manual review',
        'Data used to teach a model to make predictions',
        'Encrypted data stored in the cloud',
      ],
      answer: 2,
    },
    {
      q: 'A chatbot that answers customer questions is an example of:',
      options: ['Robotics', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning'],
      answer: 1,
    },
    {
      q: 'Which tool is most associated with AI image generation?',
      options: ['Microsoft Excel', 'DALL·E / Midjourney', 'Google Sheets', 'Adobe Photoshop filters'],
      answer: 1,
    },
  ],
  innovation: [
    {
      q: 'You want to build an AI tool that helps students study. What is your FIRST step?',
      options: [
        'Start coding immediately',
        'Choose the best programming language',
        'Define the problem and understand user needs',
        'Look for a dataset online',
      ],
      answer: 2,
    },
    {
      q: 'A project combines AI with environmental science to monitor pollution. This is best described as:',
      options: ['Narrow AI', 'Cross-disciplinary AI application', 'Supervised learning only', 'Robotics engineering'],
      answer: 1,
    },
    {
      q: 'During a brainstorm, a teammate suggests an idea that seems impractical. What should you do?',
      options: [
        'Dismiss it immediately',
        'Record it and explore if any part is useful',
        'Argue that your idea is better',
        'Skip the idea and move on',
      ],
      answer: 1,
    },
    {
      q: 'Which approach best describes design thinking in AI projects?',
      options: [
        'Build → Test → Design',
        'Empathise → Define → Ideate → Prototype → Test',
        'Code → Deploy → Ignore feedback',
        'Research → Present → Submit',
      ],
      answer: 1,
    },
    {
      q: 'An AI model works well in testing but fails in the real world. What is the most likely cause?',
      options: [
        'The model used too many parameters',
        'The training data did not represent the real-world environment',
        'The programming language was wrong',
        'The hardware was too slow',
      ],
      answer: 1,
    },
    {
      q: 'Which of the following best demonstrates creative AI application?',
      options: [
        'Using a calculator',
        "Building an AI tutor that adapts to each student's learning style",
        'Copying an existing product',
        'Using spell-check',
      ],
      answer: 1,
    },
    {
      q: 'What is a "prototype" in project design?',
      options: ['The final product', 'A budget estimate', 'An early working model used to test ideas', 'A marketing plan'],
      answer: 2,
    },
    {
      q: 'When presenting an AI project, which is MOST important?',
      options: [
        'Using technical jargon to impress judges',
        'Explaining the problem, solution, and real-world impact clearly',
        'Making the slides as colourful as possible',
        'Listing all the tools you used',
      ],
      answer: 1,
    },
    {
      q: 'What is "iterative development"?',
      options: [
        'Building the whole project at once',
        'Repeatedly improving a product based on testing and feedback',
        'Hiring more developers',
        'Skipping the testing phase',
      ],
      answer: 1,
    },
    {
      q: 'Which is a good indicator of a high-quality AI project for a competition?',
      options: [
        'It uses the most expensive hardware',
        'It solves a real problem with a clear, tested AI approach',
        'It has the longest report',
        'It was completed in the shortest time',
      ],
      answer: 1,
    },
  ],
  coding: [
    {
      q: 'What does the following Python code print?\n\nfor i in range(3):\n    print(i)',
      options: ['1 2 3', '0 1 2', '0 1 2 3', '1 2'],
      answer: 1,
    },
    {
      q: 'In machine learning, what is "overfitting"?',
      options: [
        'When a model performs well on new data',
        'When a model memorises training data but fails on new data',
        'When training takes too long',
        'When a dataset is too large',
      ],
      answer: 1,
    },
    {
      q: 'Which Python library is most commonly used for machine learning?',
      options: ['NumPy', 'Matplotlib', 'scikit-learn', 'Requests'],
      answer: 2,
    },
    {
      q: 'What is the purpose of a "loss function" in training a neural network?',
      options: [
        'To visualise data',
        "To measure how wrong the model's predictions are",
        'To select the best dataset',
        'To deploy the model',
      ],
      answer: 1,
    },
    {
      q: 'What does "train_test_split" do in scikit-learn?',
      options: [
        'Trains the model twice',
        'Splits data into training and evaluation subsets',
        'Deletes bad data',
        'Normalises features',
      ],
      answer: 1,
    },
    {
      q: 'Which algorithm is best suited for classifying emails as spam or not spam?',
      options: ['K-means clustering', 'Linear regression', 'Logistic regression / Naive Bayes', 'Principal component analysis'],
      answer: 2,
    },
    {
      q: 'What is a "feature" in a machine learning dataset?',
      options: ["The model's output", 'An input variable used to make predictions', 'A type of neural network layer', 'A visualisation tool'],
      answer: 1,
    },
    {
      q: 'What does "epochs" mean when training a neural network?',
      options: [
        'The number of layers in the network',
        'The number of times the entire training dataset is passed through the model',
        'The learning rate',
        'The number of neurons',
      ],
      answer: 1,
    },
    {
      q: 'Which of these is an unsupervised learning algorithm?',
      options: ['Decision tree', 'Random forest', 'K-means clustering', 'Support vector machine'],
      answer: 2,
    },
    {
      q: 'What is the main purpose of "data normalisation"?',
      options: [
        'To remove all outliers',
        'To scale features to a similar range so the model trains more effectively',
        'To increase dataset size',
        'To encrypt the data',
      ],
      answer: 1,
    },
    {
      q: 'In Python, which line correctly imports pandas?',
      options: ['include pandas as pd', 'import pandas as pd', 'using pandas = pd', 'require pandas as pd'],
      answer: 1,
    },
    {
      q: 'What is "gradient descent"?',
      options: [
        'A data cleaning technique',
        'An optimisation algorithm that adjusts model weights to minimise loss',
        'A type of neural network',
        'A regularisation method',
      ],
      answer: 1,
    },
  ],
  literacy: [
    {
      q: 'You notice an AI-generated image shared online looks almost real. What is the BEST first response?',
      options: ['Share it immediately', 'Check the source and look for verification before sharing', 'Assume it is real', 'Ignore it'],
      answer: 1,
    },
    {
      q: 'An AI recommendation system only shows you news that matches your existing views. This is called:',
      options: ['Personalisation', 'Filter bubble / echo chamber', 'Targeted advertising', 'Data mining'],
      answer: 1,
    },
    {
      q: 'Which best demonstrates "AI application ability"?',
      options: [
        'Knowing what AI stands for',
        'Using an AI writing tool to improve an essay draft',
        'Watching a video about AI',
        'Memorising AI facts',
      ],
      answer: 1,
    },
    {
      q: 'A student uses AI to generate an essay and submits it as their own work. This raises concerns about:',
      options: ['Data privacy', 'Academic integrity and AI ethics', 'Cybersecurity', 'Hardware compatibility'],
      answer: 1,
    },
    {
      q: 'Which shows the highest level of AI literacy — "Creation"?',
      options: [
        'Using an AI tool someone else built',
        'Understanding how AI tools work',
        'Building an AI model to solve a personal or community problem',
        'Reading about AI developments',
      ],
      answer: 2,
    },
    {
      q: 'What does "algorithmic bias" mean?',
      options: [
        'When an algorithm runs slowly',
        'When an AI system produces unfair outcomes due to biased training data or design',
        'When a programmer prefers one coding language',
        'When AI replaces human jobs',
      ],
      answer: 1,
    },
    {
      q: 'You want to use AI to help plan a school event. Which is the MOST effective approach?',
      options: [
        'Ask AI to do everything automatically',
        'Use AI to draft a schedule, then review and adjust it yourself',
        'Avoid AI because it makes mistakes',
        'Only use AI for the final presentation',
      ],
      answer: 1,
    },
    {
      q: 'Which is an example of "AI perception ability"?',
      options: [
        'Training your own model',
        'Recognising that a customer service chatbot is AI-powered',
        'Writing code for an AI app',
        'Publishing an AI research paper',
      ],
      answer: 1,
    },
    {
      q: '"Deepfake" technology is most associated with which AI risk?',
      options: ['Slower internet speeds', 'Misinformation and identity fraud', 'Higher energy consumption', 'Data storage limits'],
      answer: 1,
    },
    {
      q: 'Which statement reflects responsible AI use?',
      options: [
        'Use AI outputs without checking them',
        'Rely entirely on AI for important decisions',
        'Use AI as a tool, verify outputs, and take responsibility for your work',
        'Share AI-generated content without attribution',
      ],
      answer: 2,
    },
    {
      q: 'What is "explainable AI" (XAI)?',
      options: [
        'AI that can talk',
        'AI systems designed so humans can understand and audit their decision-making',
        'AI used in education only',
        'AI that generates explanations for essays',
      ],
      answer: 1,
    },
  ],
}

const DIMENSIONS = {
  basic: ['AI Concept Awareness', 'Tool Recognition', 'Ethics Sensitivity'],
  innovation: ['Creative Thinking', 'Project Design', 'Cross-disciplinary Application'],
  coding: ['Programming Fundamentals', 'ML Algorithms', 'Data Handling'],
  literacy: ['AI Perception', 'AI Understanding', 'AI Application & Creation'],
}

const TYPE_COURSES = {
  basic: {
    adv: ['Advanced AI Research Track', 'Competition Bootcamp', 'AI Camp · AI Research'],
    int: ['Intermediate AI Project Course', 'AI Innovation Workshop', 'Competition Foundations'],
    fnd: ['AI Literacy Foundations', 'Intro to AI Tools', 'AI Thinking for Students'],
  },
  innovation: {
    adv: ['AI Research Project Camp', 'International Innovation Competition Prep', 'Cross-disciplinary AI Lab'],
    int: ['AI Innovation Workshop', 'Design Thinking for AI', 'Competition Project Sprint'],
    fnd: ['Creative AI Applications', 'Intro to AI Projects', 'AI Thinking for Students'],
  },
  coding: {
    adv: ['Deep Learning & Neural Nets', 'AI Research Project', 'Advanced Python + ML'],
    int: ['Python + AI Projects', 'Machine Learning Foundations', 'Competition Coding Bootcamp'],
    fnd: ['Python Programming Basics', 'Intro to Data Science', 'AI Foundations Bootcamp'],
  },
  literacy: {
    adv: ['AI Literacy Capstone', 'STEM Admissions Prep', 'Research & Portfolio Build'],
    int: ['Youth AI Literacy Level 2', 'Competition Readiness', 'AI Application Practice'],
    fnd: ['AI Literacy Foundations', 'Intro to AI Tools', 'AI Perception & Ethics'],
  },
}

export function getQuestionsForPaper(paper) {
  const bank = QUESTION_BANKS[paper.questionBank] || []
  const count = Math.min(paper.questionCount || bank.length, bank.length)
  return bank.slice(0, count)
}

export function getResult(score, total, typeId) {
  const pct = Math.round((score / total) * 100)
  const dims = DIMENSIONS[typeId] || []
  const dimScores = dims.map((label) => ({
    label,
    score: Math.min(100, Math.max(30, pct + Math.floor(Math.random() * 20) - 10)),
  }))

  const tc = TYPE_COURSES[typeId] || TYPE_COURSES.basic
  let level, color, feedback, courses
  if (pct >= 80) {
    level = 'Advanced'
    color = 'text-green-600 bg-green-50 border-green-200'
    feedback =
      'Excellent! You demonstrate strong AI capability and are well-positioned for competitive programmes and advanced coursework.'
    courses = tc.adv
  } else if (pct >= 55) {
    level = 'Intermediate'
    color = 'text-primary bg-primary/5 border-primary/20'
    feedback =
      'Good foundation! You understand key concepts and are ready to deepen your skills with structured practice and project work.'
    courses = tc.int
  } else {
    level = 'Foundations'
    color = 'text-amber-700 bg-amber-50 border-amber-200'
    feedback =
      'Great start! Building a strong foundation now will prepare you for rapid progress. Focus on core concepts first.'
    courses = tc.fnd
  }
  return { pct, level, color, feedback, courses, dimScores }
}
