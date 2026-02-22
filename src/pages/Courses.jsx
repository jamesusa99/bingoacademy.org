import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Data ─────────────────────────────────────────────────────────

const STUDENT_LEVELS = [
  {
    id: 'level1',
    level: 'Level 1',
    name: 'AI Elite Foundations',
    tag: 'Foundations',
    age: 'Ages 6–12 · Elementary',
    tagColor: 'bg-green-100 text-green-700',
    goal: 'Interest activation + literacy foundation · Cultivate AI perception',
    outcome: 'Build fundamental AI awareness and curiosity; develop the "love to think, dare to try" mindset of an elite student',
    courses: [
      {
        name: '"Entering the Intelligent World" — AI Foundations',
        age: 'Ages 6–8',
        hours: '12 sessions',
        desc: 'What is AI? AI in everyday life, basic principles (input→process→output), AI ethics introduction. Virtual AI pet interaction, AI art creation challenges.',
        price: '$299',
      },
      {
        name: '"AI Tool Champion" — Learning with AI',
        age: 'Ages 8–10',
        hours: '12 sessions',
        desc: 'AI mind maps, homework helpers, voice assistants. Core tool logic, AI-assisted study habits, digital safety awareness. Virtual AI Learning Studio collaboration.',
        price: '$299',
      },
      {
        name: '"AI Innovation Lab" — Creative Experiments',
        age: 'Ages 10–12',
        hours: '12 sessions',
        desc: 'AI image/sound classification, simple experiments, design thinking from problem to AI solution. 3D virtual lab, team AI mini-project. Connect with school AI clubs.',
        price: '$349',
      },
    ],
    services: [
      'Multi-modal AI capability assessment → "AI Elite Potential Report"',
      'Home-school co-learning: monthly parent briefings + AI exploration homework',
      'Completion badge + "Bingo AI Young Elites Camp" invitation for top students',
    ],
  },
  {
    id: 'level2',
    level: 'Level 2',
    name: 'AI Elite Intermediate',
    tag: 'Intermediate',
    age: 'Ages 13–18 · Middle & High School',
    tagColor: 'bg-blue-100 text-blue-700',
    goal: 'Ability growth + mindset shaping · Strengthen AI application skills',
    outcome: 'Independently complete AI applications and simple innovations; develop "apply confidently, break through consistently" elite competency',
    courses: [
      {
        name: 'AI Foundations & Applications',
        age: 'Ages 13–15 · Middle School',
        hours: '16 sessions',
        desc: 'ML / deep learning / neural networks (applied focus), AI video editing, content creation, data visualization, cross-subject integration. Virtual AI workshop tasks.',
        price: '$599',
      },
      {
        name: 'Machine Learning: Intro to Practice',
        age: 'Ages 15–18 · High School',
        hours: '16 sessions',
        desc: 'Data collection, feature extraction, model training with Python basics. Linear regression, decision trees, neural networks. AI grade prediction, image classification. STEM admissions pathways.',
        price: '$799',
      },
      {
        name: 'AI Competition Bootcamp',
        age: 'Ages 14–18 · All levels',
        hours: '16 sessions',
        desc: '2026 top-tier AI competitions decoded: topic selection, design, presentation, Q&A skills. Virtual competition simulations, 1-on-1 project coaching, award case studies.',
        price: '$999',
      },
      {
        name: 'AI Ethics & Elite Thinking',
        age: 'Ages 13–18 · All levels',
        hours: '16 sessions',
        desc: 'AI bias, privacy, human-AI futures. Critical thinking, innovation mindset, global perspective, career planning. AI ethics debates, public interest AI project design.',
        price: '$499',
      },
    ],
    services: [
      'Personalised AI learning path (AI model adapts to stage + goal)',
      'Elite mentor team: university faculty, competition judges, STEM admissions coaches',
      'Direct access to 2026 top-tier AI competitions: registration → training → presentation',
      'AI Elite Growth Portfolio with blockchain credentials for admissions',
    ],
  },
  {
    id: 'level3',
    level: 'Level 3',
    name: 'AI Elite Applied',
    tag: 'Applied',
    age: 'Ages 16–22 · High School + University',
    tagColor: 'bg-purple-100 text-purple-700',
    goal: 'Real-world practice + outcome delivery · Strengthen AI innovation capability',
    outcome: 'Complete AI innovation projects independently; achieve "innovate boldly, deliver concretely" elite core competency',
    courses: [
      {
        name: 'AI Innovation Project Studio (General)',
        age: 'Ages 16–22',
        hours: '20 sessions',
        desc: 'Full project lifecycle: topic → design → build → test → showcase. Cross-disciplinary AI projects, publication-ready research papers. 3D virtual innovation studio, community pilot deployments.',
        price: '$1,299',
      },
      {
        name: 'AI Vision & Robotics Programming',
        age: 'Ages 16–22 · Specialist',
        hours: '20 sessions',
        desc: 'Image recognition, object detection, face recognition with Python. Robot programming and AI integration: autonomous navigation, smart access control. Virtual robot lab + offline hardware sessions.',
        price: '$1,499',
      },
      {
        name: 'Education AI Development',
        age: 'Ages 16–22 · Specialist',
        hours: '20 sessions',
        desc: 'Needs analysis, AI tutoring bots, learning analytics systems, personalised learning platforms. Education LLM integration, product launch and iteration. School pilot deployments.',
        price: '$1,499',
      },
      {
        name: 'AI Data Science & Visualisation',
        age: 'Ages 16–22 · Specialist',
        hours: '20 sessions',
        desc: 'Data collection, cleaning, analysis (Python + Excel). ML modelling, professional visualisation dashboards. Real-world datasets: education, healthcare, environment. Enterprise/university data lab placements.',
        price: '$1,299',
      },
    ],
    services: [
      'Project incubation: technical guidance, funding, resource connections for top projects',
      'University-enterprise internships at leading AI companies and research labs',
      'Patent and academic paper coaching with specialist mentors',
      'Bingo AI Elite Applied Community: peers, experts, project opportunities',
    ],
  },
  {
    id: 'level4',
    level: 'Level 4',
    name: 'AI Elite Mastery',
    tag: 'Mastery',
    age: 'Ages 20–28 · University + Early Career',
    tagColor: 'bg-amber-100 text-amber-700',
    goal: 'Value delivery + long-term growth · Build AI core competitive advantage',
    outcome: 'Become a domain-specific AI expert; achieve capability monetisation and career elevation with "lead trends, create value" elite vision',
    courses: [
      {
        name: 'AI Domain Mastery (3 Specialist Tracks)',
        age: 'Ages 20–28',
        hours: '24 sessions',
        desc: 'Track A — LLM Applications & Prompt Engineering: 2026 leading models, precision prompting, AI-powered workplace productivity. Track B — AI Product Management: requirements, prototyping, development, operations. Track C — AI Algorithms Intro: deep learning, NLP, algorithm projects, interview prep.',
        price: '$1,999',
      },
      {
        name: 'AI Entrepreneurship Accelerator',
        age: 'Ages 20–28',
        hours: '24 sessions',
        desc: '2026 AI startup trends (EdTech AI, SME AI enablement). Topic validation, business plan, fundraising pitch, team management, risk control. VC pitch sessions with real investors.',
        price: '$2,499',
      },
      {
        name: 'AI Monetisation Masterclass',
        age: 'Ages 20–28',
        hours: '24 sessions',
        desc: 'Multiple monetisation paths: AI tool sales, freelance projects, course creation, patent licensing, research commercialisation. Client acquisition, personal AI brand building. Live project order fulfilment.',
        price: '$1,299',
      },
      {
        name: 'AI Elite Leadership',
        age: 'Ages 20–28',
        hours: '24 sessions',
        desc: 'Innovation leadership, resource integration, team management, industry foresight. Cross-domain resource brokering, 2026–2030 AI mega-trends, long-term vision and responsibility. Industry forum participation.',
        price: '$1,499',
      },
    ],
    services: [
      'Career & startup full-lifecycle mentoring from elite industry coaches',
      'Resource platform: AI companies, VCs, incubators, freelance marketplaces',
      'Bingo AI Elite Certificate (industry-aligned) + "Bingo Elite Talent Pool" listing',
      'Lifetime learning: content updated continuously + ongoing elite community events',
    ],
  },
]

const PARENT_LEVELS = [
  {
    id: 'parent1',
    level: 'Parent 1',
    name: 'AI Foundations Parent Course',
    tag: 'Elementary-age child',
    age: 'Child ages 6–12',
    tagColor: 'bg-green-100 text-green-700',
    goal: 'Cognitive onboarding + guided support · Accompany child through AI introduction',
    courses: [
      {
        name: '"AI Foundations for Parents" — Read AI, Guide Your Child In',
        age: 'Child ages 6–8',
        hours: '8 sessions',
        desc: '2026 early AI education trends, plain-language AI principles, age-appropriate introduction methods, risk prevention (screen time, privacy, bad content).',
        price: '$99',
      },
      {
        name: '"AI Tools for Parents" — Use AI to Boost Your Child\'s Learning',
        age: 'Child ages 8–12',
        hours: '8 sessions',
        desc: 'Elementary AI tool overview, hands-on practice, healthy study habit integration, protecting creative curiosity, supporting AI mini-projects at home.',
        price: '$99',
      },
    ],
    services: [
      '1-on-1 AI onboarding mentor for all parent questions',
      'Synced with student course progress + "Parent-Child AI Showcase" each quarter',
      'Downloadable packs: AI Starter Guide, Home Exploration Tasks, Tool Tutorials',
    ],
  },
  {
    id: 'parent2',
    level: 'Parent 2',
    name: 'AI Intermediate Parent Course',
    tag: 'Middle/High-school-age child',
    age: 'Child ages 13–18',
    tagColor: 'bg-blue-100 text-blue-700',
    goal: 'Admissions alignment + mindset co-development · Help child advance in AI',
    courses: [
      {
        name: '"Middle School AI Parent Empowerment" — Understand Trends, Guide Progress',
        age: 'Child ages 13–15',
        hours: '10 sessions',
        desc: '2026 middle-school AI policy, subject integration strategies, motivation techniques for teens, AI ethics guidance for adolescents.',
        price: '$149',
      },
      {
        name: '"High School AI Admissions Parent Course" — Seize the Opportunity',
        age: 'Child ages 15–18',
        hours: '10 sessions',
        desc: 'STEM specialty admissions policy deep-dive, competition value and planning, AI career pathway overview, supporting your child\'s innovation projects.',
        price: '$199',
      },
    ],
    services: [
      'Admissions specialist 1-on-1: regional policy interpretation + personalised planning',
      'Real-time sync with student competition prep + "AI Admissions Sharing Events"',
      'Resource packs: 2026 STEM Admissions Guide, Competition Prep Handbook, Motivation Techniques',
      'Parent community: peer experience sharing, resource exchange, anxiety reduction',
    ],
  },
  {
    id: 'parent3',
    level: 'Parent 3',
    name: 'AI Applied Parent Course',
    tag: 'University-age child',
    age: 'Child ages 16–22',
    tagColor: 'bg-purple-100 text-purple-700',
    goal: 'Outcome support + direction guidance · Help child deliver AI results',
    courses: [
      {
        name: '"AI Innovation Parent Support" — Understand Results, Enable Delivery',
        age: 'All parents at this stage',
        hours: '10 sessions',
        desc: '2026 research commercialisation pathways, plain-language project and patent value, how to resource-support without over-controlling, resilience coaching for setbacks.',
        price: '$149',
      },
      {
        name: '"AI Admissions & Career Planning for Parents" — Guide Direction',
        age: 'Goal-specific parents',
        hours: '10 sessions',
        desc: 'University AI admissions and postgraduate policy, subject and career pathway selection, 2026 AI employment trends, respectful career guidance without imposing choices.',
        price: '$149',
      },
    ],
    services: [
      'AI innovation, admissions, and career specialists for 1-on-1 parent guidance',
      'Synced with student project milestones + parent-mentor communication channel',
      'Resource packs: Research Commercialisation Guide, AI Subject Selector, Employment Trend Report',
      '"AI Applied Results Showcase" each quarter with student project presentations',
    ],
  },
  {
    id: 'parent4',
    level: 'Parent 4',
    name: 'AI Elite Parent Course',
    tag: 'Early-career-age child',
    age: 'Child ages 20–28',
    tagColor: 'bg-amber-100 text-amber-700',
    goal: 'Value alignment + resource co-creation · Help child achieve elite-level breakthrough',
    courses: [
      {
        name: '"AI Career Parent Empowerment" — Understand the Workplace, Support Growth',
        age: 'Career-track child parents',
        hours: '10 sessions',
        desc: '2026 AI job market and salary trends, core competency analysis, emotional support and boundary-setting, handling workplace pressure and setbacks constructively.',
        price: '$149',
      },
      {
        name: '"AI Entrepreneurship Parent Support" — Shared Values, Enable Success',
        age: 'Startup-track child parents',
        hours: '10 sessions',
        desc: '2026 AI startup landscape and opportunities, understanding your child\'s business model, rational financial support, building resilience and long-term vision together.',
        price: '$149',
      },
    ],
    services: [
      'Career, entrepreneurship, and wellbeing specialists for 1-on-1 parent guidance',
      'Regular updates on child\'s career/startup milestones + direct mentor communication',
      'Resource packs: AI Career Guide, Startup Parent Handbook, Emotional Support Toolkit',
    ],
  },
]

// ─── Purchase Modal ────────────────────────────────────────────────

function PurchaseModal({ course, onClose }) {
  const [payment, setPayment] = useState('card')
  const [submitted, setSubmitted] = useState(false)

  if (!course) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="card p-8 max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-4xl mb-4">✅</div>
          <h3 className="font-semibold text-bingo-dark text-lg">Enrolment Request Received</h3>
          <p className="text-slate-600 text-sm mt-2">We'll contact you within 24 hours to confirm your place in <strong>{course.name}</strong>.</p>
          <button onClick={onClose} className="btn-primary mt-4 px-6 py-2">Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-bingo-dark mb-1">Enrol Now</h2>
        <p className="text-slate-500 text-sm mb-4">Secure your place — we'll confirm within 24 hours</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <p className="font-medium text-slate-800">{course.name}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-primary font-bold text-lg">{course.price}</p>
            {course.hours && <span className="text-xs text-slate-500">{course.hours}</span>}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment method</label>
          <div className="space-y-2">
            {[{ id: 'card', label: 'Credit / Debit Card' }, { id: 'paypal', label: 'PayPal' }, { id: 'group', label: 'Group Enrolment (2+ students · 10% off)' }].map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} className="text-primary" />
                <span className="text-sm text-slate-700">{p.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setSubmitted(true)} className="btn-primary flex-1 py-2.5">Confirm Enrolment</button>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Course Card ───────────────────────────────────────────────────

function CourseCard({ course, onEnrol }) {
  return (
    <div className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-bingo-dark text-sm leading-snug flex-1">{course.name}</h4>
        <span className="shrink-0 font-bold text-primary text-sm">{course.price}</span>
      </div>
      <div className="flex gap-2 text-xs text-slate-500 mb-2">
        <span>👤 {course.age}</span>
        {course.hours && <span>· ⏱ {course.hours}</span>}
      </div>
      <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-4">{course.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => onEnrol(course)} className="btn-primary text-xs px-3 py-1.5">Enrol Now</button>
        <Link to="/ai-test" className="text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5 transition">Free Assessment First</Link>
      </div>
    </div>
  )
}

// ─── Level Block ───────────────────────────────────────────────────

function LevelBlock({ level, isParent }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-slate-50 transition"
      >
        <div className="shrink-0">
          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${level.tagColor}`}>{level.level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-bingo-dark">{level.name}</span>
            <span className="text-xs text-slate-500">{level.age}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{level.goal}</p>
        </div>
        <span className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-5">
          {/* Outcome */}
          <div className="bg-primary/5 rounded-xl px-4 py-3 text-sm text-primary font-medium">
            🎯 {isParent ? 'Goal' : 'Outcome'}: {level.outcome || level.goal}
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {isParent ? 'Parent Courses' : 'Student Courses'} ({level.courses.length} programmes)
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {level.courses.map((c, i) => <CourseCardInner key={i} course={c} />)}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Included Services</h4>
            <ul className="space-y-1.5">
              {level.services.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-primary shrink-0 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// Inner course card (no modal, just enrol button handled by parent)
function CourseCardInner({ course }) {
  const [enrolling, setEnrolling] = useState(false)
  const [done, setDone] = useState(false)

  if (done) return (
    <div className="card p-5 border-primary/30 text-center">
      <div className="text-2xl mb-1">✅</div>
      <p className="text-sm font-medium text-bingo-dark">Request sent!</p>
      <p className="text-xs text-slate-500 mt-1">We'll contact you within 24 hours.</p>
    </div>
  )

  if (enrolling) return (
    <div className="card p-5 space-y-3">
      <p className="font-medium text-bingo-dark text-sm">{course.name}</p>
      <p className="text-primary font-bold">{course.price}</p>
      <div className="space-y-1.5">
        {[{ id: 'card', label: 'Credit / Debit Card' }, { id: 'paypal', label: 'PayPal' }, { id: 'group', label: 'Group Enrolment (10% off)' }].map((p) => (
          <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="radio" name={`pay-${course.name}`} defaultChecked={p.id === 'card'} />
            {p.label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setDone(true)} className="btn-primary text-xs px-4 py-2 flex-1">Confirm</button>
        <button onClick={() => setEnrolling(false)} className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Back</button>
      </div>
    </div>
  )

  return (
    <div className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-bingo-dark text-sm leading-snug flex-1">{course.name}</h4>
        <span className="shrink-0 font-bold text-primary text-sm">{course.price}</span>
      </div>
      <div className="flex gap-2 text-xs text-slate-500 mb-2">
        <span>👤 {course.age}</span>
        {course.hours && <span>· ⏱ {course.hours}</span>}
      </div>
      <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-4">{course.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setEnrolling(true)} className="btn-primary text-xs px-3 py-1.5">Enrol Now</button>
        <Link to="/ai-test" className="text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5 transition">Free Assessment</Link>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function Courses() {
  const [tab, setTab] = useState('student')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <section className="mb-10 section-tech rounded-2xl px-6 py-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-3">AI Courses</h1>
        <p className="text-slate-600 text-base max-w-3xl mx-auto mb-6">
          Cultivating AI-literate, innovative, and future-ready elites across every age. A four-level student excellence programme paired with a dedicated parent empowerment track — advancing together.
        </p>
        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <span className="bg-white/80 border border-primary/20 rounded-full px-4 py-1.5 text-slate-700">📚 Literacy → Capability → Practice → Mastery</span>
          <span className="bg-white/80 border border-primary/20 rounded-full px-4 py-1.5 text-slate-700">👨‍👩‍👧 Student + Parent dual-track system</span>
          <span className="bg-white/80 border border-primary/20 rounded-full px-4 py-1.5 text-slate-700">🤖 AI-powered personalised learning paths</span>
          <span className="bg-white/80 border border-primary/20 rounded-full px-4 py-1.5 text-slate-700">🏆 Ages 6–28 · Full lifecycle coverage</span>
        </div>
      </section>

      {/* Framework overview */}
      <section className="mb-10">
        <h2 className="section-title mb-5">Course Architecture</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="card p-5 border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-bingo-dark mb-2">🎓 Student Excellence Track</h3>
            <p className="text-sm text-slate-600 mb-3">Four levels from literacy to mastery. Covers ages 6–28 with clear competency goals at each stage.</p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              {['Level 1 · Foundations · Ages 6–12', 'Level 2 · Intermediate · Ages 13–18', 'Level 3 · Applied · Ages 16–22', 'Level 4 · Mastery · Ages 20–28'].map((l, i) => (
                <span key={i} className="flex items-center gap-1.5"><span className="text-primary">✓</span>{l}</span>
              ))}
            </div>
          </div>
          <div className="card p-5 border-amber-200/60 bg-amber-50/40">
            <h3 className="font-semibold text-bingo-dark mb-2">👨‍👩‍👧 Parent Empowerment Track</h3>
            <p className="text-sm text-slate-600 mb-3">Parallel parent courses matched to each student level. From AI onboarding to career co-support.</p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              {['Parent 1 · Foundations · Child ages 6–12', 'Parent 2 · Intermediate · Child ages 13–18', 'Parent 3 · Applied · Child ages 16–22', 'Parent 4 · Mastery · Child ages 20–28'].map((l, i) => (
                <span key={i} className="flex items-center gap-1.5"><span className="text-amber-500">✓</span>{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="card p-4 bg-slate-50 text-center text-sm text-slate-600">
          Both tracks are powered by <strong>AI large models + immersive virtual environments</strong>, with personalised growth paths and full-cycle mentoring support.
        </div>
      </section>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('student')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === 'student' ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          🎓 Student Excellence Track
        </button>
        <button
          onClick={() => setTab('parent')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === 'parent' ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          👨‍👩‍👧 Parent Empowerment Track
        </button>
      </div>

      {/* Student levels */}
      {tab === 'student' && (
        <section className="space-y-4 mb-12">
          <p className="text-slate-500 text-sm mb-2">Click any level to expand courses and services. Each level includes theory, virtual practice, real-world projects, AI assessment, and elite mentoring.</p>
          {STUDENT_LEVELS.map((level) => (
            <LevelBlock key={level.id} level={level} isParent={false} />
          ))}
        </section>
      )}

      {/* Parent levels */}
      {tab === 'parent' && (
        <section className="space-y-4 mb-12">
          <p className="text-slate-500 text-sm mb-2">Parent courses are synchronised with the student track. Each level helps parents guide, support, and grow alongside their child's AI journey.</p>
          {PARENT_LEVELS.map((level) => (
            <LevelBlock key={level.id} level={level} isParent={true} />
          ))}
        </section>
      )}

      {/* CTA strip */}
      <section className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-bingo-dark text-base">Not sure which level is right?</h3>
          <p className="text-slate-600 text-sm mt-1">Take our free 3-minute AI capability assessment and get an instant personalised course recommendation.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/ai-test" className="btn-primary px-5 py-2.5 text-sm">🧠 Free Assessment →</Link>
          <Link to="/community" className="px-5 py-2.5 text-sm rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition">Talk to a Mentor</Link>
        </div>
      </section>

    </div>
  )
}
