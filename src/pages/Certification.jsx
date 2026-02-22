import React from 'react'
import { Link } from 'react-router-dom'

const INSTITUTION_STEPS = [
  { step: 1, title: 'Apply', desc: 'Submit certification application with credentials and info' },
  { step: 2, title: 'Review', desc: 'Platform reviews credentials, facilities, faculty' },
  { step: 3, title: 'Verification', desc: 'Site visit or additional materials as needed' },
  { step: 4, title: 'Partnership', desc: 'Contract and certification plaque upon approval' },
  { step: 5, title: 'Ongoing Support', desc: 'Periodic review, training, operations support' },
]

const LEARNER_ITEMS = [
  { title: 'Learner Certification', desc: 'AI skill and literacy certification for students' },
  { title: 'AI Skill Level Certification', desc: 'Tiered assessment with materials and prep courses' },
  { title: 'Certification Registration & Prep', desc: 'Registration, prep materials, mock tests' },
  { title: 'Certificate Lookup & Showcase', desc: 'Build confidence and drive sharing' },
]

const GROWTH_ITEMS = [
  { title: 'Growth Packages by Stage', desc: 'Foundations → Intermediate → Advanced; materials, courses, tools' },
  { title: 'Personalized Growth Plan', desc: 'AI assessment + custom learning path' },
  { title: 'Daily Challenges, Points & Rewards', desc: 'Points redeemable for materials, tools, and course coupons' },
  { title: 'Long-Term Mentor Follow-Up', desc: '1-on-1 guidance for sustained progress' },
]

export default function Certification() {
  const teacherItems = [
    { title: 'Teacher Certification', desc: 'AI teaching competency for teachers and trainers' },
    { title: 'Vocational Certifications', desc: 'Industry-aligned, high-value credentials' },
    { title: 'Pedagogy & AI Tool Certification', desc: 'Co-teaching, tool use, event coaching' },
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Certification Center</h1>
      <p className="text-slate-600 mb-6">Certifications for students, teachers, and institutions — registration, preparation, assessment, and credentials all in one place.</p>

      <div className="card p-6 bg-amber-50/60 border-amber-200/50 mb-10">
        <h3 className="font-semibold text-bingo-dark mb-2">Authoritative & International</h3>
        <p className="text-slate-600 text-sm">Certifications align with industry standards and international benchmarks; recognized for admissions evaluation, study abroad, and employment.</p>
      </div>

      {/* AI Capability Assessment */}
      <section className="mb-10">
        <h2 className="section-title">AI Capability Assessment</h2>
        <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-600">Assess your AI literacy and potential; get personalized course and learning path recommendations.</p>
            <p className="text-sm text-slate-500 mt-2">After assessment, view your stage packages and growth plan below.</p>
          </div>
          <Link to="/cert#assess" className="btn-primary shrink-0">Take Assessment</Link>
        </div>
        <div id="assess" className="card p-6 bg-cyan-50/50 border-primary/20 mt-4">
          <h3 className="font-semibold text-primary mb-2">AI Portfolio · Capability Profile</h3>
          <p className="text-slate-600 text-sm">Build an AI portfolio as you learn; system generates a capability profile linked to your certification level and certificate — useful for admissions and employment.</p>
        </div>
      </section>

      {/* Learner Certification */}
      <section className="mb-10">
        <h2 className="section-title">Learner Certification</h2>
        <p className="text-slate-600 text-sm mb-4">AI skill and literacy certification; linked to growth path, portfolio, and capability profile</p>
        <div className="grid md:grid-cols-2 gap-4">
          {LEARNER_ITEMS.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              {item.desc && <p className="text-sm text-slate-600 mt-1">{item.desc}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Growth Plan */}
      <section className="mb-10">
        <h2 className="section-title">Growth Plan</h2>
        <p className="text-slate-600 text-sm mb-4">Stage-based learning packages with personalized paths and mentor follow-up</p>
        <div className="grid md:grid-cols-2 gap-4">
          {GROWTH_ITEMS.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Institution Certification */}
      <section className="mb-10">
        <h2 className="section-title">Institution Certification</h2>
        <p className="text-slate-600 text-sm mb-6">Training institutions and schools apply to become Bingo AI Academy certified partners</p>
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-2">
          {INSTITUTION_STEPS.map((item, i) => (
            <React.Fragment key={item.step}>
              <div className="card p-5 flex-1 min-w-0 border-primary/20 bg-white hover:shadow-md transition mb-4 lg:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-primary">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-600 pl-9">{item.desc}</p>
              </div>
              {i < INSTITUTION_STEPS.length - 1 && (
                <div className="flex items-center justify-center lg:flex-col lg:w-10 lg:shrink-0 text-slate-400">
                  <span className="lg:rotate-90 lg:mb-1">→</span>
                  <span className="text-xs ml-2 lg:ml-0">Next</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Teacher Certification */}
      <section className="mb-10">
        <h2 className="section-title">Teacher Certification</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {teacherItems.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              {item.desc && <p className="text-sm text-slate-600 mt-1">{item.desc}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Teacher Development */}
      <section>
        <h2 className="section-title">Teacher Development Program</h2>
        <p className="text-slate-600 text-sm mb-6">Learning, training, and upskilling for teachers, institutions, and schools; AI teaching, event coaching, literacy courses</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-6 border-primary/20 hover:shadow-md transition">
            <h3 className="font-semibold text-primary">Teacher Learning</h3>
            <p className="text-sm text-slate-600 mt-1">AI literacy and meta-cognition; AI tools in teaching; staged learning</p>
          </div>
          <div className="card p-6 border-primary/20 hover:shadow-md transition">
            <h3 className="font-semibold text-primary">Faculty Training</h3>
            <p className="text-sm text-slate-600 mt-1">Online/offline training; materials and tools; event coaching; co-teaching</p>
          </div>
          <div className="card p-6 border-primary/20 hover:shadow-md transition">
            <h3 className="font-semibold text-primary">Certification</h3>
            <p className="text-sm text-slate-600 mt-1">Teacher, pedagogy, and AI tool certification; teaching and coaching skills</p>
          </div>
        </div>
      </section>
    </div>
  )
}
