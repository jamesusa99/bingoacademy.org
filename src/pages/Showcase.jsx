import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Data ──────────────────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'Competition Award Winners' },
  { value: '300+', label: 'STEM Admissions Cases' },
  { value: '120+', label: 'Partner Schools & Institutions' },
  { value: '98%+', label: 'Parent Satisfaction Rate' },
  { value: '1,000+', label: 'AI Works Produced' },
  { value: '50+', label: 'Whitelist Competition Wins' },
]

const AWARD_CASES = [
  { student: 'Student A', grade: 'Grade 6 · Primary', pain: 'Zero AI background · didn\'t know which competition to enter', path: 'AI Literacy Camp → Whitelist Bootcamp → 1-on-1 Coach Prep', result: '🥇 National Whitelist Competition · 1st Prize', duration: '6 months', tags: ['AI Zero Background', 'Whitelist Competition', 'Primary School'], detail: 'Starting from zero, A completed the AI Literacy programme in 2 months, joined the Whitelist Bootcamp, and worked with a competition coach on mock defences. Scored in the top 3% nationally.', type: 'competition' },
  { student: 'Student B', grade: 'Grade 10 · High School', pain: 'Had AI skills but no competition experience or formal results', path: 'ML Intro Camp → Competition Research Project → Pre-Competition Sprint', result: '🥈 Provincial AI Innovation Competition · 2nd Prize', duration: '8 months', tags: ['ML Skills', 'Competition Research', 'High School'], detail: 'B had basic Python skills. With guided research project mentorship and a personalised competition strategy, achieved provincial 2nd place and built a strong 综评 portfolio.', type: 'competition' },
  { student: 'Student C', grade: 'Grade 8 · Middle School', pain: 'Parents wanted competitions but didn\'t know AI education pathway', path: 'AI Literacy → Robotics Camp → Robotics Competition', result: '🏆 City Robotics Championship · Champion', duration: '5 months', tags: ['Robotics', 'Middle School', 'Competition'], detail: 'Complete beginner at entry. Intensive robotics programme with team collaboration training. Won city championship and was invited to join the school robotics team.', type: 'competition' },
]

const ADMISSIONS_CASES = [
  { student: 'Student D', grade: 'Grade 12 · High School', pain: 'Wanted STEM specialty admission but had no qualifying AI results', path: '综评 Research Project → AI Portfolio → STEM Specialty Application', result: '🎓 STEM Specialty Admission · Key Provincial High School', duration: '10 months', tags: ['综评 Admissions', 'STEM Specialty', 'High School'], detail: 'D used our ML research project as the cornerstone of their 综评 application. Research report, competition certificates, and mentor recommendation letter all contributed to a successful STEM specialty offer.', type: 'admissions' },
  { student: 'Student E', grade: 'Grade 11 · High School', pain: 'Strong AI interest but no formal pathway or documentation', path: 'AI Agent Research → Competition Entry → 强基 Application', result: '🎓 强基 Programme Shortlisted · CS Major · Top-10 University', duration: '12 months', tags: ['强基 Programme', 'University Application', 'AI Research'], detail: 'E built an AI agent prototype and competed in two national competitions. The working prototype was demonstrated in the 强基 interview, directly supporting the CS major shortlisting.', type: 'admissions' },
  { student: 'Student F', grade: 'Grade 12 · International Track', pain: 'Applying to US universities without standout STEM projects', path: 'Data Science Camp → Research Project → International Application', result: '🌏 US University Early Decision · Top-50 School', duration: '8 months', tags: ['International', 'US Admissions', 'Data Science'], detail: '"Impressive depth of STEM project work" — cited directly by admissions letter. Data science portfolio and competition certificate formed the core of the application.', type: 'admissions' },
]

const ABILITY_CASES = [
  { student: 'Student G', grade: 'Grade 5 · Primary', pain: 'Worried child would only use AI tools, not think creatively', path: 'AI Literacy Starter → AIGC Creative Design → Project Portfolio', result: '🎨 AI Art Portfolio · 12 original works · School Exhibition', improvement: ['Creative Thinking +85%', 'Tool Application +90%', 'Self-directed Learning +70%'], type: 'ability' },
  { student: 'Student H', grade: 'Grade 7 · Middle School', pain: 'Child used AI passively — copy-paste mentality', path: 'AI Literacy + Unplugged Science → Data Analysis Project', result: '📊 School Data Science Project Award · District 1st', improvement: ['Logical Thinking +78%', 'Data Literacy +92%', 'Problem Solving +80%'], type: 'ability' },
  { student: 'Student I', grade: 'Grade 9 · Middle School', pain: 'Wanted to learn AI but couldn\'t focus or stay consistent', path: 'AI Foundations → Check-In Programme → ML Intro', result: '🧠 AI Literacy Level 3 Certificate · Competition Portfolio Started', improvement: ['Consistency Score +88%', 'AI Concepts Mastery +82%', 'Confidence +75%'], type: 'ability' },
]

const SCHOOL_CASES = [
  { org: 'Maple Grove Academy', region: 'Shanghai', type: 'Public School', pain: 'Required AI curriculum by new standards — no teachers, no resources', solution: 'Full AI curriculum pack + 3-day teacher training + embedded competition resources', result: '1,200+ students reached · 8 teachers certified · 15 competition award winners in Year 1', duration: '3 months to full launch', tags: ['Curriculum', 'Teacher Training', 'Competition'] },
  { org: 'Horizon International School', region: 'Beijing', type: 'International School', pain: 'Wanted AI programme aligned with IB and AP curriculum', solution: 'Custom AI integration programme + bilingual materials + international competition pathway', result: '300+ students · IB extended essay AI track established · 4 international competition entries', duration: '4 months', tags: ['International Curriculum', 'Bilingual', 'IB/AP'] },
  { org: 'Tech Focus Middle School', region: 'Shenzhen', type: 'STEM Focus School', pain: 'Had STEM label but no AI education depth or competition results', solution: 'Advanced AI lab setup + competition coaching track + STEM specialty pathway guidance', result: 'Designated "AI Education Demonstration School" by district · 20+ competition awards Year 1', duration: '6 months', tags: ['STEM School', 'AI Lab', 'Demonstration School'] },
]

const FRANCHISE_CASES = [
  { org: 'BrightPath Education Centre', region: 'Chengdu', type: 'Franchise Partner', pain: 'Converting from English tutoring to AI education — no curriculum or brand', timeline: '6 months post-launch', result: '200+ students enrolled · 3 in-house competitions hosted · Revenue +¥40万', months: 6 },
  { org: 'Future Minds Academy', region: 'Guangzhou', type: 'Franchise Partner', pain: 'New AI education brand, zero market recognition', timeline: '8 months post-launch', result: '350+ students · 95% course renewal rate · Regional AI leader recognition', months: 8 },
]

const PARENT_TESTIMONIALS = [
  { name: 'Parent of Student A (Shanghai)', quote: 'We were worried AI would just make our child dependent on technology. What actually happened was the complete opposite — she started questioning outputs, fact-checking AI, and proposing her own solutions. That shift in mindset was worth every penny.' },
  { name: 'Parent of Student D (Beijing)', quote: 'The 综评 application process was terrifying until we had the research report and competition certificates. Bingo\'s team guided us through every step. Our daughter got her first-choice STEM programme.' },
  { name: 'Parent of Student G (Shenzhen)', quote: 'My son went from copy-pasting homework to building his own AI art portfolio. His school showed it at the parents\' evening. I couldn\'t believe it was his work.' },
]

// ─── Small components ──────────────────────────────────────────────

function PainTag({ text }) {
  return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{text}</span>
}

function CaseCard({ item, onClick }) {
  return (
    <div className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-semibold text-bingo-dark text-sm">{item.student || item.org}</span>
          <span className="text-xs text-slate-500 ml-2">{item.grade || item.region}</span>
        </div>
        {item.duration && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">{item.duration}</span>}
      </div>
      <p className="text-xs text-slate-500 mb-2 italic">"{item.pain}"</p>
      <div className="text-xs font-medium text-primary mb-2">{item.result}</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {(item.tags || []).map((t, i) => <PainTag key={i} text={t} />)}
      </div>
      <button className="text-xs text-primary hover:underline">Full story →</button>
    </div>
  )
}

function CaseModal({ item, type, onClose }) {
  const [leadDone, setLeadDone] = useState(false)
  if (!item) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-bingo-dark">{item.student || item.org}</h3>
              <p className="text-xs text-slate-500">{item.grade || `${item.region} · ${item.type}`}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-3">×</button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-0.5">Starting Pain Point</p>
              <p className="text-slate-700">{item.pain}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-3">
              <p className="text-xs font-semibold text-primary mb-0.5">Bingo Solution</p>
              <p className="text-slate-700">{item.path || item.solution}</p>
            </div>
            {item.detail && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-600 mb-0.5">Full Journey</p>
                <p className="text-slate-600">{item.detail}</p>
              </div>
            )}
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-700 mb-0.5">Outcome</p>
              <p className="text-slate-800 font-medium">{item.result}</p>
            </div>
            {item.improvement && (
              <div className="flex flex-wrap gap-2">
                {item.improvement.map((imp, i) => <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">{imp}</span>)}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            {leadDone ? (
              <div className="text-center py-3">
                <div className="text-2xl mb-1">✅</div>
                <p className="font-medium text-bingo-dark text-sm">Request received!</p>
                <p className="text-xs text-slate-500 mt-0.5">Our team will contact you within 10 minutes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Interested in a similar outcome?</p>
                <div className="flex gap-2">
                  <input placeholder="Your phone number" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                  <button onClick={() => setLeadDone(true)} className="btn-primary text-sm px-4 py-2 shrink-0">Get This Plan</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeadCapture({ title, subtitle, btnText }) {
  const [done, setDone] = useState(false)
  return done ? (
    <div className="text-center py-4">
      <span className="text-2xl">✅</span>
      <p className="font-medium text-bingo-dark text-sm mt-1">Submitted! We'll contact you within 10 minutes.</p>
    </div>
  ) : (
    <div>
      <p className="font-semibold text-bingo-dark text-sm mb-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none w-28" />
        <input placeholder="Phone" className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none flex-1 min-w-[140px]" />
        <button onClick={() => setDone(true)} className="btn-primary text-sm px-4 py-2 shrink-0">{btnText || 'Submit'}</button>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function Showcase() {
  const [audience, setAudience] = useState('c') // 'c' | 'b'
  const [cTab, setCTab] = useState('awards')
  const [bTab, setBTab] = useState('school')
  const [activeCase, setActiveCase] = useState(null)
  const [activeCaseType, setActiveCaseType] = useState(null)

  const cTabs = [
    { id: 'awards', icon: '🏆', label: 'Competition Awards' },
    { id: 'admissions', icon: '🎓', label: 'Admissions Outcomes' },
    { id: 'ability', icon: '🧠', label: 'Ability Growth' },
  ]
  const bTabs = [
    { id: 'school', icon: '🏫', label: 'School Partnerships' },
    { id: 'franchise', icon: '🤝', label: 'Franchise Partners' },
    { id: 'oem', icon: '🔧', label: 'OEM Custom' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Case Detail Modal */}
      <CaseModal item={activeCase} type={activeCaseType} onClose={() => { setActiveCase(null); setActiveCaseType(null) }} />

      {/* ── Hero ── */}
      <section className="mb-8 section-tech rounded-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Real Outcomes · Verified Results · Proven Pathways</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-2">Achievements</h1>
        <p className="text-lg text-slate-600 mb-1">Breaking AI Education Anxiety with Real Results</p>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto mb-5">1,000+ student success stories · 120+ partner institutions · Full competition-to-admissions ecosystem</p>

        {/* Pain point hook */}
        <div className="bg-red-50 border border-red-200/60 rounded-xl px-4 py-3 mb-6 max-w-xl mx-auto">
          <p className="text-red-700 text-sm font-medium">Worried AI learning leads nowhere? No competition wins? No admissions edge?</p>
          <p className="text-red-600 text-xs mt-0.5">↓ See real student answers to every one of these fears ↓</p>
        </div>

        {/* B/C toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setAudience('c')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${audience==='c' ? 'bg-primary text-white shadow' : 'bg-white border border-primary text-primary hover:bg-primary/5'}`}>
            👦 Student & Family Outcomes
          </button>
          <button onClick={() => setAudience('b')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${audience==='b' ? 'bg-primary text-white shadow' : 'bg-white border border-primary text-primary hover:bg-primary/5'}`}>
            🏫 School & Institution Outcomes
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center text-xs">
          {['Whitelist competition wins','STEM specialty admissions','AI works portfolio','University research projects','School AI curriculum','Franchise success cases'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {STATS.map((s,i) => (
          <div key={i} className="card p-3 text-center">
            <div className="text-lg font-bold text-primary">{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════ C-END ══════════════════ */}
      {audience === 'c' && (
        <div className="space-y-6">
          {/* Tab nav */}
          <div className="flex gap-2 flex-wrap">
            {cTabs.map(t => (
              <button key={t.id} onClick={() => setCTab(t.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${cTab===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Competition Awards */}
          {cTab === 'awards' && (
            <div className="space-y-6">
              {/* Pain + solution banner */}
              <div className="card p-5 border-2 border-primary/20 bg-primary/5">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-600 mb-1">Pain Points We Solve:</p>
                    <p className="text-sm text-slate-700 mb-2">Which AI competitions should my child enter? Are they realistic for a zero-background student? Will coaching actually lead to wins?</p>
                    <p className="text-xs font-semibold text-primary">Bingo Solution: Competition Bootcamp + Whitelist pathway + dedicated competition coach. From first lesson to award stage.</p>
                  </div>
                  <Link to="/ai-test" className="btn-primary text-sm px-4 py-2 shrink-0">Free Competition Assessment →</Link>
                </div>
              </div>

              {/* Trusted competition resources */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Authorised Competitions We Train For</p>
                <div className="flex flex-wrap gap-2">
                  {['National Youth AI Innovation Challenge','China Robotics & AI Competition','AIOT Innovation Competition','WAIC Youth AI Competition','International AI Olympiad','Science & Technology Innovation Award'].map((c,i) => (
                    <span key={i} className="text-xs bg-white border border-primary/20 rounded-lg px-3 py-1.5 text-slate-700 shadow-sm">🏅 {c}</span>
                  ))}
                </div>
              </div>

              {/* Award stats */}
              <div className="grid grid-cols-3 gap-3">
                {[['500+','Total Award Winners'],['92%','Award Success Rate'],['1st Prizes','50+ this year']].map(([v,l],i) => (
                  <div key={i} className="card p-4 text-center bg-amber-50/30 border-amber-200/60">
                    <div className="font-bold text-amber-700 text-lg">{v}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>

              {/* Cases grid */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Real Student Award Cases</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {AWARD_CASES.map((c,i) => (
                    <CaseCard key={i} item={c} onClick={() => { setActiveCase(c); setActiveCaseType('award') }} />
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="card p-5 bg-amber-50/30 border-amber-200/60">
                <LeadCapture title="Want a competition plan for your child?" subtitle="Free 1-on-1 consultation · personalised competition pathway" btnText="Free Competition Consult →" />
              </div>
            </div>
          )}

          {/* Admissions Outcomes */}
          {cTab === 'admissions' && (
            <div className="space-y-6">
              <div className="card p-5 border-2 border-purple-200/60 bg-purple-50/10">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-600 mb-1">Pain Points We Solve:</p>
                    <p className="text-sm text-slate-700 mb-2">Can AI skills actually help with 综评, 强基, or university applications? How do I turn my child's AI learning into formal admissions material?</p>
                    <p className="text-xs font-semibold text-purple-600">Bingo Solution: Structured research projects + competition entries + certified portfolio → direct admissions pathway.</p>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2 shrink-0">Free Admissions Planning →</button>
                </div>
              </div>

              {/* Admissions pathway visual */}
              <div className="card p-5 border-purple-200/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">The Bingo Admissions Pathway</p>
                <div className="flex items-center gap-1 flex-wrap text-xs">
                  {['AI Learning','Competition/Project','Research Certificate','Portfolio Build','Admissions Application','STEM Specialty / 综评 / 强基 / International'].map((step,i,arr) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">{step}</span>
                      {i < arr.length - 1 && <span className="text-slate-300">→</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Verified Admissions Cases (All anonymised)</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {ADMISSIONS_CASES.map((c,i) => (
                    <CaseCard key={i} item={c} onClick={() => { setActiveCase(c); setActiveCaseType('admissions') }} />
                  ))}
                </div>
              </div>

              {/* Parent testimonials */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">What Parents Say</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {PARENT_TESTIMONIALS.map((t,i) => (
                    <div key={i} className="card p-4">
                      <p className="text-sm text-slate-600 italic mb-3">"{t.quote}"</p>
                      <p className="text-xs text-primary font-medium">— {t.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 bg-purple-50/20 border-purple-200/60">
                <LeadCapture title="Get a personalised admissions roadmap" subtitle="Free consultation · 综评 / 强基 / international track" btnText="Book Free Consultation →" />
              </div>
            </div>
          )}

          {/* Ability Growth */}
          {cTab === 'ability' && (
            <div className="space-y-6">
              <div className="card p-5 border-2 border-green-200/60 bg-green-50/10">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-600 mb-1">Pain Points We Solve:</p>
                    <p className="text-sm text-slate-700 mb-2">Worried your child just uses AI passively — copy-pasting instead of thinking? Will AI make them lazy rather than capable?</p>
                    <p className="text-xs font-semibold text-green-600">Bingo Solution: AI Literacy courses train questioning, creation, and critical evaluation — not just tool usage.</p>
                  </div>
                  <Link to="/ai-test" className="btn-primary text-sm px-4 py-2 shrink-0">Free AI Literacy Assessment →</Link>
                </div>
              </div>

              {/* Pyramid */}
              <div className="card p-5 border-green-200/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Bingo AI Ability Development Pyramid</p>
                <div className="space-y-2 max-w-md mx-auto text-center text-xs">
                  {[['🌟 Create & Innovate','Produce original AI-powered work','bg-amber-100 text-amber-700'],['🧠 Think & Evaluate','Question, refine, and direct AI','bg-primary/10 text-primary'],['⚙️ Apply & Adapt','Use AI tools effectively','bg-green-100 text-green-700'],['📚 Understand & Explore','AI literacy foundations','bg-slate-100 text-slate-600']].map(([t,d,c],i) => (
                    <div key={i} className={`rounded-xl px-4 py-2 ${c}`} style={{margin: `0 ${i*8}px`}}>
                      <div className="font-semibold">{t}</div>
                      <div className="text-[10px] opacity-80">{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Ability Growth Cases</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {ABILITY_CASES.map((c,i) => (
                    <CaseCard key={i} item={c} onClick={() => { setActiveCase(c); setActiveCaseType('ability') }} />
                  ))}
                </div>
              </div>

              {/* AI Works Showcase */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Student AI Works Gallery</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['AI Illustrated Story','Predictive Data Model','AI Music Composer','Chatbot Project','Environmental AI Art','Robot Navigation Code','AI Language Translator','Smart Home Prototype'].map((w,i) => (
                    <div key={i} className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 aspect-video flex flex-col items-center justify-center text-center p-3 hover:from-primary/10 hover:to-primary/20 transition cursor-pointer group">
                      <div className="text-xl mb-1 group-hover:scale-110 transition">
                        {['📖','📊','🎵','🤖','🎨','💻','🌐','🏠'][i]}
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium leading-tight">{w}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 bg-green-50/20 border-green-200/60">
                <LeadCapture title="Measure your child's AI ability baseline" subtitle="Free 3-min assessment · instant personalised report" btnText="Free AI Literacy Test →" />
              </div>
            </div>
          )}

          {/* C-end bottom promo row */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🧠', title: 'Free AI Assessment', desc: '3 mins · instant level report · personalised learning path', cta: 'Start Assessment', href: '/ai-test' },
              { icon: '📚', title: '1-on-1 Learning Plan', desc: 'Personalised roadmap from advisor · competition + admissions aligned', cta: 'Book Free Consult', href: null },
              { icon: '🏆', title: 'Competition Bootcamp', desc: 'Whitelist competition training · from beginner to award winner', cta: 'View Programmes', href: '/research' },
            ].map((p,i) => (
              <div key={i} className="card p-5 text-center hover:shadow-md transition">
                <div className="text-2xl mb-2">{p.icon}</div>
                <h3 className="font-semibold text-bingo-dark text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{p.desc}</p>
                {p.href
                  ? <Link to={p.href} className="btn-primary text-xs px-4 py-1.5">{p.cta}</Link>
                  : <button onClick={() => {}} className="btn-primary text-xs px-4 py-1.5">{p.cta}</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ B-END ══════════════════ */}
      {audience === 'b' && (
        <div className="space-y-6">
          {/* Tab nav */}
          <div className="flex gap-2 flex-wrap">
            {bTabs.map(t => (
              <button key={t.id} onClick={() => setBTab(t.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${bTab===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* School Partnerships */}
          {bTab === 'school' && (
            <div className="space-y-6">
              <div className="card p-5 border-2 border-primary/20 bg-primary/5">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-600 mb-1">School Pain Points We Solve:</p>
                    <p className="text-sm text-slate-700 mb-2">New curriculum requires AI classes — but no qualified teachers, no ready curriculum, no competition resources. How to launch fast with quality?</p>
                    <p className="text-xs font-semibold text-primary">Bingo Solution: Complete AI curriculum package + 3-day teacher certification + embedded competition pathway. Full launch in weeks.</p>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2 shrink-0">Request School Proposal →</button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[['📋','Curriculum Ready','Full AI course package, lesson plans, assessments — ready to teach from Day 1'],['👨‍🏫','Teacher Certified','3-day intensive certification programme. Teach with confidence, not uncertainty'],['🏆','Competition Results','Embedded competition pathway means your school shows real AI achievement, fast']].map(([i,t,d],idx) => (
                  <div key={idx} className="card p-5 text-center">
                    <div className="text-2xl mb-2">{i}</div>
                    <h3 className="font-semibold text-bingo-dark text-sm mb-1">{t}</h3>
                    <p className="text-xs text-slate-500">{d}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Partner School Success Cases</p>
                <div className="space-y-4">
                  {SCHOOL_CASES.map((c,i) => (
                    <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-semibold text-bingo-dark">{c.org}</span>
                          <span className="text-xs text-slate-500 ml-2">{c.region} · {c.type}</span>
                        </div>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.duration}</span>
                      </div>
                      <p className="text-xs text-red-600 italic mb-2">"{c.pain}"</p>
                      <p className="text-xs text-slate-600 mb-2"><strong>Solution:</strong> {c.solution}</p>
                      <p className="text-sm font-medium text-primary mb-2">✓ {c.result}</p>
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t,j) => <PainTag key={j} text={t} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 bg-primary/5 border-primary/20">
                <div className="grid sm:grid-cols-3 gap-3 text-sm text-center mb-4">
                  {[['120+','Partner Schools'],['50,000+','Students Reached'],['200+','Teachers Certified']].map(([v,l],i) => (
                    <div key={i}><div className="text-lg font-bold text-primary">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
                  ))}
                </div>
                <LeadCapture title="Get the full school AI curriculum proposal" subtitle="Free · includes curriculum plan, teacher training schedule, and budget estimate" btnText="Request Free Proposal →" />
              </div>
            </div>
          )}

          {/* Franchise */}
          {bTab === 'franchise' && (
            <div className="space-y-6">
              <div className="card p-5 border-2 border-amber-200/60 bg-amber-50/10">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-600 mb-1">Institution Pain Points We Solve:</p>
                    <p className="text-sm text-slate-700 mb-2">Transitioning to AI education but have no brand, no proven curriculum, and no support system. How to profit quickly without building from scratch?</p>
                    <p className="text-xs font-semibold text-amber-700">Bingo Franchise: Brand licence + full curriculum + teacher training + competition resources + operations playbook. Zero to revenue in months.</p>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2 shrink-0">Franchise Enquiry →</button>
                </div>
              </div>

              {/* Franchise value chain */}
              <div className="card p-5 border-amber-200/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">What You Get as a Franchise Partner</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                  {['🏷️ Brand Licence','📚 Full Curriculum','👨‍🏫 Teacher Training','🏆 Competition Resources','📊 Operations Playbook','📣 Marketing Support'].map((s,i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-2">
                      <p className="font-medium text-amber-800 leading-tight">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Franchise Partner Results</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {FRANCHISE_CASES.map((c,i) => (
                    <div key={i} className="card p-5 hover:shadow-md hover:border-amber-300 transition">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-semibold text-bingo-dark">{c.org}</span>
                          <span className="text-xs text-slate-500 ml-2">{c.region}</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{c.timeline}</span>
                      </div>
                      <p className="text-xs text-red-600 italic mb-2">"{c.pain}"</p>
                      <p className="text-sm font-medium text-primary">✓ {c.result}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {[['Avg. Break-even','< 8 months'],['Avg. Monthly Enrolment','80+ new students'],['Course Renewal Rate','90%+']].map(([l,v],i) => (
                  <div key={i} className="card p-4 text-center bg-amber-50/30 border-amber-200/60">
                    <div className="text-sm text-slate-500">{l}</div>
                    <div className="font-bold text-amber-700 text-lg mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card p-5 bg-amber-50/20 border-amber-200/60">
                <LeadCapture title="Check franchise availability in your area" subtitle="Limited regional slots available" btnText="Check Availability →" />
              </div>
            </div>
          )}

          {/* OEM */}
          {bTab === 'oem' && (
            <div className="space-y-6">
              <div className="card p-5 border-2 border-slate-200 bg-slate-50/50">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-600 mb-1">OEM Client Pain Points:</p>
                    <p className="text-sm text-slate-700 mb-2">You have the distribution and brand — but no R&D capability to build AI courses or hardware. How to launch a credible own-brand AI education product?</p>
                    <p className="text-xs font-semibold text-slate-700">Bingo OEM: Course content · hardware kit · teaching tools · all white-label. Your brand, our expertise.</p>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2 shrink-0">OEM Enquiry →</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[['📖','Custom Course Content','AI curriculum built to your brand standards and student demographics'],['🔧','Hardware & Kits','AI-powered maker kits, robotics components, and sensor packages — white label ready'],['🖥️','Software & Tools','AI teaching tools, assessment platform, and learning management system']].map(([i,t,d],idx) => (
                  <div key={idx} className="card p-5">
                    <div className="text-2xl mb-2">{i}</div>
                    <h3 className="font-semibold text-bingo-dark text-sm mb-1">{t}</h3>
                    <p className="text-xs text-slate-500">{d}</p>
                  </div>
                ))}
              </div>

              {/* OEM process */}
              <div className="card p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">OEM Delivery Process</p>
                <div className="flex items-start gap-1 flex-wrap text-xs">
                  {['Requirement Brief','Custom Design','R&D & Prototyping','Testing & QA','Delivery & Branding','Post-launch Support'].map((s,i,arr) => (
                    <div key={i} className="flex items-center gap-1 mb-1">
                      <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium">{s}</div>
                      {i < arr.length-1 && <span className="text-slate-300">→</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 bg-slate-50 border-slate-200">
                <LeadCapture title="Submit your OEM requirements" subtitle="Free feasibility assessment · proposal within 48 hours" btnText="Submit Requirements →" />
              </div>
            </div>
          )}

          {/* B-end bottom CTA */}
          <div className="card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-bingo-dark">Ready to launch AI education at your institution?</p>
              <p className="text-xs text-slate-500 mt-0.5">School · franchise · OEM — all enquiries welcome. No obligation.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="btn-primary text-sm px-4 py-2">Get Partnership Proposal</button>
              <Link to="/community" className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">Visit Community →</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Universal trust footer ── */}
      <div className="mt-10 card p-5 border-slate-200 bg-slate-50">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center mb-3">Endorsed & Recognised By</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Ministry-Listed Competitions','District Education Bureau Partners','University Research Labs','STEM Demonstration Schools','AI Education Industry Alliance','10,000+ Satisfied Families'].map((b,i) => (
            <span key={i} className="text-[10px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 shadow-sm">✓ {b}</span>
          ))}
        </div>
      </div>

    </div>
  )
}
