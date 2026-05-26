import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'
import StudentPortfolioGallery from '../components/StudentPortfolioGallery'
import { SHOWCASE_PORTAL } from '../config/showcasePortal'

// ─── Data ──────────────────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'Competition Award Winners' },
  { value: '300+', label: 'STEM Admissions Cases' },
  { value: '120+', label: 'K12 Classroom Projects' },
  { value: '98%+', label: 'Parent Satisfaction Rate' },
  { value: '1,000+', label: 'AI Works Produced' },
  { value: '50+', label: 'Prestigious Competition Wins' },
]

const AWARD_CASES_FALLBACK = [
  { student: 'Student A', grade: 'Grade 6 · Primary', pain: 'Zero AI background · didn\'t know which competition to enter', path: 'AI Literacy Camp → Prestigious Competition Bootcamp → 1-on-1 Coach Prep', result: '🥇 National Prestigious Competition · 1st Prize', duration: '6 months', tags: ['AI Zero Background', 'Prestigious Competition', 'Primary School'], detail: 'Starting from zero, A completed the AI Literacy programme in 2 months, joined the Prestigious Competition Bootcamp, and worked with a competition coach on mock defences. Scored in the top 3% nationally.', type: 'competition' },
  { student: 'Student B', grade: 'Grade 10 · High School', pain: 'Had AI skills but no competition experience or formal results', path: 'ML Intro Camp → Competition Research Project → Pre-Competition Sprint', result: '🥈 Provincial AI Innovation Competition · 2nd Prize', duration: '8 months', tags: ['ML Skills', 'Competition Research', 'High School'], detail: 'B had basic Python skills. With guided research project mentorship and a personalised competition strategy, achieved provincial 2nd place and built a strong comprehensive-evaluation portfolio.', type: 'competition' },
  { student: 'Student C', grade: 'Grade 8 · Middle School', pain: 'Parents wanted competitions but didn\'t know AI education pathway', path: 'AI Literacy → Robotics Camp → Robotics Competition', result: '🏆 City Robotics Championship · Champion', duration: '5 months', tags: ['Robotics', 'Middle School', 'Competition'], detail: 'Complete beginner at entry. Intensive robotics programme with team collaboration training. Won city championship and was invited to join the school robotics team.', type: 'competition' },
]

const ADMISSIONS_CASES_FALLBACK = [
  { student: 'Student D', grade: 'Grade 12 · High School', pain: 'Wanted STEM specialty admission but had no qualifying AI results', path: 'Comprehensive Evaluation Research Project → AI Portfolio → STEM Specialty Application', result: '🎓 STEM Specialty Admission · Key Provincial High School', duration: '10 months', tags: ['Comprehensive Evaluation', 'STEM Specialty', 'High School'], detail: 'D used our ML research project as the cornerstone of their comprehensive evaluation application. Research report, competition certificates, and mentor recommendation letter all contributed to a successful STEM specialty offer.', type: 'admissions' },
  { student: 'Student E', grade: 'Grade 11 · High School', pain: 'Strong AI interest but no formal pathway or documentation', path: 'AI Agent Research → Competition Entry → Strong Foundation Application', result: '🎓 Strong Foundation Programme Shortlisted · CS Major · Top-10 University', duration: '12 months', tags: ['Strong Foundation Programme', 'University Application', 'AI Research'], detail: 'E built an AI agent prototype and competed in two national competitions. The working prototype was demonstrated in the strong-foundation interview, directly supporting the CS major shortlisting.', type: 'admissions' },
  { student: 'Student F', grade: 'Grade 12 · International Track', pain: 'Applying to US universities without standout STEM projects', path: 'Data Science Camp → Research Project → International Application', result: '🌏 US University Early Decision · Top-50 School', duration: '8 months', tags: ['International', 'US Admissions', 'Data Science'], detail: '"Impressive depth of STEM project work" — cited directly by admissions letter. Data science portfolio and competition certificate formed the core of the application.', type: 'admissions' },
]

const ABILITY_CASES_FALLBACK = [
  { student: 'Student G', grade: 'Grade 5 · Primary', pain: 'Worried child would only use AI tools, not think creatively', path: 'AI Literacy Starter → AIGC Creative Design → Project Portfolio', result: '🎨 AI Art Portfolio · 12 original works · School Exhibition', improvement: ['Creative Thinking +85%', 'Tool Application +90%', 'Self-directed Learning +70%'], type: 'ability' },
  { student: 'Student H', grade: 'Grade 7 · Middle School', pain: 'Child used AI passively — copy-paste mentality', path: 'AI Literacy + Unplugged Science → Data Analysis Project', result: '📊 School Data Science Project Award · District 1st', improvement: ['Logical Thinking +78%', 'Data Literacy +92%', 'Problem Solving +80%'], type: 'ability' },
  { student: 'Student I', grade: 'Grade 9 · Middle School', pain: 'Wanted to learn AI but couldn\'t focus or stay consistent', path: 'AI Foundations → Check-In Programme → ML Intro', result: '🧠 AI Literacy Level 3 Certificate · Competition Portfolio Started', improvement: ['Consistency Score +88%', 'AI Concepts Mastery +82%', 'Confidence +75%'], type: 'ability' },
]

function mapCase(r) {
  return {
    student: r.student,
    org: r.org,
    grade: r.grade,
    region: r.region,
    type: r.type,
    role: r.role,
    pain: r.pain,
    path: r.path,
    solution: r.solution,
    result: r.result,
    detail: r.detail,
    improvement: r.improvement,
    tags: r.tags || [],
    duration: r.duration,
    timeline: r.timeline,
    months: r.months,
  }
}

const PARENT_TESTIMONIALS = [
  { name: 'Parent of Student A (Shanghai)', quote: 'We were worried AI would just make our child dependent on technology. What actually happened was the complete opposite — she started questioning outputs, fact-checking AI, and proposing her own solutions. That shift in mindset was worth every penny.' },
  { name: 'Parent of Student D (Beijing)', quote: 'The comprehensive evaluation application process was daunting until we had the research report and competition certificates. Bingo\'s team guided us through every step. Our daughter got her first-choice STEM programme.' },
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
  const [cTab, setCTab] = useState('awards')
  const [activeCase, setActiveCase] = useState(null)
  const [activeCaseType, setActiveCaseType] = useState(null)
  const [awardCases, setAwardCases] = useState(AWARD_CASES_FALLBACK)
  const [admissionsCases, setAdmissionsCases] = useState(ADMISSIONS_CASES_FALLBACK)
  const [abilityCases, setAbilityCases] = useState(ABILITY_CASES_FALLBACK)

  useEffect(() => {
    supabase.from('showcase_cases').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) {
        const byType = (t) => data.filter((r) => r.type === t).map(mapCase)
        setAwardCases(byType('competition').length ? byType('competition') : AWARD_CASES_FALLBACK)
        setAdmissionsCases(byType('admissions').length ? byType('admissions') : ADMISSIONS_CASES_FALLBACK)
        setAbilityCases(byType('ability').length ? byType('ability') : ABILITY_CASES_FALLBACK)
      }
    })
  }, [])

  const cTabs = [
    { id: 'awards', icon: '🏆', label: 'Competition Awards' },
    { id: 'admissions', icon: '🎓', label: 'Admissions Outcomes' },
    { id: 'ability', icon: '🧠', label: 'Ability Growth' },
  ]

  return (
    <div className="w-full">
      <CaseModal item={activeCase} type={activeCaseType} onClose={() => { setActiveCase(null); setActiveCaseType(null) }} />

      <PageBanner
        eyebrow="Real Outcomes · Verified Results"
        title="Achievements"
        subtitle={SHOWCASE_PORTAL.bannerSubtitle}
        gradient="from-amber-500/15 via-amber-50 to-orange-50"
      >
        <div className="bg-red-50 border border-red-200/60 rounded-xl px-4 py-3 mb-5 max-w-xl mx-auto lg:mx-0 text-left sm:text-center">
          <p className="text-red-700 text-sm font-medium">Worried AI learning leads nowhere? See real student results below.</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center lg:justify-start text-xs mt-4">
          {['Prestigious competition wins','STEM specialty admissions','AI works portfolio','University research projects','K12 lab work','Certified learners'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
      </PageBanner>

      <PageContent className="py-6 sm:py-8">
      {/* ── Student portfolio (visual-first) ── */}
      <section className="mb-10">
        <StudentPortfolioGallery />
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
                    <p className="text-xs font-semibold text-primary">Bingo Solution: Competition Bootcamp + prestigious competition pathway + dedicated competition coach. From first lesson to award stage.</p>
                  </div>
                  <Link to="/courses?line=ioai" className="btn-primary text-sm px-4 py-2 shrink-0">IOAI Training Courses →</Link>
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Student Award Cases</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {awardCases.map((c,i) => (
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
                    <p className="text-sm text-slate-700 mb-2">Can AI skills actually help with comprehensive evaluation, strong-foundation programmes, or university applications? How do I turn my child's AI learning into formal admissions material?</p>
                    <p className="text-xs font-semibold text-purple-600">Bingo Solution: Structured research projects + competition entries + certified portfolio → direct admissions pathway.</p>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2 shrink-0">Free Admissions Planning →</button>
                </div>
              </div>

              {/* Admissions pathway visual */}
              <div className="card p-5 border-purple-200/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">The Bingo Admissions Pathway</p>
                <div className="flex items-center gap-1 flex-wrap text-xs">
                  {['AI Learning','Competition/Project','Research Certificate','Portfolio Build','Admissions Application','STEM Specialty / Comprehensive Eval / Strong Foundation / International'].map((step,i,arr) => (
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
                  {admissionsCases.map((c,i) => (
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
                <LeadCapture title="Get a personalised admissions roadmap" subtitle="Free consultation · comprehensive evaluation / strong foundation / international track" btnText="Book Free Consultation →" />
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
                  <Link to="/courses?line=general" className="btn-primary text-sm px-4 py-2 shrink-0">Foundations of AI Program →</Link>
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
                  {abilityCases.map((c,i) => (
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
              { icon: '📚', title: 'Foundations of AI Program', desc: 'Self-study literacy, labs, and materials', cta: 'Browse Courses', href: '/courses?line=general' },
              { icon: '📚', title: '1-on-1 Learning Plan', desc: 'Personalised roadmap from advisor · competition + admissions aligned', cta: 'Book Free Consult', href: null },
              { icon: '🏆', title: 'IOAI Training', desc: 'Video lessons and training camps for competitions', cta: 'View Programmes', href: '/courses?line=ioai' },
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

      {/* ── Universal trust footer ── */}
      <div className="mt-10 card p-5 border-slate-200 bg-slate-50">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center mb-3">Endorsed & Recognised By</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Ministry-Listed Competitions','District Education Bureau Partners','University Research Labs','STEM Demonstration Schools','AI Education Industry Alliance','10,000+ Satisfied Families'].map((b,i) => (
            <span key={i} className="text-[10px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 shadow-sm">✓ {b}</span>
          ))}
        </div>
      </div>

      </PageContent>
    </div>
  )
}
