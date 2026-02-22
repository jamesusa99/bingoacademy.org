import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Data ──────────────────────────────────────────────────────────

const AGE_COHORTS = [
  {
    key: 'enlighten', label: 'Starter Cohort', range: '6–9 yrs', icon: '🌱',
    core: 'Fun science experiments · unplugged activities',
    goal: 'Spark curiosity, build hands-on observation skills, develop foundational scientific thinking',
    camps: ['Unplugged Science Experience Camp', 'Fun Science Starter Camp'],
  },
  {
    key: 'advance', label: 'Intermediate Cohort', range: '10–14 yrs', icon: '⚙️',
    core: 'AI literacy · robotics introduction',
    goal: 'Master basic STEM tools, develop logical thinking and simple project execution',
    camps: ['AI Literacy AI Camp', 'Robotics Intro Workshop Camp'],
  },
  {
    key: 'contest', label: 'Competition Cohort', range: '14–18 yrs', icon: '🏆',
    core: 'Competition-focused · research project methods',
    goal: 'Build competition problem-solving skills, master research methodology, boost college admissions profiles',
    camps: ['Machine Learning Intro Camp', 'Data Science Research Camp', 'Competition Sprint Camp'],
  },
]

const PREMIUM_CAMPS = [
  { id: 'ai', title: 'AI Literacy AI Camp', age: '8–12 yrs', icon: '🤖', direction: 'Starter Interest',
    core: 'AI literacy · unplugged experiments · robotics hands-on',
    highlight: 'Hands-on experiments + hardware practice. Zero-background AI entry — fun and knowledge-rich.',
    outcome: 'Complete 1 simple robot project + AI literacy handbook',
    ratio: '1:10 small class · STEM instructor + teaching assistant', competition: 'Youth AI Innovation Challenge — Foundation Entry',
    price: 'From $590', weeks: '2 weeks' },
  { id: 'data', title: 'Data Science Research Camp', age: '12–16 yrs', icon: '📊', direction: 'Competition Sprint',
    core: 'Data collection · visualisation · analysis · report writing',
    highlight: 'Real datasets, professional tools, full-process research training.',
    outcome: 'Data analysis report + project portfolio',
    ratio: '1:8 small class · data science instructor + TA', competition: 'Data Science categories of AI competitions',
    price: 'From $790', weeks: '3 weeks' },
  { id: 'ml', title: 'Machine Learning Intro Camp', age: '14–18 yrs', icon: '🧠', direction: 'College Admissions',
    core: 'ML fundamentals · model training · project practice · outcome defence',
    highlight: 'University-lab collaboration, professor-guided projects, generate college admissions materials.',
    outcome: 'Small ML project report + research certificate + professor reference letter',
    ratio: '1:6 small class · university professor + research mentor', competition: 'STEM specialty & college admissions pathway',
    price: 'From $1,290', weeks: '4 weeks' },
  { id: 'aigc', title: 'AIGC Creative Design Camp', age: '10–16 yrs', icon: '🎨', direction: 'Starter Interest',
    core: 'AI art generation · AIGC tools · creative project creation',
    highlight: 'Creativity meets AI. No coding required — express ideas through AI-powered art.',
    outcome: 'Original AI artworks portfolio + AIGC tools mastery certificate',
    ratio: '1:10 · creative STEM instructor + design mentor', competition: 'AI creative competitions & design showcases',
    price: 'From $490', weeks: '1 week' },
  { id: 'aero', title: 'Aerospace Innovation Camp', age: '10–16 yrs', icon: '🚀', direction: 'Starter Interest',
    core: 'Rocket principles · aerospace science · hands-on model building',
    highlight: 'Build and launch model rockets. Understand flight, physics, and engineering in action.',
    outcome: 'Water rocket project + aerospace science report',
    ratio: '1:10 · aerospace STEM instructor + safety officer', competition: 'Aerospace model competitions',
    price: 'From $690', weeks: '2 weeks' },
  { id: 'robot', title: 'Robotics Competition Camp', age: '12–18 yrs', icon: '⚙️', direction: 'Competition Sprint',
    core: 'Robot building · programming · competition strategy · team collaboration',
    highlight: 'Competition-ready training. Build, code, and compete with a team.',
    outcome: 'Competition-ready robot + competition coaching certificate',
    ratio: '1:6 · competition coach + technical mentor', competition: 'National Youth AI Robotics Competition',
    price: 'From $990', weeks: '3 weeks' },
  { id: 'unplugged', title: 'Unplugged Science Experience Camp', age: '6–10 yrs', icon: '🔬', direction: 'Starter Interest',
    core: 'Water rockets · rainbow experiments · simple inventions · no screens',
    highlight: '100% screen-free. Safe, fun, hands-on discovery for young learners.',
    outcome: 'Science experiment portfolio + exploration journal',
    ratio: '1:8 · starter science instructor + safety aide', competition: 'Foundation for all future STEM programmes',
    price: 'From $390', weeks: '1 week' },
]

const RESEARCH_PROJECTS = [
  { id: 'ml', title: 'Machine Learning Research Project', age: '14–18 yrs', icon: '🧠',
    steps: ['Topic selection guidance (align with interests & admissions goals)', 'Theory instruction (ML basics + Python tools)', 'Hands-on project (model training & optimisation under university mentor)', 'Report writing (research report format + content polish)', 'Outcome defence (mock university defence, build presentation skills)'],
    tools: 'Python · TensorFlow basics', outcomes: 'University mentor reference letter · ML project report ·综评/portfolio material · Research training certificate',
    suitedFor: 'Integrated evaluation (综评) · Qiangji program · Competition research support', weeks: '6–8 weeks' },
  { id: 'data', title: 'Data Visualisation Analysis Project', age: '12–18 yrs', icon: '📊',
    steps: ['Data collection & cleaning', 'Visualisation tools (Python/Tableau)', 'Data story & insights', 'Final presentation & report'],
    tools: 'Python · Tableau · Excel advanced', outcomes: 'Data analysis portfolio · visualisation report · project certificate',
    suitedFor: 'Data science competitions · STEM portfolio · college applications', weeks: '4–6 weeks' },
  { id: 'agent', title: 'AI Agent Design Research', age: '14–18 yrs', icon: '🤖',
    steps: ['Use-case research & design', 'Prompt engineering & agent architecture', 'Prototype build & testing', 'Outcome presentation & paper draft'],
    tools: 'ChatGPT API · LangChain basics · Python', outcomes: 'AI agent prototype · design report · conference paper draft',
    suitedFor: 'AI innovation competitions · 强基 & 综评 · College CS applications', weeks: '6 weeks' },
  { id: 'custom', title: 'Custom Competition Research Project', age: '14–18 yrs', icon: '🏆',
    steps: ['Personalised topic design (match target competition)', 'Intensive research & iteration', 'Competition entry preparation', 'Mock defence & final polish'],
    tools: 'Customised per project', outcomes: 'Competition entry materials · research report · defence PPT',
    suitedFor: 'National/provincial AI innovation competitions · ISEF prep', weeks: '8–12 weeks' },
]

const FACULTY = [
  { name: 'Director Chen', team: 'Research Faculty', area: 'AI Literacy & Youth STEM Education', exp: '8 yrs youth STEM · led 20+ curriculum designs · 500+ students guided', philosophy: 'Start with curiosity, end with capability.', type: 'research' },
  { name: 'Prof. Li', team: 'University Partner Faculty', area: 'Machine Learning & Computer Vision', exp: 'Associate Professor · 30+ published papers · 10 yrs university teaching', philosophy: 'Research projects should solve real problems.', type: 'university' },
  { name: 'Coach Wang', team: 'Competition Coaches', area: 'Youth AI Competition Strategy', exp: '50+ award-winning teams coached · National competition gold coach', philosophy: 'Prepare early, compete with confidence.', type: 'competition' },
  { name: 'Dr. Zhang', team: 'University Partner Faculty', area: 'Data Science & Statistical Modelling', exp: 'PhD from Top-10 university · Led 3 national research grants', philosophy: 'Data tells stories — teach students to listen.', type: 'university' },
  { name: 'Instructor Liu', team: 'Research Faculty', area: 'Robotics & Maker Education', exp: '6 yrs maker education · robot competition judge · 200+ student projects', philosophy: 'Build things. Break things. Learn everything.', type: 'research' },
  { name: 'Coach Zhao', team: 'Competition Coaches', area: 'STEM Specialty Admissions Planning', exp: '300+ students guided through STEM specialty admissions', philosophy: 'Right strategy + right effort = right school.', type: 'competition' },
]

const OUTCOMES = [
  { student: 'Student L', age: 16, prog: 'ML Intro Camp + Custom Research Project', result: 'Provincial 1st Prize · National Camp selection', type: 'competition', detail: '6-month journey: ML foundations → competition research project → pre-competition sprint. Entered National Youth AI Innovation Competition.' },
  { student: 'Student M', age: 17, prog: 'Data Science Camp + ML Research Project', result: '综评 accepted · Top provincial STEM school', type: 'admissions', detail: 'Research report used as 综评 (holistic evaluation) material. Project portfolio demonstrated data analysis + AI competence.' },
  { student: 'Student K', age: 15, prog: 'Robotics Competition Camp', result: 'City-level 2nd Place · school robotics team captain', type: 'competition', detail: 'From zero robotics experience to podium finish in 3 months. Joined school team and mentored junior students.' },
  { student: 'Student S', age: 18, prog: 'AI Agent Research + 强基 prep', result: '强基 program interview shortlisted · CS major', type: 'admissions', detail: 'AI agent design research used in 强基 application. Interview materials included a working prototype demo.' },
  { student: 'Student T', age: 16, prog: 'ML Camp + STEM specialty track', result: 'STEM specialty admission · Top-tier provincial school', type: 'stem', detail: 'Three-semester project portfolio. STEM specialty application supported by research certificate and mentor reference.' },
  { student: 'Student W', age: 15, prog: 'Data Science Camp', result: 'International student · US college early decision', type: 'overseas', detail: 'Data analysis project portfolio included in US college application. Admission officers cited "impressive STEM project depth".' },
]

const PARTNERS = [
  { name: 'UESTC AI Lab', type: 'University Lab' },
  { name: 'Beihang STEM Centre', type: 'University Lab' },
  { name: 'Tsinghua Education Research Institute', type: 'University Lab' },
  { name: 'Youth AI Innovation Challenge Committee', type: 'Competition Org' },
  { name: 'National Robotics Competition Secretariat', type: 'Competition Org' },
  { name: 'AI Education Technology Co.', type: 'Industry Partner' },
]

const DOWNLOADS = [
  { name: 'AI Literacy AI Camp Outline', type: 'outline', fmt: 'PDF' },
  { name: 'Data Science Research Camp Outline', type: 'outline', fmt: 'PDF' },
  { name: 'Machine Learning Intro Camp Outline', type: 'outline', fmt: 'PDF' },
  { name: 'AIGC Creative Design Camp Outline', type: 'outline', fmt: 'PDF' },
  { name: 'ML Research Project Outline', type: 'outline', fmt: 'PDF' },
  { name: 'Data Visualisation Project Outline', type: 'outline', fmt: 'PDF' },
  { name: 'Camp Registration Requirements (General)', type: 'notice', fmt: 'PDF' },
  { name: 'Parent Information Pack', type: 'notice', fmt: 'PDF' },
  { name: 'Research Project Application Requirements', type: 'notice', fmt: 'PDF' },
  { name: 'Refund Policy', type: 'notice', fmt: 'PDF' },
  { name: 'Research Outcome Report Template', type: 'template', fmt: 'Word' },
  { name: 'Presentation Slide Template', type: 'template', fmt: 'PPT' },
  { name: 'Competition Research Report Template', type: 'template', fmt: 'Word' },
  { name: '综评 Application Materials Template', type: 'template', fmt: 'Word' },
]

const FAQ_ITEMS = [
  { cat: 'registration', q: 'Can I switch camps after registering?', a: 'Yes, you may switch to another camp before the camp starts by contacting our team. Fees are adjusted accordingly.' },
  { cat: 'registration', q: 'Is there a group discount?', a: '3+ students registering together receive 10% off. Contact us to activate the group code.' },
  { cat: 'camp', q: 'Does the camp include meals and accommodation?', a: 'Residential camps include all meals and dormitory accommodation. Day camps include lunch and all materials. No additional items needed.' },
  { cat: 'camp', q: 'What is the instructor-to-student ratio?', a: 'Starter camps: 1:8. Intermediate camps: 1:10. Competition and research camps: 1:6. Each class has one lead instructor plus one teaching assistant.' },
  { cat: 'research', q: 'Do research projects require prior experience?', a: 'No prior experience required. We assess your current level at intake and tailor the project scope. Starter and intermediate backgrounds both welcome.' },
  { cat: 'research', q: 'What can the research outcomes be used for?', a: 'Outcomes can be used for 综评 materials, 强基 applications, competition entries, STEM specialty admissions, and overseas college applications.' },
  { cat: 'admissions', q: 'Can camp results be used for 综评 applications?', a: 'Yes. Research reports, certificates, and mentor reference letters from our programmes are accepted as 综评 supporting materials by many schools.' },
  { cat: 'admissions', q: 'Do competition awards help with college admissions?', a: 'Provincial-level awards and above are recognised by most STEM specialty programmes. National competition results significantly strengthen college applications.' },
  { cat: 'other', q: 'What is the refund policy?', a: 'Cancellations more than 14 days before camp start: full refund. 7–14 days: 80% refund. Under 7 days: 50% refund. Detailed policy available in the Refund Policy document.' },
]

// ─── Sub-components ────────────────────────────────────────────────

function CampDetailModal({ camp, onClose }) {
  const [applied, setApplied] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-3xl mb-1">{camp.icon}</div>
              <h3 className="font-bold text-bingo-dark text-lg">{camp.title}</h3>
              <p className="text-xs text-slate-500">{camp.age} · {camp.weeks} · {camp.direction}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-2">×</button>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="bg-slate-50 rounded-xl p-3"><strong className="text-slate-800">Core Content:</strong> {camp.core}</div>
            <div className="bg-primary/5 rounded-xl p-3"><strong className="text-slate-800">Programme Highlight:</strong> {camp.highlight}</div>
            <div className="rounded-xl p-3 border border-green-200 bg-green-50"><strong className="text-slate-800">Outcomes:</strong> {camp.outcome}</div>
            <div className="rounded-xl p-3 border border-slate-200"><strong className="text-slate-800">Class Setup:</strong> {camp.ratio}</div>
            <div className="rounded-xl p-3 border border-amber-200 bg-amber-50/30"><strong className="text-slate-800">Competition Fit:</strong> {camp.competition}</div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
            <div className="font-bold text-primary text-lg">{camp.price}</div>
            <div className="flex gap-2">
              {applied
                ? <span className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-xl font-medium">✅ Submitted!</span>
                : <button onClick={() => setApplied(true)} className="btn-primary text-sm px-5 py-2">Apply Now</button>}
              <button onClick={onClose} className="border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResearchDetailModal({ project, onClose }) {
  const [applied, setApplied] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-3xl mb-1">{project.icon}</div>
              <h3 className="font-bold text-bingo-dark text-lg">{project.title}</h3>
              <p className="text-xs text-slate-500">{project.age} · {project.weeks}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-2">×</button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-800 mb-2">Project Flow:</p>
              <ol className="space-y-1 text-slate-600">
                {project.steps.map((s, i) => <li key={i} className="flex gap-2"><span className="text-primary font-bold shrink-0">{i+1}.</span>{s}</li>)}
              </ol>
            </div>
            <div className="bg-slate-50 rounded-xl p-3"><strong className="text-slate-800">Tools:</strong> {project.tools}</div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200"><strong className="text-slate-800">What You Get:</strong> {project.outcomes}</div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200"><strong className="text-slate-800">Best For:</strong> {project.suitedFor}</div>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
            {applied
              ? <span className="flex-1 text-center bg-green-100 text-green-700 text-sm px-4 py-2.5 rounded-xl font-medium">✅ Application Submitted!</span>
              : <button onClick={() => setApplied(true)} className="flex-1 btn-primary text-sm py-2.5">Apply for Project</button>}
            <button onClick={onClose} className="border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OutcomeDetailModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-bingo-dark">{item.student}'s Story</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <p className="text-xs text-slate-500 mb-3">{item.age} yrs · {item.prog}</p>
        <div className="bg-primary/5 rounded-xl p-3 text-sm text-slate-700 mb-3">{item.result}</div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.detail}</p>
        <button onClick={onClose} className="w-full btn-primary py-2">Close</button>
      </div>
    </div>
  )
}

function RegisterModal({ preselect, onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', age: '', grade: '', phone: '', parent: '', camp: preselect || '', notes: '', agreed: false })
  const valid = form.name && form.age && form.phone && form.parent && form.camp && form.agreed
  if (step === 2) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-bold text-bingo-dark mb-2">Registration Submitted!</h3>
        <p className="text-slate-600 text-sm mb-2">Our team will contact you within 1–2 business days to confirm your place and payment details.</p>
        <p className="text-xs text-slate-400 mb-4">A confirmation message will be sent to your phone.</p>
        <button onClick={onClose} className="btn-primary w-full py-2.5">Got it</button>
      </div>
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark">Camp / Programme Registration</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Programme *</label>
            <select value={form.camp} onChange={e => setForm(f => ({...f, camp: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none bg-white">
              <option value="">Select a programme</option>
              {PREMIUM_CAMPS.map(c => <option key={c.id} value={c.title}>{c.title} ({c.age})</option>)}
              {RESEARCH_PROJECTS.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
            </select>
          </div>
          {[['name','Student Name','Required'],['age','Student Age','e.g. 12'],['grade','Grade / Year Level','e.g. Grade 8'],['parent','Parent / Guardian Name','Required'],['phone','Contact Phone','Required']].map(([k,l,p]) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{l} *</label>
              <input value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} placeholder={p}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Notes (dietary needs, special requirements)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
          </div>
          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.agreed} onChange={e => setForm(f => ({...f, agreed: e.target.checked}))} className="mt-0.5 shrink-0" />
            I have read and agree to the Registration Requirements, Safety Responsibility Agreement, and Refund Policy.
          </label>
        </div>
        <button onClick={() => valid && setStep(2)} disabled={!valid}
          className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${valid ? 'btn-primary' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
          Submit Registration
        </button>
      </div>
    </div>
  )
}

function ConsultModal({ onClose }) {
  const [sent, setSent] = useState(false)
  if (sent) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-bingo-dark mb-1">Message Received</p>
        <p className="text-slate-500 text-sm mb-4">We'll reply within 1 business day.</p>
        <button onClick={onClose} className="btn-primary w-full py-2">Close</button>
      </div>
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark text-sm">Quick Consultation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 mb-4">
          {['Name', 'Phone / WeChat', 'Your Question'].map((f, i) => i < 2
            ? <input key={f} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
            : <textarea key={f} placeholder={f} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
          )}
        </div>
        <button onClick={() => setSent(true)} className="w-full btn-primary py-2.5">Send Message</button>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function Research() {
  const [section, setSection] = useState('home')
  const [ageFilter, setAgeFilter] = useState('all')
  const [campFilter, setCampFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [facultyFilter, setFacultyFilter] = useState('all')
  const [downloadFilter, setDownloadFilter] = useState('all')
  const [faqFilter, setFaqFilter] = useState('all')
  const [activeCamp, setActiveCamp] = useState(null)
  const [activeResearch, setActiveResearch] = useState(null)
  const [activeOutcome, setActiveOutcome] = useState(null)
  const [registerModal, setRegisterModal] = useState(null)
  const [consultModal, setConsultModal] = useState(false)
  const [faqOpen, setFaqOpen] = useState({})

  const NAV = [
    { id: 'home', icon: '🏠', label: 'Overview' },
    { id: 'age', icon: '👧', label: 'By Age' },
    { id: 'camps', icon: '🏕️', label: 'Premium Camps' },
    { id: 'research', icon: '🔬', label: 'Research Projects' },
    { id: 'outcomes', icon: '🏅', label: 'Admissions Outcomes' },
    { id: 'faculty', icon: '👨‍🏫', label: 'Faculty' },
    { id: 'partners', icon: '🏫', label: 'Partners' },
    { id: 'safety', icon: '🛡️', label: 'Safety' },
    { id: 'gallery', icon: '📷', label: 'Gallery' },
    { id: 'services', icon: '📋', label: 'Service Centre' },
  ]

  const filteredCamps = campFilter === 'all' ? PREMIUM_CAMPS : PREMIUM_CAMPS.filter(c => c.direction === campFilter)
  const filteredOutcomes = outcomeFilter === 'all' ? OUTCOMES : OUTCOMES.filter(o => o.type === outcomeFilter)
  const filteredFaculty = facultyFilter === 'all' ? FACULTY : FACULTY.filter(f => f.type === facultyFilter)
  const filteredDownloads = downloadFilter === 'all' ? DOWNLOADS : DOWNLOADS.filter(d => d.type === downloadFilter)
  const filteredFaq = faqFilter === 'all' ? FAQ_ITEMS : FAQ_ITEMS.filter(f => f.cat === faqFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Modals */}
      {activeCamp && <CampDetailModal camp={activeCamp} onClose={() => setActiveCamp(null)} />}
      {activeResearch && <ResearchDetailModal project={activeResearch} onClose={() => setActiveResearch(null)} />}
      {activeOutcome && <OutcomeDetailModal item={activeOutcome} onClose={() => setActiveOutcome(null)} />}
      {registerModal !== null && <RegisterModal preselect={registerModal || ''} onClose={() => setRegisterModal(null)} />}
      {consultModal && <ConsultModal onClose={() => setConsultModal(false)} />}

      {/* ── Hero Banner ── */}
      <section className="mb-8 section-tech rounded-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Innovation · University Collaboration · Competition · Admissions</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-3">AI Camp & Science Research Hub</h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-2">AI-powered learning journey for ages 6–18</p>
        <p className="text-slate-500 text-sm max-w-xl mx-auto mb-6">From curiosity to competition · from experiment to research report · from skills to college admissions advantage</p>
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-7">
          {['Age-matched cohorts','University lab collaboration','Competition-ready outcomes','College admissions materials','Small-class expert instruction'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => setRegisterModal('')} className="btn-primary px-6 py-2.5">Register Now</button>
          <button onClick={() => setSection('camps')} className="px-6 py-2.5 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition text-sm">View All Camps →</button>
          <button onClick={() => setConsultModal(true)} className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm">Free Consultation</button>
        </div>
        <p className="text-xs text-slate-400 mt-4">Bingo AI Academy · 10,000+ students served · 92% competition award rate</p>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[['300+','Competition Awards'],['92%','Award Rate'],['15+','University Partners'],['10,000+','Students Served']].map(([v,l],i) => (
          <div key={i} className="card p-4 text-center"><div className="text-xl font-bold text-primary">{v}</div><div className="text-xs text-slate-500 mt-0.5">{l}</div></div>
        ))}
      </div>

      {/* ── Section Nav ── */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${section === n.id ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ OVERVIEW ══════════════════ */}
      {section === 'home' && (
        <div className="space-y-8">
          <section>
            <h2 className="section-title mb-5">Three Pathways. One Complete Journey.</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '🏕️', title: 'Premium Camp Programmes', desc: '7 specialised camps spanning AI, data science, robotics, AIGC, aerospace, and more. Structured learning with clear outcomes for every age group.', btn: 'camps', color: '' },
                { icon: '🔬', title: 'University Research Projects', desc: '4 in-depth research projects in partnership with university labs. Mentored by professors. Produce college-grade research reports and certificates.', btn: 'research', color: 'border-purple-200/60 bg-purple-50/10' },
                { icon: '🏅', title: 'Admissions Outcome Cases', desc: 'Real student journeys from camp to competition podium and college admission. Evidence-based pathways with documented results.', btn: 'outcomes', color: 'border-amber-200/60 bg-amber-50/20' },
              ].map((p,i) => (
                <div key={i} className={`card p-6 flex flex-col border-2 ${p.color}`}>
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <h3 className="font-bold text-bingo-dark mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-600 flex-1 mb-4">{p.desc}</p>
                  <button onClick={() => setSection(p.btn)} className="btn-primary w-full text-sm py-2">Explore →</button>
                </div>
              ))}
            </div>
          </section>

          {/* Learning progression */}
          <section className="card p-6 border-primary/10">
            <h2 className="font-semibold text-bingo-dark mb-4 text-center">Learning Progression — Ages 6 to 18</h2>
            <div className="grid grid-cols-3 gap-0 relative">
              <div className="absolute top-8 left-[16.5%] right-[16.5%] h-0.5 bg-primary/20 hidden md:block" />
              {AGE_COHORTS.map((c,i) => (
                <div key={i} className="flex flex-col items-center text-center px-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl mb-2 relative z-10">{c.icon}</div>
                  <div className="font-semibold text-bingo-dark text-xs mb-0.5">{c.label}</div>
                  <div className="text-[10px] text-primary mb-1">{c.range}</div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{c.core}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button onClick={() => setSection('age')} className="text-xs text-primary hover:underline">See age-matched programmes →</button>
            </div>
          </section>

          {/* Quick preview of camps */}
          <section>
            <h2 className="section-title mb-4">Featured Programmes</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PREMIUM_CAMPS.slice(0,3).map((c,i) => (
                <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={() => setActiveCamp(c)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{c.icon}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.direction==='Competition Sprint'?'bg-red-100 text-red-700':c.direction==='College Admissions'?'bg-purple-100 text-purple-700':'bg-green-100 text-green-700'}`}>{c.direction}</span>
                  </div>
                  <h3 className="font-semibold text-bingo-dark text-sm mb-0.5">{c.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">{c.age} · {c.weeks}</p>
                  <p className="text-xs text-slate-600 mb-3">{c.core}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">{c.price}</span>
                    <button className="text-xs text-primary hover:underline">Details →</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button onClick={() => setSection('camps')} className="btn-primary text-sm px-5 py-2">View All 7 Programmes →</button>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════ BY AGE ══════════════════ */}
      {section === 'age' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">👧 Find the Right Programme by Age</h2>
            <p className="text-slate-500 text-sm">From starter explorer to competition ready — every age has the right next step.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All Ages'],['enlighten','6–9 yrs'],['advance','10–14 yrs'],['contest','14–18 yrs']].map(([k,l]) => (
              <button key={k} onClick={() => setAgeFilter(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${ageFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-6">
            {AGE_COHORTS.filter(c => ageFilter === 'all' || c.key === ageFilter).map((c,i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{c.icon}</span>
                  <div>
                    <h3 className="font-bold text-bingo-dark">{c.label}</h3>
                    <p className="text-xs text-primary">{c.range}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2"><strong>Core focus:</strong> {c.core}</p>
                <p className="text-sm text-slate-600 mb-3"><strong>Goal:</strong> {c.goal}</p>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Recommended Programmes:</p>
                  <div className="flex flex-wrap gap-2">
                    {c.camps.map((camp,j) => {
                      const found = PREMIUM_CAMPS.find(p => p.title === camp)
                      return (
                        <button key={j} onClick={() => found && setActiveCamp(found)} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition font-medium">
                          {camp} →
                        </button>
                      )
                    })}
                  </div>
                </div>
                <button onClick={() => setRegisterModal('')} className="btn-primary text-xs px-4 py-1.5">Register for this track</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ CAMPS ══════════════════ */}
      {section === 'camps' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">🏕️ Premium Camp Programmes</h2>
            <p className="text-slate-500 text-sm">7 specialised programmes. Structured outcomes. Expert instruction.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['Starter Interest','Starter'],['Competition Sprint','Competition'],['College Admissions','Admissions']].map(([k,l]) => (
              <button key={k} onClick={() => setCampFilter(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${campFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCamps.map((c,i) => (
              <div key={i} className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{c.icon}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.direction==='Competition Sprint'?'bg-red-100 text-red-700':c.direction==='College Admissions'?'bg-purple-100 text-purple-700':'bg-green-100 text-green-700'}`}>{c.direction}</span>
                </div>
                <h3 className="font-bold text-bingo-dark mb-0.5">{c.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{c.age} · {c.weeks}</p>
                <p className="text-xs text-slate-600 mb-3 flex-1">{c.highlight}</p>
                <div className="text-xs text-slate-500 bg-green-50 rounded-lg px-2 py-1.5 mb-3">✓ {c.outcome}</div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <span className="font-bold text-primary">{c.price}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveCamp(c)} className="text-xs border border-primary text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition">Details</button>
                    <button onClick={() => setRegisterModal(c.title)} className="text-xs btn-primary px-2.5 py-1.5">Apply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Not sure which programme is right? Take the free AI Assessment to get matched.</p>
            <div className="flex gap-2">
              <Link to="/ai-test" className="btn-primary text-xs px-4 py-2">Free Assessment</Link>
              <button onClick={() => setConsultModal(true)} className="border border-primary text-primary text-xs px-4 py-2 rounded-xl hover:bg-primary/5 transition">Ask an Advisor</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RESEARCH ══════════════════ */}
      {section === 'research' && (
        <div className="space-y-6">
          <div className="card p-5 bg-purple-50/30 border-purple-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🔬 University Research Projects</h2>
            <p className="text-slate-600 text-sm">Partner with university labs. Produce real research outcomes. Generate 综评, 强基, and college application materials.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {RESEARCH_PROJECTS.map((p,i) => (
              <div key={i} className="card p-5 flex flex-col hover:shadow-md hover:border-purple-300 transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <h3 className="font-semibold text-bingo-dark">{p.title}</h3>
                    <p className="text-xs text-slate-500">{p.age} · {p.weeks}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-2 flex-1"><strong>Suited for:</strong> {p.suitedFor}</p>
                <p className="text-xs text-slate-600 mb-3"><strong>Tools:</strong> {p.tools}</p>
                <div className="flex gap-2">
                  <button onClick={() => setActiveResearch(p)} className="border border-primary text-primary text-xs px-3 py-1.5 rounded-lg hover:bg-primary/5 transition">Full Details</button>
                  <button onClick={() => setRegisterModal(p.title)} className="btn-primary text-xs px-3 py-1.5">Apply for Project</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5 border-slate-200 bg-slate-50 text-sm text-slate-600">
            <h3 className="font-semibold text-bingo-dark mb-2">University Partners</h3>
            <div className="flex flex-wrap gap-2">
              {PARTNERS.filter(p => p.type === 'University Lab').map((p,i) => (
                <span key={i} className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs">{p.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ OUTCOMES ══════════════════ */}
      {section === 'outcomes' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">🏅 Admissions & Competition Outcomes</h2>
            <p className="text-slate-500 text-sm">Real student journeys. Documented results. All names anonymised.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['competition','Competition'],['admissions','Admissions'],['stem','STEM Specialty'],['overseas','International']].map(([k,l]) => (
              <button key={k} onClick={() => setOutcomeFilter(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${outcomeFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredOutcomes.map((o,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={() => setActiveOutcome(o)}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">{o.student.charAt(0)}</div>
                  <div><div className="font-semibold text-bingo-dark text-sm">{o.student}</div><div className="text-xs text-slate-500">{o.age} yrs</div></div>
                </div>
                <p className="text-xs text-slate-500 mb-1.5">{o.prog}</p>
                <p className="text-xs font-medium text-primary mb-2">🏅 {o.result}</p>
                <button className="text-xs text-slate-400 hover:text-primary transition">Read full story →</button>
              </div>
            ))}
          </div>
          <div className="card p-5 bg-amber-50/30 border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">Want to plan your student's journey?</p>
              <p className="text-xs text-slate-500 mt-0.5">Free admissions consultation · personalised programme recommendation</p>
            </div>
            <button onClick={() => setConsultModal(true)} className="btn-primary text-sm px-4 py-2">Free Consultation →</button>
          </div>
        </div>
      )}

      {/* ══════════════════ FACULTY ══════════════════ */}
      {section === 'faculty' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">👨‍🏫 Expert Faculty</h2>
            <p className="text-slate-500 text-sm">Research educators, university professors, and competition-winning coaches — all dedicated to your student's growth.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['research','Research Faculty'],['university','University Partners'],['competition','Competition Coaches']].map(([k,l]) => (
              <button key={k} onClick={() => setFacultyFilter(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${facultyFilter===k?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFaculty.map((f,i) => (
              <div key={i} className="card p-5 hover:shadow-md transition">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mb-3">{f.name.charAt(0)}</div>
                <h3 className="font-semibold text-bingo-dark">{f.name}</h3>
                <p className="text-xs text-primary mb-0.5">{f.team}</p>
                <p className="text-xs text-slate-500 mb-2">{f.area}</p>
                <p className="text-xs text-slate-600 italic mb-2">"{f.philosophy}"</p>
                <p className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-2 py-1">{f.exp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ PARTNERS ══════════════════ */}
      {section === 'partners' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">🏫 Partner Institutions</h2>
            <p className="text-slate-500 text-sm">University labs, competition organisations, and industry partners — all collaborating to deliver world-class STEM education.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PARTNERS.map((p,i) => (
              <div key={i} className="card p-5 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary mb-2">{p.name.charAt(0)}</div>
                <p className="font-medium text-bingo-dark text-sm leading-tight">{p.name}</p>
                <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{p.type}</span>
              </div>
            ))}
          </div>
          <div className="card p-5 border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">Interested in institutional partnership?</p>
              <p className="text-xs text-slate-500 mt-0.5">School groups, research labs, and education organisations welcome</p>
            </div>
            <button onClick={() => setConsultModal(true)} className="btn-primary text-sm px-4 py-2">Partnership Enquiry →</button>
          </div>
        </div>
      )}

      {/* ══════════════════ SAFETY ══════════════════ */}
      {section === 'safety' && (
        <div className="space-y-6">
          <div className="card p-5 bg-blue-50/30 border-blue-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🛡️ Safety & Protection System</h2>
            <p className="text-slate-600 text-sm">Full-journey protection. Every camp, every day. So parents and students can focus entirely on learning.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: '👨‍🏫', title: 'Instructor Ratio Guarantee', items: ['Starter/Experience camps: 1:8 ratio','Intermediate/Advanced camps: 1:10 ratio','Competition/Research: 1:6 ratio','Every class: Lead instructor + TA + safety officer','Additional safety officers for outdoor activities'] },
              { icon: '🏢', title: 'Venue Safety Standards', items: ['All venues pass annual safety inspections','Hazardous materials stored with proper protocols','Emergency exit routes clearly marked','First-aid stations in all classrooms','No unsupervised student access to equipment'] },
              { icon: '🍱', title: 'Logistics & Welfare', items: ['All meals nutritionally balanced and allergen-labelled','Accommodation rooms supervised and secure (residential camps)','Medical kit on-site; nurse available at all times','Daily welfare check-in for all residential students','24/7 emergency contact line for parents'] },
              { icon: '📋', title: 'Insurance Coverage', items: ['Full personal accident insurance for all enrolled students','Public liability insurance for all venues','Coverage confirmed before each camp intake','Policy documents available on request'] },
            ].map((s,i) => (
              <div key={i} className="card p-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-bingo-dark mb-3">{s.title}</h3>
                <ul className="space-y-1.5">
                  {s.items.map((item,j) => <li key={j} className="text-sm text-slate-600 flex gap-2"><span className="text-primary shrink-0">✓</span>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="card p-4 bg-red-50/30 border-red-200/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-bingo-dark text-sm">Emergency Contact</p>
              <p className="text-xs text-slate-500 mt-0.5">24/7 emergency line available during all active camps</p>
            </div>
            <button onClick={() => setConsultModal(true)} className="bg-red-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-red-600 transition">Emergency Line</button>
          </div>
        </div>
      )}

      {/* ══════════════════ GALLERY ══════════════════ */}
      {section === 'gallery' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">📷 Programme Highlights</h2>
            <p className="text-slate-500 text-sm">Real moments from camps, research projects, competitions, and celebrations.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Hands-on Lab Work','Team Project Session','Robot Assembly','Competition Day','Data Analysis Workshop','Professor Q&A','Certificate Ceremony','Field Science Day','AI Art Creation','Research Presentation','Camp Final Showcase','Outdoor STEM Activity'].map((label,i) => (
              <div key={i} className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 aspect-square flex flex-col items-center justify-center text-center p-3 hover:from-primary/10 hover:to-primary/20 transition cursor-pointer group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition">
                  {['🔬','👥','🤖','🏆','📊','👨‍🏫','🎓','🌿','🎨','📋','🎪','🌳'][i]}
                </div>
                <p className="text-xs text-slate-600 font-medium leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center">Photos updated after each programme cycle · All students photographed with guardian consent</p>
        </div>
      )}

      {/* ══════════════════ SERVICES ══════════════════ */}
      {section === 'services' && <ServiceCentre onRegister={setRegisterModal} onConsult={() => setConsultModal(true)} downloads={DOWNLOADS} filteredDownloads={filteredDownloads} downloadFilter={downloadFilter} setDownloadFilter={setDownloadFilter} faqItems={filteredFaq} faqFilter={faqFilter} setFaqFilter={setFaqFilter} faqOpen={faqOpen} setFaqOpen={setFaqOpen} />}

      {/* ── Bottom CTA ── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">Ready to start your STEM journey?</p>
          <p className="text-xs text-slate-500 mt-0.5">Take the free AI Assessment · Get matched · Register today</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/ai-test" className="btn-primary text-sm px-4 py-2">🧠 Free AI Assessment</Link>
          <button onClick={() => setRegisterModal('')} className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">Register Now</button>
          <button onClick={() => setConsultModal(true)} className="border border-slate-300 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition">Free Consultation</button>
        </div>
      </div>
    </div>
  )
}

// ─── Service Centre sub-component ──────────────────────────────────
function ServiceCentre({ onRegister, onConsult, filteredDownloads, downloadFilter, setDownloadFilter, faqItems, faqFilter, setFaqFilter, faqOpen, setFaqOpen }) {
  const [serviceTab, setServiceTab] = useState('register')
  const [customType, setCustomType] = useState('group')
  const [customDone, setCustomDone] = useState(false)
  const [downloadedSet, setDownloadedSet] = useState({})

  const SERVICE_TABS = [
    { id: 'register', icon: '📝', label: 'Register' },
    { id: 'consult', icon: '💬', label: 'Consultation' },
    { id: 'download', icon: '📥', label: 'Downloads' },
    { id: 'custom', icon: '✏️', label: 'Custom Services' },
    { id: 'faq', icon: '❓', label: 'FAQ' },
  ]

  const CUSTOM_TYPES = [
    { id: 'group', label: 'Group Camp (20+ students)', icon: '🏫', fields: ['Organisation / School Name', 'Number of Students', 'Age Range', 'Preferred Dates', 'Budget Range', 'Focus Area'] },
    { id: 'individual', label: 'Individual Custom', icon: '👤', fields: ['Student Name', 'Student Age', 'Current Grade', 'Core Learning Goals', 'Preferred Duration'] },
    { id: 'competition', label: 'Competition Research Custom', icon: '🏆', fields: ['Student Name', 'Age', 'Target Competition', 'Current Skill Level', 'Preferred Research Direction', 'Sprint Timeline'] },
    { id: 'research', label: 'Admissions Research Custom', icon: '🎓', fields: ['Student Name', 'Age', 'Admissions Goal (综评/强基/overseas)', 'Research Interest', 'Project Duration'] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-bingo-dark mb-1">📋 Service Centre</h2>
        <p className="text-slate-500 text-sm">Registration · consultation · downloads · custom services — everything in one place.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SERVICE_TABS.map(t => (
          <button key={t.id} onClick={() => setServiceTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${serviceTab===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {serviceTab === 'register' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🏕️', title: 'Camp Registration', desc: 'Register for any of our 7 premium camp programmes. Ages 6–18.', type: '' },
              { icon: '🔬', title: 'Research Project Application', desc: 'Apply for university-partnered research projects. Ages 14–18.', type: '' },
              { icon: '🎪', title: 'Experience Day Booking', desc: 'Book a 1-day or weekend experience session. Low commitment, high fun.', type: '' },
            ].map((r,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                <div className="text-2xl mb-2">{r.icon}</div>
                <h3 className="font-semibold text-bingo-dark text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
                <button onClick={() => onRegister(r.type)} className="btn-primary text-xs px-4 py-1.5 w-full">Register →</button>
              </div>
            ))}
          </div>
          <div className="card p-4 bg-slate-50 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800 mb-1">Registration Notes</p>
            <p>• Our team confirms your place within 1–2 business days via phone.</p>
            <p>• Places are limited — early registration is recommended.</p>
            <p>• Refund policy: 14+ days before: full refund · 7–14 days: 80% · Under 7 days: 50%.</p>
          </div>
        </div>
      )}

      {serviceTab === 'consult' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '💬', title: 'Live Chat (7×12 hrs)', desc: 'Mon–Fri 9am–9pm · Weekends 10am–6pm. Text + image support.', action: () => onConsult() },
              { icon: '📞', title: 'Phone Consultation', desc: 'Call our hotline during business hours for direct advice.', action: () => onConsult() },
              { icon: '📱', title: 'WeChat / Line', desc: 'Scan the QR code to add our student advisor on WeChat.', action: () => onConsult() },
              { icon: '📅', title: '1-on-1 Planning Session', desc: 'Book a dedicated 30-minute session with an admissions advisor.', action: () => onConsult() },
            ].map((c,i) => (
              <div key={i} className="card p-5 flex items-start gap-3 hover:shadow-sm transition">
                <div className="text-2xl shrink-0">{c.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-bingo-dark text-sm mb-0.5">{c.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">{c.desc}</p>
                  <button onClick={c.action} className="text-xs text-primary hover:underline">Connect →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {serviceTab === 'download' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['outline','Course Outlines'],['notice','Requirements & Policies'],['template','Templates']].map(([k,l]) => (
              <button key={k} onClick={() => setDownloadFilter(k)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${downloadFilter===k?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredDownloads.map((d,i) => (
              <div key={i} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.fmt==='PDF'?'bg-red-100 text-red-700':d.fmt==='Word'?'bg-blue-100 text-blue-700':'bg-orange-100 text-orange-700'}`}>{d.fmt}</span>
                  <span className="text-sm text-slate-700">{d.name}</span>
                </div>
                <button onClick={() => setDownloadedSet(p => ({...p,[i]:true}))}
                  className={`text-xs px-3 py-1 rounded-lg shrink-0 transition ${downloadedSet[i]?'bg-green-100 text-green-700':'btn-primary'}`}>
                  {downloadedSet[i] ? '✓ Done' : '↓ Download'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">All documents are in their latest version. Updates flagged with "New" for 7 days after release.</p>
        </div>
      )}

      {serviceTab === 'custom' && (
        <div className="space-y-4">
          {customDone ? (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-bingo-dark mb-2">Custom Request Submitted!</h3>
              <p className="text-slate-600 text-sm mb-4">Our specialist will contact you within 2 business days with a tailored proposal.</p>
              <button onClick={() => setCustomDone(false)} className="btn-primary px-5 py-2 text-sm">Submit Another Request</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                {CUSTOM_TYPES.map(t => (
                  <button key={t.id} onClick={() => setCustomType(t.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${customType===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              {CUSTOM_TYPES.filter(t => t.id === customType).map(t => (
                <div key={t.id} className="card p-5">
                  <h3 className="font-semibold text-bingo-dark mb-4">{t.icon} {t.label}</h3>
                  <div className="space-y-3 mb-4">
                    {['Contact Name *', 'Contact Phone *', ...t.fields.map(f => `${f} *`)].map((f,i) => (
                      <div key={i}>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{f}</label>
                        <input placeholder="" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Additional Notes</label>
                      <textarea rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                    </div>
                  </div>
                  <button onClick={() => setCustomDone(true)} className="w-full btn-primary py-2.5">Submit Custom Request</button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {serviceTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['registration','Registration'],['camp','Camps'],['research','Research'],['admissions','Admissions'],['other','Other']].map(([k,l]) => (
              <button key={k} onClick={() => setFaqFilter(k)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${faqFilter===k?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-2">
            {faqItems.map((f,i) => (
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
      )}
    </div>
  )
}
