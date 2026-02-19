import { useState } from 'react'
import { Link } from 'react-router-dom'

const posterBanners = [
  {
    id: 'literacy-1',
    title: 'AI Literacy Course',
    desc: 'Future-ready · Literacy & Meta-cognition',
    img: 'https://placehold.co/1200x500/0891b2/ffffff?text=AI+Literacy',
    to: '/courses/detail/literacy-1',
  },
  {
    id: 'contest-1',
    title: 'Competition Training',
    desc: 'Bootcamp · Mock exams · Past papers',
    img: 'https://placehold.co/1200x500/0f172a/ffffff?text=Contest+Training',
    to: '/courses/detail/contest-1',
  },
  {
    id: 'exam-1',
    title: 'Admissions Prep Course',
    desc: 'STEM specialty track · Admissions materials',
    img: 'https://placehold.co/1200x500/155e75/ffffff?text=Admissions',
    to: '/courses/detail/exam-1',
  },
]

const categories = [
  { key: 'literacy', name: 'AI Literacy', desc: 'AI literacy courses (beyond tools—meta-cognition and future-ready skills)', to: '/courses?cat=literacy' },
  {
    key: 'contest',
    name: 'Competition Training',
    desc: 'Bootcamp + mock exams + past papers + 1-on-1 tutoring; filter by event/level',
    to: '/courses?cat=contest',
  },
  {
    key: 'exam',
    name: 'Admissions Prep',
    desc: 'STEM specialty track + admissions materials + past papers & mocks; combinable with growth plans',
    to: '/courses?cat=exam',
  },
  { key: 'career', name: 'Career Readiness', desc: 'AI + job skills, project training & career placement', to: '/courses?cat=career' },
]

const courseTypes = [
  {
    key: 'ace',
    name: 'Featured Courses',
    desc: 'Top-rated, high-retention platform courses',
    img: 'https://placehold.co/640x360/0f172a/ffffff?text=Featured',
  },
  {
    key: 'hot',
    name: 'Best-sellers · STEM Innovation',
    desc: 'High-conversion courses for competition and admissions',
    img: 'https://placehold.co/640x360/0891b2/ffffff?text=Best-sellers',
  },
]

const courseList = [
  {
    id: 'basic-1',
    name: 'Basic Course',
    cat: 'Curriculum',
    stage: 'K7-K9',
    teacher: 'Bingo Instructors',
    price: '$890',
    commission: '10%',
    hasTrial: true,
  },
  {
    id: 'intermediate-1',
    name: 'Intermediate Course',
    cat: 'Curriculum',
    stage: 'K9-K11',
    teacher: 'Bingo Instructors',
    price: '$990',
    commission: '10%',
    hasTrial: true,
  },
  {
    id: 'advanced-1',
    name: 'Advanced Course',
    cat: 'Curriculum',
    stage: 'K10-K12',
    teacher: 'Bingo Instructors',
    price: '$1290',
    commission: '12%',
    hasTrial: true,
  },
  {
    id: 'literacy-1',
    name: 'AI Literacy Introduction · Your First Step Toward the Future',
    cat: 'Literacy',
    stage: 'Intro/Intermediate',
    teacher: 'Bingo Instructors',
    price: '$199',
    commission: '10%',
    hasTrial: true,
  },
  {
    id: 'contest-1',
    name: 'Whitelist Competition Bootcamp',
    cat: 'Competition',
    stage: 'Competition',
    teacher: 'Competition Coaches',
    price: '$1299',
    commission: '15%',
    hasTrial: true,
  },
  {
    id: 'exam-1',
    name: 'STEM Specialty Track Admissions Course',
    cat: 'Admissions',
    stage: 'Admissions',
    teacher: 'Admissions Advisors',
    price: '$1999',
    commission: '12%',
    hasTrial: false,
  },
  {
    id: 'career-1',
    name: 'AI Project Training · Career Placement',
    cat: 'Career',
    stage: 'Career',
    teacher: 'Enterprise Mentors',
    price: '$2999',
    commission: '8%',
    hasTrial: false,
  },
]

const toolItems = [
  { id: 'tool-1', title: 'Error Assistant AI', desc: 'Smart error log and personalized review', price: '$9.9/mo' },
  { id: 'tool-2', title: 'Homework Grader', desc: 'Auto grading and feedback', price: '$19.9/mo' },
  { id: 'tool-3', title: 'Speaking Practice', desc: 'AI speaking practice and assessment', price: '$29.9/mo' },
  { id: 'tool-4', title: 'Learning Report Generator', desc: 'Learning data visualization and reports', price: 'Free' },
]

function PurchaseModal({ course, onClose, onConfirm }) {
  const [payment, setPayment] = useState('wechat')
  const [submitted, setSubmitted] = useState(false)

  const handleOrderNow = () => {
    setSubmitted(true)
    setTimeout(() => {
      onConfirm?.()
      onClose()
    }, 1500)
  }

  if (!course) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="card p-8 max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-4xl mb-4">✓</div>
          <h3 className="font-semibold text-bingo-dark text-lg">Order Submitted</h3>
          <p className="text-slate-600 text-sm mt-2">Your order for {course.name} has been received. Payment confirmation will be sent shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-bingo-dark mb-4">Order Now</h2>
        <div className="mb-4">
          <p className="font-medium text-slate-800">{course.name}</p>
          <p className="text-primary font-semibold mt-1">{course.price}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment method</label>
          <div className="space-y-2">
            {['wechat', 'coupon', 'group'].map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" value={p} checked={payment === p} onChange={() => setPayment(p)} className="text-primary" />
                <span className="text-sm text-slate-700">
                  {p === 'wechat' && 'WeChat Pay'}
                  {p === 'coupon' && 'Coupon'}
                  {p === 'group' && 'Group Buy'}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleOrderNow} className="btn-primary flex-1 py-2.5">Order Now</button>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function Courses() {
  const [purchaseCourse, setPurchaseCourse] = useState(null)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">AI Courses</h1>
      <p className="text-slate-600 mb-8">Browse by category, stage, or course type—all in one place</p>

      <section className="mb-10">
        <h2 className="section-title mb-4">Course Posters</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {posterBanners.map((p) => (
            <Link key={p.id} to={p.to} className="card overflow-hidden p-0 hover:shadow-md transition">
              <div className="aspect-[16/9] bg-slate-100">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="font-semibold text-primary">{p.title}</div>
                <div className="text-sm text-slate-600 mt-1">{p.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title mb-4">Browse by Category</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <Link key={c.key} to={c.to} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
              <div className="font-semibold text-primary">{c.name}</div>
              <p className="text-sm text-slate-600 mt-2">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title mb-4">Course Types</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {courseTypes.map((t) => (
            <div key={t.key} className="card p-0 overflow-hidden hover:shadow-md transition">
              <div className="aspect-[16/9] bg-slate-100">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-primary">{t.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title mb-4">Course List</h2>
        <p className="text-slate-600 text-sm mb-4">Each course: syllabus, instructor, reviews, trial, commission rate, share (poster/link), add to study center; purchase via WeChat Pay, coupons, group buy</p>
        <div className="grid md:grid-cols-2 gap-4">
          {courseList.map((c) => (
            <div key={c.id} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-bingo-dark line-clamp-2">{c.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">Category: {c.cat} · Stage: {c.stage}</p>
                  <p className="text-sm text-slate-600 mt-1">Instructor: {c.teacher}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-primary font-semibold">{c.price}</div>
                  <div className="text-xs text-slate-500 mt-1">Commission {c.commission}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/courses/detail/${c.id}`} className="btn-primary text-sm px-4 py-2">View Details</Link>
                {c.hasTrial && <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Trial</button>}
                <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Share</button>
                <Link to="/profile/study" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">Add to Study Center</Link>
                <button type="button" onClick={() => setPurchaseCourse(c)} className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">Purchase</button>
              </div>
              <p className="text-xs text-slate-500 mt-3">Purchase: WeChat Pay / Coupons / Group buy (coming soon)</p>
            </div>
          ))}
        </div>
      </section>

      {purchaseCourse && (
        <PurchaseModal
          course={purchaseCourse}
          onClose={() => setPurchaseCourse(null)}
          onConfirm={() => setPurchaseCourse(null)}
        />
      )}

      <section className="mb-10">
        <h2 className="section-title mb-4">AI Tools · Teaching Tools</h2>
        <p className="text-slate-600 text-sm mb-4">Each tool has its own page; purchase history in Profile → My Orders</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolItems.map((item) => (
            <Link key={item.id} to={`/tools/detail/${item.id}`} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
              <p className="text-xs text-slate-500 mt-2">Price: {item.price}</p>
              <span className="text-sm text-primary mt-3 inline-block">View details →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
