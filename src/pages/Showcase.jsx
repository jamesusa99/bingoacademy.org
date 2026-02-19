import { useState } from 'react'
import { Link } from 'react-router-dom'

const outstandingStudents = [
  { name: 'Alex Zhang', photo: 'https://ui-avatars.com/api/?name=Alex+Zhang&background=0891b2&color=fff&size=120' },
  { name: 'Emma Li', photo: 'https://ui-avatars.com/api/?name=Emma+Li&background=0891b2&color=fff&size=120' },
  { name: 'Oliver Wang', photo: 'https://ui-avatars.com/api/?name=Oliver+Wang&background=0891b2&color=fff&size=120' },
  { name: 'Sophia Chen', photo: 'https://ui-avatars.com/api/?name=Sophia+Chen&background=0891b2&color=fff&size=120' },
  { name: 'Leo Liu', photo: 'https://ui-avatars.com/api/?name=Leo+Liu&background=0891b2&color=fff&size=120' },
]

const prizeWinners = [
  { rank: 1, name: 'James Zhao', photo: 'https://ui-avatars.com/api/?name=James+Zhao&background=0f172a&color=fff&size=120' },
  { rank: 2, name: 'Lily Sun', photo: 'https://ui-avatars.com/api/?name=Lily+Sun&background=0f172a&color=fff&size=120' },
  { rank: 3, name: 'Ethan Zhou', photo: 'https://ui-avatars.com/api/?name=Ethan+Zhou&background=0f172a&color=fff&size=120' },
  { rank: 4, name: 'Mia Wu', photo: 'https://ui-avatars.com/api/?name=Mia+Wu&background=0f172a&color=fff&size=120' },
  { rank: 5, name: 'Ryan Zheng', photo: 'https://ui-avatars.com/api/?name=Ryan+Zheng&background=0f172a&color=fff&size=120' },
]

const sections = [
  { title: 'Student AI Work & Learning Outcomes', desc: 'Images + video' },
  { title: 'Event awards, vocational & employment cases', desc: '' },
  { title: 'Teaching tools results, materials learning cases', desc: '' },
  { title: 'AI OEM Partner Showcase', desc: 'Trust & credibility display' },
]

function Avatar({ src, name, alt }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-500">
      {!failed && <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setFailed(true)} />}
      <span className={'w-full h-full flex items-center justify-center bg-primary/20 text-primary' + (failed ? '' : ' hidden')}>{name.charAt(0)}</span>
    </div>
  )
}

export default function Showcase() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Showcase</h1>
      <p className="text-slate-600 mb-6">Browse by category → List → Details; images/video, like/comment/share; link work to course/tool purchase; share to earn commission</p>

      <section className="mb-8">
        <h2 className="section-title">Categories</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/showcase/works" className="card px-5 py-3 hover:shadow-md hover:border-primary/30">Student Works</Link>
          <Link to="/showcase/awards" className="card px-5 py-3 hover:shadow-md hover:border-primary/30">Event Awards</Link>
          <Link to="/showcase/school" className="card px-5 py-3 hover:shadow-md hover:border-primary/30">School Partnerships</Link>
          <Link to="/showcase/materials" className="card px-5 py-3 hover:shadow-md hover:border-primary/30">Materials & Tools</Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Young AI Entrepreneurs</h2>
        <div className="card p-6 border-primary/20">
          <p className="text-slate-600 mb-6">Showcasing youth entrepreneurship and AI innovation projects.</p>
          <h3 className="text-sm font-semibold text-slate-500 mb-4">Outstanding Students</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {outstandingStudents.map((s, i) => (
              <li key={i} className="flex flex-col items-center text-center">
                <Avatar src={s.photo} name={s.name} alt={s.name} />
                <span className="text-xs text-primary font-medium mt-2">Bingo Student</span>
                <span className="font-medium text-bingo-dark mt-1">{s.name}</span>
                <Link to={'/showcase/venture/' + (i + 1)} className="text-xs text-primary hover:underline mt-2">View Work</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Bingo AI Academy $100K Prize</h2>
        <div className="card p-6 border-primary/20 bg-cyan-50/50">
          <p className="text-slate-600 mb-6">Annual incentive program—$100K total—for students and teachers in events, certification, and outcomes.</p>
          <h3 className="text-sm font-semibold text-slate-500 mb-4">Winners</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {prizeWinners.map((w, i) => (
              <li key={i} className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-primary mb-2">#{w.rank}</span>
                <Avatar src={w.photo} name={w.name} alt={w.name} />
                <span className="font-medium text-bingo-dark mt-2">{w.name}</span>
                <Link to={'/showcase/award/' + w.rank} className="text-xs text-primary hover:underline mt-2">Award Case</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="section-title">Details</h2>
        <p className="text-slate-600 text-sm mb-4">Images/video, like/comment/share; purchase links; custom services; share to earn commission</p>
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((s, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{s.title}</h3>
              {s.desc && <p className="text-sm text-slate-500 mt-1">{s.desc}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
