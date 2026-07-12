import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  BINGO_ACADEMY_NAME,
  CERT_ISSUER,
  CERT_ISSUING_CENTRES,
  CERT_PORTAL,
} from '../config/bingoCert'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'

// ─── Data ──────────────────────────────────────────────────────────

const CERT_TIERS_FALLBACK = [
  {
    id: 'qizhi', stars: '1–3★', name: 'AI Enlightenment', chinese: 'AI Enlightenment', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60',
    inst: 'Newly established tutoring centres', learner: 'AI Foundations Certificate',
    weeks: '4–6 weeks',
    courses: ['AI Basics & Logic Thinking', 'Scratch & Block Coding', 'Data Literacy Introduction', 'Visual AI Applications'],
    criteria: 'Pass rate ≥ 70% · satisfaction ≥ 4.0',
    benefits: ['Official AI Enlightenment partner badge', 'Bingo branded enrollment materials', 'Basic marketing resource pack'],
  },
  {
    id: 'jichu', stars: '4–6★', name: 'AI Skill Acquisition', chinese: 'AI Skill Acquisition', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200/60',
    inst: 'Growing centres with 50+ active students', learner: 'AI Application Certificate',
    weeks: '5–7 weeks',
    courses: ['Python Programming Foundations', 'Machine Learning Concepts', 'AI in Society', 'Project-Based AI Design'],
    criteria: 'Pass rate ≥ 75% · satisfaction ≥ 4.2',
    benefits: ['AI Skill Acquisition badge + verified partner page', 'Priority referrals from Bingo platform', 'Curriculum co-branding rights'],
  },
  {
    id: 'jinyan', stars: '7–8★', name: 'Technical Mastery & Ethics', chinese: 'Technical Mastery & Ethics', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200/60',
    inst: 'Established centres with proven outcomes', learner: 'AI Proficiency Certificate',
    weeks: '6–8 weeks',
    courses: ['Deep Learning & Neural Nets', 'Computer Vision Projects', 'NLP & Text AI', 'AI Research Methodology'],
    criteria: 'Pass rate ≥ 80% · satisfaction ≥ 4.4',
    benefits: ['Technical Mastery & Ethics badge + featured partner spotlight', 'Access to regional competition coaching support', 'Joint marketing campaign eligibility'],
  },
  {
    id: 'zhichuang', stars: '9★', name: 'Synthesis & Innovation', chinese: 'Synthesis & Innovation', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60',
    inst: 'Premium centres seeking flagship status', learner: 'AI Innovation Certificate',
    weeks: '7–10 weeks',
    courses: ['AI Image Recognition (5-step framework)', 'Face Recognition Systems', 'Full AI Project Lifecycle', 'Competition Entry & Presentation'],
    criteria: 'Pass rate ≥ 85% · satisfaction ≥ 4.5',
    benefits: ['Exclusive Synthesis & Innovation flagship badge', 'National ranking on Bingo partner map', 'Direct referral from all Bingo competition entrants', 'Revenue sharing on joint events', 'Dedicated account manager'],
  },
]

const GALLERY_WORKS = [
  { title: 'National Youth AI Challenge — Gold', student: 'Student A · Synthesis & Innovation (9★)', year: 2024 },
  { title: 'AIOT Competition — Provincial 1st', student: 'Student B · Technical Mastery & Ethics (7–8★)', year: 2024 },
  { title: 'Bingo Cup AIGC — Special Award', student: 'Student C · AI Skill Acquisition (4–6★)', year: 2024 },
]


const FAQ_ITEMS = [
  { q: 'How much does learner certification cost?', a: 'Fees vary by tier and course bundle. Entry-level certificates start around $198; top-tier innovation certificates around $498. Full pricing is in the certification guide PDF.' },
  { q: 'Can learner certificates be used for school admissions?', a: 'Yes. Synthesis & Innovation (Star 9) certificates are widely accepted as supplementary evidence for high school STEM specialty admissions (comprehensive evaluation tracks) and have been cited in strong-foundation programme application materials.' },
  { q: 'Are certificates valid nationally?', a: 'All certificates are nationally valid. Learner certificates are registered in the Bingo central verification system and can be verified online or by QR code scan.' },
  { q: 'How do issuing centres endorse certificates?', a: 'Issuing centres are approved oversight bodies (associations, universities, government bodies) that co-endorse learner certificates and conduct periodic quality audits.' },
]

// ─── Sub-components ────────────────────────────────────────────────

function LeadModal({ title, subtitle, onClose }) {
  const [done, setDone] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-bingo-dark mb-1">Request Submitted!</p>
            <p className="text-sm text-slate-600 mb-3">Our certification team will contact you within 1 business day.</p>
            <button onClick={onClose} className="btn-primary px-5 py-2 text-sm">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-bingo-dark text-sm">{title}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
            <div className="space-y-2.5 mb-4">
              {['Name *', 'Phone *', 'Institution / School'].map((f,i) => (
                <input key={i} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              ))}
            </div>
            <button onClick={() => setDone(true)} className="w-full btn-primary py-2.5">Submit Enquiry</button>
          </>
        )}
      </div>
    </div>
  )
}

function VerifyModal({ onClose }) {
  const [verified, setVerified] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark">Certificate Verification</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        {verified ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">✅ Certificate Verified</div>
              <div className="space-y-1 text-slate-600 text-xs">
                <div><span className="font-medium">Holder:</span> Zhang Wei (Z**)</div>
                <div><span className="font-medium">Cert Level:</span> Synthesis & Innovation (9★) — AI Innovation Certificate</div>
                <div><span className="font-medium">Issued:</span> Dec 2024 · <span className="font-medium">Valid:</span> Dec 2027</div>
                <div>
                  <span className="font-medium">{CERT_PORTAL.verifyIssuingOrg}:</span> {BINGO_ACADEMY_NAME}
                </div>
                <div><span className="font-medium">Certificate No:</span> BINGO-2024-ZC-00412</div>
              </div>
            </div>
            <button onClick={onClose} className="w-full btn-primary py-2">Close</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">Enter certificate number + full name, or scan the QR code on the certificate.</p>
            <div className="space-y-2.5 mb-4">
              <input placeholder="Certificate number *" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              <input placeholder="Full name *" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
            </div>
            <button onClick={() => setVerified(true)} className="w-full btn-primary py-2.5">Verify Certificate</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function Certification() {
  const [tab, setTab] = useState('home')
  const [learnerTier, setLearnerTier] = useState('zhichuang')
  const [leadModal, setLeadModal] = useState(null)
  const [verifyModal, setVerifyModal] = useState(false)
  const [faqOpen, setFaqOpen] = useState({})
  const [learnerDone, setLearnerDone] = useState(false)
  const [certPreview, setCertPreview] = useState(false)
  const [certTiers, setCertTiers] = useState(CERT_TIERS_FALLBACK)

  useEffect(() => {
    supabase.from('cert_tiers').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setCertTiers(data.map((r) => ({ id: r.tier_id || r.id, stars: r.stars, name: r.name, chinese: r.chinese, color: r.color, bg: r.bg, border: r.border, inst: r.inst, learner: r.learner, weeks: r.weeks, courses: r.courses || [], criteria: r.criteria, benefits: r.benefits || [] })))
    })
  }, [])

  const TABS = [
    { id: 'home', icon: '🏠', label: 'Cert Hub' },
    { id: 'learner', icon: '🎓', label: 'Learner Certification' },
    { id: 'overview', icon: '📊', label: 'Cert Overview' },
    { id: 'issuing', icon: '🏛️', label: 'Issuing Centres' },
  ]

  return (
    <div className="w-full">
      {leadModal && <LeadModal title={leadModal.title} subtitle={leadModal.subtitle} onClose={() => setLeadModal(null)} />}
      {verifyModal && <VerifyModal onClose={() => setVerifyModal(false)} />}

      <PageBanner
        eyebrow={BINGO_ACADEMY_NAME}
        title={CERT_PORTAL.bannerTitle}
        subtitle={CERT_ISSUER.tagline}
        gradient="from-emerald-500/15 via-emerald-50 to-cyan-50"
      >
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start text-xs mb-5">
          {['9-Star AI Mastery Roadmap','Learner certificates','Nationally verifiable'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
          <button onClick={() => setTab('learner')} className="btn-primary px-6 py-2.5">Learner Certification →</button>
          <button onClick={() => setVerifyModal(true)} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition text-sm">🔍 Verify a Certificate</button>
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center lg:text-left">8,000+ certified learners · nationally verifiable credentials</p>
      </PageBanner>

      <PageContent className="py-6 sm:py-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[['8,000+','Certified Learners'],['4','Learner tiers'],['9★','Mastery roadmap']].map(([v,l],i) => (
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
          {/* Three-in-one system graphic */}
          <section>
            <h2 className="section-title mb-5">Learner Certification</h2>
            <div className="card p-6 flex flex-col border-2">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-bold text-bingo-dark mb-0.5">Learner Certification</h3>
              <p className="text-xs text-primary font-medium mb-2">4-tier · AI Foundations → AI Innovation</p>
              <p className="text-sm text-slate-600 flex-1 mb-4">Students receive dual-endorsed certificates — backed by their learning centre and an official issuing centre. Verifiable and nationally recognised.</p>
              <button onClick={() => setTab('learner')} className="btn-primary w-full text-sm py-2">Explore →</button>
            </div>
          </section>

          {/* 9-star overview */}
          <section>
            <h2 className="section-title mb-4">The 9-Star AI Mastery Roadmap</h2>
            <div className="card p-5">
              <div className="grid sm:grid-cols-4 gap-3">
                {certTiers.map((t,i) => (
                  <button key={i} onClick={() => { setTab('learner'); setLearnerTier(t.id) }}
                    className={`rounded-xl p-4 text-left transition hover:shadow-md border-2 ${t.border} ${t.bg}`}>
                    <div className={`text-xs font-bold ${t.color} mb-1`}>{t.stars}</div>
                    <div className="font-semibold text-bingo-dark text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{t.inst}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Click any tier to view learner certification paths →</p>
            </div>
          </section>

          {/* Verify + FAQ quick links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5 bg-primary/5 border-primary/20 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-bingo-dark text-sm">Verify a Certificate</p>
                <p className="text-xs text-slate-500 mt-0.5">Certificate number or QR code scan</p>
              </div>
              <button onClick={() => setVerifyModal(true)} className="btn-primary text-sm px-4 py-2 shrink-0">🔍 Verify Now</button>
            </div>
            <div className="card p-5 bg-amber-50/30 border-amber-200/60 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-bingo-dark text-sm">Download Certification Guide</p>
                <p className="text-xs text-slate-500 mt-0.5">Free PDF — conditions, process, and pricing</p>
              </div>
              <button onClick={() => setLeadModal({ title: 'Download Certification Guide', subtitle: 'Enter your phone to receive the PDF guide instantly.' })} className="border border-amber-400 text-amber-700 text-sm px-4 py-2 rounded-xl hover:bg-amber-50 transition shrink-0">Download →</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ LEARNER CERTIFICATION ══════════════════ */}
      {tab === 'learner' && (
        <div className="space-y-6">
          <div className="card p-5 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🎓 Learner Certification — Dual-Endorsed Certificates</h2>
            <p className="text-slate-600 text-sm">Every learner certificate carries dual endorsement: from the teaching institution and from an official Bingo Issuing Centre. Nationally verifiable. Referenced in admissions.</p>
          </div>

          {/* Tier cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {certTiers.map(t => (
              <div key={t.id} className={`card p-4 border-2 ${t.border} ${t.bg}`}>
                <div className={`text-xs font-bold ${t.color} mb-1`}>{t.stars}</div>
                <div className="font-semibold text-bingo-dark text-sm mb-0.5">{t.chinese}</div>
                <div className="text-xs text-slate-500 mb-2">{t.learner}</div>
                <ul className="space-y-0.5 text-xs text-slate-600">
                  {t.courses.slice(0,2).map((c,i) => <li key={i} className="flex gap-1"><span className="text-primary">✓</span>{c}</li>)}
                  {t.courses.length > 2 && <li className="text-slate-400">+{t.courses.length-2} more courses</li>}
                </ul>
              </div>
            ))}
          </div>

          {/* Certificate mockup */}
          <div className="card p-5 border-amber-200/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Certificate Design — What Your Certificate Contains</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-5 text-center">
                <p className="text-xs font-bold text-amber-700 mb-3">CERTIFICATE FRONT</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-bold text-sm text-bingo-dark">Bingo AI Academy</p>
                  <p className="text-slate-500">— AI Learning Certificate —</p>
                  <p className="mt-2">Learner Name · Certificate Level</p>
                  <p>Completion Date · Certificate Number</p>
                  <p className="mt-2 text-primary font-medium">🏫 Institution endorsement seal</p>
                  <p className="text-violet-600 font-medium">🏛️ Issuing Centre co-endorsement seal</p>
                  <p className="mt-2 text-slate-400">Anti-counterfeit hologram</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-xs font-bold text-slate-500 mb-3">CERTIFICATE BACK</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>Certificate verification URL</p>
                  <p>QR code (scan to verify)</p>
                  <p className="mt-2">Certificate validity: 3 years</p>
                  <p>Issuing organisation details</p>
                  <p className="mt-2 text-primary">Courses completed</p>
                  <p className="text-slate-400">Assessment score range</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setCertPreview(true)} className="btn-primary text-sm px-4 py-2">Generate Certificate Preview</button>
              <button onClick={() => setVerifyModal(true)} className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">🔍 Verify a Certificate</button>
            </div>
          </div>

          {/* Certificate use cases */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">How Learner Certificates Are Used</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: '🎓', title: 'School Admissions Support', desc: 'Synthesis & Innovation (Star 9) certificates accepted as supplementary evidence for STEM specialty admissions (comprehensive evaluation) and referenced in strong-foundation programme applications.' },
                { icon: '🏆', title: 'Competition Entry Advantage', desc: 'Certified learners gain priority access to Bingo-partnered competitions. Some competitions waive preliminary rounds for Synthesis & Innovation (9★) cert holders.' },
                { icon: '📋', title: 'Skill Portfolio Record', desc: 'Each certificate maps to a digital skills profile. Learners can share their profile with schools, scholarship committees, or employers.' },
              ].map((u,i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xl mb-1">{u.icon}</div>
                  <p className="font-semibold text-bingo-dark text-sm mb-1">{u.title}</p>
                  <p className="text-xs text-slate-500">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Apply form */}
          <div className="card p-5">
            <h3 className="font-semibold text-bingo-dark mb-3">Apply for Learner Certification</h3>
            {learnerDone ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold text-bingo-dark">Application Submitted</p>
                <p className="text-sm text-slate-600 mt-1">Your application number: <strong>BLA-2024-08412</strong>. Certificate will be sent to your email once approved.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Student name *', 'Parent phone *', 'Teaching institution *', 'City / Region'].map((f,i) => (
                    <input key={i} placeholder={f} className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                  ))}
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Certification tier applying for</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none bg-white">
                    {certTiers.map(t => <option key={t.id}>{t.chinese} — {t.learner}</option>)}
                  </select>
                </div>
                <p className="text-xs text-slate-400">📋 Apply through your course provider or learning centre that offers Bingo certification.</p>
                <button onClick={() => setLearnerDone(true)} className="w-full btn-primary py-2.5">Submit Application</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ OVERVIEW ══════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">📊 Certification System Overview</h2>
            <p className="text-slate-500 text-sm">How learner certificates map across the 9-star AI mastery roadmap.</p>
          </div>

          {/* Architecture */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Certification Architecture</p>
            <div className="card p-4 border-2">
              <div className="text-2xl mb-1">🎓</div>
              <h3 className="font-bold text-bingo-dark">Learner</h3>
              <span className="text-xs text-primary font-medium">Outcome</span>
              <p className="text-xs text-slate-500 mt-2">Learner certificates document verified skills. Dual endorsement from the learning centre and an issuing centre.</p>
            </div>
          </div>

          {/* Tier correspondence table */}
          <div className="card p-5 overflow-x-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tier Correspondence — Learner Certificates</p>
            <table className="w-full text-xs min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="py-2 pr-4 text-slate-400 font-medium">Curriculum Tier</th>
                  <th className="py-2 px-2 text-primary font-medium">Learner</th>
                  <th className="py-2 px-2 text-slate-400 font-medium">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {certTiers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className={`py-2 pr-4 font-medium ${t.color}`}>{t.chinese} {t.stars}</td>
                    <td className="py-2 px-2 text-slate-600">{t.learner}</td>
                    <td className="py-2 px-2 text-slate-400">{t.weeks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Certificate use */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">How Learner Certificates Are Used</p>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-semibold text-bingo-dark mb-1 text-xs">Learner Certificate</p>
              <p className="text-xs text-slate-500">High school STEM admissions (comprehensive evaluation) · strong-foundation programme supplementary material · competition entry advantage · digital skills portfolio sharing</p>
            </div>
          </div>

          {/* Validity and renewal */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Validity, Renewal & Replacement</p>
            <div className="bg-slate-50 rounded-xl p-3 text-xs">
              <p className="font-semibold text-bingo-dark">Learner Certificate</p>
              <p className="text-primary mt-0.5">Valid: 3 years</p>
              <p className="text-slate-400 mt-1">Renewal: Optional top-up course to renew</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Frequently Asked Questions</p>
            <div className="space-y-2">
              {FAQ_ITEMS.map((f,i) => (
                <div key={i} className="card overflow-hidden">
                  <button className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 transition"
                    onClick={() => setFaqOpen(p => ({...p,[i]:!p[i]}))}>
                    <span className="font-medium text-slate-800 text-sm pr-4">{f.q}</span>
                    <span className="text-primary shrink-0 text-lg">{faqOpen[i]?'−':'+'}</span>
                  </button>
                  {faqOpen[i] && <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Download the full Bingo Certification Guide (PDF)</p>
            <button onClick={() => setLeadModal({ title: 'Download Certification Guide', subtitle: 'Conditions · process · pricing · FAQ — all in one PDF.' })} className="btn-primary text-sm px-5 py-2">Download Free Guide →</button>
          </div>
        </div>
      )}

      {/* ══════════════════ ISSUING CENTRES ══════════════════ */}
      {tab === 'issuing' && (
        <div className="space-y-6">
          <div className="card p-5 bg-slate-50 border-slate-200">
            <h2 className="font-bold text-bingo-dark mb-1">📜 {CERT_PORTAL.issuingNoticeTitle}</h2>
            <p className="text-slate-600 text-sm">{CERT_PORTAL.issuingNoticeBody}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {CERT_PORTAL.issuingCentresLabel}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {CERT_ISSUING_CENTRES.map((c) => (
                <div key={c.name} className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">🎓</div>
                  <div>
                    <h3 className="font-semibold text-bingo-dark text-sm">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.type} · {c.region}</p>
                    {c.desc && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complaint / monitoring */}
          <div className="card p-5 border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quality Monitoring & Complaints</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-medium text-bingo-dark mb-1">Online complaint form</p>
                <p>Submit complaint + evidence. Issuing centre reviews within 3 business days. All cases logged.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-medium text-bingo-dark mb-1">Supervision hotline</p>
                <p>Available weekdays 9:00–18:00. Connected to the relevant issuing centre for your certificate region.</p>
              </div>
            </div>
            <button onClick={() => setLeadModal({ title: 'Submit a Quality Complaint', subtitle: 'Our issuing centre will review and respond within 3 business days.' })} className="border border-slate-300 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition">Submit Complaint</button>
          </div>

        </div>
      )}

      {/* Certificate preview overlay */}
      {certPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCertPreview(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-bingo-dark">Certificate Preview</h3>
              <button onClick={() => setCertPreview(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="border-2 border-amber-300 rounded-2xl p-5 text-center bg-gradient-to-b from-amber-50/40 to-white mb-4">
              <p className="text-xs text-amber-600 font-bold tracking-widest mb-1">BINGO AI ACADEMY</p>
              <p className="text-sm text-slate-500 mb-3">— Certificate of Achievement —</p>
              <p className="font-bold text-bingo-dark text-lg mb-0.5">Your Name Here</p>
              <p className="text-xs text-slate-500 mb-2">Has successfully completed the requirements for</p>
              <p className="font-bold text-primary text-sm mb-3">AI Innovation Certificate (Synthesis & Innovation · 9★)</p>
              <div className="flex justify-around text-xs text-slate-400 border-t border-dashed border-amber-200 pt-3">
                <div><p className="font-medium">Dec 2024</p><p>Issue Date</p></div>
                <div><p className="font-medium">BINGO-ZC-00000</p><p>Certificate No.</p></div>
                <div><p className="font-medium">Dec 2027</p><p>Valid Until</p></div>
              </div>
              <div className="flex justify-around mt-3 text-[10px] text-slate-400">
                <p>🏫 Institution Seal</p>
                <p>🏛️ Issuing Centre</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center mb-3">This is a preview. Actual certificate issued upon successful completion and verification.</p>
            <button onClick={() => { setCertPreview(false); setLeadModal({ title: 'Apply for Learner Certification', subtitle: 'Our team will guide you through the application process.' }) }} className="w-full btn-primary py-2.5">Apply Now →</button>
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">Start your certification journey today</p>
          <p className="text-xs text-slate-500 mt-0.5">Learners — explore tiers, apply, or verify a certificate</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTab('learner')} className="btn-primary text-sm px-4 py-2">Learner Certificate</button>
          <button onClick={() => setVerifyModal(true)} className="border border-slate-300 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition">🔍 Verify</button>
        </div>
      </div>
      </PageContent>
    </div>
  )
}
