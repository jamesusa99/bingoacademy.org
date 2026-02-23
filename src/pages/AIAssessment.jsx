import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Question banks ────────────────────────────────────────────────
const QUESTION_BANKS = {
  basic: [
    {
      q: 'What does "AI" stand for?',
      options: ['Automated Interface', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Input'],
      answer: 1,
    },
    {
      q: 'Which of the following is an example of supervised learning?',
      options: ['Grouping similar photos without labels', 'Teaching a model to recognise spam using labelled emails', 'A robot exploring a maze on its own', 'Generating random text'],
      answer: 1,
    },
    {
      q: 'What is a neural network inspired by?',
      options: ['Computer circuits', 'The human brain', 'DNA sequences', 'Mathematical equations'],
      answer: 1,
    },
    {
      q: 'Which statement best describes "machine learning"?',
      options: ['Machines that can physically move', 'Software that follows only hard-coded rules', 'Systems that learn from data without explicit programming', 'Hardware that processes data faster'],
      answer: 2,
    },
    {
      q: 'Which of the following raises an AI ethics concern?',
      options: ['Using AI to recommend music', 'Using AI to automate document filing', 'Using biased training data in hiring decisions', 'Using AI to translate text'],
      answer: 2,
    },
    {
      q: 'What is "training data" in machine learning?',
      options: ['Data used to test a model after deployment', 'Data shown to humans for manual review', 'Data used to teach a model to make predictions', 'Encrypted data stored in the cloud'],
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
      options: ['Start coding immediately', 'Choose the best programming language', 'Define the problem and understand user needs', 'Look for a dataset online'],
      answer: 2,
    },
    {
      q: 'A project combines AI with environmental science to monitor pollution. This is best described as:',
      options: ['Narrow AI', 'Cross-disciplinary AI application', 'Supervised learning only', 'Robotics engineering'],
      answer: 1,
    },
    {
      q: 'During a brainstorm, a teammate suggests an idea that seems impractical. What should you do?',
      options: ['Dismiss it immediately', 'Record it and explore if any part is useful', 'Argue that your idea is better', 'Skip the idea and move on'],
      answer: 1,
    },
    {
      q: 'Which approach best describes design thinking in AI projects?',
      options: ['Build → Test → Design', 'Empathise → Define → Ideate → Prototype → Test', 'Code → Deploy → Ignore feedback', 'Research → Present → Submit'],
      answer: 1,
    },
    {
      q: 'An AI model works well in testing but fails in the real world. What is the most likely cause?',
      options: ['The model used too many parameters', 'The training data did not represent the real-world environment', 'The programming language was wrong', 'The hardware was too slow'],
      answer: 1,
    },
    {
      q: 'Which of the following best demonstrates creative AI application?',
      options: ['Using a calculator', 'Building an AI tutor that adapts to each student\'s learning style', 'Copying an existing product', 'Using spell-check'],
      answer: 1,
    },
    {
      q: 'What is a "prototype" in project design?',
      options: ['The final product', 'A budget estimate', 'An early working model used to test ideas', 'A marketing plan'],
      answer: 2,
    },
    {
      q: 'When presenting an AI project, which is MOST important?',
      options: ['Using technical jargon to impress judges', 'Explaining the problem, solution, and real-world impact clearly', 'Making the slides as colourful as possible', 'Listing all the tools you used'],
      answer: 1,
    },
    {
      q: 'What is "iterative development"?',
      options: ['Building the whole project at once', 'Repeatedly improving a product based on testing and feedback', 'Hiring more developers', 'Skipping the testing phase'],
      answer: 1,
    },
    {
      q: 'Which is a good indicator of a high-quality AI project for a competition?',
      options: ['It uses the most expensive hardware', 'It solves a real problem with a clear, tested AI approach', 'It has the longest report', 'It was completed in the shortest time'],
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
      options: ['When a model performs well on new data', 'When a model memorises training data but fails on new data', 'When training takes too long', 'When a dataset is too large'],
      answer: 1,
    },
    {
      q: 'Which Python library is most commonly used for machine learning?',
      options: ['NumPy', 'Matplotlib', 'scikit-learn', 'Requests'],
      answer: 2,
    },
    {
      q: 'What is the purpose of a "loss function" in training a neural network?',
      options: ['To visualise data', 'To measure how wrong the model\'s predictions are', 'To select the best dataset', 'To deploy the model'],
      answer: 1,
    },
    {
      q: 'What does "train_test_split" do in scikit-learn?',
      options: ['Trains the model twice', 'Splits data into training and evaluation subsets', 'Deletes bad data', 'Normalises features'],
      answer: 1,
    },
    {
      q: 'Which algorithm is best suited for classifying emails as spam or not spam?',
      options: ['K-means clustering', 'Linear regression', 'Logistic regression / Naive Bayes', 'Principal component analysis'],
      answer: 2,
    },
    {
      q: 'What is a "feature" in a machine learning dataset?',
      options: ['The model\'s output', 'An input variable used to make predictions', 'A type of neural network layer', 'A visualisation tool'],
      answer: 1,
    },
    {
      q: 'What does "epochs" mean when training a neural network?',
      options: ['The number of layers in the network', 'The number of times the entire training dataset is passed through the model', 'The learning rate', 'The number of neurons'],
      answer: 1,
    },
    {
      q: 'Which of these is an unsupervised learning algorithm?',
      options: ['Decision tree', 'Random forest', 'K-means clustering', 'Support vector machine'],
      answer: 2,
    },
    {
      q: 'What is the main purpose of "data normalisation"?',
      options: ['To remove all outliers', 'To scale features to a similar range so the model trains more effectively', 'To increase dataset size', 'To encrypt the data'],
      answer: 1,
    },
    {
      q: 'In Python, which line correctly imports pandas?',
      options: ['include pandas as pd', 'import pandas as pd', 'using pandas = pd', 'require pandas as pd'],
      answer: 1,
    },
    {
      q: 'What is "gradient descent"?',
      options: ['A data cleaning technique', 'An optimisation algorithm that adjusts model weights to minimise loss', 'A type of neural network', 'A regularisation method'],
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
      options: ['Knowing what AI stands for', 'Using an AI writing tool to improve an essay draft', 'Watching a video about AI', 'Memorising AI facts'],
      answer: 1,
    },
    {
      q: 'A student uses AI to generate an essay and submits it as their own work. This raises concerns about:',
      options: ['Data privacy', 'Academic integrity and AI ethics', 'Cybersecurity', 'Hardware compatibility'],
      answer: 1,
    },
    {
      q: 'Which shows the highest level of AI literacy — "Creation"?',
      options: ['Using an AI tool someone else built', 'Understanding how AI tools work', 'Building an AI model to solve a personal or community problem', 'Reading about AI developments'],
      answer: 2,
    },
    {
      q: 'What does "algorithmic bias" mean?',
      options: ['When an algorithm runs slowly', 'When an AI system produces unfair outcomes due to biased training data or design', 'When a programmer prefers one coding language', 'When AI replaces human jobs'],
      answer: 1,
    },
    {
      q: 'You want to use AI to help plan a school event. Which is the MOST effective approach?',
      options: ['Ask AI to do everything automatically', 'Use AI to draft a schedule, then review and adjust it yourself', 'Avoid AI because it makes mistakes', 'Only use AI for the final presentation'],
      answer: 1,
    },
    {
      q: 'Which is an example of "AI perception ability"?',
      options: ['Training your own model', 'Recognising that a customer service chatbot is AI-powered', 'Writing code for an AI app', 'Publishing an AI research paper'],
      answer: 1,
    },
    {
      q: '"Deepfake" technology is most associated with which AI risk?',
      options: ['Slower internet speeds', 'Misinformation and identity fraud', 'Higher energy consumption', 'Data storage limits'],
      answer: 1,
    },
    {
      q: 'Which statement reflects responsible AI use?',
      options: ['Use AI outputs without checking them', 'Rely entirely on AI for important decisions', 'Use AI as a tool, verify outputs, and take responsibility for your work', 'Share AI-generated content without attribution'],
      answer: 2,
    },
    {
      q: 'What is "explainable AI" (XAI)?',
      options: ['AI that can talk', 'AI systems designed so humans can understand and audit their decision-making', 'AI used in education only', 'AI that generates explanations for essays'],
      answer: 1,
    },
  ],
}

// ─── Scoring / feedback ────────────────────────────────────────────
function getResult(score, total, typeId) {
  const pct = Math.round((score / total) * 100)
  const dimensions = {
    basic: ['AI Concept Awareness', 'Tool Recognition', 'Ethics Sensitivity'],
    innovation: ['Creative Thinking', 'Project Design', 'Cross-disciplinary Application'],
    coding: ['Programming Fundamentals', 'ML Algorithms', 'Data Handling'],
    literacy: ['AI Perception', 'AI Understanding', 'AI Application & Creation'],
  }
  const dims = dimensions[typeId] || []
  const dimScores = dims.map((d) => ({
    label: d,
    score: Math.min(100, Math.max(30, pct + Math.floor(Math.random() * 20) - 10)),
  }))

  const typeCourses = {
    basic: { adv: ['Advanced AI Research Track', 'Competition Bootcamp', 'AI Camp · AI Research'], int: ['Intermediate AI Project Course', 'AI Innovation Workshop', 'Competition Foundations'], fnd: ['AI Literacy Foundations', 'Intro to AI Tools', 'AI Thinking for Students'] },
    innovation: { adv: ['AI Research Project Camp', 'International Innovation Competition Prep', 'Cross-disciplinary AI Lab'], int: ['AI Innovation Workshop', 'Design Thinking for AI', 'Competition Project Sprint'], fnd: ['Creative AI Applications', 'Intro to AI Projects', 'AI Thinking for Students'] },
    coding: { adv: ['Deep Learning & Neural Nets', 'AI Research Project', 'Advanced Python + ML'], int: ['Python + AI Projects', 'Machine Learning Foundations', 'Competition Coding Bootcamp'], fnd: ['Python Programming Basics', 'Intro to Data Science', 'AI Foundations Bootcamp'] },
    literacy: { adv: ['AI Literacy Capstone', 'STEM Admissions Prep', 'Research & Portfolio Build'], int: ['Youth AI Literacy Level 2', 'Competition Readiness', 'AI Application Practice'], fnd: ['AI Literacy Foundations', 'Intro to AI Tools', 'AI Perception & Ethics'] },
  }
  const tc = typeCourses[typeId] || typeCourses.basic
  let level, color, feedback, courses
  if (pct >= 80) {
    level = 'Advanced'; color = 'text-green-600 bg-green-50 border-green-200'
    feedback = 'Excellent! You demonstrate strong AI capability and are well-positioned for competitive programmes and advanced coursework.'
    courses = tc.adv
  } else if (pct >= 55) {
    level = 'Intermediate'; color = 'text-primary bg-primary/5 border-primary/20'
    feedback = 'Good foundation! You understand key concepts and are ready to deepen your skills with structured practice and project work.'
    courses = tc.int
  } else {
    level = 'Foundations'; color = 'text-amber-700 bg-amber-50 border-amber-200'
    feedback = 'Great start! Building a strong foundation now will prepare you for rapid progress. Focus on core concepts first.'
    courses = tc.fnd
  }
  return { pct, level, color, feedback, courses, dimScores }
}

// ─── Quiz component ────────────────────────────────────────────────
function Quiz({ typeId, title, onBack }) {
  const questions = QUESTION_BANKS[typeId] || []
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)

  const q = questions[current]
  const progress = Math.round((current / questions.length) * 100)

  const handleSelect = (idx) => {
    if (confirmed) return
    setSelected(idx)
  }

  const handleConfirm = () => {
    if (selected === null) return
    setConfirmed(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, { selected, correct: selected === q.answer }]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  if (done) {
    const score = answers.filter((a) => a.correct).length
    const result = getResult(score, questions.length, typeId)
    return <Results score={score} total={questions.length} result={result} title={title} onBack={onBack} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1">
          ← Back
        </button>
        <span className="text-sm text-slate-500 font-medium">Question {current + 1} / {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="card p-6 mb-4">
        <h3 className="font-semibold text-bingo-dark text-base mb-6 leading-relaxed whitespace-pre-line">{q.q}</h3>
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let style = 'border border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary/5'
            if (selected === idx && !confirmed) style = 'border-2 border-primary bg-primary/5 text-primary font-medium'
            if (confirmed) {
              if (idx === q.answer) style = 'border-2 border-green-500 bg-green-50 text-green-700 font-medium'
              else if (idx === selected && selected !== q.answer) style = 'border-2 border-red-400 bg-red-50 text-red-600'
              else style = 'border border-slate-200 text-slate-400'
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left rounded-xl px-4 py-3 text-sm transition ${style}`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            )
          })}
        </div>

        {confirmed && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${selected === q.answer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {selected === q.answer
              ? '✓ Correct!'
              : `✗ The correct answer is: ${q.options[q.answer]}`}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary px-6 py-2.5">
            {current + 1 < questions.length ? 'Next Question →' : 'See Results →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Results component (aligned with bingoacademy.cn post-test design) ─
function Results({ score, total, result, title, onBack }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary transition mb-6 flex items-center gap-1">
        ← Back to Assessment Center
      </button>

      {/* Hero: Completion + Score */}
      <section className="section-tech rounded-2xl px-6 py-10 mb-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
        <div className="relative">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-sm font-medium text-primary mb-2">Assessment Complete</p>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/30 bg-white/80 mb-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{result.pct}</span>
              <span className="text-xl font-semibold text-primary">%</span>
            </div>
          </div>
          <div className={`inline-block text-sm font-semibold px-5 py-2 rounded-full border mb-3 ${result.color}`}>
            {result.level}
          </div>
          <p className="text-slate-600 text-sm mb-1">{score} / {total} correct</p>
          <p className="text-xs text-slate-500 mb-0">{title}</p>
        </div>
      </section>

      {/* Feedback */}
      <div className="card p-5 mb-6 border-l-4 border-primary">
        <p className="text-slate-700 text-sm leading-relaxed">{result.feedback}</p>
      </div>

      {/* Capability Map / 能力图谱 */}
      <section className="card p-6 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-1">AI Capability Map</h3>
        <p className="text-xs text-slate-500 mb-5">Multi-dimensional breakdown</p>
        <div className="space-y-5">
          {result.dimScores.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">{d.label}</span>
                <span className="font-semibold text-primary">{d.score}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${result.pct >= 80 ? 'bg-green-600' : result.pct >= 55 ? 'bg-primary' : 'bg-amber-500'}`}
                  style={{ width: `${d.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended courses */}
      <section className="card p-6 mb-6 border-primary/20 bg-gradient-to-br from-cyan-50/80 to-primary/5">
        <h3 className="font-semibold text-bingo-dark mb-1">Recommended for You</h3>
        <p className="text-xs text-slate-500 mb-4">Based on your assessment results · 3–5 matched courses</p>
        <div className="space-y-3 mb-4">
          {result.courses.map((c, i) => (
            <Link key={i} to="/courses" className="flex items-center gap-3 p-3 rounded-xl bg-white/70 hover:bg-white border border-slate-100 hover:border-primary/20 transition">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="text-sm font-medium text-slate-800 hover:text-primary transition">{c}</span>
              <span className="ml-auto text-primary text-xs">View →</span>
            </Link>
          ))}
        </div>
        <Link to="/courses" className="btn-primary w-full py-3 text-sm font-medium rounded-xl">View All Courses →</Link>
      </section>

      {/* Report use cases */}
      <section className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '🏆', title: 'Competition', desc: 'Scores can be used in preliminary rounds' },
          { icon: '📊', title: 'Profile', desc: 'Saved to your personal growth record' },
          { icon: '🎓', title: 'Courses', desc: 'Get matched learning path' },
        ].map((u, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="text-2xl mb-2">{u.icon}</div>
            <p className="text-xs font-semibold text-bingo-dark">{u.title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{u.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-medium hover:bg-primary/5 transition">
          Try Another Assessment
        </button>
        <Link to="/courses" className="btn-primary px-5 py-2.5 text-sm font-medium rounded-xl">Course Enrollment</Link>
        <Link to="/cert" className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition">
          Certification Center
        </Link>
        <a href="tel:400-xxx-xxxx" className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">📞 Call</a>
      </div>
    </div>
  )
}

// ─── Assessment type definitions ──────────────────────────────────
const ASSESSMENT_TYPES = [
  { id: 'basic', title: 'AI Foundations Assessment', shortTitle: 'AI Foundations', badge: 'Free', badgeStyle: 'bg-green-100 text-green-700 border-green-200',
    price: null, events: 'General / All competitions', duration: '20 min', questionCount: 8,
    desc: 'Evaluates foundational AI concepts, tool awareness, and ethical understanding.',
    ages: ['elementary','middle','high'], goals: ['literacy','competition','stem'],
    sampleReport: { pct: 72, level: 'Intermediate', dimScores: [{ label: 'AI Concept Awareness', score: 78 }, { label: 'Tool Recognition', score: 65 }, { label: 'Ethics Sensitivity', score: 72 }] },
  },
  { id: 'innovation', title: 'AI Innovation & Creativity Assessment', shortTitle: 'AI Innovation', badge: '$39/session', badgeStyle: 'bg-primary/10 text-primary border-primary/30',
    price: 39, events: 'Science & innovation competitions', duration: '40 min', questionCount: 10,
    desc: 'Measures creative thinking, project design capability, and cross-disciplinary application.',
    ages: ['middle','high'], goals: ['competition','stem'],
    sampleReport: { pct: 65, level: 'Intermediate', dimScores: [{ label: 'Creative Thinking', score: 70 }, { label: 'Project Design', score: 62 }, { label: 'Cross-disciplinary Application', score: 64 }] },
  },
  { id: 'coding', title: 'AI Programming & Algorithms Assessment', shortTitle: 'AI Programming', badge: '$59/session', badgeStyle: 'bg-primary/10 text-primary border-primary/30',
    price: 59, events: 'Coding / Robotics competitions', duration: '60 min', questionCount: 12,
    desc: 'Covers Python programming, machine learning fundamentals, and algorithmic logic.',
    ages: ['middle','high'], goals: ['competition','stem'],
    sampleReport: { pct: 58, level: 'Intermediate', dimScores: [{ label: 'Programming Fundamentals', score: 55 }, { label: 'ML Algorithms', score: 60 }, { label: 'Data Handling', score: 58 }] },
  },
  { id: 'literacy', title: 'Youth AI Literacy Comprehensive Assessment', shortTitle: 'AI Literacy', badge: '$49/session', badgeStyle: 'bg-primary/10 text-primary border-primary/30',
    price: 49, events: 'Literacy / College admissions track', duration: '45 min', questionCount: 11,
    desc: 'Multi-dimensional evaluation. Generates a personalized AI Literacy Capability Map.',
    ages: ['elementary','middle','high'], goals: ['literacy','competition','stem'],
    sampleReport: { pct: 68, level: 'Intermediate', dimScores: [{ label: 'AI Perception', score: 72 }, { label: 'AI Understanding', score: 65 }, { label: 'AI Application & Creation', score: 68 }] },
  },
]

const USE_CASES = [
  { icon: '🏆', title: 'Competition Preliminary Reference', desc: 'Scores can be factored into judging by competition organizers' },
  { icon: '📊', title: 'Personal Growth Record', desc: 'Synced to your profile to track AI capability growth over time' },
  { icon: '🎓', title: 'Course Recommendations', desc: 'Get 3–5 matched AI courses based on your assessment results' },
]

// Filter by age + goal → recommended assessment IDs
function getRecommendedIds(age, goal) {
  const all = ASSESSMENT_TYPES.filter(a => (age ? a.ages.includes(age) : true) && (goal ? a.goals.includes(goal) : true))
  const ids = all.map(a => a.id)
  if (ids.length === 0) return ASSESSMENT_TYPES.map(a => a.id)
  return ids
}

// ─── Sample Report Modal ───────────────────────────────────────────
function SampleReportModal({ assessment, onClose }) {
  if (!assessment) return null
  const r = assessment.sampleReport
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-bingo-dark">Sample Report — {assessment.shortTitle}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{r.pct}%</div>
              <div className="text-sm text-slate-500 mt-1">Level: {r.level}</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Capability breakdown</p>
              {r.dimScores.map((d,i) => (
                <div key={i} className="flex justify-between text-xs mb-2">
                  <span>{d.label}</span>
                  <span className="font-medium text-primary">{d.score}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">This is a sample. Your actual report will reflect your performance.</p>
          <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────
export default function AIAssessment() {
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [ageFilter, setAgeFilter] = useState('') // elementary | middle | high
  const [goalFilter, setGoalFilter] = useState('') // literacy | competition | stem
  const [sampleReportFor, setSampleReportFor] = useState(null)

  const recommendedIds = getRecommendedIds(ageFilter, goalFilter)
  const filteredTypes = ASSESSMENT_TYPES.filter(a => !ageFilter && !goalFilter ? true : recommendedIds.includes(a.id))

  if (activeQuiz) {
    const type = ASSESSMENT_TYPES.find((a) => a.id === activeQuiz)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Quiz typeId={activeQuiz} title={type?.title} onBack={() => setActiveQuiz(null)} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {sampleReportFor && <SampleReportModal assessment={sampleReportFor} onClose={() => setSampleReportFor(null)} />}

      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 mb-4">
        <Link to="/events" className="hover:text-primary transition">Events Center</Link>
        <span className="mx-2">/</span>
        <span className="text-bingo-dark font-medium">AI Assessment Center</span>
      </div>

      {/* Hero */}
      <section className="mb-8 section-tech rounded-2xl px-6 py-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-3">AI Assessment Center</h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-6">
          Select assessments by age and goal. Get personalized course recommendations and learning path planning.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => setActiveQuiz('basic')} className="btn-primary px-6 py-2.5 text-sm font-medium">
            🧠 Free Trial Assessment
          </button>
          <button onClick={() => setActiveQuiz('literacy')} className="px-6 py-2.5 text-sm font-medium rounded-xl border border-primary text-primary hover:bg-primary/5 transition">
            Book Specialized Assessment
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-slate-600">By age:</span>
          <div className="flex gap-2">
            {['elementary','middle','high'].map(a => (
              <button key={a} onClick={() => setAgeFilter(prev => prev === a ? '' : a)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${ageFilter === a ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {a === 'elementary' ? 'Elementary' : a === 'middle' ? 'Middle School' : 'High School'}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-slate-600 ml-4">By goal:</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'literacy', label: 'Literacy' },
              { id: 'competition', label: 'Competition' },
              { id: 'stem', label: 'STEM Admissions' },
            ].map(g => (
              <button key={g.id} onClick={() => setGoalFilter(prev => prev === g.id ? '' : g.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${goalFilter === g.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment types */}
      <section className="mb-10">
        <h2 className="section-title mb-5">Choose Assessment Type</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {filteredTypes.map((a) => (
            <div key={a.id} className={`card p-6 flex flex-col transition border-2 ${recommendedIds.includes(a.id) && (ageFilter || goalFilter) ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/20'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-bingo-dark text-base">{a.title}</h3>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${a.badgeStyle}`}>{a.badge}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">{a.desc}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                <span>⏱ {a.duration}</span>
                <span>📝 {a.questionCount} questions</span>
                <span>🏅 {a.events}</span>
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => setActiveQuiz(a.id)} className="flex-1 btn-primary text-sm py-2.5 rounded-xl font-medium">
                  Start Assessment →
                </button>
                <button onClick={() => setSampleReportFor(a)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                  Sample Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mb-10">
        <h2 className="section-title mb-5">Report Use Cases</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {USE_CASES.map((u, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md hover:border-primary/20 transition">
              <div className="text-3xl mb-3">{u.icon}</div>
              <h3 className="font-semibold text-bingo-dark mb-1">{u.title}</h3>
              <p className="text-sm text-slate-500">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="flex flex-wrap gap-3 justify-center text-sm">
        <Link to="/courses" className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition">Course Enrollment</Link>
        <Link to="/community" className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">💬 Community</Link>
        <a href="tel:400-xxx-xxxx" className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">📞 Call</a>
      </div>
    </div>
  )
}
