import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Data ───────────────────────────────────────────────────────────

const TRAINING_BASES = [
  { name: 'Alibaba Cloud Intelligence', field: 'AI & Cloud', roles: ['AI Trainer', 'Data Analyst', 'Cloud Ops'], weeks: 12, cert: 'Industry Certificate', badge: '🏆 Top partner' },
  { name: 'Huawei ICT Academy', field: 'AI & Networks', roles: ['AI Engineer (Trainee)', 'Network Ops'], weeks: 8, cert: 'Huawei Certification', badge: '🥇 Flagship' },
  { name: 'ByteDance Data Lab', field: 'Big Data', roles: ['Data Operations', 'Content AI Analyst'], weeks: 10, cert: 'Platform Competency', badge: '🔥 Popular' },
  { name: 'SAIC Intelligent Mfg', field: 'Smart Manufacturing', roles: ['Robotics Ops', 'MES Systems'], weeks: 16, cert: 'SAIC Partner Cert', badge: '' },
]

const JOB_LIST_FALLBACK = [
  { title: 'AI Trainer (Junior)', company: 'Alibaba Cloud', level: 'Junior', salary: '$8k–12k', location: 'Remote / Hangzhou', skill: 'AI Basics · Python', courseLinked: true },
  { title: 'Data Analyst', company: 'ByteDance Data Lab', level: 'Junior', salary: '$10k–15k', location: 'Beijing / Remote', skill: 'SQL · Data Vis', courseLinked: true },
  { title: 'Short Video Operations', company: 'New Media Agency', level: 'Entry', salary: '$5k–8k', location: 'Multiple cities', skill: 'AIGC · Content Ops', courseLinked: false },
  { title: 'Smart Mfg Ops Engineer', company: 'SAIC Partner', level: 'Mid', salary: '$12k–18k', location: 'Shanghai', skill: 'PLC · MES Systems', courseLinked: true },
  { title: 'Business Data Analyst', company: 'Retail Group', level: 'Junior', salary: '$9k–13k', location: 'Guangzhou', skill: 'SQL · Excel · BI', courseLinked: true },
]

const TEXTBOOKS = [
  { title: 'Foundations & Practice of Generative AI', field: 'AI', edition: '2024', linked: 'AI Fundamentals Course', schools: 38, sales: 2100, tag: '🆕 New', isbn: '978-7-xxx-xxxxx-0' },
  { title: 'Business Data Analysis with SQL', field: 'Big Data', edition: '2023', linked: 'SQL Data Analysis', schools: 54, sales: 3400, tag: '🔥 Bestseller', isbn: '978-7-xxx-xxxxx-1' },
  { title: 'Industrial IoT and Smart Manufacturing', field: 'Smart Mfg', edition: '2024', linked: 'IoT Systems Course', schools: 21, sales: 890, tag: '', isbn: '978-7-xxx-xxxxx-2' },
  { title: 'New Media Content Operations (AI Edition)', field: 'New Media', edition: '2024', linked: 'Short Video Ops Course', schools: 44, sales: 1650, tag: '📈 Rising', isbn: '978-7-xxx-xxxxx-3' },
]

const COURSES = [
  { icon: '🤖', name: 'AI Fundamentals to Application', level: 'Beginner', weeks: 4, price: 299, free: 'Ch.1–2 free', tag: '🔥 Top-selling', linkedBook: true },
  { icon: '📊', name: 'SQL Business Data Analysis', level: 'Beginner–Intermediate', weeks: 6, price: 399, free: 'Ch.1 free', tag: '📈 Popular', linkedBook: true },
  { icon: '🏭', name: 'Industrial Robot Programming', level: 'Intermediate', weeks: 8, price: 680, free: 'Intro free', tag: '🏭 Vocational', linkedBook: false },
  { icon: '📱', name: 'AIGC Short Video Operations', level: 'Beginner', weeks: 3, price: 198, free: 'Free trial', tag: '🆕 New', linkedBook: true },
  { icon: '🔗', name: 'IoT & Smart Manufacturing', level: 'Intermediate', weeks: 10, price: 580, free: 'Ch.1 free', tag: '', linkedBook: true },
  { icon: '💼', name: 'Digital Career Sprint Camp', level: 'All levels', weeks: 2, price: 880, free: null, tag: '🎯 Job-ready', linkedBook: false },
]

const CREATORS = [
  { name: 'Prof. Li Wei', title: 'Associate Professor, Zhejiang University of Technology', works: 3, schools: 62, desc: 'Expert in industrial AI applications and vocational curriculum design.' },
  { name: 'Wang Fang', title: 'Senior Data Engineer, Alibaba Cloud', works: 2, schools: 41, desc: 'Creator of the bestselling SQL data analysis textbook. 7 years industry experience.' },
  { name: 'Zhang Hao', title: 'AI Content Director, ByteDance', works: 1, schools: 28, desc: 'Specialises in AIGC content creation and new media operations training.' },
]

const PARTNERS = {
  enterprise: [
    { name: 'Alibaba Cloud Intelligence', field: 'AI · Cloud', collab: 'Training base · curriculum co-build · hiring', size: 'Large' },
    { name: 'ByteDance Data Lab', field: 'Big Data · Content', collab: 'Internship · live project curriculum', size: 'Large' },
    { name: 'SAIC Partner Network', field: 'Smart Manufacturing', collab: 'Training base · certification', size: 'Large' },
    { name: 'Regional AI Startup Cluster', field: 'AI · SaaS', collab: 'Hiring · project internships', size: 'SME' },
  ],
  school: [
    { name: 'Zhejiang Business & Trade Vocational College', type: 'Higher Vocational', collab: 'Joint cultivation · textbook adoption', cases: '2023 cohort, 95% placement' },
    { name: 'Chengdu Polytechnic College', type: 'Higher Vocational', collab: 'Training base · curriculum', cases: '280 students trained' },
    { name: 'Beijing No.1 Vocational School', type: 'Secondary Vocational', collab: 'AI lab · textbook adoption', cases: 'AI lab operational 2024' },
  ],
  org: [
    { name: 'China Association for AI Education', type: 'Industry Association', collab: 'Certification · standards co-build' },
    { name: 'National MOOC Platform', type: 'Platform', collab: 'Course co-distribution' },
    { name: 'Smart Ed Technology Alliance', type: 'Alliance', collab: 'Cross-promotion · events' },
  ],
}

const NEWS_ITEMS = [
  { type: 'publication', tag: '📖 New Publication', title: '"Generative AI Foundations" selected for 2024 Provincial Curriculum Reform Textbook List', date: 'Feb 2025', excerpt: 'The textbook has now been adopted by 38+ colleges and sold 2,100+ copies since launch in October 2024.' },
  { type: 'industry', tag: '🏭 Industry-Education', title: 'Bingo × Huawei ICT Academy Sign Strategic Cooperation Agreement', date: 'Jan 2025', excerpt: 'Formalising an AI talent pipeline from campus to job-ready. Students receive co-branded certification upon completion.' },
  { type: 'employment', tag: '💼 Employment', title: '2024 Smart Career Cohort: 94% Employment Rate, Average Starting Salary $9,800', date: 'Dec 2024', excerpt: 'Latest annual report shows significant improvements over 2023. 68% of students placed in AI-related roles.' },
  { type: 'policy', tag: '📋 Policy Update', title: 'MoE Releases New Vocational AI Education Framework — What It Means for Training Centres', date: 'Nov 2024', excerpt: 'Bingo curriculum team has analysed key policy changes and updated relevant modules accordingly.' },
  { type: 'publication', tag: '📖 New Publication', title: '"Business Data Analysis with SQL" Passes 3,400 Sales Milestone', date: 'Oct 2024', excerpt: 'Now the platform\'s bestselling vocational textbook. Adopted by 54 schools nationwide.' },
]

// ─── Shared mini components ─────────────────────────────────────────

function LeadModal({ title, subtitle, onClose }) {
  const [done, setDone] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-bingo-dark mb-1">Submitted!</p>
            <p className="text-sm text-slate-600 mb-3">Our team will contact you within 1 business day.</p>
            <button onClick={onClose} className="btn-primary px-5 py-2 text-sm">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-bingo-dark text-sm">{title}</h3>
              <button onClick={onClose} className="text-slate-400 text-xl leading-none">×</button>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
            <div className="space-y-2.5 mb-4">
              {['Full name *', 'Phone *', 'Organisation / School'].map((f,i) => (
                <input key={i} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              ))}
            </div>
            <button onClick={() => setDone(true)} className="w-full btn-primary py-2.5">Submit</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export default function Career() {
  const [tab, setTab] = useState('home')
  const [lead, setLead] = useState(null)
  const [newsFilter, setNewsFilter] = useState('all')
  const [partnerTab, setPartnerTab] = useState('enterprise')
  const [assessDone, setAssessDone] = useState(false)
  const [jobList, setJobList] = useState(JOB_LIST_FALLBACK)

  useEffect(() => {
    supabase.from('career_jobs').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setJobList(data.map((r) => ({ title: r.title, company: r.company, level: r.level, salary: r.salary, location: r.location, skill: r.skill, courseLinked: !!r.course_linked })))
    })
  }, [])

  const TABS = [
    { id: 'home', icon: '🏠', label: 'Hub Home' },
    { id: 'industry', icon: '🏭', label: 'Industry-Education' },
    { id: 'jobs', icon: '💼', label: 'Career Centre' },
    { id: 'books', icon: '📚', label: 'Textbook Mall' },
    { id: 'creator', icon: '✍️', label: 'Creator Platform' },
    { id: 'courses', icon: '🎓', label: 'Smart Courses' },
    { id: 'partners', icon: '🤝', label: 'Partner Network' },
    { id: 'news', icon: '📰', label: 'Insights & News' },
  ]

  const filteredNews = newsFilter === 'all' ? NEWS_ITEMS : NEWS_ITEMS.filter(n => n.type === newsFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {lead && <LeadModal title={lead.title} subtitle={lead.subtitle} onClose={() => setLead(null)} />}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mb-8 section-tech rounded-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">AI Empowers · Digital Careers · Future-Ready</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-3">Smart Careers</h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-5">
          One-stop digital career development platform. From skill learning to enterprise internship,
          textbook publishing to job placement — a complete ecosystem for the AI era.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-6">
          {['Industry-Education bases','Digital textbooks','Smart Courses','Creator publishing','Job matching','Partner network'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => setTab('jobs')} className="btn-primary px-6 py-2.5">Explore Careers →</button>
          <button onClick={() => setTab('books')} className="border border-primary text-primary px-6 py-2.5 rounded-xl font-medium hover:bg-primary/5 transition text-sm">Browse Textbooks</button>
          <button onClick={() => setLead({ title: 'Partner with Us', subtitle: 'Enterprise, school, or institution — tell us your goals.' })} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition text-sm">Partner enquiry</button>
        </div>
        <p className="text-xs text-slate-400 mt-4">30+ enterprise partners · 100+ schools · 5,000+ students served · 94% employment rate</p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[['30+','Enterprise Partners'],['100+','Partner Schools'],['5,000+','Students Trained'],['94%','Employment Rate']].map(([v,l],i) => (
          <div key={i} className="card p-4 text-center"><div className="text-xl font-bold text-primary">{v}</div><div className="text-xs text-slate-500 mt-0.5">{l}</div></div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${tab===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ HOME ══════════════════ */}
      {tab === 'home' && (
        <div className="space-y-8">
          <section>
            <h2 className="section-title mb-5">Seven Core Services</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏭', title: 'Industry-Education Bases', desc: 'Enterprise internship placements, joint cultivation programmes, policy insights.', tab: 'industry', color: '' },
                { icon: '💼', title: 'Career Centre', desc: 'Job matching, skill assessment, resume optimisation, employment camp.', tab: 'jobs', color: '' },
                { icon: '📚', title: 'Textbook Mall', desc: 'Digital vocational textbooks. Buy online, access instantly. Pair with courses.', tab: 'books', color: '' },
                { icon: '✍️', title: 'Creator Platform', desc: 'Publish textbooks and courses. Incubation programme for educators.', tab: 'creator', color: '' },
                { icon: '🎓', title: 'Smart Courses', desc: 'Modular vocational courses from beginner to job-ready. Free trial available.', tab: 'courses', color: '' },
                { icon: '🤝', title: 'Partner Network', desc: 'Enterprise, school, and institution partner showcase and collaboration entry.', tab: 'partners', color: '' },
                { icon: '📰', title: 'Insights & News', desc: 'Publication milestones, industry-education successes, policy updates.', tab: 'news', color: '' },
                { icon: '🎯', title: 'Skill Assessment', desc: 'Free digital career ability test. Get a personalised course & job roadmap.', action: () => setTab('jobs'), color: '' },
              ].map((s,i) => (
                <div key={i} className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <h3 className="font-bold text-bingo-dark text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 flex-1 mb-3">{s.desc}</p>
                  <button onClick={s.action ? s.action : () => setTab(s.tab)} className="text-xs text-primary font-medium hover:underline self-start">Explore →</button>
                </div>
              ))}
            </div>
          </section>

          {/* Featured textbooks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Featured Textbooks</h2>
              <button onClick={() => setTab('books')} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {TEXTBOOKS.map((b,i) => (
                <div key={i} className="card p-4 hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={() => setTab('books')}>
                  {b.tag && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-2 inline-block">{b.tag}</span>}
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-cyan-50 h-20 flex items-center justify-center text-3xl mb-2">📖</div>
                  <h3 className="font-semibold text-bingo-dark text-xs line-clamp-2 mb-1">{b.title}</h3>
                  <p className="text-[10px] text-slate-400">{b.field} · {b.schools} schools · {b.sales.toLocaleString()} sold</p>
                </div>
              ))}
            </div>
          </section>

          {/* Partner showcase */}
          <section className="card p-5 bg-slate-50 border-slate-200">
            <h2 className="section-title mb-4">Partner Highlights</h2>
            <div className="flex flex-wrap gap-3">
              {TRAINING_BASES.map((b,i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-2.5 border border-slate-100 text-xs">
                  <span className="font-medium text-bingo-dark">{b.name}</span>
                  <span className="text-slate-400 ml-1.5">· {b.field}</span>
                </div>
              ))}
              {PARTNERS.school.slice(0,2).map((s,i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-2.5 border border-slate-100 text-xs">
                  <span className="font-medium text-bingo-dark">{s.name}</span>
                  <span className="text-slate-400 ml-1.5">· {s.type}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setTab('partners')} className="mt-3 text-xs text-primary hover:underline">View full partner network →</button>
          </section>

          {/* Latest news */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Latest Insights</h2>
              <button onClick={() => setTab('news')} className="text-xs text-primary hover:underline">All news →</button>
            </div>
            <div className="space-y-3">
              {NEWS_ITEMS.slice(0,3).map((n,i) => (
                <div key={i} className="card p-4 hover:shadow-sm hover:border-primary/30 transition flex items-start gap-3">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 mt-0.5">{n.tag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-bingo-dark text-sm line-clamp-1">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════ INDUSTRY-EDUCATION ══════════════════ */}
      {tab === 'industry' && (
        <div className="space-y-6">
          <div className="card p-5 bg-slate-50 border-slate-200">
            <h2 className="font-bold text-bingo-dark mb-1">🏭 Industry-Education Integration Bases</h2>
            <p className="text-slate-600 text-sm">Direct pathway from course completion to enterprise internship. All internship placements require completion of linked Bingo courses.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {TRAINING_BASES.map((b,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                {b.badge && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold mb-2 inline-block">{b.badge}</span>}
                <h3 className="font-bold text-bingo-dark mb-1">{b.name}</h3>
                <p className="text-xs text-primary font-medium mb-2">{b.field} · {b.weeks}-week programme · {b.cert}</p>
                <p className="text-xs text-slate-500 mb-3">Available roles: {b.roles.join(' · ')}</p>
                <div className="flex gap-2">
                  <button onClick={() => setLead({ title: `Apply: ${b.name}`, subtitle: 'Complete linked courses to be eligible.' })} className="btn-primary text-xs px-3 py-1.5">Apply for internship →</button>
                  <button onClick={() => setTab('courses')} className="border border-primary text-primary text-xs px-3 py-1.5 rounded-xl hover:bg-primary/5 transition">View linked courses</button>
                </div>
              </div>
            ))}
          </div>

          {/* Joint cultivation */}
          <div className="card p-5 border-amber-200/60 bg-amber-50/20">
            <h3 className="font-bold text-bingo-dark mb-3">🎓 Joint Cultivation — For Schools & Colleges</h3>
            <p className="text-sm text-slate-600 mb-4">We partner with vocational colleges and universities to deliver customised AI-digital talent programmes. Courses, textbooks, and internship placements all included.</p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs mb-4">
              {[['📋 Needs Assessment','Define programme scope, student profile, and desired outcomes'],['📚 Curriculum Design','Co-build curriculum using Bingo textbooks and enterprise-validated content'],['🏭 Placement','Graduate students matched to internship and job openings in our enterprise network']].map(([t,d],i) => (
                <div key={i} className="bg-white rounded-xl p-3"><p className="font-semibold text-bingo-dark mb-0.5">{t}</p><p className="text-slate-500">{d}</p></div>
              ))}
            </div>
            <button onClick={() => setLead({ title: 'School Partnership Application', subtitle: 'Joint cultivation · textbook adoption · internship pipeline' })} className="btn-primary text-sm px-4 py-2">Apply for joint cultivation →</button>
          </div>

          {/* Policy */}
          <div className="card p-5">
            <h3 className="font-semibold text-bingo-dark mb-3">📋 Policy & Industry Insights</h3>
            <div className="space-y-2 text-sm text-slate-600">
              {['MoE 2024 Vocational AI Education Framework — key points for training institutions','National AI talent gap forecast 2025–2030 (report summary)','Provincial industry-education integration subsidy policy update','How to qualify a training base under the new MoE guidelines'].map((p,i) => (
                <div key={i} className="flex gap-2 items-start p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"><span className="text-primary shrink-0">→</span>{p}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CAREER CENTRE ══════════════════ */}
      {tab === 'jobs' && (
        <div className="space-y-6">
          <div className="card p-5 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">💼 Career Centre</h2>
            <p className="text-slate-600 text-sm">AI-era job matching. Precision recommendations for students who have completed Bingo courses or purchased textbooks.</p>
          </div>

          {/* Skill assessment */}
          <div className="card p-5 bg-amber-50/20 border-amber-200/60">
            <h3 className="font-semibold text-bingo-dark mb-2">🎯 Digital Career Skill Assessment (Free)</h3>
            <p className="text-sm text-slate-600 mb-3">Takes 10 minutes. Identifies your strongest AI-era skills, gaps, and best-fit roles. Generates personalised course + job recommendations.</p>
            {assessDone ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                <p className="font-bold text-green-700 mb-1">✅ Assessment submitted!</p>
                <p className="text-slate-600">Your skill report and personalised job recommendations will appear within 10 minutes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  {['Current role / study level', 'Target industry / role type', 'Key skills (self-rated)', 'Preferred location'].map((f,i) => (
                    <input key={i} placeholder={f} className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                  ))}
                </div>
                <button onClick={() => setAssessDone(true)} className="btn-primary px-5 py-2.5 text-sm">Start Free Assessment →</button>
              </div>
            )}
          </div>

          {/* Job list */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Current Openings</p>
            <div className="space-y-3">
              {jobList.map((j,i) => (
                <div key={i} className="card p-4 hover:shadow-sm hover:border-primary/30 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {j.courseLinked && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">🎓 Course-linked</span>}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{j.level}</span>
                      </div>
                      <h3 className="font-semibold text-bingo-dark">{j.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{j.company} · {j.location} · {j.skill}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">{j.salary}</p>
                      <button onClick={() => setLead({ title: `Apply: ${j.title}`, subtitle: `${j.company} · ${j.location}` })} className="btn-primary text-xs px-3 py-1.5 mt-1">Apply →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employment stats */}
          <div className="card p-5 bg-green-50/20 border-green-200/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Employment Outcomes 2024</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
              {[['94%','Employment rate'],['$9,800','Avg starting salary'],['68%','AI-related roles'],['30+','Hiring partners']].map(([v,l],i) => (
                <div key={i}><p className="font-bold text-primary text-lg">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
              ))}
            </div>
          </div>

          {/* Guidance services */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '📄', title: 'CV & Resume Optimisation', desc: 'AI-assisted resume review + expert feedback. Free trial, premium full service.', cta: 'Book session' },
              { icon: '🎙️', title: 'Interview Prep Coaching', desc: 'Mock interviews with industry HR. Live coaching + recording review.', cta: 'Book session' },
              { icon: '🚀', title: 'Digital Career Sprint Camp', desc: '2-week intensive job-readiness programme. Portfolio + live mock interviews.', cta: 'Enrol' },
            ].map((s,i) => (
              <div key={i} className="card p-5 hover:shadow-md transition">
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-bingo-dark text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{s.desc}</p>
                <button onClick={() => setLead({ title: s.title })} className="btn-primary text-xs px-3 py-1.5">{s.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ TEXTBOOK MALL ══════════════════ */}
      {tab === 'books' && (
        <div className="space-y-6">
          <div className="card p-5 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-bingo-dark mb-1">📚 Digital Textbook Mall</h2>
              <p className="text-slate-600 text-sm">Vocational AI textbooks written by industry experts. Digital access instant. Physical print available. Pair with courses for 20%+ bundle discount.</p>
            </div>
            <a href="https://binguoketang.com/#/bingoBook/home?flag=store" target="_blank" rel="noreferrer" className="btn-primary text-sm px-4 py-2 shrink-0">Open Full Bookstore ↗</a>
          </div>

          <div className="flex gap-2 flex-wrap text-xs">
            {['All','AI & Machine Learning','Big Data & SQL','Smart Manufacturing','IoT','New Media'].map((f,i) => (
              <button key={i} className={`px-3 py-1.5 rounded-xl font-medium transition ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {TEXTBOOKS.map((b,i) => (
              <div key={i} className="card p-5 flex gap-4 hover:shadow-md hover:border-primary/30 transition">
                <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-50 flex items-center justify-center text-4xl shrink-0">📖</div>
                <div className="flex-1 min-w-0">
                  {b.tag && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1 inline-block">{b.tag}</span>}
                  <h3 className="font-semibold text-bingo-dark text-sm mb-0.5">{b.title}</h3>
                  <p className="text-xs text-slate-500 mb-1">{b.field} · {b.edition} Edition · {b.schools} schools adopted</p>
                  <p className="text-xs text-primary font-medium mb-2">Linked course: {b.linked}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button className="btn-primary text-xs px-3 py-1.5">Buy Textbook</button>
                    <button onClick={() => setTab('courses')} className="border border-primary text-primary text-xs px-3 py-1.5 rounded-xl hover:bg-primary/5 transition">View course</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4 bg-amber-50/20 border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">📦 Course + Textbook bundle packs</p>
              <p className="text-xs text-slate-500">Buy any textbook with its linked course and save 20–30% versus purchasing separately.</p>
            </div>
            <button onClick={() => setLead({ title: 'Get Bundle Pack Pricing' })} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition shrink-0">Get bundle price</button>
          </div>
        </div>
      )}

      {/* ══════════════════ CREATOR PLATFORM ══════════════════ */}
      {tab === 'creator' && (
        <div className="space-y-6">
          <div className="card p-5 bg-violet-50/30 border-violet-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">✍️ Creator Platform — Publish & Earn</h2>
            <p className="text-slate-600 text-sm">For educators, industry experts, and AI professionals. Write textbooks, build courses, earn royalties. Bingo handles layout, distribution, and sales.</p>
          </div>

          {/* Creator entry */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-bingo-dark mb-3">Creator Benefits</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {['Revenue share on every sale — no cap','Copyright fully retained by author','Platform design + formatting support','Publisher introduction and print coordination','Priority listing in Textbook Mall','Considered for Bingo invited lecturer programme'].map((b,i) => (
                  <li key={i} className="flex gap-2"><span className="text-violet-600 shrink-0">✓</span>{b}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5 border-violet-200/60 bg-violet-50/20">
              <h3 className="font-semibold text-bingo-dark mb-3">Creator Tools</h3>
              <div className="space-y-2 text-sm text-slate-600">
                {['📝 Textbook authoring editor (WYSIWYG, chapter structure)','🎬 Lecture video trim & upload','📊 Question bank builder (auto-graded)','🎨 Typesetting & layout assistance (free for all creators)','📬 Publication coordination & print fulfilment'].map((t,i) => (
                  <div key={i} className="flex gap-2 items-start p-2 rounded-lg hover:bg-slate-50">{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured creators */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Featured Creators</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {CREATORS.map((c,i) => (
                <div key={i} className="card p-5 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg mb-3">{c.name[0]}</div>
                  <h3 className="font-semibold text-bingo-dark">{c.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{c.title}</p>
                  <p className="text-xs text-slate-600 mb-2">{c.desc}</p>
                  <p className="text-xs text-primary">{c.works} works · {c.schools} schools</p>
                </div>
              ))}
            </div>
          </div>

          {/* Creator incubation */}
          <div className="card p-5 bg-amber-50/20 border-amber-200/60">
            <h3 className="font-semibold text-bingo-dark mb-2">🚀 Creator Incubation Programme</h3>
            <p className="text-sm text-slate-600 mb-3">Selected creators receive dedicated editorial support, marketing promotion, school adoption outreach, and the opportunity to become a Bingo invited lecturer. Apply with your curriculum idea and we'll connect you with our editorial team.</p>
            <div className="flex gap-2">
              <a href="https://binguoketang.com/#/author/login" target="_blank" rel="noreferrer" className="btn-primary text-sm px-4 py-2">Join Creator Platform ↗</a>
              <button onClick={() => setLead({ title: 'Creator Incubation Application', subtitle: 'Tell us your area and idea. We\'ll match you with editorial support.' })} className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">Apply to incubation programme</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ SMART COURSES ══════════════════ */}
      {tab === 'courses' && (
        <div className="space-y-6">
          <div className="card p-5 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🎓 Smart Career Courses</h2>
            <p className="text-slate-600 text-sm">Modular, industry-validated courses. Pair with textbooks for the complete learning experience. Completion unlocks priority access to internship placements and job matching.</p>
          </div>
          <div className="flex gap-2 text-xs flex-wrap">
            {['All','Beginner','Intermediate','Job-ready Camp','Textbook-linked'].map((f,i) => (
              <button key={i} className={`px-3 py-1.5 rounded-xl font-medium transition ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {COURSES.map((c,i) => (
              <div key={i} className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition">
                <div className="text-2xl mb-2">{c.icon}</div>
                {c.tag && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1 self-start">{c.tag}</span>}
                {c.linkedBook && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-1 self-start">📚 Textbook linked</span>}
                <h3 className="font-semibold text-bingo-dark text-sm mb-0.5">{c.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{c.level} · {c.weeks} weeks</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  <span className="font-bold text-primary">${c.price}</span>
                  <div className="flex gap-1.5">
                    {c.free && <button className="border border-primary text-primary text-xs px-2 py-1 rounded-lg hover:bg-primary/5">Free trial</button>}
                    <button onClick={() => setLead({ title: `Enrol: ${c.name}` })} className="btn-primary text-xs px-3 py-1.5">Enrol</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4 bg-green-50/20 border-green-200/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">🎯 Course + Textbook + Internship bundle</p>
              <p className="text-xs text-slate-500">The complete package: course + linked textbook + internship placement priority. Best value.</p>
            </div>
            <button onClick={() => setLead({ title: 'Course + Textbook + Internship Bundle' })} className="btn-primary text-sm px-4 py-2">Get full bundle →</button>
          </div>
        </div>
      )}

      {/* ══════════════════ PARTNER NETWORK ══════════════════ */}
      {tab === 'partners' && (
        <div className="space-y-6">
          <div className="card p-5 bg-slate-50 border-slate-200">
            <h2 className="font-bold text-bingo-dark mb-1">🤝 Partner Network</h2>
            <p className="text-slate-600 text-sm">Enterprise, school, and institution partners shaping digital career education. Interested in partnering? See the enquiry form below. For full platform cooperation policies, visit <Link to="/community" className="text-primary hover:underline">Institution Cooperation →</Link></p>
          </div>

          <div className="flex gap-2">
            {[['enterprise','🏢 Enterprise'],['school','🏫 Schools & Colleges'],['org','🏛️ Organisations']].map(([k,l]) => (
              <button key={k} onClick={() => setPartnerTab(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${partnerTab===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>

          {partnerTab === 'enterprise' && (
            <div className="space-y-3">
              {PARTNERS.enterprise.map((p,i) => (
                <div key={i} className="card p-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-bingo-dark">{p.name}</h3>
                    <p className="text-xs text-slate-500">{p.field} · {p.size} · {p.collab}</p>
                  </div>
                  <button onClick={() => setLead({ title: `Enterprise Collaboration: ${p.name}` })} className="btn-primary text-xs px-3 py-1.5 shrink-0">Enquire →</button>
                </div>
              ))}
            </div>
          )}
          {partnerTab === 'school' && (
            <div className="space-y-3">
              {PARTNERS.school.map((s,i) => (
                <div key={i} className="card p-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-bingo-dark">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.type} · {s.collab}</p>
                    <p className="text-xs text-green-600 mt-0.5">{s.cases}</p>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Active partner</span>
                </div>
              ))}
            </div>
          )}
          {partnerTab === 'org' && (
            <div className="space-y-3">
              {PARTNERS.org.map((o,i) => (
                <div key={i} className="card p-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-bingo-dark">{o.name}</h3>
                    <p className="text-xs text-slate-500">{o.type} · {o.collab}</p>
                  </div>
                  <button onClick={() => setLead({ title: `Organisation Partnership: ${o.name}` })} className="btn-primary text-xs px-3 py-1.5 shrink-0">Connect →</button>
                </div>
              ))}
            </div>
          )}

          {/* Partnership application form */}
          <div className="card p-5 border-amber-200/60 bg-amber-50/10">
            <h3 className="font-semibold text-bingo-dark mb-2">Apply for Partnership</h3>
            <p className="text-sm text-slate-600 mb-3">Tell us about your organisation and goals. We have dedicated commercial teams for enterprise, school, and institution partnerships.</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              {['Organisation name *', 'Contact person *', 'Phone *', 'Partnership type'].map((f,i) => (
                <input key={i} placeholder={f} className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              ))}
            </div>
            <textarea placeholder="Brief description of your cooperation goals" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none mb-3" />
            <button onClick={() => setLead({ title: 'Partnership Application Confirmed', subtitle: 'Our team will review and respond within 1 business day.' })} className="w-full btn-primary py-2.5">Submit Partnership Application</button>
          </div>
        </div>
      )}

      {/* ══════════════════ INSIGHTS & NEWS ══════════════════ */}
      {tab === 'news' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">📰 Insights & News</h2>
            <p className="text-slate-500 text-sm">Publication milestones, industry-education outcomes, employment results, policy updates, and featured coverage.</p>
          </div>

          <div className="flex gap-2 flex-wrap text-xs">
            {[['all','All'],['publication','📖 Publications'],['industry','🏭 Industry-Education'],['employment','💼 Employment'],['policy','📋 Policy']].map(([k,l]) => (
              <button key={k} onClick={() => setNewsFilter(k)} className={`px-3 py-1.5 rounded-xl font-medium transition ${newsFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredNews.map((n,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 mt-0.5">{n.tag}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-bingo-dark mb-1">{n.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{n.date}</p>
                    <p className="text-sm text-slate-600">{n.excerpt}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs text-primary hover:underline">Read more →</button>
                      {(n.type === 'publication' || n.type === 'industry') && (
                        <button onClick={() => setTab(n.type === 'publication' ? 'books' : 'industry')} className="text-xs text-slate-400 hover:text-primary transition">View related products →</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Get industry news and Bingo updates directly</p>
            <button onClick={() => setLead({ title: 'Subscribe to Insights Newsletter', subtitle: 'Monthly digest of digital career education news and Bingo updates.' })} className="btn-primary text-sm px-4 py-2">Subscribe →</button>
          </div>
        </div>
      )}

      {/* ── Cross-promotion footer ──────────────────────────────── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">Full ecosystem — from AI literacy to digital careers</p>
          <p className="text-xs text-slate-500 mt-0.5">AI Courses · Competitions · Certification → <strong>Smart Careers</strong></p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/courses" className="btn-primary text-sm px-4 py-2">AI Courses</Link>
          <Link to="/events" className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">Events</Link>
          <Link to="/cert" className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">Certification</Link>
          <button onClick={() => setLead({ title: 'Partner with Bingo — Smart Careers' })} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition">Partner enquiry</button>
        </div>
      </div>
    </div>
  )
}
