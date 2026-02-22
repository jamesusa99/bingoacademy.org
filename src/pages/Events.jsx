import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Data ──────────────────────────────────────────────────────────

const EVENT_LIST = [
  { id: 1, name: 'National Youth AI Innovation Challenge', type: 'whitelist', stage: 'Registration Open', students: '8–18 yrs', award: 'National recognition + certificate', enrolled: 1240, whitelist: true, aiCourse: true, desc: 'China\'s premier whitelist youth AI competition. Innovation + engineering + presentation.' },
  { id: 2, name: 'China Robotics & AI Competition', type: 'whitelist', stage: 'Prep Phase', students: '10–18 yrs', award: 'Provincial / National prizes', enrolled: 890, whitelist: true, aiCourse: true, desc: 'Hands-on robotics and AI integration competition. Team and individual tracks.' },
  { id: 3, name: 'AIOT Innovation Competition', type: 'provincial', stage: 'Entries Closing Soon', students: '12–18 yrs', award: 'Provincial + industry certificate', enrolled: 560, whitelist: false, aiCourse: true, desc: 'AI + IoT integration challenge. Smart home, smart city, wearables tracks.' },
  { id: 4, name: 'WAIC Youth AI Competition', type: 'international', stage: 'Open', students: '14–18 yrs', award: 'International certificate + recognition', enrolled: 320, whitelist: false, aiCourse: false, desc: 'World AI Conference youth track. International exposure and networking.' },
  { id: 5, name: 'Bingo Cup AI Design Challenge', type: 'bingo', stage: 'Active', students: '8–16 yrs', award: 'Prize money + Bingo scholarship', enrolled: 2100, whitelist: false, aiCourse: true, desc: 'Bingo Academy\'s own flagship competition. AIGC, AI art, and data science tracks.' },
  { id: 6, name: 'Science & Technology Innovation Award', type: 'whitelist', stage: 'Upcoming', students: '14–18 yrs', award: 'National award + 综评 material', enrolled: 780, whitelist: true, aiCourse: true, desc: 'Established national competition. Research project + defence format.' },
]

const GALLERY_WORKS = [
  { title: 'AI Campus Navigation Robot', student: 'Student A · Grade 10', award: '🥇 National 1st Prize', type: 'robotics', year: 2024 },
  { title: 'Predictive Flood Early Warning System', student: 'Student B · Grade 11', award: '🥈 Provincial 2nd Prize', type: 'ai', year: 2024 },
  { title: 'AI-Powered Elderly Care Assistant', student: 'Team C · Grade 9-10', award: '🏆 Special Innovation Award', type: 'ai', year: 2024 },
  { title: 'Smart Classroom Engagement Tracker', student: 'Student D · Grade 11', award: '🥇 City Champion', type: 'data', year: 2023 },
  { title: 'AIGC Illustrated Short Story Collection', student: 'Student E · Grade 7', award: '🎨 Creativity Award', type: 'aigc', year: 2024 },
  { title: 'AI-Based Traffic Optimisation Model', student: 'Team F · Grade 12', award: '🥉 Provincial 3rd Prize', type: 'data', year: 2023 },
]

const CUSTOM_TEMPLATES = [
  { id: 'gov', icon: '🏛️', name: 'Government & Enterprise Innovation Race', badge: 'AI Science & Innovation', desc: 'For government agencies and enterprises hosting AI science competitions', duration: '2 months', format: 'Teams + individual', phases: ['Registration (15 days)', 'Preliminary (30 days)', 'Semi-final (20 days)', 'Final (15 days)'], criteria: 'Innovation 40% · Feasibility 30% · Value 20% · Presentation 10%', services: ['AI Sprint Bootcamp (8折 discount for entrants)', 'AI Innovation Ability Assessment (10% of judging)', 'Whitelist competition pathway guidance'] },
  { id: 'school', icon: '🏫', name: 'School & University Teaching Competition', badge: 'Education Track', desc: 'For K-12 schools and universities hosting learning + teaching competitions', duration: '1.5 months', format: 'Students + teachers', phases: ['Registration (10 days)', 'Preliminary (20 days)', 'Final (15 days)'], criteria: 'Teaching fit 40% · Innovation 30% · Expression 20% · Practicality 10%', services: ['AI Teaching Bootcamp + Student Foundations Class', 'Student AI Assessment + Teacher AI Teaching Assessment', 'Whitelist competition entry recommendations'] },
  { id: 'chamber', icon: '🤝', name: 'Chamber & Industry Public Benefit Race', badge: 'Public Benefit', desc: 'For trade associations, chambers, and industry bodies hosting public AI education events', duration: '1 month', format: 'Open public + members', phases: ['Registration (10 days)', 'Online competition (15 days)', 'Ceremony (5 days)'], criteria: 'Reach 40% · Practicality 30% · Public benefit 20% · Participation 10%', services: ['Free AI Public Education Course for all entrants', 'Free AI Literacy Assessment for all participants', 'Industry whitelist competition matchmaking'] },
]

const CUSTOM_FAQ = [
  { q: 'How quickly can a custom event be launched?', a: 'Basic configuration takes 3–5 business days. Full custom launch with all integrations typically 7–10 days. We have a team dedicated to fast deployment.' },
  { q: 'Does our organisation need technical capability?', a: 'Zero technical knowledge needed. Bingo handles all setup, configuration, and ongoing operation. You focus on your participants and goals.' },
  { q: 'Can we embed the AI Assessment into our competition scoring?', a: 'Yes. Assessment scores can contribute to preliminary judging at any weighting you choose (we recommend 10%). Full integration is included in Professional and Flagship packages.' },
  { q: 'What is the whitelist competition connection?', a: 'We help organisers apply for provincial/national whitelist status, and help participants identify and prepare for whitelist competitions that match their work.' },
  { q: 'Can we white-label the platform with our own branding?', a: 'Yes. All packages include full white-label customisation: your logo, colour palette, domain, and branded materials.' },
]

const WHITELIST_EVENTS = [
  { name: 'National Youth AI Innovation Challenge', cert: 'Ministry of Education Whitelist', type: 'AI Innovation', grade: 'Middle + High School', regDeadline: 'Rolling intake', award: 'National certificate + 综评 material', badge: '🏅 Top-tier' },
  { name: 'China Robotics Competition', cert: 'Ministry Whitelist', type: 'Robotics + AI', grade: 'Primary to High School', regDeadline: 'Annual March–April', award: 'National + international pathways', badge: '🏅 Top-tier' },
  { name: 'Science & Technology Innovation Award', cert: 'National Science Org Whitelist', type: 'Research Project', grade: 'High School', regDeadline: 'Annual September', award: 'National prize + 强基 material', badge: '🥇 Recommended' },
  { name: 'STEAM Education Competition', cert: 'Provincial Whitelist', type: 'STEAM Integration', grade: 'Primary + Middle School', regDeadline: 'Bi-annual', award: 'Provincial certificate', badge: '🥈 Verified' },
]

// ─── Small components ──────────────────────────────────────────────

function LeadModal({ title, subtitle, onClose }) {
  const [done, setDone] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-bingo-dark mb-1">Request Submitted!</p>
            <p className="text-sm text-slate-600 mb-3">Our team will contact you within 2 hours.</p>
            <button onClick={onClose} className="btn-primary px-5 py-2 text-sm">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-bingo-dark text-sm">{title}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
            <div className="space-y-3 mb-4">
              {['Name *', 'Phone *', 'Organisation'].map((f, i) => (
                <input key={i} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              ))}
            </div>
            <button onClick={() => setDone(true)} className="w-full btn-primary py-2.5">Submit — 2hr Response</button>
          </>
        )}
      </div>
    </div>
  )
}

function EventDetailModal({ event, onClose }) {
  const [registered, setRegistered] = useState(false)
  if (!event) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {event.whitelist && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">✦ Whitelist Certified</span>}
                {event.aiCourse && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">🎓 Bingo AI Courses Available</span>}
              </div>
              <h3 className="font-bold text-bingo-dark">{event.name}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-3 shrink-0">×</button>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
              {[['Stage', event.stage], ['Participants', event.students], ['Award', event.award], ['Enrolled', `${event.enrolled}+ registered`]].map(([l,v],i) => (
                <div key={i}><span className="text-slate-400">{l}: </span><span className="font-medium text-slate-700">{v}</span></div>
              ))}
            </div>
            <div className="bg-primary/5 rounded-xl p-3 text-xs text-slate-600">{event.desc}</div>
          </div>
          {event.aiCourse && (
            <div className="bg-amber-50 rounded-xl p-3 mb-4 text-xs text-amber-700">
              🎓 <strong>Bingo AI Bootcamp available</strong> for this competition — boosts win rate significantly. Participants enrolled in bootcamp get priority coaching.
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {registered
              ? <span className="flex-1 text-center bg-green-100 text-green-700 text-sm px-4 py-2.5 rounded-xl font-medium">✅ Registered!</span>
              : <button onClick={() => setRegistered(true)} className="flex-1 btn-primary text-sm py-2.5">Register Now</button>}
            <Link to="/ai-test" onClick={onClose} className="border border-primary text-primary text-sm px-4 py-2.5 rounded-xl hover:bg-primary/5 transition">AI Assessment</Link>
            <button onClick={onClose} className="border border-slate-200 text-slate-600 text-sm px-3 py-2.5 rounded-xl hover:bg-slate-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function Events() {
  const [tab, setTab] = useState('home')
  const [evtFilter, setEvtFilter] = useState('all')
  const [galleryFilter, setGalleryFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [leadModal, setLeadModal] = useState(null)
  const [hostModal, setHostModal] = useState(false)
  const [customTemplate, setCustomTemplate] = useState('gov')
  const [faqOpen, setFaqOpen] = useState({})
  const [hostForm, setHostForm] = useState({ name: '', phone: '', org: '', type: '', ai: false, assess: false, whitelist: false })
  const [hostDone, setHostDone] = useState(false)
  const [whitelistQuery, setWhitelistQuery] = useState('')
  const [whitelistDone, setWhitelistDone] = useState(false)

  const TABS = [
    { id: 'home', icon: '🏠', label: 'Hub Home' },
    { id: 'events', icon: '🏆', label: 'Competition List' },
    { id: 'gallery', icon: '🎨', label: 'Works Gallery' },
    { id: 'host', icon: '🔧', label: 'Host a Competition' },
    { id: 'ai-academy', icon: '🎓', label: 'AI Academy Link' },
    { id: 'ai-assess', icon: '🧠', label: 'AI Assessment' },
    { id: 'whitelist', icon: '📋', label: 'Whitelist Advisory' },
  ]

  const filteredEvents = evtFilter === 'all' ? EVENT_LIST : EVENT_LIST.filter(e => e.type === evtFilter)
  const filteredGallery = galleryFilter === 'all' ? GALLERY_WORKS : GALLERY_WORKS.filter(w => w.type === galleryFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Modals */}
      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {leadModal && <LeadModal title={leadModal.title} subtitle={leadModal.subtitle} onClose={() => setLeadModal(null)} />}

      {/* ── Hero ── */}
      <section className="mb-8 section-tech rounded-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Register · Train · Compete · Win · Advance</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-3">AI Competition Hub</h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-5">
          From competition discovery to award stage — registration, bootcamp coaching, judging, results, and full event hosting. All in one place.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-6">
          {['Whitelist competition access','Bingo AI bootcamp training','AI ability assessment','Custom event hosting','Awards gallery & portfolio'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => setTab('events')} className="btn-primary px-6 py-2.5">View All Competitions →</button>
          <button onClick={() => setHostModal(true)} className="px-6 py-2.5 rounded-xl border border-amber-400 text-amber-700 font-medium hover:bg-amber-50 transition text-sm">🔧 Host a Competition</button>
          <button onClick={() => setTab('whitelist')} className="px-6 py-2.5 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition text-sm">📋 Whitelist Advisory</button>
        </div>
        <p className="text-xs text-slate-400 mt-4">500+ award winners · 50+ whitelist competition entries · 120+ partner schools</p>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[['500+','Award Winners'],['50+','Whitelist Entries'],['120+','Partner Institutions'],['10,000+','Participants Served']].map(([v,l],i) => (
          <div key={i} className="card p-4 text-center"><div className="text-xl font-bold text-primary">{v}</div><div className="text-xs text-slate-500 mt-0.5">{l}</div></div>
        ))}
      </div>

      {/* ── Tab Nav ── */}
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
          {/* Three service pillars */}
          <section>
            <h2 className="section-title mb-5">Three Services. Complete Competition Support.</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '🎓', title: 'AI Academy Link', desc: 'Every major competition has a paired Bingo bootcamp — competition-specific training that dramatically improves win rates. Enrol in the bootcamp at the same time you register for the competition.', tab: 'ai-academy', color: '' },
                { icon: '🧠', title: 'AI Ability Assessment', desc: 'Structured AI ability testing before competition entry. Identifies strengths and gaps, informs your training focus, and can contribute to competition judging (10% weighting available).', tab: 'ai-assess', color: 'border-purple-200/60 bg-purple-50/10' },
                { icon: '📋', title: 'Whitelist Advisory', desc: 'Expert guidance on which whitelist competitions best fit your student\'s profile and goals. Application support, entry preparation, and direct connection to organisers.', tab: 'whitelist', color: 'border-amber-200/60 bg-amber-50/20' },
              ].map((p,i) => (
                <div key={i} className={`card p-6 flex flex-col border-2 ${p.color}`}>
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <h3 className="font-bold text-bingo-dark mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-600 flex-1 mb-4">{p.desc}</p>
                  <button onClick={() => setTab(p.tab)} className="btn-primary w-full text-sm py-2">Explore →</button>
                </div>
              ))}
            </div>
          </section>

          {/* Featured events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Featured Competitions</h2>
              <button onClick={() => setTab('events')} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {EVENT_LIST.slice(0,3).map((e,i) => (
                <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={() => setSelectedEvent(e)}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {e.whitelist && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">✦ Whitelist</span>}
                    {e.aiCourse && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">🎓 Bootcamp</span>}
                  </div>
                  <h3 className="font-semibold text-bingo-dark text-sm mb-0.5">{e.name}</h3>
                  <p className="text-xs text-slate-500 mb-1">{e.students} · {e.stage}</p>
                  <p className="text-xs text-primary font-medium">{e.award}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Host CTA */}
          <section className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-bingo-dark mb-1">🔧 Want to Host Your Own AI Competition?</h3>
                <p className="text-sm text-slate-600 max-w-xl">Zero-code competition hosting. Full support for schools, enterprises, government bodies, and chambers. Three ready-to-use templates — or fully custom.</p>
              </div>
              <button onClick={() => setHostModal(true)} className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 transition shrink-0">Host a Competition →</button>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════ EVENT LIST ══════════════════ */}
      {tab === 'events' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">🏆 Competition Directory</h2>
            <p className="text-slate-500 text-sm">All active and upcoming competitions. Whitelist-certified events marked. Bootcamp training available where indicated.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['whitelist','Whitelist Certified'],['international','International'],['provincial','Provincial'],['bingo','Bingo Cup']].map(([k,l]) => (
              <button key={k} onClick={() => setEvtFilter(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${evtFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredEvents.map((e,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={() => setSelectedEvent(e)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {e.whitelist && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">✦ Whitelist</span>}
                      {e.aiCourse && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">🎓 Bootcamp Available</span>}
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{e.stage}</span>
                    </div>
                    <h3 className="font-semibold text-bingo-dark">{e.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{e.students} · {e.enrolled}+ registered · {e.award}</p>
                  </div>
                  <button className="btn-primary text-xs px-3 py-1.5 shrink-0">Details →</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Not sure which competition to enter? Take the free AI Assessment first.</p>
            <div className="flex gap-2">
              <Link to="/ai-test" className="btn-primary text-xs px-4 py-2">Free AI Assessment</Link>
              <button onClick={() => setLeadModal({ title: 'Competition Guidance Consultation', subtitle: 'Free 1-on-1 · personalised competition recommendation' })} className="border border-primary text-primary text-xs px-4 py-2 rounded-xl hover:bg-primary/5 transition">Free Consultation</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ GALLERY ══════════════════ */}
      {tab === 'gallery' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">🎨 Competition Works Gallery</h2>
            <p className="text-slate-500 text-sm">Award-winning student works from competitions we support. All showcased with permission.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All Types'],['robotics','Robotics'],['ai','AI Innovation'],['data','Data Science'],['aigc','AIGC Creative']].map(([k,l]) => (
              <button key={k} onClick={() => setGalleryFilter(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${galleryFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredGallery.map((w,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition group">
                <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 h-28 flex items-center justify-center text-3xl mb-3 group-hover:from-primary/10 group-hover:to-primary/20 transition">
                  {w.type === 'robotics' ? '🤖' : w.type === 'ai' ? '🧠' : w.type === 'data' ? '📊' : '🎨'}
                </div>
                <h3 className="font-semibold text-bingo-dark text-sm mb-0.5">{w.title}</h3>
                <p className="text-xs text-slate-500 mb-1">{w.student} · {w.year}</p>
                <p className="text-xs font-medium text-primary">{w.award}</p>
                <div className="flex gap-2 mt-3">
                  <button className="text-xs text-primary hover:underline">View Details →</button>
                  <Link to="/ai-test" className="text-xs text-slate-400 hover:text-primary transition">AI Assessment →</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">Want your work featured here?</p>
              <p className="text-xs text-slate-500 mt-0.5">Register for any competition and join a Bingo bootcamp to get started</p>
            </div>
            <button onClick={() => setTab('events')} className="btn-primary text-sm px-4 py-2">Browse Competitions →</button>
          </div>
        </div>
      )}

      {/* ══════════════════ HOST A COMPETITION ══════════════════ */}
      {tab === 'host' && (
        <div className="space-y-6">
          <div className="card p-5 bg-amber-50/40 border-amber-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🔧 Host Your Own AI Competition</h2>
            <p className="text-slate-600 text-sm">Zero-code platform · full operations support · 2-hour response to all enquiries. Three ready templates or fully custom — for schools, enterprises, government bodies, and chambers.</p>
          </div>

          {/* Template selector */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Choose a Competition Template</p>
            <div className="flex gap-2 flex-wrap">
              {CUSTOM_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setCustomTemplate(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${customTemplate===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template detail */}
          {CUSTOM_TEMPLATES.filter(t => t.id === customTemplate).map(t => (
            <div key={t.id} className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <h3 className="font-bold text-bingo-dark">{t.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.badge}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">{t.desc}</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Duration & Format</p>
                    <p className="text-slate-700">{t.duration} · {t.format}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Judging Criteria</p>
                    <p className="text-xs text-slate-600">{t.criteria}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Competition Phases:</p>
                  <div className="flex flex-wrap gap-1 items-center text-xs">
                    {t.phases.map((p,i,arr) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg">{p}</span>
                        {i < arr.length-1 && <span className="text-slate-300">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card p-5 border-green-200/60 bg-green-50/20">
                <p className="text-xs font-semibold text-slate-600 mb-2">Three Bundled Services (included):</p>
                <div className="space-y-1.5">
                  {t.services.map((s,i) => <div key={i} className="flex gap-2 text-xs text-slate-600"><span className="text-green-600 shrink-0">✓</span>{s}</div>)}
                </div>
              </div>
            </div>
          ))}

          {/* Requirement submission form */}
          <div className="card p-5">
            <h3 className="font-semibold text-bingo-dark mb-3">Submit Your Requirements</h3>
            {hostDone ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold text-bingo-dark">Requirements Submitted!</p>
                <p className="text-sm text-slate-600 mt-1">A draft proposal will be generated and our team will contact you within 2 hours.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Competition Name *', 'Contact Person *', 'Phone *', 'Organisation *'].map((f,i) => (
                    <div key={i}>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">{f}</label>
                      <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Competition Type *</label>
                    <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none bg-white">
                      <option>AI Science & Innovation</option>
                      <option>Education & Teaching</option>
                      <option>Public Benefit / Industry</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Expected Participants</label>
                    <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none bg-white">
                      <option>Under 100</option>
                      <option>100–500</option>
                      <option>500–2,000</option>
                      <option>2,000+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Services Needed:</p>
                  <div className="flex gap-3 flex-wrap">
                    {[['ai', '🎓 AI Academy Bootcamp Link'], ['assess', '🧠 AI Ability Assessment Integration'], ['whitelist', '📋 Whitelist Competition Connection']].map(([k,l]) => (
                      <label key={k} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={hostForm[k]} onChange={e => setHostForm(f => ({...f,[k]:e.target.checked}))} />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={() => setHostDone(true)} className="w-full btn-primary py-2.5">Submit — 2hr Response</button>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Frequently Asked Questions</p>
            <div className="space-y-2">
              {CUSTOM_FAQ.map((f,i) => (
                <div key={i} className="card overflow-hidden">
                  <button className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 transition"
                    onClick={() => setFaqOpen(p => ({...p,[i]:!p[i]}))}>
                    <span className="font-medium text-slate-800 text-sm pr-4">{f.q}</span>
                    <span className="text-primary shrink-0 text-lg">{faqOpen[i] ? '−' : '+'}</span>
                  </button>
                  {faqOpen[i] && <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ AI ACADEMY LINK ══════════════════ */}
      {tab === 'ai-academy' && (
        <div className="space-y-6">
          <div className="card p-5 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🎓 Bingo AI Academy — Competition Bootcamps</h2>
            <p className="text-slate-600 text-sm">Every major competition on our platform has a matched Bingo bootcamp. Training is competition-specific, taught by former competition coaches, and dramatically improves award rates.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: '🤖', name: 'AI Innovation Competition Sprint', comp: 'National Youth AI Innovation Challenge', type: 'Competition Sprint', weeks: 8, desc: 'Full competition preparation: project selection, development, optimisation, mock defence. Coaches are former national judges.', price: 'From $890', enroll: 342 },
              { icon: '⚙️', name: 'Robotics Competition Bootcamp', comp: 'China Robotics & AI Competition', type: 'Competition Sprint', weeks: 6, desc: 'Hardware + code + team strategy. Competition-format drills every session. 91% of participants win an award.', price: 'From $790', enroll: 218 },
              { icon: '📊', name: 'Data Science Competition Class', comp: 'Multiple data competitions', type: 'Skills Class', weeks: 4, desc: 'Python · data analysis · visualisation · presentation. Structured to produce competition-ready work.', price: 'From $590', enroll: 184 },
              { icon: '🎨', name: 'AIGC Creative Competition Class', comp: 'Bingo Cup AIGC Track', type: 'Skills Class', weeks: 3, desc: 'AI art tools, prompt engineering, creative concept development. Portfolio-focused training.', price: 'From $490', enroll: 156 },
            ].map((c,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-bingo-dark">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.comp} · {c.weeks} weeks · {c.enroll}+ enrolled</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{c.price}</span>
                  <button onClick={() => setLeadModal({ title: `Enrol: ${c.name}`, subtitle: 'Our team will confirm your place and schedule.' })} className="btn-primary text-xs px-4 py-1.5">Enrol Now</button>
                </div>
              </div>
            ))}
          </div>

          {/* Integration flow */}
          <div className="card p-5 border-primary/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">How the Competition + Bootcamp Integration Works</p>
            <div className="grid sm:grid-cols-3 gap-3 text-center text-xs">
              {[['📝 Register','Register for competition + bootcamp simultaneously. Auto-sync your details.'],['🎓 Train','Bootcamp sessions run in parallel with the competition calendar. Pacing adjusted to competition deadlines.'],['🏆 Compete','Enter competition with coach-reviewed work. Post-competition: data shared back to Bingo for curriculum improvement.']].map(([t,d],i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <div className="font-semibold text-slate-800 mb-1">{t}</div>
                  <div className="text-slate-500 leading-relaxed">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ AI ASSESSMENT ══════════════════ */}
      {tab === 'ai-assess' && (
        <div className="space-y-6">
          <div className="card p-5 bg-purple-50/30 border-purple-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🧠 AI Ability Assessment Centre</h2>
            <p className="text-slate-600 text-sm">Structured assessment of your AI knowledge and skills. Used for competition entry preparation, personalised learning recommendations, and (optionally) as part of competition preliminary judging.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🌱', name: 'AI Foundations Assessment', desc: 'Core AI literacy and conceptual understanding. Recommended for new entrants before registration.', duration: '15 mins', price: 'Free', level: 'Beginner' },
              { icon: '⚙️', name: 'AI Application Skills Assessment', desc: 'Practical AI tool proficiency. Project planning, prompt engineering, and data handling.', duration: '25 mins', price: '¥49', level: 'Intermediate' },
              { icon: '🏆', name: 'Competition Readiness Assessment', desc: 'Full competition preparation check. Identifies specific gaps against competition judging criteria.', duration: '35 mins', price: '¥99', level: 'Advanced' },
            ].map((a,i) => (
              <div key={i} className="card p-5 flex flex-col hover:shadow-md transition">
                <div className="text-2xl mb-2">{a.icon}</div>
                <h3 className="font-semibold text-bingo-dark mb-1">{a.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{a.level} · {a.duration}</p>
                <p className="text-xs text-slate-600 flex-1 mb-3">{a.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <span className={`font-bold text-sm ${a.price === 'Free' ? 'text-green-600' : 'text-primary'}`}>{a.price}</span>
                  <Link to="/ai-test" className="btn-primary text-xs px-3 py-1.5">Start Assessment</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Report preview */}
          <div className="card p-5 bg-slate-50 border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">What Your Assessment Report Includes</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
              {['Overall AI ability score and level classification','Dimension breakdown: understanding · application · creation · ethics','Specific gap analysis vs. competition judging criteria','Personalised learning path recommendations','Recommended Bingo courses and bootcamps','Comparison with competition peer group (aggregated)'].map((r,i) => (
                <div key={i} className="flex gap-2"><span className="text-primary shrink-0">✓</span>{r}</div>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-purple-50/20 border-purple-200/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Ready to see your AI ability baseline?</p>
            <Link to="/ai-test" className="btn-primary text-sm px-5 py-2">Take Free Assessment →</Link>
          </div>
        </div>
      )}

      {/* ══════════════════ WHITELIST ADVISORY ══════════════════ */}
      {tab === 'whitelist' && (
        <div className="space-y-6">
          <div className="card p-5 bg-amber-50/30 border-amber-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">📋 Whitelist Competition Advisory</h2>
            <p className="text-slate-600 text-sm">Whitelist competitions are officially recognised by the Ministry of Education and carry significant weight in 综评, STEM specialty admissions, and 强基 applications. Our advisors help you identify the right competitions, prepare your entry, and navigate the process.</p>
          </div>

          {/* Whitelist event directory */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recognised Whitelist Competitions</p>
            <div className="space-y-3">
              {WHITELIST_EVENTS.map((w,i) => (
                <div key={i} className="card p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-amber-700">{w.badge}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{w.cert}</span>
                      </div>
                      <h3 className="font-semibold text-bingo-dark text-sm">{w.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{w.type} · {w.grade} · Registration: {w.regDeadline}</p>
                      <p className="text-xs text-primary mt-0.5">{w.award}</p>
                    </div>
                    <button onClick={() => setLeadModal({ title: `Whitelist Advisory: ${w.name}`, subtitle: 'Free consultation · entry preparation support' })} className="btn-primary text-xs px-3 py-1.5 shrink-0">Consult →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory service */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'Competition Matching', desc: 'We assess your student\'s current level, interests, and goals, then identify the 2–3 whitelist competitions that best fit.' },
              { icon: '📝', title: 'Entry Preparation', desc: 'Support for project development, written submissions, and presentation preparation aligned to each competition\'s judging rubric.' },
              { icon: '🔗', title: 'Direct Connection', desc: 'For schools and institutions, we facilitate direct contact with competition organisers for group entries and partnership arrangements.' },
            ].map((s,i) => (
              <div key={i} className="card p-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-bingo-dark text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Consultation form */}
          <div className="card p-5 border-amber-200/60 bg-amber-50/10">
            {whitelistDone ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold text-bingo-dark mb-1">Consultation Request Received</p>
                <p className="text-sm text-slate-600">Our whitelist advisory team will contact you within 1 business day.</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-bingo-dark mb-3">Request a Free Whitelist Consultation</h3>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  {['Student Name', 'Grade / Year', 'Parent Phone', 'Target Competitions (optional)'].map((f,i) => (
                    <input key={i} placeholder={f} className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                  ))}
                </div>
                <textarea placeholder="Current AI skills / learning background / specific questions (optional)" rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none mb-3" />
                <button onClick={() => setWhitelistDone(true)} className="w-full btn-primary py-2.5">Submit Consultation Request</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Host a Competition floating CTA modal ── */}
      {hostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setHostModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-bingo-dark">Host a Competition</h3>
              <button onClick={() => setHostModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Tell us your basic needs — we'll build a customised proposal and respond within 2 hours.</p>
            <div className="space-y-3 mb-4">
              {['Competition name (or working title)', 'Your name *', 'Phone *', 'Organisation / School *'].map((f,i) => (
                <input key={i} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              ))}
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none bg-white">
                <option value="">Competition type</option>
                <option>AI Science & Innovation</option>
                <option>School / University Teaching Race</option>
                <option>Chamber / Public Benefit</option>
                <option>Custom</option>
              </select>
            </div>
            <button onClick={() => { setHostModal(false); setTab('host') }} className="w-full btn-primary py-2.5">Submit & View Full Setup →</button>
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">Ready to compete, train, or host?</p>
          <p className="text-xs text-slate-500 mt-0.5">Free AI assessment · personalised competition plan · 2-hour hosting enquiry response</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/ai-test" className="btn-primary text-sm px-4 py-2">🧠 Free AI Assessment</Link>
          <button onClick={() => setTab('events')} className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">View Competitions</button>
          <button onClick={() => setHostModal(true)} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition">Host a Competition</button>
        </div>
      </div>
    </div>
  )
}
