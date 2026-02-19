import { useState } from 'react'

// Avatar paths: place mentor photos in public/mentors/ or use full URLs from bingoacademy.org
const certifiedMentors = [
  { name: 'Jianwen Chen', title: 'Professor', photo: '/mentors/jianwen-chen.jpg' },
  { name: 'Wang Wenzhi', title: 'Ph.D', photo: '/mentors/wang-wenzhi.jpg' },
  { name: 'Feng Xu', title: 'Ph.D', photo: '/mentors/feng-xu.jpg' },
  { name: 'Shuang Wang', title: 'Ph.D', photo: '/mentors/shuang-wang.jpg' },
]

const items = [
  { title: 'Groups by use case', desc: 'Vocational, event prep, tool usage' },
  { title: 'Mentor Q&A, peer discussion, work feedback', desc: '' },
  { title: 'Community perks', desc: 'Material coupons, flash sales, early event signup' },
  { title: 'Referral events', desc: 'Invite friends for free courses, unlock tool trials' },
]

const certifiedCourses = [
  { name: 'Error Assistant AI', desc: 'Smart error log and personalized review' },
  { name: 'Speaking Practice', desc: 'AI speaking practice and assessment' },
  { name: 'Family Education', desc: 'Parent workshops and parent-child learning' },
  { name: 'Reading List', desc: 'Literacy and STEM reading recommendations' },
]

const partnerInstitutions = [
  { name: 'Youth STEM Education Center', region: 'Jiangsu · Nanjing', logo: null },
  { name: 'AI Education Practice Base', region: 'Guangdong · Shenzhen', logo: null },
  { name: 'Education Group STEM Academy', region: 'Beijing', logo: null },
  { name: 'Foreign Language School AI Lab', region: 'Shanghai', logo: null },
  { name: 'XX Training School', region: 'Zhejiang · Hangzhou', logo: null },
  { name: 'XX Maker Education', region: 'Sichuan · Chengdu', logo: null },
]

function MentorAvatar({ src, name }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-500">
      {!failed && <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setFailed(true)} />}
      <span className={`w-full h-full flex items-center justify-center bg-primary/20 text-primary ${failed ? '' : 'hidden'}`}>{name.charAt(0)}</span>
    </div>
  )
}

export default function Community() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">AI Community</h1>
      <p className="text-slate-600 mb-6">Groups → Details → Chat/live/files. Create or join by course/event/region/grade; announcements, files, live; mentor Q&A, peer review, challenges; invite for commission</p>

      <section className="mb-10">
        <h2 className="section-title">Featured Mentors</h2>
        <div className="card p-6 border-primary/20">
          <p className="text-slate-600 mb-6">Leading AI education mentors and outstanding students; experience sharing, Q&A, collaboration.</p>
          <h3 className="text-sm font-semibold text-slate-500 mb-4">Certified Mentors</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {certifiedMentors.map((m, i) => (
              <li key={i} className="flex flex-col items-center text-center">
                <MentorAvatar src={m.photo} name={m.name} />
                <span className="text-xs text-primary font-medium mt-2">{m.title}</span>
                <span className="font-medium text-bingo-dark mt-1">{m.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Partner Institutions</h2>
        <p className="text-slate-600 text-sm mb-6">Certified training institutions, schools, and practice bases partnering with Bingo AI Academy</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {partnerInstitutions.map((p, i) => (
            <div
              key={i}
              className="card p-5 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition group"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-primary/60 group-hover:bg-primary/10 mb-3">
                {p.logo ? <img src={p.logo} alt="" className="w-full h-full object-contain rounded-xl" /> : p.name.charAt(0)}
              </div>
              <div className="font-medium text-bingo-dark text-sm leading-tight line-clamp-2">{p.name}</div>
              <div className="text-xs text-slate-500 mt-1">{p.region}</div>
              <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                Certified Partner
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Community Sections</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {items.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              {item.desc && <p className="text-sm text-slate-600 mt-1">{item.desc}</p>}
            </div>
          ))}
        </div>
        <h3 className="text-base font-semibold text-bingo-dark mb-3">Certified Courses</h3>
        <p className="text-slate-600 text-sm mb-4">Partner courses in the community</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {certifiedCourses.map((c, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="font-semibold text-primary">{c.name}</div>
              <p className="text-sm text-slate-600 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
