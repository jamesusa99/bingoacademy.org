import React from 'react'

const INSTITUTION_STEPS = [
  { step: 1, title: 'Apply', desc: 'Submit certification application with credentials and info' },
  { step: 2, title: 'Review', desc: 'Platform reviews credentials, facilities, faculty' },
  { step: 3, title: 'Verification', desc: 'Site visit or additional materials as needed' },
  { step: 4, title: 'Partnership', desc: 'Contract and certification plaque upon approval' },
  { step: 5, title: 'Ongoing Support', desc: 'Periodic review, training, operations support' },
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
      <p className="text-slate-600 mb-4">For teachers, institutions, schools. List → Details → Register → Prepare → Assess → Certificate; commission rates, prep materials; certificate lookup/download/share; links to employment/admissions</p>
      <div className="card p-6 bg-amber-50/60 border-amber-200/50 mb-8">
        <h3 className="font-semibold text-bingo-dark mb-2">Authoritative & International</h3>
        <p className="text-slate-600 text-sm">Certifications align with ministry whitelist events and industry standards; some recognized internationally; valid for admissions evaluation, study abroad, and employment.</p>
      </div>

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
